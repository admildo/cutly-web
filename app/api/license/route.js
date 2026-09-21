import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDesktopUserId } from '@/lib/desktop-auth'
import { activateDevice, getLicenseStatus } from '@/lib/license'
import { syncUser } from '@/lib/users'
import { enforceRateLimit, rateLimitResponse } from '@/lib/rate-limiting'

const json = (body, options = {}) => NextResponse.json(body, options)

const requireUser = async (request) => {
  const desktopUserId = await getDesktopUserId(request)
  if (desktopUserId) {
    await syncUser(desktopUserId)
    return desktopUserId
  }

  const { userId } = await auth()
  if (userId) await syncUser(userId)
  return userId
}

export async function GET(request) {
  const limit = await enforceRateLimit(request, { name: 'license-read', limit: 60, windowSeconds: 60 })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const userId = await requireUser(request)
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 })

  try {
    return json(await getLicenseStatus(userId))
  } catch (error) {
    console.error('Could not get license status:', error)
    return json({ error: 'Could not check license status.' }, { status: 503 })
  }
}

export async function POST(request) {
  const limit = await enforceRateLimit(request, { name: 'license-write', limit: 10, windowSeconds: 60 })
  if (!limit.ok) return rateLimitResponse(limit.retryAfter)

  const userId = await requireUser(request)
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { deviceId, platform, appVersion } = await request.json()
    if (typeof deviceId !== 'string' || deviceId.length < 16 || deviceId.length > 256) {
      return json({ error: 'A valid device identifier is required.' }, { status: 400 })
    }

    const license = await activateDevice(userId, deviceId, { platform, appVersion })
    return json(license, { status: license.licensed ? 200 : 403 })
  } catch (error) {
    console.error('Could not activate device:', error)
    return json({ error: 'Could not activate this device.' }, { status: 503 })
  }
}
