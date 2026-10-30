import { randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { creatorApplications, licenses } from '@/db/schema'
import { getDb } from '@/lib/db'
import {
  CREATOR_CREDIT_LIMIT_CENTS,
  CREATOR_PROGRAM_MAX_APPROVED,
  CreatorProgramError,
  normalizeCreatorApplication
} from '@/lib/creator-program-options'
import { decryptCreatorKey, encryptCreatorKey } from '@/lib/creator-key-secret'
import { GRANTED_PROVIDER, grantLicense, normalizeReason, revokeGrantedLicense } from '@/lib/license-admin'
import {
  createCreatorKey,
  deleteCreatorKey,
  disableCreatorKey,
  readCreatorKeyUsage,
  requireManagementKey
} from '@/lib/openrouter-keys'

const ALREADY_APPLIED = 'You have already applied. The decision will appear in your dashboard.'
const DECISION_NOTE_MAX = 500

const applicationColumns = {
  id: creatorApplications.id,
  userId: creatorApplications.userId,
  status: creatorApplications.status,
  profileUrl: creatorApplications.profileUrl,
  platformsJson: creatorApplications.platformsJson,
  audience: creatorApplications.audience,
  plan: creatorApplications.plan,
  decisionNote: creatorApplications.decisionNote,
  decidedAt: creatorApplications.decidedAt,
  creditLimitCents: creatorApplications.creditLimitCents,
  openrouterKeyHash: creatorApplications.openrouterKeyHash,
  openrouterKeyCiphertext: creatorApplications.openrouterKeyCiphertext,
  openrouterKeyDisabledAt: creatorApplications.openrouterKeyDisabledAt,
  createdAt: creatorApplications.createdAt
}

// The key itself never leaves this module except through getCreatorKeyForUser; hasKey says whether one exists.
const toApplication = (row) => ({
  id: row.id,
  userId: row.userId,
  status: row.status,
  profileUrl: row.profileUrl,
  platforms: JSON.parse(row.platformsJson),
  audience: row.audience,
  plan: row.plan,
  decisionNote: row.decisionNote || null,
  decidedAt: row.decidedAt || null,
  creditLimitCents: row.creditLimitCents ?? null,
  hasKey: Boolean(row.openrouterKeyCiphertext),
  keyDisabled: Boolean(row.openrouterKeyDisabledAt),
  createdAt: row.createdAt
})

const getApplicationById = async (applicationId) => {
  const [row] = await getDb()
    .select(applicationColumns)
    .from(creatorApplications)
    .where(eq(creatorApplications.id, applicationId))
    .limit(1)

  return row ? toApplication(row) : null
}

const getApplicationRowForUser = async (userId) => {
  const [row] = await getDb()
    .select(applicationColumns)
    .from(creatorApplications)
    .where(eq(creatorApplications.userId, userId))
    .limit(1)

  return row || null
}

export const getCreatorApplication = async (userId) => {
  const row = await getApplicationRowForUser(userId)
  return row ? toApplication(row) : null
}

// Pending applications first, then the newest.
export const listCreatorApplications = async () => {
  const rows = await getDb()
    .select(applicationColumns)
    .from(creatorApplications)
    .orderBy(sql`CASE ${creatorApplications.status} WHEN 'pending' THEN 0 ELSE 1 END`, desc(creatorApplications.createdAt))
    .limit(500)

  return rows.map(toApplication)
}

/**
 * Stores the signed-in account's application. One application per account: the unique index on
 * user_id makes a second submission, including a racing one, a conflict rather than a duplicate.
 */
export const submitCreatorApplication = async (userId, input) => {
  if (!userId) throw new CreatorProgramError('Please sign in to apply.', 401)
  const values = normalizeCreatorApplication(input)

  const result = await getDb().run(sql`
    INSERT INTO creator_applications (id, user_id, status, profile_url, platforms_json, audience, plan)
    VALUES (${randomUUID()}, ${userId}, 'pending', ${values.profileUrl}, ${JSON.stringify(values.platforms)}, ${values.audience}, ${values.plan})
    ON CONFLICT (user_id) DO NOTHING
  `)
  if (result.rowsAffected !== 1) throw new CreatorProgramError(ALREADY_APPLIED, 409)

  return getCreatorApplication(userId)
}

const notFound = () => new CreatorProgramError('That application was not found.', 404)
const alreadyDecided = () => new CreatorProgramError('This application has already been decided.', 409)

const normalizeCreditLimitCents = (value) => {
  const { min, max } = CREATOR_CREDIT_LIMIT_CENTS
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new CreatorProgramError(`Choose a credit limit between $${(min / 100).toFixed(2)} and $${(max / 100).toFixed(2)}.`)
  }
  return value
}

// Everything approval needs outside the database. Checked before anything is claimed.
const assertCreatorKeysReady = () => {
  requireManagementKey()
  if (!process.env.DESKTOP_AUTH_SIGNING_KEY) {
    throw new CreatorProgramError('Creator keys are not set up. Add DESKTOP_AUTH_SIGNING_KEY to the server settings first.', 503)
  }
}

