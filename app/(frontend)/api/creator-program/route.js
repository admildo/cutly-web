import { auth } from '@clerk/nextjs/server'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'
import { submitCreatorApplication } from '@/lib/creator-program'
import { CreatorProgramError } from '@/lib/creator-program-options'

export const runtime = 'nodejs'

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0' }
})

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Please sign in to apply.' }, 401)
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Not found.' }, 404)

  const limit = await enforceRateLimit(request, { name: 'creator-program-apply', limit: 5, windowSeconds: 3600, subject: userId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'A creator application is required.' }, 400)
  }

  try {
    const application = await submitCreatorApplication(userId, body)
    return json({ application }, 201)
  } catch (error) {
    if (error instanceof CreatorProgramError) return json({ error: error.message }, error.status)
    console.error('Could not save the creator application:', error)
    return json({ error: 'We couldn’t send your application. Please try again.' }, 503)
  }
}
