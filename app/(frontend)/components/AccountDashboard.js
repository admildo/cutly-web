import Link from 'next/link'
import { AppAccess } from '@/app/components/AppAccess'
import { BuyLicenseButton } from '@/app/components/BuyLicenseButton'
import { RefreshLicenseStatusButton } from '@/app/components/RefreshLicenseStatusButton'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteFooter, SiteHeader } from '@/app/components/SiteChrome'

const displayDate = (value) => {
  if (!value) return 'No expiry'
  const date = new Date(value)
  return Number.isNaN(date.valueOf())
    ? 'No expiry'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function LicensePanel({ license, licenseError, checkoutState }) {
  if (licenseError) {
    return (
      <div className="mt-10 rounded-[24px] border border-[#8993ad]/20 bg-[#11141d]/80 p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
        <p className="font-medium">We couldn’t check your license.</p>
        <p className="mt-2 text-sm leading-6 text-[#a0a7b7]">Your account is signed in. Please try again; we won’t ask you to buy while the status is unavailable.</p>
      </div>
    )
  }

  if (license?.licensed) {
    return (
      <div className="mt-10 overflow-hidden rounded-[24px] border border-[#8993ad]/20 bg-[#11141d]/85 shadow-[0_24px_80px_rgb(0_0_0/.2)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#8993ad]/15 bg-[radial-gradient(ellipse_at_85%_0%,rgb(164_140_94/.12),transparent_48%)] p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-[#aab7d7]">Your plan</p>
            <h2 className="mt-1 text-2xl font-medium tracking-[-0.04em]">{license.plan || 'Deyn Studio license'}</h2>
          </div>
          <span className="rounded-full border border-[#a48c5e]/25 bg-[#a48c5e]/[0.14] px-3 py-1.5 text-xs font-semibold text-[#e5d2a8]">Active</span>
        </div>
        <dl className="grid divide-y divide-[#8993ad]/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#9398a4]">Devices in use</dt><dd className="mt-2 text-lg font-medium">{license.devicesUsed} of {license.deviceLimit}</dd></div>
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#9398a4]">License type</dt><dd className="mt-2 text-lg font-medium capitalize">{license.type || '—'}</dd></div>
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#9398a4]">Access</dt><dd className="mt-2 text-lg font-medium">{license.type === 'lifetime' ? 'Lifetime' : displayDate(license.expiresAt)}</dd></div>
        </dl>
      </div>
    )
  }

  if (checkoutState === 'success') {
    return (
      <div className="mt-10 rounded-[24px] border border-[#8993ad]/20 bg-[#11141d]/80 p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
        <p className="font-medium">Payment received. Your license is being activated.</p>
        <p className="mt-2 text-sm leading-6 text-[#a0a7b7]">It can take a short moment for the payment confirmation to reach your account.</p>
        <div className="mt-5"><RefreshLicenseStatusButton /></div>
      </div>
    )
  }

  if (license?.status && license.status !== 'none') {
    const state = license.status === 'expired' ? 'Expired' : license.status === 'refunded' ? 'Refunded' : 'Inactive'
    return (
      <div className="mt-10 rounded-[24px] border border-[#8993ad]/20 bg-[#11141d]/80 p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
        <p className="text-sm font-medium text-[#aab7d7]">License {state.toLowerCase()}</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Your previous license is {state.toLowerCase()}.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#a0a7b7]">{license.message || 'Contact Deyn Studio support if you think this status is incorrect.'}</p>
        <Link href="/support" className="mt-5 inline-flex rounded-full border border-[#8993ad]/30 px-5 py-3 text-sm font-medium text-[#c5cbe0] transition hover:border-[#a9c4ff]/60 hover:text-white">Contact support</Link>
      </div>
    )
  }

  return (
    <div className="mt-10 rounded-[24px] border border-[#a48c5e]/25 bg-[radial-gradient(ellipse_at_90%_0%,rgb(164_140_94/.12),transparent_52%),#11141d] p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
      <p className="text-sm font-medium text-[#e5d2a8]">No license yet</p>
      <h2 className="mt-2 max-w-lg text-2xl font-medium tracking-[-0.03em]">Get Deyn Studio.</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#a0a7b7]">A one-time license includes future desktop updates and use on up to two devices.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <BuyLicenseButton />
        <Link href="/support" className="rounded-full border border-[#8993ad]/30 px-5 py-3 text-sm font-medium text-[#c5cbe0] transition hover:border-[#a9c4ff]/60 hover:text-white">Contact support</Link>
      </div>
      {checkoutState === 'cancelled' ? <p className="mt-4 text-sm text-[#a0a7b7]">Checkout was canceled. You haven’t been charged.</p> : null}
    </div>
  )
}

export function AccountDashboard({ user, license, licenseError, checkoutState, downloadUrl }) {
  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-6 text-[#f1f3fa] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(70_87_139/.2),transparent_68%)]" />
      <div className="relative mx-auto max-w-5xl">
        <SiteHeader dashboard><div className="flex items-center gap-3"><span className="hidden text-sm text-[#a6a4a4] sm:block">{user?.primaryEmailAddress?.emailAddress}</span><AccountMenu /></div></SiteHeader>
        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#aab7d7]">ACCOUNT & LICENSING</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6"><div><h1 className="text-4xl font-medium tracking-[-0.065em] sm:text-6xl">Your license</h1><p className="mt-3 text-base text-[#9398a4]">See your Deyn Studio access and connected devices.</p></div><p className="text-sm text-[#858d9d]">{user?.firstName ? `Welcome back, ${user.firstName}.` : 'Deyn Studio account'}</p></div>
          <LicensePanel license={license} licenseError={licenseError} checkoutState={checkoutState} />
          <div className="mt-10"><AppAccess downloadUrl={downloadUrl} licensed={Boolean(license?.licensed)} /></div>
        </section>
        <SiteFooter dark />
      </div>
    </main>
  )
}
