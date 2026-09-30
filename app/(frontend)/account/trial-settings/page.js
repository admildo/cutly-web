import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin, getTrialConfigForAdmin } from '@/lib/trial'
import { TrialSettingsForm } from '@/app/components/TrialSettingsForm'

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
      <main className="min-h-screen bg-[#171716] px-5 py-12 text-[#f2f0ef] sm:px-8">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-medium tracking-[-0.04em]">Trial controls unavailable</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#a6a4a4]">The trial settings could not be loaded. Check the database connection and try again.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen [color-scheme:dark] bg-[#171716] px-5 py-8 text-[#f2f0ef] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between border-b border-[#807e7e]/40 pb-5">
          <a href="/account" className="text-sm text-[#a6a4a4] underline-offset-4 hover:text-[#f2f0ef] hover:underline">Back to account</a>
          <span className="text-sm font-semibold tracking-[0.22em]">CUTLY</span>
        </header>
        <section className="py-10 sm:py-14">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#a6a4a4]">ADMIN SETTINGS</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">Free trial controls</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a6a4a4]">Changes take effect immediately for trial accounts. Active paid licenses always use their own provider settings and are never changed by these limits.</p>
          <TrialSettingsForm initialConfig={config} />
        </section>
      </div>
    </main>
  )
}
