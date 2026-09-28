
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
      or(isNull(licenses.expiresAt), gt(sql`datetime(${licenses.expiresAt})`, sql`CURRENT_TIMESTAMP`))
    ))
    .orderBy(desc(licenses.createdAt))
    .limit(1)

  return license || null
}

const getMostRecentLicense = async (userId) => {
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
    .where(eq(licenses.userId, userId))
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
  const activeLicense = await getActiveLicense(userId)
  if (activeLicense) {
    return toLicenseStatus(activeLicense, await countActiveDevices(activeLicense.id))
  }

  const license = await getMostRecentLicense(userId)
  if (!license) return toLicenseStatus(null)

  const expiryTime = license.expiresAt ? Date.parse(license.expiresAt) : null
  const expired = license.status === 'active' && expiryTime !== null &&
    (!Number.isFinite(expiryTime) || expiryTime <= Date.now())
  const status = expired ? 'expired' : license.status

  return {
    ...toLicenseStatus(license),
    licensed: false,
    status,
    message: status === 'expired'
      ? 'This Cutly license has expired.'
      : status === 'refunded'
        ? 'This Cutly license was refunded.'
        : 'This Cutly license is no longer active.'
  }
}

export const activateDevice = async (userId, deviceHash, { platform, appVersion } = {}) => {
  const db = getDb()
  const license = await getActiveLicense(userId)
  if (!license) return toLicenseStatus(null)

  // One statement makes the capacity check atomic for both new devices and
  // reactivations. Existing active devices can renew even when at capacity.
  const activated = await db.run(sql`
      INSERT INTO devices (id, license_id, device_hash, platform, app_version)
      SELECT ${randomUUID()}, id, ${deviceHash}, ${platform || null}, ${appVersion || null}
      FROM licenses
      WHERE id = ${license.id}
        AND status = 'active'
        AND (expires_at IS NULL OR datetime(expires_at) > CURRENT_TIMESTAMP)
        AND (
          EXISTS (
            SELECT 1 FROM devices
            WHERE license_id = ${license.id}
              AND device_hash = ${deviceHash}
              AND deactivated_at IS NULL
          )
          OR (SELECT COUNT(*) FROM devices WHERE license_id = ${license.id} AND deactivated_at IS NULL) < device_limit
        )
      ON CONFLICT (license_id, device_hash) DO UPDATE SET
        deactivated_at = NULL,
        last_seen_at = CURRENT_TIMESTAMP,
        platform = excluded.platform,
        app_version = excluded.app_version
      WHERE devices.deactivated_at IS NULL
        OR (SELECT COUNT(*) FROM devices WHERE license_id = ${license.id} AND deactivated_at IS NULL) < ${license.deviceLimit}
    `)

  if (activated.rowsAffected === 0) {
    return {
      ...toLicenseStatus(license, await countActiveDevices(license.id)),
      licensed: false,
      message: `This license has reached its ${license.deviceLimit}-device limit.`
    }
  }

  return toLicenseStatus(license, await countActiveDevices(license.id))
}
