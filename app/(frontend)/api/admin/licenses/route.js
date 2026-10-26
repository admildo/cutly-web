import { auth } from '@clerk/nextjs/server'
import { isTrialAdmin } from '@/lib/trial'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'
import { findClerkUserByEmail } from '@/lib/clerk-users'
import {
  LicenseAdminError,
  grantLicense,
  listUserLicenses,
  normalizeEmail,
  revokeGrantedLicense
} from '@/lib/license-admin'

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
  if (error instanceof LicenseAdminError) return json({ error: error.message }, error.status)
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

const hasOnly = (body, keys) => Object.keys(body).every((key) => keys.includes(key))

export async function GET(request) {
  const adminId = await requireAdmin(request)
  if (!adminId) return json({ error: 'Not found.' }, 404)
  const limit = await enforceRateLimit(request, { name: 'license-admin-lookup', limit: 30, windowSeconds: 60, subject: adminId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  try {
    const email = normalizeEmail(new URL(request.url).searchParams.get('email'))
    const user = await findClerkUserByEmail(email)
    if (!user) return json({ error: 'No single account has that email address.' }, 404)
    return json({ user, licenses: await listUserLicenses(user.id) })
  } catch (error) {
    return failure(error, 'Could not look up that account.')
  }
}

export async function POST(request) {
  const adminId = await requireAdmin(request, { requireOrigin: true })
  if (!adminId) return json({ error: 'Not found.' }, 404)
  const limit = await enforceRateLimit(request, { name: 'license-admin-write', limit: 20, windowSeconds: 60, subject: adminId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const body = await readBody(request)
  if (!body || !hasOnly(body, ['email', 'reason'])) {
    return json({ error: 'A valid license grant is required.' }, 400)
  }

  try {
    const email = normalizeEmail(body.email)
    const user = await findClerkUserByEmail(email)
    if (!user) return json({ error: 'No single account has that email address.' }, 404)
    const license = await grantLicense(adminId, user.id, { reason: body.reason })
    return json({ user, license }, 201)
  } catch (error) {
    return failure(error, 'Could not grant the license. Please try again.')
  }
}

export async function DELETE(request) {
  const adminId = await requireAdmin(request, { requireOrigin: true })
  if (!adminId) return json({ error: 'Not found.' }, 404)
  const limit = await enforceRateLimit(request, { name: 'license-admin-write', limit: 20, windowSeconds: 60, subject: adminId })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const body = await readBody(request)
  if (!body || !hasOnly(body, ['licenseId', 'reason'])) {
    return json({ error: 'A license and a reason are required.' }, 400)
  }

  try {
    await revokeGrantedLicense(adminId, body.licenseId, body.reason)
    return json({ revoked: true })
  } catch (error) {
    return failure(error, 'Could not revoke the license. Please try again.')
  }
}
