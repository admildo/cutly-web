import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDesktopUserId } from '@/lib/desktop-auth'
import { activateDevice, getActiveLicense, getLicenseStatus, getMostRecentLicense } from '@/lib/license'
import { syncUser } from '@/lib/users'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'
import { enrollTrialAccount, getTrialAccount, getTrialConfig, getTrialSnapshot, hashTrialDeviceId } from '@/lib/trial'

export const runtime = 'nodejs'

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0' }
})

const devicePattern = /^[a-zA-Z0-9_-]{16,256}$/

export async function POST(request) {
  const ipLimit = await enforceRateLimit(request, { name: 'desktop-access-ip', limit: 20, windowSeconds: 60 })
  if (!ipLimit.ok) return rateLimitResponse(ipLimit.retryAfter)

  const desktopUserId = await getDesktopUserId(request)
  if (!desktopUserId) {
    const { userId } = await auth()
    if (!userId) return json({ error: 'Please sign in to check Cutly access.' }, 401)
    // This endpoint serves the desktop app only; browser sessions cannot enroll trials.
    return json({ error: 'Use Cutly desktop to check trial access.' }, 401)
  }

  const accountLimit = await enforceRateLimit(request, {
    name: 'desktop-access-user', limit: 30, windowSeconds: 60, subject: desktopUserId
  })
  if (!accountLimit.ok) return rateLimitResponse(accountLimit.retryAfter)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'A valid access request is required.' }, 400)
  }
  const { deviceId, platform, appVersion } = body || {}
  if (typeof deviceId !== 'string' || !devicePattern.test(deviceId)) {
    return json({ error: 'A valid device identifier is required.' }, 400)
  }
  let deviceHash
  try {
    deviceHash = hashTrialDeviceId(deviceId)
  } catch (error) {
    console.error('Could not protect trial device identifier:', error)
    return json({ error: 'Trial access is temporarily unavailable.' }, 503)
  }

  try {
    await syncUser(desktopUserId)
    const [license, latestLicense] = await Promise.all([
      getActiveLicense(desktopUserId),
      getMostRecentLicense(desktopUserId)
    ])
    if (license) {
      return json(await activateDevice(desktopUserId, deviceId, { platform, appVersion }))
    }

    // A refunded/revoked/expired purchaser cannot re-enter as a new free trial.
    if (latestLicense) {
      const status = await getLicenseStatus(desktopUserId)
      return json({
        ...status,
        status: 'license-required',
        message: status.message || 'This account has already used a paid license. Contact support if you need help.'
      }, 403)
    }

    const config = await getTrialConfig()
    if (!config.enabled) {
      return json({ status: 'trial-unavailable', licensed: false, message: 'The free trial is temporarily paused.' }, 403)
    }

    let trialAccount = await getTrialAccount(desktopUserId)
    if (!trialAccount) {
      const user = await (await clerkClient()).users.getUser(desktopUserId)
      const emailVerified = user?.primaryEmailAddress?.verification?.status === 'verified'
      if (!emailVerified) {
        return json({
          status: 'trial-verification-required',
          licensed: false,
          message: 'Verify your email address in your Cutly account, then check access again.'
        }, 403)
      }
    }

    const enrollment = await enrollTrialAccount(desktopUserId, deviceHash)
    if (!enrollment.success) {
      return json({
        status: 'trial-unavailable',
        licensed: false,
        message: 'A free trial has already been started on this device. Sign in with the account that began it.'
      }, 403)
    }
    const snapshot = await getTrialSnapshot(desktopUserId)
    if (snapshot.status === 'trial-unavailable') {
      return json({ status: 'trial-unavailable', licensed: false, message: 'The free trial is temporarily unavailable.' }, 403)
    }
    return json({ licensed: false, ...snapshot })
  } catch (error) {
    console.error('Could not resolve desktop access:', error)
    return json({ error: 'Could not check your Cutly access. Please try again.' }, 503)
  }
}
