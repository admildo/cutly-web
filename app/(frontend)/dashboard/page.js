import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountDashboard } from '@/app/components/AccountDashboard'
import { getDownloadUrls } from '@/lib/downloads'
import { getActiveLicenseDevices, getLicenseStatus } from '@/lib/license'
import { getTrialSnapshot, isTrialAdmin } from '@/lib/trial'
import { getCreatorApplication, getCreatorKeyUsageForUser } from '@/lib/creator-program'
import { LIFETIME_LICENSE_PRICE_EUR } from '@/lib/pricing'

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } }

export default async function DashboardPage({ searchParams }) {
  const { checkout: checkoutState, buy } = searchParams ? await searchParams : {}
  // Keep the purchase intent through sign-in so a new customer lands in checkout, not on a bare dashboard.
  const signInPath = `/sign-in?returnTo=${encodeURIComponent(
    buy === '1' ? '/dashboard?buy=1' : checkoutState ? `/dashboard?checkout=${encodeURIComponent(String(checkoutState))}` : '/dashboard'
  )}`

  const { userId } = await auth()
  if (!userId) redirect(signInPath)

  const user = await currentUser()
  if (!user) redirect(signInPath)

  const downloadUrls = await getDownloadUrls()
  let license = null
  let licenseError = false
  let trialSnapshot = null
  let trialError = false
  let licenseDevices = []
  let devicesError = false
  let creatorApplication = null
  let creatorError = false
  const priceLabel = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(LIFETIME_LICENSE_PRICE_EUR)

  const [licenseResult, trialResult, creatorResult] = await Promise.allSettled([
    getLicenseStatus(userId),
    getTrialSnapshot(userId),
    getCreatorApplication(userId)
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

  if (creatorResult.status === 'fulfilled') creatorApplication = creatorResult.value
  else {
    console.error('Could not load the creator program application:', creatorResult.reason)
    creatorError = true
  }

  // The usage is read from OpenRouter, so a failure there only hides the usage line.
  const creatorKeyUsage = creatorApplication?.hasKey
    ? await getCreatorKeyUsageForUser(userId).catch((error) => {
      console.error('Could not load the creator key usage:', error)
      return null
    })
    : null

  if (license?.licensed) {
    try {
      licenseDevices = await getActiveLicenseDevices(userId)
    } catch (error) {
      console.error('Could not load the dashboard device activations:', error)
      devicesError = true
    }
  }

  return <AccountDashboard user={user} license={license} licenseError={licenseError} trialSnapshot={trialSnapshot} trialError={trialError} licenseDevices={licenseDevices} devicesError={devicesError} creatorApplication={creatorApplication} creatorError={creatorError} creatorKeyUsage={creatorKeyUsage}priceLabel={priceLabel} checkoutState={checkoutState} autoBuy={buy === '1'} downloadUrls={downloadUrls} isTrialAdmin={isTrialAdmin(userId)} />
}
