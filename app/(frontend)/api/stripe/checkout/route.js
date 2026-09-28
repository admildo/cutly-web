import { auth, currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'You must be signed in to purchase Cutly.' }, { status: 401 })

  const priceId = process.env.STRIPE_LIFETIME_PRICE_ID
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!priceId || !secretKey) {
    return Response.json({ error: 'Stripe checkout is not configured.' }, { status: 503 })
  }

  try {
    const user = await currentUser()
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user?.primaryEmailAddress?.emailAddress || undefined,
      client_reference_id: userId,
      metadata: { clerkUserId: userId, licenseType: 'lifetime' },
      success_url: `${configuredOrigin}/?checkout=success`,
      cancel_url: `${configuredOrigin}/?checkout=cancelled`
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Could not create Stripe Checkout Session:', error)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
