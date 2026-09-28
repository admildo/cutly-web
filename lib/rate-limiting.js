import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { incrementRateLimit } from './state-store.js'

const clientIdentifier = (request) => {
  // Vercel overwrites x-vercel-forwarded-for with the client IP. On another
  // host, only use a header explicitly configured as trusted and overwritten
  // by that platform's ingress proxy. Never trust arbitrary forwarded headers.
  const trustedHeader = process.env.TRUSTED_CLIENT_IP_HEADER ||
    (process.env.VERCEL ? 'x-vercel-forwarded-for' : null)
  if (!trustedHeader && process.env.NODE_ENV === 'production') {
    throw new Error('Configure TRUSTED_CLIENT_IP_HEADER for this production host.')
  }
  const forwarded = trustedHeader ? request.headers.get(trustedHeader) : null
  const candidate = forwarded?.split(',')[0]?.trim()
  const ip = candidate && isIP(candidate) ? candidate : 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

export const enforceRateLimit = async (request, { name, limit, windowSeconds, subject = '' }) => {
  const now = Date.now()
  const bucket = Math.floor(now / (windowSeconds * 1000))
  const identity = subject || clientIdentifier(request)
  const key = `cutly:rate:${name}:${identity}:${bucket}`
  const count = await incrementRateLimit(key, (bucket + 1) * windowSeconds, Math.floor(now / 1000))

  if (count > limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, windowSeconds - Math.floor((now / 1000) % windowSeconds))
    }
  }

  return { ok: true }
}

export const rateLimitResponse = (retryAfter) =>
  Response.json(
    { error: 'Too many requests. Please try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
