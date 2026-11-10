import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { isTrialAdmin, getTrialConfigForAdmin } from '@/lib/trial'
import { TrialSettingsForm } from '@/app/components/TrialSettingsForm'
import { AccountShell, accountProfile } from '@/app/components/AccountShell'

export const metadata = { title: 'Trial controls', robots: { index: false, follow: false } }

export default async function TrialSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount%2Ftrial-settings')
  if (!isTrialAdmin(userId)) notFound()
  const user = await currentUser()

  let config
  try {
    config = await getTrialConfigForAdmin()
  } catch {
    return (
      <AccountShell active="trial" profile={accountProfile(user)} isAdmin title="Trial controls unavailable" description="The trial settings could not be loaded. Check the database connection and try again." width="max-w-4xl" />
    )
  }

  return (
    <AccountShell active="trial" profile={accountProfile(user)} isAdmin title="Free trial controls" description="Changes take effect immediately for trial accounts. Active paid licenses always use their own provider settings and are never changed by these limits." width="max-w-4xl">
          <TrialSettingsForm initialConfig={config} />
    </AccountShell>
  )
}
