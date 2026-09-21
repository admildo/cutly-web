import { createHash } from 'node:crypto'
import { getRedis } from './redis.js'

const clientIdentifier = (request) => {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

export const enforceRateLimit = async (request, { name, limit, windowSeconds, subject = '' }) => {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const identity = subject || clientIdentifier(request)
  const key = `cutly:rate:${name}:${identity}:${bucket}`
  const redis = getRedis()
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSeconds)

  if (count > limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, windowSeconds - Math.floor((Date.now() / 1000) % windowSeconds))
    }
  }

  return { ok: true }
}

export const rateLimitResponse = (retryAfter) =>
  Response.json(
    { error: 'Too many requests. Please try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
