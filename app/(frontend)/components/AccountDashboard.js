import Link from 'next/link'
import { AppAccess } from '@/app/components/AppAccess'
import { BuyLicenseButton } from '@/app/components/BuyLicenseButton'
import { RefreshLicenseStatusButton } from '@/app/components/RefreshLicenseStatusButton'
import { RefreshTrialUsageButton } from '@/app/components/RefreshTrialUsageButton'
import { AccountMenu } from '@/app/components/AccountMenu'
import { SiteFooter, SiteHeader } from '@/app/components/SiteChrome'

const displayDate = (value) => {
  if (!value) return 'No expiry'
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d/.test(value)
    ? new Date(`${value.replace(' ', 'T')}Z`)
    : new Date(value)
  return Number.isNaN(date.valueOf())
    ? 'No expiry'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const displayLastActivity = (value) => {
  if (!value) return null
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d/.test(value)
    ? new Date(`${value.replace(' ', 'T')}Z`)
    : new Date(value)
  return Number.isNaN(date.valueOf())
    ? null
    : new Intl.DateTimeFormat('en', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short'
    }).format(date)
}

const displayPlatform = (value) => ({
  darwin: 'macOS',
  macos: 'macOS',
  win32: 'Windows',
  windows: 'Windows',
  linux: 'Linux'
})[String(value || '').toLowerCase()] || value || 'Desktop app'

const trialFeatures = [
  { key: 'clip_generation', name: 'Clip suggestions' },
  { key: 'smart_clean', name: 'Smart Clean' },
  { key: 'caption_translation', name: 'Caption translation' },
  { key: 'media_assistant_plan', name: 'Media Assistant' }
]

function TrialUsagePanel({ snapshot, error }) {
  if (error || !snapshot?.trial) {
    return (
      <section className="mt-4 rounded-2xl border border-white/10 bg-[#141519] px-4 py-4 sm:px-5" aria-labelledby="trial-usage-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="trial-usage-title" className="text-sm font-medium text-[#ededeb]">Free trial usage</h2>
            <p className="mt-1 text-sm text-[#b8b8bd]">Couldn’t load your remaining actions. Refresh to try again.</p>
          </div>
          <RefreshTrialUsageButton />
        </div>
      </section>
    )
  }

  const { trial } = snapshot
  const isActive = snapshot.status === 'trial'
  const isComplete = snapshot.status === 'trial-complete'
  const isReady = trial.enabled && !trial.startedAt
  const isPaused = !trial.enabled
  const status = isActive ? 'Active' : isComplete ? 'Used up' : isReady ? 'Ready to start' : isPaused ? 'Paused' : 'Unavailable'
  const description = isComplete
    ? 'All trial actions have been used.'
    : isReady
      ? 'Open Deyn Studio on your desktop to start using these actions.'
      : isPaused
        ? 'The free trial is paused. Your remaining actions are shown below.'
        : !isActive
          ? 'Trial access is unavailable. Your current usage is shown below.'
          : null
  const remainingTotal = Math.max(0, Number(trial.remainingTotal || 0))

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#141519] px-4 py-4 sm:px-5 sm:py-5" aria-labelledby="trial-usage-title">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 id="trial-usage-title" className="text-sm font-medium text-[#ededeb]">Free trial</h2>
          <span aria-hidden="true" className="text-[#77787e]">·</span>
          <p className="text-sm text-[#b8b8bd]">{status}</p>
        </div>
        <RefreshTrialUsageButton />
      </header>

      <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-[minmax(155px,0.7fr)_minmax(0,1.8fr)] sm:items-center sm:gap-6">
        <div>
          <p className="flex items-baseline gap-2.5">
            <span className="text-4xl font-medium leading-none tracking-[-0.06em] text-[#f2f2ee]">{remainingTotal}</span>
            <span className="text-sm text-[#b8b8bd]">{isReady ? 'actions available' : 'actions remaining'}</span>
          </p>
          {description ? <p className="mt-2 max-w-xs text-xs leading-5 text-[#b8b8bd]">{description}</p> : null}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          {trialFeatures.map(({ key, name }, index) => {
            const limit = Math.max(0, Number(trial.limits?.[key] || 0))
            const remaining = Math.max(0, Number(trial.remaining?.[key] || 0))

            return (
              <article key={key} className={`py-2.5 ${index > 1 ? 'border-t border-white/10 lg:border-t-0' : ''} lg:border-l lg:border-white/10 lg:px-3 ${index === 0 ? 'lg:border-l-0 lg:pl-0' : ''}`}>
                <h3 className="text-xs leading-5 text-[#b8b8bd]">{name}</h3>
                <p className={`mt-1 text-sm font-medium ${remaining === 0 ? 'text-[#a5a6ab]' : 'text-[#f2f2ee]'}`}>
                  {remaining} of {limit} {isReady ? 'available' : 'remaining'}
                </p>
              </article>
            )
          })}
        </div>
      </div>

      {(trial.startedAt || trial.usageUpdatedAt) ? (
        <footer className="mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/10 pt-3 text-xs text-[#9fa0a5]">
          {trial.startedAt ? <p>Started {displayDate(trial.startedAt)}</p> : null}
          {trial.usageUpdatedAt ? <p>Usage updated {displayDate(trial.usageUpdatedAt)}</p> : null}
        </footer>
      ) : null}
    </section>
  )
}

