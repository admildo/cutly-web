import { createHash } from 'node:crypto'
import { incrementRateLimit } from './state-store.js'

const clientIdentifier = (request) => {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
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
