import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createClient } from '@libsql/client'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const dbFile = join(mkdtempSync(join(tmpdir(), 'cutly-test-')), 'test.db')
process.env.TURSO_DATABASE_URL = `file:${dbFile}`
process.env.TURSO_AUTH_TOKEN = 'test-only'
process.env.DESKTOP_AUTH_SIGNING_KEY = 'test-only-signing-secret-for-creator-keys'
const MANAGEMENT_KEY = 'sk-or-v1-management-test-only'
process.env.OPENROUTER_MANAGEMENT_KEY = MANAGEMENT_KEY

const setup = createClient({ url: process.env.TURSO_DATABASE_URL })
await migrate(drizzle(setup), { migrationsFolder: './drizzle' })
setup.close()

// A stand-in for OpenRouter's key API. It keeps the keys it creates, so tests can see what was made and deleted.
const KEYS_URL = 'https://openrouter.ai/api/v1/keys'
const openRouter = { keys: new Map(), creates: [], patches: [], failNextCreate: false, failNextPatch: false, nextId: 1 }
const realFetch = globalThis.fetch
globalThis.fetch = async (url, options = {}) => {
  const target = String(url)
  if (!target.startsWith(KEYS_URL)) return realFetch(url, options)
  if (options.headers?.Authorization !== `Bearer ${MANAGEMENT_KEY}`) {
    return Response.json({ error: 'A management key is required.' }, { status: 403 })
  }

  const path = target.slice(KEYS_URL.length)
  if (options.method === 'POST' && path === '') {
    const body = JSON.parse(options.body)
    openRouter.creates.push(body)
    if (openRouter.failNextCreate) {
      openRouter.failNextCreate = false
      return new Response('{"error":"unavailable"}', { status: 500 })
    }
    const hash = `hash_${openRouter.nextId++}`
    const key = `sk-or-v1-test-${hash}-secret`
    openRouter.keys.set(hash, { key, limit: body.limit, usage: 0, disabled: false })
    return Response.json({ data: { hash, limit: body.limit, limit_remaining: body.limit, usage: 0 }, key }, { status: 201 })
  }

  const hash = decodeURIComponent(path.slice(1))
  const record = openRouter.keys.get(hash)
  if (!record) return Response.json({ error: 'Not found.' }, { status: 404 })
  if (options.method === 'GET') {
    return Response.json({ data: { hash, usage: record.usage, limit_remaining: record.limit - record.usage, disabled: record.disabled } })
  }
  if (options.method === 'PATCH') {
    openRouter.patches.push(hash)
    if (openRouter.failNextPatch) {
      openRouter.failNextPatch = false
      return new Response('{"error":"unavailable"}', { status: 500 })
    }
    record.disabled = JSON.parse(options.body).disabled === true
    return Response.json({ data: { hash, disabled: record.disabled } })
  }
  if (options.method === 'DELETE') {
    openRouter.keys.delete(hash)
    return Response.json({ deleted: true })
  }
  return new Response(null, { status: 405 })
}

const { normalizeCreatorApplication, CREATOR_PROGRAM_MAX_APPROVED, CreatorProgramError } = await import('../lib/creator-program-options.js')
const {
  approveCreatorApplication,
  declineCreatorApplication,
  getCreatorApplication,
  getCreatorKeyForUser,
  getCreatorKeyUsageForUser,
  listCreatorApplications,
  revokeCreatorLicense,
  submitCreatorApplication
} = await import('../lib/creator-program.js')
const { decryptCreatorKey, encryptCreatorKey } = await import('../lib/creator-key-secret.js')
const { grantLicense } = await import('../lib/license-admin.js')
const { getLicenseStatus } = await import('../lib/license.js')
const { getDb } = await import('../lib/db.js')

const REVIEWER = 'user_admin_reviewer'
const withStatus = (status) => (error) => error?.status === status

const validApplication = {
  profileUrl: '  youtube.com/@creator  ',
  platforms: ['YouTube', 'TikTok'],
  audience: '10k-100k',
  plan: 'Turn my weekly stream into short clips with captions.'
}

const rejects = (fn, message) => assert.throws(fn, (error) => error instanceof CreatorProgramError && error.status === 400 && (!message || error.message.includes(message)))

const applyFor = async (userId) => {
  await submitCreatorApplication(userId, validApplication)
  return (await getCreatorApplication(userId)).id
}

test('a complete application is trimmed and its link is stored as https', () => {
  const cleaned = normalizeCreatorApplication(validApplication)
  assert.equal(cleaned.profileUrl, 'https://youtube.com/@creator')
  assert.deepEqual(cleaned.platforms, ['YouTube', 'TikTok'])
  assert.equal(cleaned.audience, '10k-100k')
  assert.equal(cleaned.plan, validApplication.plan)
})

