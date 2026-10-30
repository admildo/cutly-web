import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { SUMMARY_WINDOWS, getDownloadSummary, getRecentDownloads } from '@/lib/download-stats'
import { findClerkUsersByIds } from '@/lib/clerk-users'
import { countryName, flagEmoji } from '@/lib/country'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteHeader } from '@/app/components/SiteChrome'

export const metadata = { title: 'Downloads', robots: { index: false, follow: false } }

const LABELS = { silicon: 'Mac (Apple silicon)', intel: 'Mac (Intel)', windows: 'Windows' }

const accountLabel = ({ userId, person }) => person?.email || person?.name || (userId ? 'Signed-in account' : 'Not signed in')

export default async function DownloadsAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Fdownloads')
  if (!isTrialAdmin(userId)) notFound()

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
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-4xl">
        <SiteHeader dashboard><AccountMenu /></SiteHeader>
        <AccountNavigation active="downloads" showTrialControls />
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ADMIN SETTINGS</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Downloads</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Installer downloads started from this website. App updates, link previews and crawlers are not counted, and one visitor counts at most three times an hour per platform. Counts are UTC days.</p>

          {summary === null ? (
            <p className="mt-6 text-sm text-[#a5a6ab]">The download counts could not be loaded.</p>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto rounded-[24px] bg-[#151619] px-5 py-2 shadow-[0_18px_54px_rgb(0_0_0/.2)] sm:px-7">
                <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-xs text-[#929399]">
                      <th className="py-3 pr-3 font-medium" />
                      {SUMMARY_WINDOWS.map(({ label }) => <th key={label} className="py-3 pr-3 text-right font-medium">{label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[.07]">
                    {summary.platforms.map(({ platform, totals }) => (
                      <tr key={platform}>
                        <th className="py-3 pr-3 font-medium text-[#f2f0ef]">{LABELS[platform]}</th>
                        {totals.map((value, index) => <td key={SUMMARY_WINDOWS[index].label} className="py-3 pr-3 text-right tabular-nums text-[#d4d4d7]">{value}</td>)}
                      </tr>
                    ))}
                    <tr>
                      <th className="py-3 pr-3 font-semibold text-[#f2f0ef]">All</th>
                      {summary.totals.map((value, index) => <td key={SUMMARY_WINDOWS[index].label} className="py-3 pr-3 text-right font-semibold tabular-nums text-[#f2f0ef]">{value}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="mb-0 mt-10 text-lg font-medium tracking-[-0.02em]">By version, last 30 days</h2>
              {summary.versions.length === 0 ? (
                <p className="mt-3 text-sm text-[#a5a6ab]">No downloads counted yet. Counting starts when this release of the site is live.</p>
              ) : (
                <ul className="m-0 mt-3 list-none divide-y divide-white/[.07] rounded-[24px] bg-[#151619] p-0 px-5 text-sm text-[#d4d4d7] sm:px-7">
                  {summary.versions.map(([version, count]) => (
                    <li key={version} className="flex justify-between py-3"><span>{version}</span><span className="tabular-nums">{count}</span></li>
                  ))}
                </ul>
              )}

              <h2 className="mb-0 mt-10 text-lg font-medium tracking-[-0.02em]">Recent downloads</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">The latest 100 counted downloads, newest first. Anonymous visitors show their country only. A download from a signed-in account shows that account.</p>
              {recent === null ? (
                <p className="mt-3 text-sm text-[#a5a6ab]">Recent downloads could not be loaded.</p>
              ) : recent.length === 0 ? (
                <p className="mt-3 text-sm text-[#a5a6ab]">No downloads recorded yet.</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-[24px] bg-[#151619] px-5 py-2 shadow-[0_18px_54px_rgb(0_0_0/.2)] sm:px-7">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="text-xs text-[#929399]">
                        <th className="py-3 pr-3 font-medium">When (UTC)</th>
                        <th className="py-3 pr-3 font-medium">Platform</th>
                        <th className="py-3 pr-3 font-medium">Version</th>
                        <th className="py-3 pr-3 font-medium">Country</th>
                        <th className="py-3 pr-3 font-medium">Account</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[.07] text-[#d4d4d7]">
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
        </section>
      </div>
    </main>
  )
}
