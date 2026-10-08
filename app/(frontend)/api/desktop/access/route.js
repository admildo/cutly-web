import { randomUUID } from 'node:crypto'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDesktopUserId } from '@/lib/desktop-auth'
import {
  activateDevice,
  getActiveLicense,
  getLicenseStatus,
  getMostRecentLicense,
} from '@/lib/license'
import { syncUser } from '@/lib/users'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'
import {
  enrollTrialAccount,
  getTrialAccount,
  getTrialConfig,
  getTrialSnapshot,
  hashTrialDeviceId,
} from '@/lib/trial'

export const runtime = 'nodejs'

const json = (body, status = 200, requestId) =>
  Response.json(requestId ? { ...body, requestId } : body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  })

const withRequestId = (response, requestId) => {
  const headers = new Headers(response.headers)
  headers.set('X-Request-ID', requestId)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const devicePattern = /^[a-zA-Z0-9_-]{16,256}$/

export async function POST(request) {
  const suppliedRequestId = request.headers.get('x-request-id')
  const requestIdPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i
  const requestId = requestIdPattern.test(suppliedRequestId || '')
    ? suppliedRequestId
    : randomUUID()
  const respond = (body, status = 200) => json(body, status, requestId)
  let stage = 'request-start'

  try {
    stage = 'ip-rate-limit'
    const ipLimit = await enforceRateLimit(request, {
      name: 'desktop-access-ip',
      limit: 20,
      windowSeconds: 60,
    })
    if (!ipLimit.ok)
      return withRequestId(rateLimitResponse(ipLimit.retryAfter), requestId)

    stage = 'desktop-session-validation'
    const desktopUserId = await getDesktopUserId(request)
    if (!desktopUserId) {
      stage = 'clerk-session-validation'
      const { userId } = await auth()
      if (!userId)
        return respond(
          { error: 'Please sign in to check Deyn Studio access.' },
          401,
        )
      // This endpoint serves the desktop app only; browser sessions cannot enroll trials.
      return respond(
        { error: 'Use Deyn Studio desktop to check trial access.' },
        401,
      )
    }

    stage = 'account-rate-limit'
    const accountLimit = await enforceRateLimit(request, {
      name: 'desktop-access-user',
      limit: 30,
      windowSeconds: 60,
      subject: desktopUserId,
    })
    if (!accountLimit.ok)
      return withRequestId(
        rateLimitResponse(accountLimit.retryAfter),
        requestId,
      )

    stage = 'request-validation'
    let body
    try {
      body = await request.json()
    } catch {
      return respond({ error: 'A valid access request is required.' }, 400)
    }
    const { deviceId, platform, appVersion } = body || {}
    if (typeof deviceId !== 'string' || !devicePattern.test(deviceId)) {
      return respond({ error: 'A valid device identifier is required.' }, 400)
    }

    stage = 'trial-device-hash'
    const deviceHash = hashTrialDeviceId(deviceId)

    stage = 'user-sync'
    await syncUser(desktopUserId)

    stage = 'license-lookup'
    const [license, latestLicense] = await Promise.all([
      getActiveLicense(desktopUserId),
      getMostRecentLicense(desktopUserId),
    ])
    if (license) {
      stage = 'license-device-activation'
      return respond(
        await activateDevice(desktopUserId, deviceId, { platform, appVersion }),
      )
    }

    // A refunded/revoked/expired purchaser cannot re-enter as a new free trial.
    if (latestLicense) {
      stage = 'license-status-lookup'
      const status = await getLicenseStatus(desktopUserId)
      return respond(
        {
          ...status,
          status: 'license-required',
          message:
            status.message ||
            'This account has already used a paid license. Contact support if you need help.',
        },
        403,
      )
    }

    stage = 'trial-config-lookup'
    const config = await getTrialConfig()
    if (!config.enabled) {
      return respond(
        {
          status: 'trial-unavailable',
          licensed: false,
          message: 'The free trial is temporarily paused.',
        },
        403,
      )
    }

    stage = 'trial-account-lookup'
    let trialAccount = await getTrialAccount(desktopUserId)
    if (!trialAccount) {
      stage = 'clerk-user-verification'
      const user = await (await clerkClient()).users.getUser(desktopUserId)
      const emailVerified =
        user?.primaryEmailAddress?.verification?.status === 'verified'
      if (!emailVerified) {
        return respond(
          {
            status: 'trial-verification-required',
            licensed: false,
            message:
              'Verify your email address in your Deyn Studio account, then check access again.',
          },
          403,
        )
      }
    }

    stage = 'trial-enrollment'
    const enrollment = await enrollTrialAccount(desktopUserId, deviceHash)
    if (!enrollment.success) {
      return respond(
        {
          status: 'trial-unavailable',
          licensed: false,
          message:
            'A free trial has already been started on this device. Sign in with the account that began it.',
        },
        403,
      )
    }

    stage = 'trial-snapshot'
    const snapshot = await getTrialSnapshot(desktopUserId)
    if (snapshot.status === 'trial-unavailable') {
      return respond(
        {
          status: 'trial-unavailable',
          licensed: false,
          message: 'The free trial is temporarily unavailable.',
        },
        403,
      )
    }
    return respond({ licensed: false, ...snapshot })
  } catch (error) {
    console.error(
      '[desktop-access] request failed',
      JSON.stringify({
        requestId,
        stage,
        vercelRequestId: request.headers.get('x-vercel-id'),
        errorName: error?.name || null,
        errorCode: error?.code || null,
        errorMessage: error?.message || String(error),
        stack: error?.stack || null,
      }),
    )
    return respond(
      {
        error: 'Could not check your Deyn Studio access. Please try again.',
        code: 'DESKTOP_ACCESS_UNAVAILABLE',
        stage,
      },
      503,
    )
  }
}