test('an http link is upgraded to https rather than refused', () => {
  assert.equal(normalizeCreatorApplication({ ...validApplication, profileUrl: 'http://example.com/me' }).profileUrl, 'https://example.com/me')
})

test('a link that is empty, has spaces or has no real domain is refused', () => {
  rejects(() => normalizeCreatorApplication({ ...validApplication, profileUrl: '' }), 'main channel')
  rejects(() => normalizeCreatorApplication({ ...validApplication, profileUrl: 'my channel' }), 'main channel')
  rejects(() => normalizeCreatorApplication({ ...validApplication, profileUrl: 'localhost' }), 'valid link')
})

test('platforms must be known and at least one must be chosen', () => {
  rejects(() => normalizeCreatorApplication({ ...validApplication, platforms: [] }), 'Choose where you publish')
  rejects(() => normalizeCreatorApplication({ ...validApplication, platforms: ['MySpace'] }), 'Choose where you publish')
  rejects(() => normalizeCreatorApplication({ ...validApplication, platforms: 'YouTube' }), 'Choose where you publish')
  assert.deepEqual(normalizeCreatorApplication({ ...validApplication, platforms: ['X', 'X'] }).platforms, ['X'])
})

test('the audience must be one of the listed ranges', () => {
  rejects(() => normalizeCreatorApplication({ ...validApplication, audience: 'a-million' }), 'audience size')
  rejects(() => normalizeCreatorApplication({ ...validApplication, audience: undefined }), 'audience size')
})

test('the plan must be a real description within its length limits', () => {
  rejects(() => normalizeCreatorApplication({ ...validApplication, plan: 'too short' }), 'in 20 to 600 characters')
  rejects(() => normalizeCreatorApplication({ ...validApplication, plan: 'x'.repeat(601) }), 'in 20 to 600 characters')
})

test('a missing application body is refused', () => {
  rejects(() => normalizeCreatorApplication(null), 'required')
  rejects(() => normalizeCreatorApplication(['not', 'an', 'object']), 'required')
})

test('an application is stored for the signed-in account and read back', async () => {
  const application = await submitCreatorApplication('user_creator_1', validApplication)
  assert.equal(application.status, 'pending')
  assert.equal(application.profileUrl, 'https://youtube.com/@creator')
  assert.deepEqual(application.platforms, ['YouTube', 'TikTok'])
  assert.equal(application.decisionNote, null)
  assert.equal(application.hasKey, false)

  const stored = await getCreatorApplication('user_creator_1')
  assert.equal(stored.id, application.id)
  assert.deepEqual(stored.platforms, ['YouTube', 'TikTok'])
})

test('a second application from the same account is a conflict and changes nothing', async () => {
  const before = await getCreatorApplication('user_creator_1')
  await assert.rejects(
    submitCreatorApplication('user_creator_1', { ...validApplication, audience: 'under-1k' }),
    (error) => error instanceof CreatorProgramError && error.status === 409
  )
  const after = await getCreatorApplication('user_creator_1')
  assert.equal(after.id, before.id)
  assert.equal(after.audience, '10k-100k')
})

test('an account without an application reads as none', async () => {
  assert.equal(await getCreatorApplication('user_creator_nobody'), null)
  assert.equal(await getCreatorKeyForUser('user_creator_nobody'), null)
})

test('submitting needs a signed-in account', async () => {
  await assert.rejects(submitCreatorApplication(null, validApplication), withStatus(401))
})

test('an invalid application is not stored', async () => {
  await assert.rejects(submitCreatorApplication('user_creator_2', { ...validApplication, plan: 'nope' }), CreatorProgramError)
  assert.equal(await getCreatorApplication('user_creator_2'), null)
})

test('a key is encrypted at rest and only opens with the same secret', () => {
  const ciphertext = encryptCreatorKey('sk-or-v1-plain-text-key')
  assert.ok(!ciphertext.includes('sk-or-v1'))
  assert.equal(decryptCreatorKey(ciphertext), 'sk-or-v1-plain-text-key')
  const tampered = `${ciphertext.slice(0, -2)}${ciphertext.endsWith('A') ? 'B' : 'A'}A`
  assert.throws(() => decryptCreatorKey(tampered))
})

test('approving creates a capped key, stores it encrypted and grants the free license', async () => {
  const id = await applyFor('user_applicant_approve')
  const approved = await approveCreatorApplication(REVIEWER, id, { creditLimitCents: 50 })
  assert.equal(approved.status, 'approved')
  assert.equal(approved.creditLimitCents, 50)
  assert.equal(approved.hasKey, true)
  assert.ok(approved.decidedAt)

  const [created] = openRouter.creates.slice(-1)
  assert.equal(created.limit, 0.5)
  assert.equal(created.limit_reset, null)

  const [row] = await getDb().all(sql`SELECT openrouter_key_ciphertext AS ciphertext FROM creator_applications WHERE id = ${id}`)
  const key = await getCreatorKeyForUser('user_applicant_approve')
  assert.ok(key.startsWith('sk-or-v1-test-'))
  assert.notEqual(row.ciphertext, key)

  const status = await getLicenseStatus('user_applicant_approve')
  assert.equal(status.licensed, true)
  assert.equal(status.type, 'lifetime')
})

