import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin, getTrialConfigForAdmin } from '@/lib/trial'
import { TrialSettingsForm } from '@/app/components/TrialSettingsForm'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteHeader } from '@/app/components/SiteChrome'

export const metadata = { title: 'Trial controls', robots: { index: false, follow: false } }

export default async function TrialSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Ftrial-settings')
  if (!isTrialAdmin(userId)) notFound()

  let config
  try {
    config = await getTrialConfigForAdmin()
  } catch {
    return (
      <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
        <section className="relative mx-auto max-w-4xl">
          <SiteHeader dashboard><AccountMenu /></SiteHeader>
          <AccountNavigation active="trial" showTrialControls />
          <div className="pb-10 pt-8 sm:pb-14 sm:pt-10">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ADMIN SETTINGS</p>
            <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em]">Trial controls unavailable</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#a5a6ab]">The trial settings could not be loaded. Check the database connection and try again.</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-4xl">
        <SiteHeader dashboard><AccountMenu /></SiteHeader>
        <AccountNavigation active="trial" showTrialControls />
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ADMIN SETTINGS</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Free trial controls</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Changes take effect immediately for trial accounts. Active paid licenses always use their own provider settings and are never changed by these limits.</p>
          <TrialSettingsForm initialConfig={config} />
        </section>
      </div>
    </main>
  )
}
