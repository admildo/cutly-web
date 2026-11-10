import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { listLicenseOverview, summarizeLicenses } from '@/lib/license-admin'
import { findClerkUsersByIds } from '@/lib/clerk-users'
import { countryName, flagEmoji } from '@/lib/country'
import { LicenseGrantForm } from '@/app/components/LicenseGrantForm'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteHeader } from '@/app/components/SiteChrome'

export const metadata = { title: 'Licenses', robots: { index: false, follow: false } }

const STATUS = { active: 'Active', revoked: 'Revoked', refunded: 'Refunded', expired: 'Expired' }
const SOURCE = { admin: 'Granted by hand', stripe: 'Purchased' }
const card = 'rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]'

export default async function LicensesAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Flicenses')
  if (!isTrialAdmin(userId)) notFound()

  let rows = null
  let people = new Map()
  try {
    rows = await listLicenseOverview()
    people = await findClerkUsersByIds(rows.flatMap((row) => [row.userId, row.grantedBy, row.revokedBy].filter(Boolean))).catch(() => new Map())
  } catch {
    rows = null
  }
  const summary = rows && summarizeLicenses(rows)
  const emailOf = (id) => people.get(id)?.email || id
  const who = (id) => (id === userId ? 'You' : emailOf(id))
  const day = (value) => (value || '').slice(0, 10)

  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-4xl">
        <SiteHeader dashboard><AccountMenu /></SiteHeader>
        <AccountNavigation active="licenses" showTrialControls />
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ADMIN SETTINGS</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Licenses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Every license, the devices using it, and the country each account first activated from. Grants and revokes are recorded with who did them and why.</p>

          {summary === null ? (
            <p className="mt-6 text-sm text-[#a5a6ab]">The license overview could not be loaded.</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Active licenses', summary.activeCount],
                  ['Granted by hand', summary.grantedActive],
                  ['Purchased', summary.purchasedActive],
                  ['Devices in use', summary.devicesInUse]
                ].map(([label, value]) => (
                  <div key={label} className={`${card} px-5 py-4`}>
                    <p className="m-0 text-xs text-[#929399]">{label}</p>
                    <p className="m-0 mt-1 text-2xl font-medium tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <h2 className="mb-0 mt-10 text-lg font-medium tracking-[-0.02em]">First activated in</h2>
              {summary.countries.length === 0 ? (
                <p className="mt-3 text-sm text-[#a5a6ab]">No active licenses yet.</p>
              ) : (
                <ul className={`m-0 mt-3 grid list-none gap-px overflow-hidden p-0 sm:grid-cols-2 ${card}`}>
                  {summary.countries.map(({ code, count }) => (
                    <li key={code || 'unknown'} className="flex items-center justify-between gap-3 bg-[#151619] px-5 py-3 text-sm text-[#d4d4d7]">
                      <span>
                        <span aria-hidden="true" className="mr-2 text-base">{flagEmoji(code) || '🌐'}</span>
                        {code ? countryName(code) : 'Unknown'}
                      </span>
                      <span className="tabular-nums text-[#f2f0ef]">{count}</span>
                    </li>
                  ))}
                </ul>
              )}

              <LicenseGrantForm />

              <h2 className="mb-0 mt-10 text-lg font-medium tracking-[-0.02em]">All licenses</h2>
              {rows.length === 0 ? (
                <p className="mt-3 text-sm text-[#a5a6ab]">No licenses yet.</p>
              ) : (
                <ul className={`m-0 mt-3 list-none divide-y divide-white/[.07] px-5 text-sm text-[#d4d4d7] sm:px-7 ${card} p-0`}>
                  {rows.map((row) => (
                    <li key={row.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="break-all font-medium text-[#f2f0ef]">{emailOf(row.userId)}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${row.status === 'active' ? 'bg-[#1f2d22] text-[#a9d9b4]' : 'bg-white/[.07] text-[#a5a6ab]'}`}>
                          {STATUS[row.status] || row.status}
                        </span>
                      </div>
                      <span className="mt-1 block text-xs text-[#a6a4a4]">
                        {SOURCE[row.paymentProvider] || row.paymentProvider} · {row.planName} · {row.devicesUsed} of {row.deviceLimit} devices
                      </span>
                      <span className="mt-1 block text-xs text-[#d4d4d7]">
                        {row.firstActivatedAt ? (
                          <>
                            First activated {day(row.firstActivatedAt)} in{' '}
                            <span aria-hidden="true">{flagEmoji(row.firstCountry) || '🌐'}</span>{' '}
                            {row.firstCountry ? countryName(row.firstCountry) : 'an unknown country'}
                          </>
                        ) : 'Not activated on a device yet'}
                      </span>
                      {row.grantedAt ? <span className="block text-xs text-[#a6a4a4]">Granted {day(row.grantedAt)} by {who(row.grantedBy)}: {row.grantReason}</span> : null}
                      {row.revokedAt ? <span className="block text-xs text-[#a6a4a4]">Revoked {day(row.revokedAt)} by {who(row.revokedBy)}: {row.revokeReason}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
