import { Redis } from '@upstash/redis'

let redis

export const getRedis = () => {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured.')
  }

  redis = new Redis({ url, token })
  return redis
}

// Keeps the security-sensitive token flows testable without a networked Redis
// instance. This is intentionally unavailable in production.
export const setRedisClientForTesting = (client) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The Redis client cannot be replaced in production.')
  }
  redis = client
}
