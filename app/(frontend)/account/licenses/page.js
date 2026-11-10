import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { listLicenseOverview, summarizeLicenses } from '@/lib/license-admin'
import { findClerkUsersByIds } from '@/lib/clerk-users'
import { countryName, flagEmoji } from '@/lib/country'
import { LicenseGrantForm } from '@/app/components/LicenseGrantForm'
import { AccountShell, accountProfile } from '@/app/components/AccountShell'

export const metadata = { title: 'Licenses', robots: { index: false, follow: false } }

const STATUS = { active: 'Active', revoked: 'Revoked', refunded: 'Refunded', expired: 'Expired' }
const SOURCE = { admin: 'Granted by hand', stripe: 'Purchased' }
const card = 'rounded-xl border border-app-line bg-app-panel'

export default async function LicensesAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Flicenses')
  if (!isTrialAdmin(userId)) notFound()
  const user = await currentUser()

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
    <AccountShell active="licenses" profile={accountProfile(user)} isAdmin title="Licenses" description="Every license, the devices using it, and the country each account first activated from. Grants and revokes are recorded with who did them and why.">
          {summary === null ? (
            <p className="m-0 text-sm text-app-mute">The license overview could not be loaded.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Active licenses', summary.activeCount],
                  ['Granted by hand', summary.grantedActive],
                  ['Purchased', summary.purchasedActive],
                  ['Devices in use', summary.devicesInUse]
                ].map(([label, value]) => (
                  <div key={label} className={`${card} px-5 py-4`}>
                    <p className="m-0 text-xs text-app-mute">{label}</p>
                    <p className="m-0 mt-1 text-2xl font-medium tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <h2 className="mb-0 mt-10 text-[15px] font-semibold tracking-[-0.01em]">First activated in</h2>
              {summary.countries.length === 0 ? (
                <p className="mt-3 text-sm text-app-mute">No active licenses yet.</p>
              ) : (
                <ul className={`m-0 mt-3 grid list-none gap-px overflow-hidden p-0 sm:grid-cols-2 ${card}`}>
                  {summary.countries.map(({ code, count }) => (
                    <li key={code || 'unknown'} className="flex items-center justify-between gap-3 bg-app-panel px-5 py-3 text-sm text-app-ink">
                      <span>
                        <span aria-hidden="true" className="mr-2 text-base">{flagEmoji(code) || '🌐'}</span>
                        {code ? countryName(code) : 'Unknown'}
                      </span>
                      <span className="tabular-nums text-app-ink">{count}</span>
                    </li>
                  ))}
                </ul>
              )}

              <LicenseGrantForm />

              <h2 className="mb-0 mt-10 text-[15px] font-semibold tracking-[-0.01em]">All licenses</h2>
              {rows.length === 0 ? (
                <p className="mt-3 text-sm text-app-mute">No licenses yet.</p>
              ) : (
                <ul className={`m-0 mt-3 list-none divide-y divide-app-line px-5 text-sm text-app-ink sm:px-7 ${card} p-0`}>
                  {rows.map((row) => (
                    <li key={row.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="break-all font-medium text-app-ink">{emailOf(row.userId)}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${row.status === 'active' ? 'bg-[#1f2d22] text-[#a9d9b4]' : 'bg-white/[.07] text-app-mute'}`}>
                          {STATUS[row.status] || row.status}
                        </span>
                      </div>
                      <span className="mt-1 block text-xs text-app-mute">
                        {SOURCE[row.paymentProvider] || row.paymentProvider} · {row.planName} · {row.devicesUsed} of {row.deviceLimit} devices
                      </span>
                      <span className="mt-1 block text-xs text-app-ink">
                        {row.firstActivatedAt ? (
                          <>
                            First activated {day(row.firstActivatedAt)} in{' '}
                            <span aria-hidden="true">{flagEmoji(row.firstCountry) || '🌐'}</span>{' '}
                            {row.firstCountry ? countryName(row.firstCountry) : 'an unknown country'}
                          </>
                        ) : 'Not activated on a device yet'}
                      </span>
                      {row.grantedAt ? <span className="block text-xs text-app-mute">Granted {day(row.grantedAt)} by {who(row.grantedBy)}: {row.grantReason}</span> : null}
                      {row.revokedAt ? <span className="block text-xs text-app-mute">Revoked {day(row.revokedAt)} by {who(row.revokedBy)}: {row.revokeReason}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
    </AccountShell>
  )
}