function LicensePanel({ license, licenseError, checkoutState, priceLabel, devices = [], devicesError = false }) {
  if (licenseError) {
    return (
      <div className="mt-6 rounded-[24px] border border-white/10 bg-[#17181c] p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
        <p className="font-medium">We couldn’t check your license.</p>
        <p className="mt-2 text-sm leading-6 text-[#a5a6ab]">Your account is signed in. Please try again; we won’t ask you to buy while the status is unavailable.</p>
      </div>
    )
  }

  if (license?.licensed) {
    const isLifetime = license.type === 'lifetime'
    return (
      <section className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-[#151619] shadow-[0_24px_80px_rgb(0_0_0/.2)]" aria-labelledby="license-title">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#b8b8bd]">LICENSE</p>
            <h2 id="license-title" className="mt-2 text-2xl font-medium tracking-[-0.04em]">{license.plan || 'Deyn Studio license'}</h2>
            <p className="mt-2 text-sm text-[#a5a6ab]">{isLifetime ? 'One-time desktop license with future software updates.' : 'Your Deyn Studio license is active.'}</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 text-xs font-semibold text-[#e5e5e7]">Active</span>
        </div>
        <dl className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#a5a6ab]">Devices in use</dt><dd className="mt-2 text-lg font-medium">{license.devicesUsed} of {license.deviceLimit}</dd></div>
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#a5a6ab]">License type</dt><dd className="mt-2 text-lg font-medium capitalize">{license.type || '—'}</dd></div>
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#a5a6ab]">Access</dt><dd className="mt-2 text-lg font-medium">{license.type === 'lifetime' ? 'Lifetime' : displayDate(license.expiresAt)}</dd></div>
        </dl>
        <div className="border-t border-white/10 p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="text-base font-medium">Activated devices</h3>
              <p className="mt-1 text-sm text-[#a5a6ab]">Devices currently using this license.</p>
            </div>
            <p className="text-sm text-[#d4d4d7]">{license.devicesUsed} of {license.deviceLimit} activations</p>
          </div>

          {devicesError ? (
            <p role="status" className="mt-5 text-sm leading-6 text-[#a5a6ab]">Device details are temporarily unavailable. Refresh the page to try again.</p>
          ) : devices.length ? (
            <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {devices.map((device, index) => (
                <li key={`${device.platform || 'desktop'}-${device.appVersion || 'unknown'}-${device.lastSeenAt || index}`} className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#ededeb]">Activated device {index + 1}</p>
                    <p className="mt-1 text-xs text-[#a5a6ab]">{displayPlatform(device.platform)}{device.appVersion ? ` · Deyn Studio ${device.appVersion}` : ''}</p>
                  </div>
                  {displayLastActivity(device.lastSeenAt) ? <p className="text-xs text-[#a5a6ab]">Last active {displayLastActivity(device.lastSeenAt)}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[#a5a6ab]">No devices have activated this license yet.</p>
          )}

          <p className="mt-4 text-xs leading-5 text-[#a5a6ab]">Device removal isn’t available here yet. <Link href="/support" className="text-[#f2f2ee] underline underline-offset-2">Contact support</Link> if you need to move an activation.</p>
        </div>
        <div className="border-t border-white/10 bg-white/[.025] px-6 py-5 sm:px-8">
          <p className="text-sm font-medium text-[#d4d4d7]">AI usage is separate from your desktop license.</p>
          <p className="mt-1 text-sm leading-6 text-[#a5a6ab]">The license doesn’t include cloud AI credits. After sponsored trial access, use your own OpenRouter key; provider charges may apply. Local tools remain available on your device.</p>
        </div>
      </section>
    )
  }

  if (checkoutState === 'success') {
    return (
      <div className="mt-6 rounded-[24px] border border-white/10 bg-[#17181c] p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
        <p className="font-medium">Payment received. Your license is being activated.</p>
        <p className="mt-2 text-sm leading-6 text-[#a5a6ab]">It can take a short moment for the payment confirmation to reach your account.</p>
        <div className="mt-5"><RefreshLicenseStatusButton /></div>
      </div>
    )
  }

  if (license?.status && license.status !== 'none') {
    const state = license.status === 'expired'
      ? 'Expired'
      : license.status === 'refunded'
        ? 'Refunded'
        : license.status === 'revoked'
          ? 'Revoked'
          : 'Inactive'
    return (
      <div className="mt-6 rounded-[24px] border border-white/10 bg-[#17181c] p-6 shadow-[0_24px_80px_rgb(0_0_0/.18)] sm:p-8">
        <p className="inline-flex rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-xs font-semibold text-[#d4d4d7]">License {state.toLowerCase()}</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Your previous license is {state.toLowerCase()}.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#a5a6ab]">{license.message || 'Contact Deyn Studio support if you think this status is incorrect.'}</p>
        <Link href="/support" className="mt-5 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-[#d4d4d7] transition hover:border-white/50 hover:text-white">Contact support</Link>
      </div>
    )
  }

  return (
    <section className="mt-6 rounded-[24px] border border-white/10 bg-[#17181c] p-6 shadow-[0_24px_80px_rgb(0_0_0/.2)] sm:p-8" aria-labelledby="lifetime-license-title">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#b8b8bd]">LIFETIME DESKTOP LICENSE</p>
      <h2 id="lifetime-license-title" className="mt-3 max-w-lg text-2xl font-medium tracking-[-0.03em] sm:text-3xl">Own your media toolkit.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c0c0c5]">One purchase includes Deyn Studio’s desktop media tools, future software updates, and use on up to two devices. There’s no recurring desktop license fee.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <BuyLicenseButton priceLabel={priceLabel} />
        <Link href="/support" className="min-h-11 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-[#d4d4d7] transition hover:border-white/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Contact support</Link>
      </div>
      {checkoutState === 'cancelled' ? <p className="mt-4 text-sm text-[#a5a6ab]">Checkout was canceled. You haven’t been charged.</p> : null}
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-sm font-medium text-[#d4d4d7]">AI usage is separate from desktop ownership.</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#a5a6ab]">The lifetime license doesn’t add cloud AI credits. Sponsored trial actions are limited; after the trial or after purchase, cloud AI uses your own OpenRouter key and may incur provider charges. Local tools such as on-device transcription don’t use those credits.</p>
      </div>
    </section>
  )
}

export function AccountDashboard({ user, license, licenseError, trialSnapshot, trialError, licenseDevices, devicesError, priceLabel, checkoutState, downloadUrl }) {
  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-6 text-[#f2f2ee] sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-5xl">
        <SiteHeader dashboard><div className="flex items-center gap-3"><span className="hidden text-sm text-[#a5a6ab] sm:block">{user?.primaryEmailAddress?.emailAddress}</span><AccountMenu /></div></SiteHeader>
        <section className="py-10 sm:py-14">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#b8b8bd]">ACCOUNT & LICENSING</p>
          <div className="mt-4"><h1 className="text-4xl font-medium tracking-[-0.065em] sm:text-6xl">Your license</h1><p className="mt-3 text-base text-[#a5a6ab]">See your license status, remaining AI trial uses, and desktop access.</p></div>
          <LicensePanel license={license} licenseError={licenseError} priceLabel={priceLabel} devices={licenseDevices} devicesError={devicesError} checkoutState={checkoutState} />
          {!licenseError && license?.status === 'none' ? <TrialUsagePanel snapshot={trialSnapshot} error={trialError} /> : null}
          <div className="mt-6"><AppAccess downloadUrl={downloadUrl} licensed={Boolean(license?.licensed)} /></div>
        </section>
        <SiteFooter dark />
      </div>
    </main>
  )
}
