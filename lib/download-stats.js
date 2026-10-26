import { desc, gte, sql } from 'drizzle-orm'
import { downloadCounts } from '@/db/schema'
import { getDb } from '@/lib/db'

const dayKey = (time) => new Date(time).toISOString().slice(0, 10)

// Link previews, crawlers and command-line fetchers follow download links without a person behind them.
const AUTOMATED_AGENT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|curl|wget|python-requests|go-http-client|node-fetch|axios/i

export const isAutomatedAgent = (userAgent) => !userAgent || AUTOMATED_AGENT.test(userAgent)

export const recordDownload = async ({ platform, version }, now = Date.now()) => {
  await getDb().run(sql`
    INSERT INTO download_counts (day, platform, version, count)
    VALUES (${dayKey(now)}, ${platform}, ${version}, 1)
    ON CONFLICT (day, platform, version) DO UPDATE SET count = count + 1
  `)
}

/** Per-day, per-platform, per-version counts for the last `days` UTC days, newest first. */
export const getDownloadStats = async (days = 30, now = Date.now()) =>
  getDb()
    .select()
    .from(downloadCounts)
    .where(gte(downloadCounts.day, dayKey(now - (days - 1) * 86_400_000)))
    .orderBy(desc(downloadCounts.day), downloadCounts.platform)

export const SUMMARY_WINDOWS = [{ days: 1, label: 'Today' }, { days: 7, label: 'Last 7 days' }, { days: 30, label: 'Last 30 days' }]

/** Totals per platform for each summary window, and the last 30 days by version, newest version first. */
export const getDownloadSummary = async (now = Date.now()) => {
  const rows = await getDownloadStats(30, now)
  const sum = (days, platform) => {
    const since = dayKey(now - (days - 1) * 86_400_000)
    return rows
      .filter((row) => row.day >= since && (!platform || row.platform === platform))
      .reduce((total, row) => total + row.count, 0)
  }
  const byVersion = {}
  for (const row of rows) byVersion[row.version] = (byVersion[row.version] || 0) + row.count
  return {
    platforms: ['silicon', 'intel', 'windows'].map((platform) => ({
      platform,
      totals: SUMMARY_WINDOWS.map(({ days }) => sum(days, platform))
    })),
    totals: SUMMARY_WINDOWS.map(({ days }) => sum(days)),
    versions: Object.entries(byVersion).sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
  }
}
