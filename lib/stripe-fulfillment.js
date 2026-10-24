import { randomUUID } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { licenses, paymentEvents } from '@/db/schema'
import { getActiveLicense } from '@/lib/license'
import { syncUser } from '@/lib/users'

const PENDING_REVOCATION = 'stripe-revocation'

const stripeEventWasRecorded = async (event) => {
  const [existing] = await getDb()
    .select({ id: paymentEvents.id })
    .from(paymentEvents)
    .where(and(eq(paymentEvents.provider, 'stripe'), eq(paymentEvents.providerEventId, event.id)))
    .limit(1)
  return Boolean(existing)
}

const recordRow = async (provider, providerEventId, eventType) => {
  const result = await getDb().run(sql`
    INSERT OR IGNORE INTO payment_events (id, provider, provider_event_id, event_type)
    VALUES (${randomUUID()}, ${provider}, ${providerEventId}, ${eventType})
  `)
  return result.rowsAffected === 1
}

// A refund or lost dispute can reach us before the purchase's own event does.
// Remember it by payment so the license is created already revoked.
const findPendingRevocation = async (paymentIntent) => {
  const [row] = await getDb()
    .select({ status: paymentEvents.eventType })
    .from(paymentEvents)
    .where(and(eq(paymentEvents.provider, PENDING_REVOCATION), eq(paymentEvents.providerEventId, paymentIntent)))
    .limit(1)
  return row?.status || null
}

export const activateLifetimeLicense = async (session) => {
  const userId = session.metadata?.clerkUserId || session.client_reference_id
  if (!userId) throw new Error('Stripe Checkout Session has no Deyn Studio user reference.')

  const transactionId = session.payment_intent || session.id
  await syncUser(userId)

  const revokedStatus = await findPendingRevocation(transactionId)
  if (!revokedStatus && (await getActiveLicense(userId))) {
    // Two payments for one account: the second needs a manual refund.
    console.error('[stripe] Duplicate purchase for an account that already has an active license', {
      userId,
      transactionId
    })
  }

  await getDb()
    .insert(licenses)
    .values({
      id: randomUUID(),
      userId,
      type: 'lifetime',
      status: revokedStatus || 'active',
      planName: 'Deyn Studio Lifetime',
      deviceLimit: 2,
      paymentProvider: 'stripe',
      providerCustomerId: typeof session.customer === 'string' ? session.customer : null,
      providerTransactionId: transactionId
    })
    .onConflictDoNothing({ target: licenses.providerTransactionId })
}

export const revokeLicenseForPayment = async (paymentIntent, status = 'refunded') => {
  if (!paymentIntent) return
  const result = await getDb()
    .update(licenses)
    .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(sql`${licenses.providerTransactionId} = ${paymentIntent}`)
  if (result.rowsAffected === 0) await recordRow(PENDING_REVOCATION, paymentIntent, status)
}

// Applies one verified Stripe event. Safe to call again for the same event.
export const handleStripeEvent = async (event) => {
  if (await stripeEventWasRecorded(event)) return { duplicate: true }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object
    // The webhook receives every payment in the Stripe account, so only sessions our
    // checkout route created for the lifetime license may grant one.
    if (session.metadata?.licenseType !== 'lifetime') {
      console.warn('[stripe] Ignoring a checkout session that is not for the lifetime license', { sessionId: session.id })
    } else if (session.payment_status === 'paid' || event.type === 'checkout.session.async_payment_succeeded') {
      await activateLifetimeLicense(session)
    }
  } else if (event.type === 'charge.refunded') {
    // A partial refund (goodwill, tax correction) must not take the license away.
    if (event.data.object.refunded === true) {
      await revokeLicenseForPayment(event.data.object.payment_intent, 'refunded')
    }
  } else if (event.type === 'charge.dispute.closed') {
    // A lost chargeback returns the money to the buyer, so the license goes with it.
    if (event.data.object.status === 'lost') {
      await revokeLicenseForPayment(event.data.object.payment_intent, 'revoked')
    }
  }

  await recordRow('stripe', event.id, event.type)
  return { duplicate: false }
}
