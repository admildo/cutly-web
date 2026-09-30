import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountSettings } from '../components/AccountSettings'
import { isTrialAdmin } from '@/lib/trial'

export const metadata = { title: 'Account settings', robots: { index: false, follow: false } }

export default async function AccountPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Faccount')

  const user = await currentUser()
  if (!user) redirect('/sign-in?returnTo=%2Faccount')

  return (
    <AccountSettings
      initialProfile={{
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      }}
      isTrialAdmin={isTrialAdmin(userId)}
    />
  )
}
