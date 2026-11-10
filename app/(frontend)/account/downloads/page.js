import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { SUMMARY_WINDOWS, getDownloadSummary, getRecentDownloads } from '@/lib/download-stats'
import { findClerkUsersByIds } from '@/lib/clerk-users'
import { countryName, flagEmoji } from '@/lib/country'
import { AccountShell, accountProfile } from '@/app/components/AccountShell'

export const metadata = { title: 'Downloads', robots: { index: false, follow: false } }

const LABELS = { silicon: 'Mac (Apple silicon)', intel: 'Mac (Intel)', windows: 'Windows' }

const accountLabel = ({ userId, person }) => person?.email || person?.name || (userId ? 'Signed-in account' : 'Not signed in')

export default async function DownloadsAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Fdownloads')
  if (!isTrialAdmin(userId)) notFound()
  const user = await currentUser()

  let summary = null
  try {
    summary = await getDownloadSummary()
  } catch {
    summary = null
  }

  let recent = null
  try {
    const list = await getRecentDownloads()
    const people = await findClerkUsersByIds(list.map((download) => download.userId).filter(Boolean)).catch(() => new Map())
    recent = list.map((download) => ({ ...download, person: people.get(download.userId) || null }))
  } catch (error) {
    console.error('Could not load the recent downloads:', error)
  }

  return (
    <AccountShell active="downloads" profile={accountProfile(user)} isAdmin title="Downloads" description="Installer downloads started from this website. App updates, link previews and crawlers are not counted, and one visitor counts at most three times an hour per platform. Counts are UTC days.">
          {summary === null ? (
            <p className="m-0 text-sm text-app-mute">The download counts could not be loaded.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-app-line bg-app-panel px-5 py-2  sm:px-7">
                <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-xs text-app-mute">
                      <th className="py-3 pr-3 font-medium" />
                      {SUMMARY_WINDOWS.map(({ label }) => <th key={label} className="py-3 pr-3 text-right font-medium">{label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-line">
                    {summary.platforms.map(({ platform, totals }) => (
                      <tr key={platform}>
                        <th className="py-3 pr-3 font-medium text-app-ink">{LABELS[platform]}</th>
                        {totals.map((value, index) => <td key={SUMMARY_WINDOWS[index].label} className="py-3 pr-3 text-right tabular-nums text-app-ink">{value}</td>)}
                      </tr>
                    ))}
                    <tr>
                      <th className="py-3 pr-3 font-semibold text-app-ink">All</th>
                      {summary.totals.map((value, index) => <td key={SUMMARY_WINDOWS[index].label} className="py-3 pr-3 text-right font-semibold tabular-nums text-app-ink">{value}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="mb-0 mt-10 text-[15px] font-semibold tracking-[-0.01em]">By version, last 30 days</h2>
              {summary.versions.length === 0 ? (
                <p className="mt-3 text-sm text-app-mute">No downloads counted yet. Counting starts when this release of the site is live.</p>
              ) : (
                <ul className="m-0 mt-3 list-none divide-y divide-app-line rounded-xl border border-app-line bg-app-panel p-0 px-5 text-sm text-app-ink sm:px-7">
                  {summary.versions.map(([version, count]) => (
                    <li key={version} className="flex justify-between py-3"><span>{version}</span><span className="tabular-nums">{count}</span></li>
                  ))}
                </ul>
              )}

              <h2 className="mb-0 mt-10 text-[15px] font-semibold tracking-[-0.01em]">Recent downloads</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-app-mute">The latest 100 counted downloads, newest first. Downloads need a signed-in account, which is shown. Older downloads from before sign-in was required show their country only.</p>
              {recent === null ? (
                <p className="mt-3 text-sm text-app-mute">Recent downloads could not be loaded.</p>
              ) : recent.length === 0 ? (
                <p className="mt-3 text-sm text-app-mute">No downloads recorded yet.</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-app-line bg-app-panel px-5 py-2  sm:px-7">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="text-xs text-app-mute">
                        <th className="py-3 pr-3 font-medium">When (UTC)</th>
                        <th className="py-3 pr-3 font-medium">Platform</th>
                        <th className="py-3 pr-3 font-medium">Version</th>
                        <th className="py-3 pr-3 font-medium">Country</th>
                        <th className="py-3 pr-3 font-medium">Account</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-line text-app-ink">
                      {recent.map((download) => (
                        <tr key={download.id}>
                          <td className="whitespace-nowrap py-3 pr-3 tabular-nums">{download.createdAt.slice(0, 16)}</td>
                          <td className="py-3 pr-3">{LABELS[download.platform]}</td>
                          <td className="py-3 pr-3 tabular-nums">{download.version}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{download.country ? `${flagEmoji(download.country)} ${countryName(download.country)}` : '—'}</td>
                          <td className="py-3 pr-3 break-all">{accountLabel(download)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
    </AccountShell>
  )
}
