import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const dbFile = join(mkdtempSync(join(tmpdir(), 'cutly-test-')), 'test.db')
process.env.TURSO_DATABASE_URL = `file:${dbFile}`
process.env.TURSO_AUTH_TOKEN = 'test-only'

const setup = createClient({ url: process.env.TURSO_DATABASE_URL })
await migrate(drizzle(setup), { migrationsFolder: './drizzle' })
setup.close()

const { handleStripeEvent } = await import('../lib/stripe-fulfillment.js')
const { getLicenseStatus } = await import('../lib/license.js')
const { getTrialConfigForAdmin, updateTrialConfig } = await import('../lib/trial.js')
const { getDb } = await import('../lib/db.js')

let counter = 0
const checkoutEvent = (userId, paymentIntent, overrides = {}) => ({
  id: `evt_${++counter}`,
  type: 'checkout.session.completed',
  data: {
    object: {
      id: `cs_${counter}`,
      payment_status: 'paid',
      payment_intent: paymentIntent,
      client_reference_id: userId,
      metadata: { clerkUserId: userId, licenseType: 'lifetime' },
      customer: 'cus_1',
      ...overrides
    }
  }
})
const chargeEvent = (type, object) => ({ id: `evt_${++counter}`, type, data: { object } })

test('a paid checkout activates a lifetime license', async () => {
  await handleStripeEvent(checkoutEvent('user_paid', 'pi_paid'))
  const status = await getLicenseStatus('user_paid')
  assert.equal(status.licensed, true)
  assert.equal(status.type, 'lifetime')
  assert.equal(status.deviceLimit, 2)
})

test('an unpaid checkout does not activate a license', async () => {
  await handleStripeEvent(checkoutEvent('user_unpaid', 'pi_unpaid', { payment_status: 'unpaid' }))
  assert.equal((await getLicenseStatus('user_unpaid')).licensed, false)
})

test('a paid checkout for something other than the lifetime license grants nothing', async (t) => {
  t.mock.method(console, 'warn', () => {})
  await handleStripeEvent(checkoutEvent('user_other', 'pi_other', { metadata: { clerkUserId: 'user_other' } }))
  await handleStripeEvent(checkoutEvent('user_other_type', 'pi_other_type', { metadata: { clerkUserId: 'user_other_type', licenseType: 'monthly' } }))
  assert.equal((await getLicenseStatus('user_other')).licensed, false)
  assert.equal((await getLicenseStatus('user_other_type')).licensed, false)
})

test('a delayed payment that later succeeds activates the license', async () => {
  const pending = checkoutEvent('user_async', 'pi_async', { payment_status: 'unpaid' })
  await handleStripeEvent(pending)
  assert.equal((await getLicenseStatus('user_async')).licensed, false)
  await handleStripeEvent({ ...pending, id: 'evt_async_ok', type: 'checkout.session.async_payment_succeeded' })
  assert.equal((await getLicenseStatus('user_async')).licensed, true)
})

test('redelivering the same event does not create a second license', async () => {
  const event = checkoutEvent('user_dup', 'pi_dup')
  assert.equal((await handleStripeEvent(event)).duplicate, false)
  assert.equal((await handleStripeEvent(event)).duplicate, true)
  const rows = await getDb().$client.execute({ sql: 'SELECT COUNT(*) AS n FROM licenses WHERE user_id = ?', args: ['user_dup'] })
  assert.equal(Number(rows.rows[0].n), 1)
})

test('a full refund revokes the license', async () => {
  await handleStripeEvent(checkoutEvent('user_refund', 'pi_refund'))
  await handleStripeEvent(chargeEvent('charge.refunded', { payment_intent: 'pi_refund', refunded: true }))
  const status = await getLicenseStatus('user_refund')
  assert.equal(status.licensed, false)
  assert.equal(status.status, 'refunded')
})

test('a partial refund keeps the license', async () => {
  await handleStripeEvent(checkoutEvent('user_partial', 'pi_partial'))
  await handleStripeEvent(chargeEvent('charge.refunded', { payment_intent: 'pi_partial', refunded: false }))
  assert.equal((await getLicenseStatus('user_partial')).licensed, true)
})

test('a lost dispute revokes the license, a won one does not', async () => {
  await handleStripeEvent(checkoutEvent('user_lost', 'pi_lost'))
  await handleStripeEvent(checkoutEvent('user_won', 'pi_won'))
  await handleStripeEvent(chargeEvent('charge.dispute.closed', { payment_intent: 'pi_lost', status: 'lost' }))
  await handleStripeEvent(chargeEvent('charge.dispute.closed', { payment_intent: 'pi_won', status: 'won' }))
  assert.equal((await getLicenseStatus('user_lost')).status, 'revoked')
  assert.equal((await getLicenseStatus('user_won')).licensed, true)
})

test('a refund that arrives before the purchase still wins', async () => {
  await handleStripeEvent(chargeEvent('charge.refunded', { payment_intent: 'pi_early', refunded: true }))
  await handleStripeEvent(checkoutEvent('user_early', 'pi_early'))
  const status = await getLicenseStatus('user_early')
  assert.equal(status.licensed, false)
  assert.equal(status.status, 'refunded')
})

test('a refunded customer can buy again', async () => {
  await handleStripeEvent(checkoutEvent('user_rebuy', 'pi_first'))
  await handleStripeEvent(chargeEvent('charge.refunded', { payment_intent: 'pi_first', refunded: true }))
  await handleStripeEvent(checkoutEvent('user_rebuy', 'pi_second'))
  assert.equal((await getLicenseStatus('user_rebuy')).licensed, true)
})

test('trial limit changes are written to the audit log', async () => {
  const before = await getTrialConfigForAdmin()
  await updateTrialConfig({ ...before, clipGenerationsMax: before.clipGenerationsMax + 1 }, 'user_admin')
  const rows = await getDb().$client.execute('SELECT changed_by, previous_json, next_json FROM trial_config_audit')
  assert.equal(rows.rows.length, 1)
  assert.equal(rows.rows[0].changed_by, 'user_admin')
  assert.equal(JSON.parse(rows.rows[0].previous_json).clipGenerationsMax, before.clipGenerationsMax)
  assert.equal(JSON.parse(rows.rows[0].next_json).clipGenerationsMax, before.clipGenerationsMax + 1)
})
