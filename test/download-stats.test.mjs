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

const { getDownloadStats, isAutomatedAgent, recordDownload } = await import('../lib/download-stats.js')
const { versionOfInstaller } = await import('../lib/downloads.js')

const DAY = Date.parse('2026-10-26T12:00:00Z')

test('downloads add up per day, platform and version', async () => {
  await recordDownload({ platform: 'silicon', version: '1.1.5' }, DAY)
  await recordDownload({ platform: 'silicon', version: '1.1.5' }, DAY + 1000)
  await recordDownload({ platform: 'intel', version: '1.1.5' }, DAY)
  await recordDownload({ platform: 'silicon', version: '1.1.5' }, DAY + 86_400_000)
  const rows = await getDownloadStats(30, DAY + 86_400_000)
  const count = (day, platform) => rows.find((row) => row.day === day && row.platform === platform)?.count
  assert.equal(count('2026-10-26', 'silicon'), 2)
  assert.equal(count('2026-10-26', 'intel'), 1)
  assert.equal(count('2026-10-27', 'silicon'), 1)
})

test('days outside the window are left out', async () => {
  const rows = await getDownloadStats(1, DAY + 86_400_000)
  assert.deepEqual([...new Set(rows.map((row) => row.day))], ['2026-10-27'])
})

test('crawlers and command-line fetchers are not counted as people', () => {
  assert.equal(isAutomatedAgent('Mozilla/5.0 (compatible; Googlebot/2.1)'), true)
  assert.equal(isAutomatedAgent('curl/8.4.0'), true)
  assert.equal(isAutomatedAgent('Slackbot-LinkExpanding 1.0'), true)
  assert.equal(isAutomatedAgent(null), true)
  assert.equal(isAutomatedAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15'), false)
})

test('the version comes from the installer file name', () => {
  assert.equal(versionOfInstaller('https://files.deynstudio.com/mac-arm/Deyn-1.1.5-arm64.dmg'), '1.1.5')
  assert.equal(versionOfInstaller('https://files.deynstudio.com/windows/Deyn-1.2.0-setup.exe'), '1.2.0')
  assert.equal(versionOfInstaller('https://files.deynstudio.com/mac-intel/Deyn.dmg'), 'unknown')
})
