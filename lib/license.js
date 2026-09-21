
import { randomUUID } from 'node:crypto'
import { and, desc, eq, gt, isNull, or, sql } from 'drizzle-orm'
import { devices, licenses } from '@/db/schema'
import { getDb } from '@/lib/db'

const ACTIVE_LICENSE_STATUSES = ['active']

const toLicenseStatus = (license, devicesUsed = 0) => ({
  licensed: Boolean(license),
  status: license?.status || 'none',
  type: license?.type || null,
  plan: license?.planName || null,
  expiresAt: license?.expiresAt || null,
  deviceLimit: license?.deviceLimit || 0,
  devicesUsed,
  message: license ? null : 'No active Cutly license was found for this account.'
})

const getActiveLicense = async (userId) => {
  const db = getDb()
  const [license] = await db
    .select({
      id: licenses.id,
      type: licenses.type,
      status: licenses.status,
      planName: licenses.planName,
      expiresAt: licenses.expiresAt,
      deviceLimit: licenses.deviceLimit
    })
    .from(licenses)
    .where(and(
      eq(licenses.userId, userId),
      eq(licenses.status, ACTIVE_LICENSE_STATUSES[0]),
      or(isNull(licenses.expiresAt), gt(licenses.expiresAt, sql`CURRENT_TIMESTAMP`))
    ))
    .orderBy(desc(licenses.createdAt))
    .limit(1)

  return license || null
}

const countActiveDevices = async (licenseId) => {
  const db = getDb()
  const [result] = await db
    .select({ count: sql`COUNT(*)` })
    .from(devices)
    .where(and(eq(devices.licenseId, licenseId), isNull(devices.deactivatedAt)))
  return Number(result?.count || 0)
}

export const getLicenseStatus = async (userId) => {
  const license = await getActiveLicense(userId)
  if (!license) return toLicenseStatus(null)
  return toLicenseStatus(license, await countActiveDevices(license.id))
}

export const activateDevice = async (userId, deviceHash, { platform, appVersion } = {}) => {
  const db = getDb()
  const license = await getActiveLicense(userId)
  if (!license) return toLicenseStatus(null)

  // A known device can always be renewed, including after a user deactivated it.
  const existing = await db
    .update(devices)
    .set({
      deactivatedAt: null,
      lastSeenAt: sql`CURRENT_TIMESTAMP`,
      platform: platform || null,
      appVersion: appVersion || null
    })
    .where(and(eq(devices.licenseId, license.id), eq(devices.deviceHash, deviceHash)))

  if (existing.rowsAffected > 0) {
    return toLicenseStatus(license, await countActiveDevices(license.id))
  }

  // This single statement makes the device-capacity check and insert atomic.
  const inserted = await db.run(sql`
      INSERT INTO devices (id, license_id, device_hash, platform, app_version)
      SELECT ${randomUUID()}, id, ${deviceHash}, ${platform || null}, ${appVersion || null}
      FROM licenses
      WHERE id = ${license.id}
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        AND (SELECT COUNT(*) FROM devices WHERE license_id = ${license.id} AND deactivated_at IS NULL) < device_limit
    `)

  if (inserted.rowsAffected === 0) {
    return {
      ...toLicenseStatus(license, await countActiveDevices(license.id)),
      licensed: false,
      message: `This license has reached its ${license.deviceLimit}-device limit.`
    }
  }

  return toLicenseStatus(license, await countActiveDevices(license.id))
}
