import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin } from '@/lib/trial'
import { listCreatorApplications } from '@/lib/creator-program'
import { CREATOR_PROGRAM_MAX_APPROVED } from '@/lib/creator-program-options'
import { findClerkUsersByIds } from '@/lib/clerk-users'
import { CreatorApplicationsReview } from '@/app/components/CreatorApplicationsReview'
import { AccountShell, accountProfile } from '@/app/components/AccountShell'

export const metadata = { title: 'Creators', robots: { index: false, follow: false } }

const card = 'rounded-xl border border-app-line bg-app-panel'

export default async function CreatorsAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Fcreators')
  if (!isTrialAdmin(userId)) notFound()
  const user = await currentUser()

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
    <AccountShell active="creators" profile={accountProfile(user)} isAdmin title="Creator program" description="Review creator applications. Approving grants a free lifetime license. A declined application can carry a note, which the applicant sees in their dashboard.">
          {counts === null ? (
            <p className="m-0 text-sm text-app-mute">The applications could not be loaded.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Pending', counts.pending],
                  [`Approved (max ${CREATOR_PROGRAM_MAX_APPROVED})`, counts.approved],
                  ['Declined', counts.declined]
                ].map(([label, value]) => (
                  <div key={label} className={`${card} px-5 py-4`}>
                    <p className="m-0 text-xs text-app-mute">{label}</p>
                    <p className="m-0 mt-1 text-2xl font-medium tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <CreatorApplicationsReview applications={applications} />
            </>
          )}
    </AccountShell>
  )
}
