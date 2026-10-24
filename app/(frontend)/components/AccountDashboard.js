import Link from 'next/link'
import { AppAccess } from '@/app/components/AppAccess'
import { BuyLicenseButton } from '@/app/components/BuyLicenseButton'
import { RefreshLicenseStatusButton } from '@/app/components/RefreshLicenseStatusButton'
import { RefreshTrialUsageButton } from '@/app/components/RefreshTrialUsageButton'
import { AccountMenu } from '@/app/components/AccountMenu'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountAvatar } from '@/app/components/AccountAvatar'
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

const surface = 'rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]'

const trialFeatures = [
  { key: 'clip_generation', name: 'Clip suggestions' },
  { key: 'smart_clean', name: 'Smart Clean' },
  { key: 'caption_translation', name: 'Caption translation' },
  { key: 'media_assistant_plan', name: 'Media Assistant' }
]

function TrialUsagePanel({ snapshot, error }) {
  if (error || !snapshot?.trial) {
    return (
      <section className={`${surface} mt-5 p-5 sm:p-6`} aria-labelledby="trial-usage-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="trial-usage-title" className="text-base font-medium text-[#ededeb]">Free trial usage</h2>
            <p className="mt-1 text-sm text-[#a5a6ab]">Couldn’t load your remaining actions. Refresh to try again.</p>
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
          : 'Your sponsored AI actions are ready in Deyn Studio.'
  const remainingTotal = Math.max(0, Number(trial.remainingTotal || 0))

  return (
    <section className={`${surface} mt-5 p-5 sm:p-6`} aria-labelledby="trial-usage-title">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id="trial-usage-title" className="text-base font-medium text-[#ededeb]">Free trial</h2>
            <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-xs font-medium text-[#c7c7cb]">{status}</span>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[#a5a6ab]">{description}</p>
        </div>
        <RefreshTrialUsageButton />
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(175px,.8fr)_minmax(0,2fr)]">
        <div className="flex min-h-28 items-center gap-4 rounded-2xl bg-[#1d1e22] px-5 py-4 shadow-[inset_0_1px_0_rgb(255_255_255/.025)]">
          <p className="text-5xl font-medium leading-none tracking-[-0.07em] text-[#f2f2ee]">{remainingTotal}</p>
          <div>
            <p className="text-sm font-medium text-[#ededeb]">{isReady ? 'actions available' : 'actions left'}</p>
            <p className="mt-1 text-xs text-[#929399]">Across all trial tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[460px]:grid-cols-2 xl:grid-cols-4">
          {trialFeatures.map(({ key, name }) => {
            const limit = Math.max(0, Number(trial.limits?.[key] || 0))
            const remaining = Math.max(0, Number(trial.remaining?.[key] || 0))
            const progress = limit ? Math.min(100, Math.round((remaining / limit) * 100)) : 0

            return (
              <article key={key} className="rounded-2xl bg-[#1b1c20] px-4 py-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/.02)]">
                <h3 className="text-xs leading-5 text-[#a5a6ab]">{name}</h3>
                <p className={`mt-2 text-sm font-medium ${remaining === 0 ? 'text-[#a5a6ab]' : 'text-[#f2f2ee]'}`}>
                  {remaining}<span className="font-normal text-[#85868c]"> / {limit} left</span>
                </p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[.08]" aria-hidden="true">
                  <div className="h-full rounded-full bg-[#bfc0c4] transition-[width]" style={{ width: `${progress}%` }} />
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {(trial.startedAt || trial.usageUpdatedAt) ? (
        <footer className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#85868c]">
          {trial.startedAt ? <p>Started {displayDate(trial.startedAt)}</p> : null}
          {trial.usageUpdatedAt ? <p>Usage updated {displayDate(trial.usageUpdatedAt)}</p> : null}
        </footer>
      ) : null}
    </section>
  )
}

function LicensePanel({ license, licenseError, checkoutState, autoBuy = false, priceLabel, devices = [], devicesError = false }) {
  if (licenseError) {
    return (
      <section className={`${surface} mt-7 p-6 sm:p-8`}>
        <p className="font-medium">We couldn’t check your license.</p>
        <p className="mt-2 text-sm leading-6 text-[#a5a6ab]">Your account is signed in. Please try again; we won’t ask you to buy while the status is unavailable.</p>
      </section>
    )
  }

  if (license?.licensed) {
    const isLifetime = license.type === 'lifetime'
    return (
      <section className={`${surface} mt-7 overflow-hidden`} aria-labelledby="license-title">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">YOUR LICENSE</p>
            <h2 id="license-title" className="mt-2 text-2xl font-medium tracking-[-0.045em]">{license.plan || 'Deyn Studio license'}</h2>
            <p className="mt-1.5 text-sm text-[#a5a6ab]">{isLifetime ? 'One-time desktop license with future software updates.' : 'Your Deyn Studio license is active.'}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs font-medium text-[#e5e5e7]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#c9cace]" />Active
          </span>
        </div>

        <dl className="grid gap-2 px-5 pb-5 sm:grid-cols-3 sm:px-7 sm:pb-6">
          <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5">
            <dt className="text-xs text-[#929399]">Devices in use</dt>
            <dd className="mt-1.5 text-base font-medium">{license.devicesUsed} <span className="font-normal text-[#929399]">of {license.deviceLimit}</span></dd>
          </div>
          <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5">
            <dt className="text-xs text-[#929399]">License type</dt>
            <dd className="mt-1.5 text-base font-medium capitalize">{license.type || '—'}</dd>
          </div>
          <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5">
            <dt className="text-xs text-[#929399]">Access</dt>
            <dd className="mt-1.5 text-base font-medium">{license.type === 'lifetime' ? 'Lifetime' : displayDate(license.expiresAt)}</dd>
          </div>
        </dl>

        <div className="mx-5 h-px bg-white/[.07] sm:mx-7" />
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Activated devices</h3>
              <p className="mt-1 text-sm text-[#929399]">Devices currently using this license.</p>
            </div>
            <p className="text-xs text-[#a5a6ab]">{license.devicesUsed} of {license.deviceLimit} activations</p>
          </div>

          {devicesError ? (
            <p role="status" className="mt-4 text-sm leading-6 text-[#a5a6ab]">Device details are temporarily unavailable. Refresh the page to try again.</p>
          ) : devices.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {devices.map((device, index) => (
                <li key={`${device.platform || 'desktop'}-${device.appVersion || 'unknown'}-${device.lastSeenAt || index}`} className="flex items-center justify-between gap-4 rounded-2xl bg-[#1d1e22] px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#ededeb]">Device {index + 1}</p>
                    <p className="mt-1 truncate text-xs text-[#929399]">{displayPlatform(device.platform)}{device.appVersion ? ` · Deyn Studio ${device.appVersion}` : ''}</p>
                  </div>
                  {displayLastActivity(device.lastSeenAt) ? <p className="shrink-0 text-right text-[11px] leading-4 text-[#85868c]">Last active<br />{displayLastActivity(device.lastSeenAt)}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[#a5a6ab]">No devices have activated this license yet.</p>
          )}

          <p className="mt-4 text-xs leading-5 text-[#85868c]">Need to move an activation? <Link href="/support" className="text-[#dedee1] underline underline-offset-2">Contact support</Link>.</p>
        </div>
        <div className="bg-white/[.025] px-5 py-4 sm:px-7">
          <p className="text-sm font-medium text-[#d4d4d7]">AI usage is separate from your desktop license.</p>
          <p className="mt-1 text-xs leading-5 text-[#929399]">The license doesn’t include cloud AI credits. After sponsored trial access, use your own OpenRouter key; provider charges may apply. Local tools remain available on your device.</p>
        </div>
      </section>
    )
  }

  if (checkoutState === 'success') {
    return (
      <section className={`${surface} mt-7 p-6 sm:p-8`}>
        <p className="font-medium">Payment received. Your license is being activated.</p>
        <p className="mt-2 text-sm leading-6 text-[#a5a6ab]">It can take a short moment for the payment confirmation to reach your account.</p>
        <div className="mt-5"><RefreshLicenseStatusButton /></div>
      </section>
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
      <section className={`${surface} mt-7 p-6 sm:p-8`}>
        <p className="inline-flex rounded-full bg-white/[.07] px-3 py-1.5 text-xs font-medium text-[#d4d4d7]">License {state.toLowerCase()}</p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">Your previous license is {state.toLowerCase()}.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#a5a6ab]">{license.message || 'Contact Deyn Studio support if you think this status is incorrect.'}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {license.status === 'refunded' || license.status === 'expired' ? <BuyLicenseButton priceLabel={priceLabel} autoStart={autoBuy && !checkoutState} /> : null}
          <Link href="/support" className="inline-flex min-h-11 items-center rounded-full bg-[#242529] px-5 text-sm font-medium text-[#e1e1e3] shadow-[0_4px_14px_rgb(0_0_0/.16)] transition hover:bg-[#2d2e33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">Contact support</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={`${surface} mt-7 p-6 sm:p-8`} aria-labelledby="lifetime-license-title">
      <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">LIFETIME DESKTOP LICENSE</p>
      <h2 id="lifetime-license-title" className="mt-3 max-w-lg text-2xl font-medium tracking-[-0.04em] sm:text-3xl">Own your media toolkit.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a5a6ab]">One purchase includes Deyn Studio’s desktop media tools, future software updates, and use on up to two devices. There’s no recurring desktop license fee.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <BuyLicenseButton priceLabel={priceLabel} autoStart={autoBuy && !checkoutState && !licenseError} />
        <Link href="/support" className="inline-flex min-h-12 items-center rounded-full bg-[#242529] px-5 text-sm font-medium text-[#d4d4d7] shadow-[0_4px_14px_rgb(0_0_0/.16)] transition hover:bg-[#2d2e33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">Contact support</Link>
      </div>
      {checkoutState === 'cancelled' ? <p className="mt-4 text-sm text-[#a5a6ab]">Checkout was canceled. You haven’t been charged.</p> : null}
      <div className="mt-6 rounded-2xl bg-[#1d1e22] px-4 py-4 sm:px-5">
        <p className="text-sm font-medium text-[#d4d4d7]">AI usage is separate from desktop ownership.</p>
        <p className="mt-1 text-xs leading-5 text-[#929399]">The lifetime license doesn’t add cloud AI credits. Sponsored trial actions are limited; after the trial or after purchase, cloud AI uses your own OpenRouter key and may incur provider charges. Local tools such as on-device transcription don’t use those credits.</p>
      </div>
    </section>
  )
}

export function AccountDashboard({ user, license, licenseError, trialSnapshot, trialError, licenseDevices, devicesError, priceLabel, checkoutState, autoBuy = false, downloadUrls, isTrialAdmin = false }) {
  const showTrial = !licenseError && license?.status === 'none'

  return (
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-5xl">
        <SiteHeader dashboard><div className="flex items-center gap-3"><AccountAvatar firstName={user?.firstName} lastName={user?.lastName} email={user?.primaryEmailAddress?.emailAddress} /><AccountMenu /></div></SiteHeader>
        <AccountNavigation active="overview" showTrialControls={isTrialAdmin} />
        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ACCOUNT OVERVIEW</p>
            <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Your Deyn Studio account</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Your license, trial usage, and desktop access in one place.</p>
          </div>
          {showTrial ? (
            <>
              <div className="mt-5"><AppAccess downloadUrls={downloadUrls} licensed={false} /></div>
              <TrialUsagePanel snapshot={trialSnapshot} error={trialError} />
              <LicensePanel license={license} licenseError={licenseError} priceLabel={priceLabel} devices={licenseDevices} devicesError={devicesError} checkoutState={checkoutState} autoBuy={autoBuy} />
            </>
          ) : (
            <>
              <LicensePanel license={license} licenseError={licenseError} priceLabel={priceLabel} devices={licenseDevices} devicesError={devicesError} checkoutState={checkoutState} autoBuy={autoBuy} />
              <div className="mt-5"><AppAccess downloadUrls={downloadUrls} licensed={Boolean(license?.licensed)} /></div>
            </>
          )}
        </section>
        <SiteFooter dark />
      </div>
    </main>
  )
}
