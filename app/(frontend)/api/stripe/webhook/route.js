import Stripe from 'stripe'
import { handleStripeEvent } from '@/lib/stripe-fulfillment'

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
    await handleStripeEvent(event)
    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handling failed:', error)
    return new Response('Webhook handling failed', { status: 500 })
  }
}
