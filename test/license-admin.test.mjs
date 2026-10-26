import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createClient } from '@libsql/client'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const dbFile = join(mkdtempSync(join(tmpdir(), 'cutly-test-')), 'test.db')
process.env.TURSO_DATABASE_URL = `file:${dbFile}`
process.env.TURSO_AUTH_TOKEN = 'test-only'

const setup = createClient({ url: process.env.TURSO_DATABASE_URL })
await migrate(drizzle(setup), { migrationsFolder: './drizzle' })
setup.close()

const { grantLicense, revokeGrantedLicense, listLicenseOverview, summarizeLicenses, listRecentGrantAudit, normalizeEmail, LicenseAdminError } =
  await import('../lib/license-admin.js')
const { activateDevice, getLicenseStatus } = await import('../lib/license.js')
const { handleStripeEvent } = await import('../lib/stripe-fulfillment.js')
const { getDb } = await import('../lib/db.js')
const { licenses } = await import('../db/schema.js')

const ADMIN = 'user_admin'
const rejects = (promise, status) =>
  assert.rejects(promise, (error) => error instanceof LicenseAdminError && error.status === status)

test('a granted lifetime license makes the account licensed and is audited', async () => {
  await grantLicense(ADMIN, 'user_a', { reason: 'Press review copy' })
  const status = await getLicenseStatus('user_a')
  assert.equal(status.licensed, true)
  assert.equal(status.type, 'lifetime')
  assert.equal(status.deviceLimit, 2)
  const [entry] = (await listRecentGrantAudit()).filter((row) => row.targetUserId === 'user_a')
  assert.equal(entry.action, 'grant')
  assert.equal(entry.changedBy, ADMIN)
  assert.equal(entry.reason, 'Press review copy')
})

test('a granted license is the same lifetime, two-device license a purchase gives', async () => {
  await grantLicense(ADMIN, 'user_b', { reason: 'Partner' })
  const status = await getLicenseStatus('user_b')
  assert.equal(status.licensed, true)
  assert.equal(status.type, 'lifetime')
  assert.equal(status.deviceLimit, 2)
  assert.equal(status.expiresAt, null)
})

test('a missing reason is refused and writes nothing', async () => {
  await rejects(grantLicense(ADMIN, 'user_c', { reason: ' ' }), 400)
  await rejects(grantLicense(ADMIN, 'user_c', {}), 400)
  assert.equal((await getLicenseStatus('user_c')).licensed, false)
})

test('an account with an active license cannot be granted a second one', async () => {
  await handleStripeEvent({
    id: 'evt_admin_1',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_1', payment_status: 'paid', payment_intent: 'pi_admin_1', client_reference_id: 'user_d', metadata: { clerkUserId: 'user_d', licenseType: 'lifetime' } } }
  })
  await rejects(grantLicense(ADMIN, 'user_d', { reason: 'Dup' }), 409)
})

test('revoking a granted license ends access and is audited', async () => {
  const license = await grantLicense(ADMIN, 'user_e', { reason: 'Trial extension' })
  await revokeGrantedLicense(ADMIN, license.id, 'Granted by mistake')
  assert.equal((await getLicenseStatus('user_e')).licensed, false)
  const actions = (await listRecentGrantAudit()).filter((row) => row.targetUserId === 'user_e').map((row) => row.action)
  assert.deepEqual(actions.sort(), ['grant', 'revoke'])
  await rejects(revokeGrantedLicense(ADMIN, license.id, 'Again'), 409)
})

test('a paid license cannot be revoked from the admin page', async () => {
  const [paid] = await getDb().select({ id: licenses.id }).from(licenses).where(eq(licenses.userId, 'user_d'))
  await rejects(revokeGrantedLicense(ADMIN, paid.id, 'Nope'), 409)
  assert.equal((await getLicenseStatus('user_d')).licensed, true)
  await rejects(revokeGrantedLicense(ADMIN, 'missing-id', 'Nope'), 404)
})

test('emails are normalized and malformed ones refused', () => {
  assert.equal(normalizeEmail('  Person@Example.COM '), 'person@example.com')
  assert.throws(() => normalizeEmail('not an email'), LicenseAdminError)
  assert.throws(() => normalizeEmail(undefined), LicenseAdminError)
})

test('the overview shows who granted each license and why, and who revoked it', async () => {
  const license = await grantLicense('user_admin_2', 'user_f', { reason: 'Reviewer' })
  await revokeGrantedLicense(ADMIN, license.id, 'Review published')
  const row = (await listLicenseOverview()).find((entry) => entry.id === license.id)
  assert.equal(row.userId, 'user_f')
  assert.equal(row.status, 'revoked')
  assert.equal(row.grantedBy, 'user_admin_2')
  assert.equal(row.grantReason, 'Reviewer')
  assert.equal(row.revokedBy, ADMIN)
  assert.equal(row.revokeReason, 'Review published')
})

test('the overview records the country of the first device activation, not of later ones', async () => {
  const granted = await grantLicense(ADMIN, 'user_g', { reason: 'Beta tester' })
  await activateDevice('user_g', 'device-hash-first-0001', { platform: 'darwin', appVersion: '1.1.5', country: 'PT' })
  await activateDevice('user_g', 'device-hash-second-02', { platform: 'win32', appVersion: '1.1.5', country: 'BR' })
  await activateDevice('user_g', 'device-hash-first-0001', { platform: 'darwin', appVersion: '1.1.5', country: 'BR' })
  const row = (await listLicenseOverview()).find((entry) => entry.id === granted.id)
  assert.equal(row.devicesUsed, 2)
  assert.equal(row.firstCountry, 'PT')
  assert.ok(row.firstActivatedAt)
})

test('the summary totals active licenses, devices and countries', async () => {
  const summary = summarizeLicenses(await listLicenseOverview())
  assert.ok(summary.activeCount >= 2)
  assert.equal(summary.countries.find((entry) => entry.code === 'PT')?.count, 1)
  assert.ok(summary.devicesInUse >= 2)
  assert.ok(summary.grantedActive + summary.purchasedActive === summary.activeCount)
})
