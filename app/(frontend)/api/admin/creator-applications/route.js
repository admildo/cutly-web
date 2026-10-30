import { auth } from '@clerk/nextjs/server'
import { isTrialAdmin } from '@/lib/trial'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'
import {
  approveCreatorApplication,
  declineCreatorApplication,
  listCreatorApplications
} from '@/lib/creator-program'
import { CreatorProgramError } from '@/lib/creator-program-options'
import { LicenseAdminError } from '@/lib/license-admin'

export const runtime = 'nodejs'

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0' }
})

// Anyone who is not the admin sees the same 404 as a route that does not exist.
const requireAdmin = async (request, { requireOrigin = false } = {}) => {
  const { userId } = await auth()
  if (!userId || !isTrialAdmin(userId)) return null
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return null
  if (requireOrigin && !origin) return null
  return userId
}

const failure = (error, fallback) => {
  if (error instanceof CreatorProgramError || error instanceof LicenseAdminError) {
    return json({ error: error.message }, error.status)
  }
  console.error(fallback, error)
  return json({ error: fallback }, 503)
}

const readBody = async (request) => {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

export async function GET(request) {
  const adminId = await requireAdmin(request)
  if (!adminId) return json({ error: 'Not found.' }, 404)

  try {
    return json({ applications: await listCreatorApplications() })
  } catch (error) {
    return failure(error, 'Could not load the creator applications.')
  }
}

export async function POST(request) {
  const adminId = await requireAdmin(request, { requireOrigin: true })
  if (!adminId) return json({ error: 'Not found.' }, 404)
  const limit = await enforceRateLimit(request, { name: 'creator-program-review', limit: 60, windowSeconds: 60, subject: adminId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const body = await readBody(request)
  const applicationId = typeof body?.applicationId === 'string' ? body.applicationId : ''

  try {
    if (body?.decision === 'approve') {
      return json({ application: await approveCreatorApplication(adminId, applicationId, { creditLimitCents: body.creditLimitCents }) })
    }
    if (body?.decision === 'decline') {
      return json({ application: await declineCreatorApplication(applicationId, body.note) })
    }
    return json({ error: 'Choose approve or decline.' }, 400)
  } catch (error) {
    return failure(error, 'Could not save the decision. Please try again.')
  }
}
