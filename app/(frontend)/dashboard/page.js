import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountDashboard } from '@/app/components/AccountDashboard'
import { getLicenseStatus } from '@/lib/license'

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } }

const safeExternalUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export default async function DashboardPage({ searchParams }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?returnTo=%2Fdashboard')

  const user = await currentUser()
  if (!user) redirect('/sign-in?returnTo=%2Fdashboard')

  const { checkout: checkoutState } = searchParams ? await searchParams : {}
  const downloadUrl = safeExternalUrl(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL)
  let license = null
  let licenseError = false

  try {
    license = await getLicenseStatus(userId)
  } catch (error) {
    console.error('Could not load the dashboard license status:', error)
    licenseError = true
  }

  return <AccountDashboard user={user} license={license} licenseError={licenseError} checkoutState={checkoutState} downloadUrl={downloadUrl} />
}
