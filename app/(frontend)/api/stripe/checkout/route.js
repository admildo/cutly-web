import { auth, currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { siteOrigin } from '@/lib/seo'
import { getActiveLicense } from '@/lib/license'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'

const getCheckoutOrigin = (request) => {
  if (process.env.NODE_ENV === 'production') {
    return siteOrigin.startsWith('https://') ? siteOrigin : null
  }

  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.CUTLY_SITE_URL
  if (!configuredOrigin) {
    return new URL(request.url).origin
  }

  try {
    const url = new URL(configuredOrigin)
    if (url.username || url.password) return null
    return url.origin
  } catch {
    return null
  }
}

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'You must be signed in to purchase Deyn Studio.' }, { status: 401 })

  const limit = await enforceRateLimit(request, { name: 'checkout', limit: 10, windowSeconds: 60, subject: userId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const priceId = process.env.STRIPE_LIFETIME_PRICE_ID
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!priceId || !secretKey) {
    return Response.json({ error: 'Stripe checkout is not configured.' }, { status: 503 })
  }

  const configuredOrigin = getCheckoutOrigin(request)
  if (!configuredOrigin) {
    console.error('Stripe checkout requires a valid canonical HTTPS site origin in production.')
    return Response.json({ error: 'Checkout is temporarily unavailable.' }, { status: 503 })
  }

  try {
    if (await getActiveLicense(userId)) {
      return Response.json({ error: 'This account already has an active license.', code: 'already_licensed' }, { status: 409 })
    }
  } catch (error) {
    console.error('Could not check the existing license before checkout:', error)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 503 })
  }

  try {
    const user = await currentUser()
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user?.primaryEmailAddress?.emailAddress || undefined,
      // Keeps a Stripe customer on the purchase so support can find it from the receipt.
      customer_creation: 'always',
      client_reference_id: userId,
      metadata: { clerkUserId: userId, licenseType: 'lifetime' },
      success_url: `${configuredOrigin}/dashboard?checkout=success`,
      cancel_url: `${configuredOrigin}/dashboard?checkout=cancelled`
    }, {
      // Two tabs or a double click within the window get the same session, not two payments.
      idempotencyKey: `checkout:${userId}:${Math.floor(Date.now() / (30 * 60 * 1000))}`
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Could not create Stripe Checkout Session:', error)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
