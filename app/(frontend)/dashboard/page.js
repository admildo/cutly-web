import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountDashboard } from '@/app/components/AccountDashboard'
import { getActiveLicenseDevices, getLicenseStatus } from '@/lib/license'
import { getTrialSnapshot } from '@/lib/trial'
import { LIFETIME_LICENSE_PRICE_EUR } from '@/lib/pricing'

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
  let trialSnapshot = null
  let trialError = false
  let licenseDevices = []
  let devicesError = false
  const priceLabel = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(LIFETIME_LICENSE_PRICE_EUR)

  const [licenseResult, trialResult] = await Promise.allSettled([
    getLicenseStatus(userId),
    getTrialSnapshot(userId)
  ])

  if (licenseResult.status === 'fulfilled') license = licenseResult.value
  else {
    console.error('Could not load the dashboard license status:', licenseResult.reason)
    licenseError = true
  }

  if (trialResult.status === 'fulfilled') trialSnapshot = trialResult.value
  else {
    console.error('Could not load the dashboard trial usage:', trialResult.reason)
    trialError = true
  }

  if (license?.licensed) {
    try {
      licenseDevices = await getActiveLicenseDevices(userId)
    } catch (error) {
      console.error('Could not load the dashboard device activations:', error)
      devicesError = true
    }
  }

  return <AccountDashboard user={user} license={license} licenseError={licenseError} trialSnapshot={trialSnapshot} trialError={trialError} licenseDevices={licenseDevices} devicesError={devicesError} priceLabel={priceLabel} checkoutState={checkoutState} downloadUrl={downloadUrl} />
}
