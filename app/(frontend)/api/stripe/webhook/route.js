import { randomUUID } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import Stripe from 'stripe'
import { getDb } from '@/lib/db'
import { licenses, paymentEvents } from '@/db/schema'
import { syncUser } from '@/lib/users'

const stripeEventWasRecorded = async (event) => {
  const [existing] = await getDb()
    .select({ id: paymentEvents.id })
    .from(paymentEvents)
    .where(and(eq(paymentEvents.provider, 'stripe'), eq(paymentEvents.providerEventId, event.id)))
    .limit(1)
  return Boolean(existing)
}

const recordStripeEvent = async (event) => {
  const result = await getDb().run(sql`
    INSERT OR IGNORE INTO payment_events (id, provider, provider_event_id, event_type)
    VALUES (${randomUUID()}, 'stripe', ${event.id}, ${event.type})
  `)
  return result.rowsAffected === 1
}

const activateLifetimeLicense = async (session) => {
  const userId = session.metadata?.clerkUserId || session.client_reference_id
  if (!userId) throw new Error('Stripe Checkout Session has no Deyn Studio user reference.')

  const transactionId = session.payment_intent || session.id
  await syncUser(userId)
  await getDb()
    .insert(licenses)
    .values({
      id: randomUUID(),
      userId,
      type: 'lifetime',
      status: 'active',
      planName: 'Deyn Studio Lifetime',
      deviceLimit: 2,
      paymentProvider: 'stripe',
      providerCustomerId: typeof session.customer === 'string' ? session.customer : null,
      providerTransactionId: transactionId
    })
    .onConflictDoNothing({ target: licenses.providerTransactionId })
}

const revokeLicenseForPayment = async (paymentIntent) => {
  if (!paymentIntent) return
  await getDb()
    .update(licenses)
    .set({ status: 'refunded', updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(sql`${licenses.providerTransactionId} = ${paymentIntent}`)
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signingSecret = request.headers.get('stripe-signature')
  if (!secret || !signingSecret) return new Response('Webhook not configured', { status: 503 })

  let event
  try {
    const body = await request.text()
    event = new Stripe(process.env.STRIPE_SECRET_KEY || '').webhooks.constructEvent(
      body,
      signingSecret,
      secret
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message)
    return new Response('Invalid webhook signature', { status: 400 })
  }

  try {
    if (await stripeEventWasRecorded(event)) return Response.json({ received: true })

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object
      if (session.payment_status === 'paid' || event.type === 'checkout.session.async_payment_succeeded') {
        await activateLifetimeLicense(session)
      }
    } else if (event.type === 'charge.refunded') {
      await revokeLicenseForPayment(event.data.object.payment_intent)
    }

    await recordStripeEvent(event)
    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handling failed:', error)
    return new Response('Webhook handling failed', { status: 500 })
  }
}
