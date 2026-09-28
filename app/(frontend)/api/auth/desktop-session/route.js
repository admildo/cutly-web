import { clerkClient } from '@clerk/nextjs/server'
import {
  createDesktopSession,
  consumeDesktopAuthGrantUserId,
  revokeDesktopSession
} from '@/lib/desktop-auth'
import { syncUser } from '@/lib/users'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'

export async function GET(request) {
  const limit = await enforceRateLimit(request, {
    name: 'desktop-session',
    limit: 10,
    windowSeconds: 60
  })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const userId = await consumeDesktopAuthGrantUserId(request)
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await (await clerkClient()).users.getUser(userId)
  await syncUser(userId, { login: true })
  return Response.json({
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress || null,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
    imageUrl: user?.imageUrl || null,
    sessionToken: await createDesktopSession(userId)
  })
}

export async function DELETE(request) {
  const revoked = await revokeDesktopSession(request)
  return new Response(null, { status: revoked ? 204 : 401 })
}
