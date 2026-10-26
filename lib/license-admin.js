import { randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { licenseGrantAudit, licenses } from '@/db/schema'
import { getDb } from '@/lib/db'
import { getActiveLicense } from '@/lib/license'
import { syncUser } from '@/lib/users'

export const GRANTED_PROVIDER = 'admin'
// The one license Deyn sells: lifetime, on two devices. A granted license matches it exactly.
export const LIFETIME_DEVICE_LIMIT = 2
const LIFETIME_PLAN_NAME = 'Deyn Studio Lifetime'

export class LicenseAdminError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'LicenseAdminError'
    this.status = status
  }
}

const emailPattern = /^[^\s@]{1,64}@[^\s@]{1,255}$/

export const normalizeEmail = (value) => {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!emailPattern.test(email) || email.length > 254) {
    throw new LicenseAdminError('Enter a valid email address.')
  }
  return email
}

export const normalizeReason = (value) => {
  const reason = typeof value === 'string' ? value.trim() : ''
  if (reason.length < 3 || reason.length > 200) {
    throw new LicenseAdminError('Give a reason of 3 to 200 characters.')
  }
  return reason
}

export const listUserLicenses = async (userId) =>
  getDb()
    .select({
      id: licenses.id,
      type: licenses.type,
      status: licenses.status,
      planName: licenses.planName,
      deviceLimit: licenses.deviceLimit,
      expiresAt: licenses.expiresAt,
      paymentProvider: licenses.paymentProvider,
      createdAt: licenses.createdAt
    })
    .from(licenses)
    .where(eq(licenses.userId, userId))
    .orderBy(desc(licenses.createdAt))
    .limit(10)

export const listRecentGrantAudit = async (limit = 20) =>
  getDb()
    .select({
      id: licenseGrantAudit.id,
      action: licenseGrantAudit.action,
      changedBy: licenseGrantAudit.changedBy,
      targetUserId: licenseGrantAudit.targetUserId,
      licenseId: licenseGrantAudit.licenseId,
      reason: licenseGrantAudit.reason,
      changedAt: licenseGrantAudit.changedAt
    })
    .from(licenseGrantAudit)
    .orderBy(desc(licenseGrantAudit.changedAt))
    .limit(limit)

/**
 * Every license, newest first with active ones first. Each row says who granted it and why, who revoked
 * it, how many devices are active, and the country and time of the first device activation.
 */
export const listLicenseOverview = async (limit = 500) =>
  getDb().all(sql`
    SELECT l.id AS id, l.user_id AS userId, l.type AS type, l.status AS status,
           l.plan_name AS planName, l.device_limit AS deviceLimit,
           l.payment_provider AS paymentProvider, l.created_at AS createdAt,
           g.reason AS grantReason, g.changed_by AS grantedBy, g.changed_at AS grantedAt,
           r.reason AS revokeReason, r.changed_by AS revokedBy, r.changed_at AS revokedAt,
           (SELECT COUNT(*) FROM devices d WHERE d.license_id = l.id AND d.deactivated_at IS NULL) AS devicesUsed,
           (SELECT d.country FROM devices d WHERE d.license_id = l.id ORDER BY d.created_at, d.rowid LIMIT 1) AS firstCountry,
           (SELECT d.created_at FROM devices d WHERE d.license_id = l.id ORDER BY d.created_at, d.rowid LIMIT 1) AS firstActivatedAt
    FROM licenses l
    LEFT JOIN license_grant_audit g ON g.license_id = l.id AND g.action = 'grant'
    LEFT JOIN license_grant_audit r ON r.license_id = l.id AND r.action = 'revoke'
    ORDER BY (l.status = 'active') DESC, l.created_at DESC
    LIMIT ${limit}
  `)

/** Totals for the dashboard, computed from the rows of listLicenseOverview. */
export const summarizeLicenses = (rows) => {
  const active = rows.filter((row) => row.status === 'active')
  const byCountry = new Map()
  for (const row of active) {
    const code = row.firstCountry || null
    byCountry.set(code, (byCountry.get(code) || 0) + 1)
  }
  return {
    activeCount: active.length,
    grantedActive: active.filter((row) => row.paymentProvider === GRANTED_PROVIDER).length,
    purchasedActive: active.filter((row) => row.paymentProvider !== GRANTED_PROVIDER).length,
    devicesInUse: active.reduce((total, row) => total + Number(row.devicesUsed || 0), 0),
    countries: [...byCountry].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count)
  }
}

/** Gives one account a license by hand. The license and its audit row are written together. */
export const grantLicense = async (adminId, userId, { reason }) => {
  const cleanReason = normalizeReason(reason)
  if (!adminId || !userId) throw new LicenseAdminError('An admin and a user are required.')

  await syncUser(userId)
  if (await getActiveLicense(userId)) {
    throw new LicenseAdminError('This account already has an active license. Revoke it first to replace it.', 409)
  }

  const id = randomUUID()
  await getDb().transaction(async (transaction) => {
    await transaction.insert(licenses).values({
      id,
      userId,
      type: 'lifetime',
      status: 'active',
      planName: LIFETIME_PLAN_NAME,
      deviceLimit: LIFETIME_DEVICE_LIMIT,
      paymentProvider: GRANTED_PROVIDER,
      providerTransactionId: `${GRANTED_PROVIDER}:${id}`
    })
    await transaction.insert(licenseGrantAudit).values({
      id: randomUUID(),
      action: 'grant',
      changedBy: adminId,
      targetUserId: userId,
      licenseId: id,
      reason: cleanReason,
      detailsJson: JSON.stringify({ type: 'lifetime', deviceLimit: LIFETIME_DEVICE_LIMIT })
    })
  })
  return { id }
}

/** Revokes a license an admin granted. Paid licenses are refused: those end through Stripe refunds. */
export const revokeGrantedLicense = async (adminId, licenseId, reason) => {
  const cleanReason = normalizeReason(reason)
  if (!adminId || typeof licenseId !== 'string' || !licenseId) {
    throw new LicenseAdminError('An admin and a license are required.')
  }

  await getDb().transaction(async (transaction) => {
    const [license] = await transaction
      .select({
        userId: licenses.userId,
        status: licenses.status,
        paymentProvider: licenses.paymentProvider
      })
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .limit(1)
    if (!license) throw new LicenseAdminError('That license was not found.', 404)
    if (license.paymentProvider !== GRANTED_PROVIDER) {
      throw new LicenseAdminError('Only licenses granted from this page can be revoked here. Refund paid licenses in Stripe.', 409)
    }
    if (license.status !== 'active') throw new LicenseAdminError('That license is not active.', 409)

    await transaction
      .update(licenses)
      .set({ status: 'revoked', updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(licenses.id, licenseId))
    await transaction.insert(licenseGrantAudit).values({
      id: randomUUID(),
      action: 'revoke',
      changedBy: adminId,
      targetUserId: license.userId,
      licenseId,
      reason: cleanReason,
      detailsJson: JSON.stringify({ previousStatus: license.status })
    })
  })
}