test('the applicant can read their key and its usage, and nobody else can', async () => {
  const usage = await getCreatorKeyUsageForUser('user_applicant_approve')
  assert.deepEqual(usage, { usage: 0, limitRemaining: 0.5 })
  assert.equal(await getCreatorKeyUsageForUser('user_creator_1'), null)
})

test('a decided application cannot be approved again, and no second key is created', async () => {
  const { id } = await getCreatorApplication('user_applicant_approve')
  const creates = openRouter.creates.length
  await assert.rejects(approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 }), withStatus(409))
  await assert.rejects(declineCreatorApplication(id, 'Too late'), withStatus(409))
  assert.equal(openRouter.creates.length, creates)
})

test('the spending limit must be a whole number of cents from 40 to 100', async () => {
  const id = await applyFor('user_applicant_limit')
  const creates = openRouter.creates.length
  for (const creditLimitCents of [39, 101, 50.5, '50', undefined, null]) {
    await assert.rejects(approveCreatorApplication(REVIEWER, id, { creditLimitCents }), withStatus(400))
  }
  assert.equal(openRouter.creates.length, creates)
  assert.equal((await getCreatorApplication('user_applicant_limit')).status, 'pending')
})

test('an approval is refused when the key service is not configured, and changes nothing', async () => {
  const id = await applyFor('user_applicant_unconfigured')
  const saved = process.env.OPENROUTER_MANAGEMENT_KEY
  delete process.env.OPENROUTER_MANAGEMENT_KEY
  try {
    await assert.rejects(approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 }), withStatus(503))
  } finally {
    process.env.OPENROUTER_MANAGEMENT_KEY = saved
  }
  assert.equal((await getCreatorApplication('user_applicant_unconfigured')).status, 'pending')
})

test('when OpenRouter fails to create the key, the approval is undone and no license is granted', async () => {
  const id = await applyFor('user_applicant_down')
  openRouter.failNextCreate = true
  await assert.rejects(approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 }), withStatus(502))
  const after = await getCreatorApplication('user_applicant_down')
  assert.equal(after.status, 'pending')
  assert.equal(after.hasKey, false)
  assert.equal((await getLicenseStatus('user_applicant_down')).licensed, false)
})

test('an approval that cannot grant a license deletes its key and stays pending', async () => {
  await grantLicense(REVIEWER, 'user_applicant_licensed', { reason: 'Already a partner' })
  const id = await applyFor('user_applicant_licensed')
  const keysBefore = openRouter.keys.size
  await assert.rejects(approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 }), withStatus(409))
  assert.equal(openRouter.keys.size, keysBefore)
  const after = await getCreatorApplication('user_applicant_licensed')
  assert.equal(after.status, 'pending')
  assert.equal(after.decidedAt, null)
  assert.equal(after.creditLimitCents, null)
  assert.equal(after.hasKey, false)
})

test('declining keeps the trimmed note, grants no license and gives no key', async () => {
  const id = await applyFor('user_applicant_decline')
  const declined = await declineCreatorApplication(id, '  Not the right audience yet.  ')
  assert.equal(declined.status, 'declined')
  assert.equal(declined.decisionNote, 'Not the right audience yet.')
  assert.equal(declined.hasKey, false)
  assert.equal((await getLicenseStatus('user_applicant_decline')).licensed, false)
  assert.equal(await getCreatorKeyForUser('user_applicant_decline'), null)
})

test('a blank decline note is stored as none, and an overlong one is refused without deciding', async () => {
  const blankId = await applyFor('user_applicant_blank')
  assert.equal((await declineCreatorApplication(blankId, '   ')).decisionNote, null)

  const longId = await applyFor('user_applicant_long')
  await assert.rejects(declineCreatorApplication(longId, 'x'.repeat(501)), withStatus(400))
  assert.equal((await getCreatorApplication('user_applicant_long')).status, 'pending')
})

test('an unknown application is not found', async () => {
  await assert.rejects(approveCreatorApplication(REVIEWER, 'missing-id', { creditLimitCents: 40 }), withStatus(404))
  await assert.rejects(declineCreatorApplication('missing-id', 'Nope'), withStatus(404))
})