// Puts an approval back as it was: deletes the key it created, if any, and returns the application to pending.
const undoApproval = async (applicationId, keyHash) => {
  if (keyHash) {
    await deleteCreatorKey(keyHash).catch((error) => {
      console.error(`Could not delete the unused OpenRouter key ${keyHash}. Delete it in the OpenRouter dashboard.`, error)
    })
  }
  await getDb().run(sql`
    UPDATE creator_applications SET status = 'pending', decided_at = NULL, credit_limit_cents = NULL,
      openrouter_key_hash = NULL, openrouter_key_ciphertext = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${applicationId} AND status = 'approved'
  `)
}

/**
 * Approves a pending application: creates its OpenRouter key with the chosen spending limit and grants its
 * free license. The application is claimed first, so two admins cannot both approve it, and the claim also
 * refuses approvals past CREATOR_PROGRAM_MAX_APPROVED. If the key or the license cannot be created, the
 * approval is undone and nothing is left behind.
 */
export const approveCreatorApplication = async (adminId, applicationId, { creditLimitCents } = {}) => {
  const creditLimit = normalizeCreditLimitCents(creditLimitCents)
  const application = await getApplicationById(applicationId)
  if (!application) throw notFound()
  if (application.status !== 'pending') throw alreadyDecided()
  assertCreatorKeysReady()

  const claim = await getDb().run(sql`
    UPDATE creator_applications SET status = 'approved', decided_at = CURRENT_TIMESTAMP,
      credit_limit_cents = ${creditLimit}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${applicationId} AND status = 'pending'
      AND (SELECT COUNT(*) FROM creator_applications WHERE status = 'approved') < ${CREATOR_PROGRAM_MAX_APPROVED}
  `)
  if (claim.rowsAffected !== 1) {
    const current = await getApplicationById(applicationId)
    if (!current) throw notFound()
    if (current.status !== 'pending') throw alreadyDecided()
    throw new CreatorProgramError(`You have already approved ${CREATOR_PROGRAM_MAX_APPROVED} creators, the program maximum.`, 409)
  }

  let keyHash = null
  try {
    const key = await createCreatorKey({
      name: `Deyn Studio creator ${applicationId}`,
      limitUsd: creditLimit / 100
    })
    keyHash = key.hash
    await getDb().run(sql`
      UPDATE creator_applications SET openrouter_key_hash = ${key.hash},
        openrouter_key_ciphertext = ${encryptCreatorKey(key.key)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${applicationId}
    `)
    await grantLicense(adminId, application.userId, { reason: 'Creator program application' })
  } catch (error) {
    await undoApproval(applicationId, keyHash).catch((undoError) => {
      console.error('Could not undo a failed creator approval:', undoError)
    })
    throw error
  }

  return getApplicationById(applicationId)
}

const normalizeDecisionNote = (value) => {
  if (value === undefined || value === null) return null
  const note = typeof value === 'string' ? value.trim() : ''
  if (note.length > DECISION_NOTE_MAX) {
    throw new CreatorProgramError(`Keep the note under ${DECISION_NOTE_MAX} characters.`)
  }
  return note || null
}

/** Declines a pending application. The optional note is shown to the applicant in their dashboard. */
export const declineCreatorApplication = async (applicationId, note) => {
  const decisionNote = normalizeDecisionNote(note)

  const result = await getDb().run(sql`
    UPDATE creator_applications SET status = 'declined', decision_note = ${decisionNote}, decided_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${applicationId} AND status = 'pending'
  `)
  if (result.rowsAffected === 1) return getApplicationById(applicationId)

  if (await getApplicationById(applicationId)) throw alreadyDecided()
  throw notFound()
}

/** The applicant's own key, decrypted, for an approved application whose key is still enabled. Null otherwise. */
export const getCreatorKeyForUser = async (userId) => {
  const row = await getApplicationRowForUser(userId)
  if (!row?.openrouterKeyCiphertext || row.status !== 'approved' || row.openrouterKeyDisabledAt) return null
  return decryptCreatorKey(row.openrouterKeyCiphertext)
}

// Disables the applicant's key once. A key that is already disabled, or that was never created, is left alone.
const disableCreatorKeyForRow = async (row) => {
  if (!row?.openrouterKeyHash || row.openrouterKeyDisabledAt) return
  await disableCreatorKey(row.openrouterKeyHash)
  await getDb().run(sql`
    UPDATE creator_applications SET openrouter_key_disabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${row.id}
  `)
}

/**
 * Revokes an admin-granted license and disables the account's creator key, if it has one. The key is disabled
 * first: if OpenRouter refuses, the license stays active, nothing is half-revoked, and the revoke can be retried.
 * Paid licenses and inactive ones are passed straight to revokeGrantedLicense, which refuses them.
 */
export const revokeCreatorLicense = async (adminId, licenseId, reason) => {
  normalizeReason(reason)
  const [license] = await getDb()
    .select({ userId: licenses.userId, status: licenses.status, paymentProvider: licenses.paymentProvider })
    .from(licenses)
    .where(eq(licenses.id, licenseId))
    .limit(1)

  if (license?.status === 'active' && license.paymentProvider === GRANTED_PROVIDER) {
    await disableCreatorKeyForRow(await getApplicationRowForUser(license.userId))
  }
  await revokeGrantedLicense(adminId, licenseId, reason)
}

/** How much of the applicant's key has been spent, read from OpenRouter. Null when there is no key. */
export const getCreatorKeyUsageForUser = async (userId) => {
  const row = await getApplicationRowForUser(userId)
  if (!row?.openrouterKeyHash || row.status !== 'approved') return null
  return readCreatorKeyUsage(row.openrouterKeyHash)
}
