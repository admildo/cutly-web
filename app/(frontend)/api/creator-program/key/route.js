import { auth } from '@clerk/nextjs/server'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'
import { getCreatorKeyForUser } from '@/lib/creator-program'

export const runtime = 'nodejs'

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0' }
})

// Returns the signed-in creator's own key. Nothing is returned for anyone else, or before approval.
export async function GET(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Please sign in to see your key.' }, 401)

  const limit = await enforceRateLimit(request, { name: 'creator-program-key', limit: 30, windowSeconds: 3600, subject: userId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  try {
    const key = await getCreatorKeyForUser(userId)
    if (!key) return json({ error: 'No creator key is available for this account.' }, 404)
    return json({ key })
  } catch (error) {
    console.error('Could not read the creator key:', error)
    return json({ error: 'We couldn’t show your key. Please try again or contact support.' }, 503)
  }
}
