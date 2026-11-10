import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { listCreatorApplications } from '@/lib/creator-program'
import { CREATOR_PROGRAM_MAX_APPROVED } from '@/lib/creator-program-options'
import { findClerkUsersByIds } from '@/lib/clerk-users'
import { CreatorApplicationsReview } from '@/app/components/CreatorApplicationsReview'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteHeader } from '@/app/components/SiteChrome'

export const metadata = { title: 'Creators', robots: { index: false, follow: false } }

const card = 'rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]'

export default async function CreatorsAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Fcreators')
  if (!isTrialAdmin(userId)) notFound()

  let applications = null
  try {
    const list = await listCreatorApplications()
    const people = await findClerkUsersByIds(list.map((application) => application.userId)).catch(() => new Map())
    applications = list.map((application) => ({
      ...application,
      email: people.get(application.userId)?.email || null,
      name: people.get(application.userId)?.name || null
    }))
  } catch (error) {
    console.error('Could not load the creator applications:', error)
  }

  const counts = applications
    ? {
        pending: applications.filter((application) => application.status === 'pending').length,
        approved: applications.filter((application) => application.status === 'approved').length,
        declined: applications.filter((application) => application.status === 'declined').length
      }
    : null

  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-4xl">
        <SiteHeader dashboard><AccountMenu /></SiteHeader>
        <AccountNavigation active="creators" showTrialControls />
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ADMIN SETTINGS</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Creator program</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Review creator applications. Approving grants a free lifetime license. A declined application can carry a note, which the applicant sees in their dashboard.</p>

          {counts === null ? (
            <p className="mt-6 text-sm text-[#a5a6ab]">The applications could not be loaded.</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ['Pending', counts.pending],
                  [`Approved (max ${CREATOR_PROGRAM_MAX_APPROVED})`, counts.approved],
                  ['Declined', counts.declined]
                ].map(([label, value]) => (
                  <div key={label} className={`${card} px-5 py-4`}>
                    <p className="m-0 text-xs text-[#929399]">{label}</p>
                    <p className="m-0 mt-1 text-2xl font-medium tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <CreatorApplicationsReview applications={applications} />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
