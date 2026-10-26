import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { listRecentGrantAudit } from '@/lib/license-admin'
import { LicenseGrantForm } from '@/app/components/LicenseGrantForm'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteHeader } from '@/app/components/SiteChrome'

export const metadata = { title: 'Grant licenses', robots: { index: false, follow: false } }

export default async function LicensesAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Flicenses')
  if (!isTrialAdmin(userId)) notFound()

  let audit = []
  try {
    audit = await listRecentGrantAudit()
  } catch {
    audit = null
  }

  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-4xl">
        <SiteHeader dashboard><AccountMenu /></SiteHeader>
        <AccountNavigation active="licenses" showTrialControls />
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ADMIN SETTINGS</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Grant licenses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Find an account by email, then give it the lifetime license without a payment. Every grant and revoke is recorded below with your reason.</p>
          <LicenseGrantForm />

          <h2 className="mb-0 mt-10 text-lg font-medium tracking-[-0.02em]">Recent changes</h2>
          {audit === null ? (
            <p className="mt-3 text-sm text-[#a5a6ab]">The history could not be loaded.</p>
          ) : audit.length === 0 ? (
            <p className="mt-3 text-sm text-[#a5a6ab]">No licenses have been granted by hand yet.</p>
          ) : (
            <ul className="m-0 mt-3 list-none divide-y divide-white/[.07] rounded-[24px] bg-[#151619] p-0 px-5 text-sm text-[#d4d4d7] sm:px-7">
              {audit.map((entry) => (
                <li key={entry.id} className="py-4">
                  <span className="font-medium">{entry.action === 'grant' ? 'Granted' : 'Revoked'}</span> · {entry.targetUserId} · {entry.changedAt}
                  <span className="block text-xs text-[#a6a4a4]">{entry.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