test('the review list shows pending applications before decided ones', async () => {
  const list = await listCreatorApplications()
  const lastPending = list.map((application) => application.status).lastIndexOf('pending')
  const firstDecided = list.findIndex((application) => application.status !== 'pending')
  assert.ok(lastPending !== -1 && firstDecided !== -1)
  assert.ok(lastPending < firstDecided)
  assert.ok(list.every((application) => application.userId))
  assert.ok(list.every((application) => !('openrouterKeyCiphertext' in application)))
})

const activeLicenseId = async (userId) => {
  const [license] = await getDb().all(sql`SELECT id FROM licenses WHERE user_id = ${userId} AND status = 'active'`)
  return license.id
}

const keyHashOf = async (userId) => {
  const [row] = await getDb().all(sql`SELECT openrouter_key_hash AS hash FROM creator_applications WHERE user_id = ${userId}`)
  return row.hash
}

test('revoking the license of an approved creator disables their key, and the key can no longer be shown', async () => {
  const userId = 'user_applicant_approve'
  const hash = await keyHashOf(userId)
  await revokeCreatorLicense(REVIEWER, await activeLicenseId(userId), 'Program ended for this creator')

  assert.equal((await getLicenseStatus(userId)).licensed, false)
  assert.equal(openRouter.keys.get(hash).disabled, true)
  assert.equal(await getCreatorKeyForUser(userId), null)
  const after = await getCreatorApplication(userId)
  assert.equal(after.keyDisabled, true)
  assert.equal(after.status, 'approved')
})

test('a key that OpenRouter cannot disable keeps the license active, so the revoke can be retried', async () => {
  const id = await applyFor('user_applicant_retry')
  await approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 })
  const licenseId = await activeLicenseId('user_applicant_retry')
  const hash = await keyHashOf('user_applicant_retry')

  openRouter.failNextPatch = true
  await assert.rejects(revokeCreatorLicense(REVIEWER, licenseId, 'Retry this'), withStatus(502))
  assert.equal((await getLicenseStatus('user_applicant_retry')).licensed, true)
  assert.equal(openRouter.keys.get(hash).disabled, false)
  assert.notEqual(await getCreatorKeyForUser('user_applicant_retry'), null)

  await revokeCreatorLicense(REVIEWER, licenseId, 'Retry this')
  assert.equal((await getLicenseStatus('user_applicant_retry')).licensed, false)
  assert.equal(openRouter.keys.get(hash).disabled, true)
  assert.equal(await getCreatorKeyForUser('user_applicant_retry'), null)
})

test('revoking a paid license leaves a creator key alone', async () => {
  const id = await applyFor('user_applicant_paid')
  await approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 })
  const licenseId = await activeLicenseId('user_applicant_paid')
  const hash = await keyHashOf('user_applicant_paid')
  await getDb().run(sql`UPDATE licenses SET payment_provider = 'stripe' WHERE id = ${licenseId}`)

  const patches = openRouter.patches.length
  await assert.rejects(revokeCreatorLicense(REVIEWER, licenseId, 'Not allowed'), withStatus(409))
  assert.equal(openRouter.patches.length, patches)
  assert.equal(openRouter.keys.get(hash).disabled, false)
  assert.equal((await getLicenseStatus('user_applicant_paid')).licensed, true)
})

test('revoking a license for an account with no creator key touches no key', async () => {
  await grantLicense(REVIEWER, 'user_plain_partner', { reason: 'Partner' })
  const licenseId = await activeLicenseId('user_plain_partner')
  const patches = openRouter.patches.length
  await revokeCreatorLicense(REVIEWER, licenseId, 'Partnership ended')
  assert.equal((await getLicenseStatus('user_plain_partner')).licensed, false)
  assert.equal(openRouter.patches.length, patches)
})

test('a revoke with no reason is refused before any key is touched', async () => {
  const id = await applyFor('user_applicant_reason')
  await approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 })
  const licenseId = await activeLicenseId('user_applicant_reason')
  const patches = openRouter.patches.length
  await assert.rejects(revokeCreatorLicense(REVIEWER, licenseId, ' '), withStatus(400))
  assert.equal(openRouter.patches.length, patches)
  assert.equal((await getLicenseStatus('user_applicant_reason')).licensed, true)
})

test('the program approves at most the maximum, and refuses one more without creating a key', async () => {
  let approved = (await listCreatorApplications()).filter((application) => application.status === 'approved').length
  for (let index = 0; approved < CREATOR_PROGRAM_MAX_APPROVED; index += 1) {
    const id = await applyFor(`user_cap_${index}`)
    await approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 })
    approved += 1
  }

  const id = await applyFor('user_cap_over')
  const keysBefore = openRouter.keys.size
  await assert.rejects(approveCreatorApplication(REVIEWER, id, { creditLimitCents: 40 }), withStatus(409))
  assert.equal(openRouter.keys.size, keysBefore)
  assert.equal((await getCreatorApplication('user_cap_over')).status, 'pending')
})
