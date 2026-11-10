import Link from 'next/link'
import { AppAccess } from '@/app/components/AppAccess'
import { BuyLicenseButton } from '@/app/components/BuyLicenseButton'
import { RefreshLicenseStatusButton } from '@/app/components/RefreshLicenseStatusButton'
import { RefreshTrialUsageButton } from '@/app/components/RefreshTrialUsageButton'
import { CreatorProgramPanel } from '@/app/components/CreatorProgramPanel'
import { AccountShell, accountProfile } from '@/app/components/AccountShell'
import { Check, Laptop } from '@phosphor-icons/react/ssr'
import { CardHeader, Note, Row, Rows, Status, button, card } from '@/app/components/dashboard-ui'

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
      <section className={`${card} flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6`} aria-labelledby="trial-usage-title">
        <div>
          <h2 id="trial-usage-title" className="m-0 text-[15px] font-semibold">Free trial</h2>
          <p className="m-0 mt-1 text-sm text-app-mute">Couldn’t load your remaining actions. Refresh to try again.</p>
        </div>
        <RefreshTrialUsageButton />
      </section>
    )
  }

  const { trial } = snapshot
  const isActive = snapshot.status === 'trial'
  const isComplete = snapshot.status === 'trial-complete'
  const isReady = trial.enabled && !trial.startedAt
  const isPaused = !trial.enabled
  const status = isActive ? 'Active' : isComplete ? 'Used up' : isReady ? 'Ready to start' : isPaused ? 'Paused' : 'Unavailable'
  const tone = isActive ? 'ok' : isPaused ? 'warn' : 'neutral'
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
    <section className={card} aria-labelledby="trial-usage-title">
      <CardHeader id="trial-usage-title" title="Free trial" status={<Status tone={tone}>{status}</Status>} description={description} action={<RefreshTrialUsageButton />} />

      <div className="px-5 pb-2 pt-5 sm:px-6">
        <p className="m-0 flex items-baseline gap-2">
          <span className="text-4xl font-semibold leading-none tracking-[-0.04em] tabular-nums">{remainingTotal}</span>
          <span className="text-sm text-app-mute">{isReady ? 'actions available' : 'actions left'} across all trial tools</span>
        </p>

        <ul className="m-0 mt-4 list-none divide-y divide-app-line p-0">
          {trialFeatures.map(({ key, name }) => {
            const limit = Math.max(0, Number(trial.limits?.[key] || 0))
            const remaining = Math.max(0, Number(trial.remaining?.[key] || 0))
            const progress = limit ? Math.min(100, Math.round((remaining / limit) * 100)) : 0

            return (
              <li key={key} className="py-3.5">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className={remaining === 0 ? 'text-app-mute' : 'text-app-ink'}>{name}</span>
                  <span className="tabular-nums text-app-ink">{remaining}<span className="text-app-faint"> / {limit}</span></span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[.08]" role="img" aria-label={`${remaining} of ${limit} left`}>
                  <div className="h-full rounded-full bg-app-ink/80 transition-[width]" style={{ width: `${progress}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {(trial.startedAt || trial.usageUpdatedAt) ? (
        <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 border-t border-app-line px-5 py-3 text-xs text-app-faint sm:px-6">
          {trial.startedAt ? <span>Started {displayDate(trial.startedAt)}</span> : null}
          {trial.usageUpdatedAt ? <span>Usage updated {displayDate(trial.usageUpdatedAt)}</span> : null}
        </p>
      ) : null}
    </section>
  )
}

function DevicePips({ used, limit }) {
  const total = Math.min(Math.max(Number(limit) || 0, 0), 10)
  if (!total) return null
  return (
    <span aria-hidden="true" className="mr-2.5 inline-flex gap-1 align-middle">
      {Array.from({ length: total }, (_, index) => <span key={index} className={`h-1.5 w-4 rounded-full ${index < used ? 'bg-app-ink' : 'bg-white/[.12]'}`} />)}
    </span>
  )
}

function Message({ title, children, actions }) {
  return (
    <section className={`${card} p-5 sm:p-6`}>
      <h2 className="m-0 text-[15px] font-semibold">{title}</h2>
      <p className="m-0 mt-1.5 max-w-xl text-sm leading-6 text-app-mute">{children}</p>
      {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  )
}

function LicensePanel({ license, licenseError, checkoutState, autoBuy = false, priceLabel, devices = [], devicesError = false }) {
  if (licenseError) {
    return <Message title="We couldn’t check your license.">Your account is signed in. Please try again; we won’t ask you to buy while the status is unavailable.</Message>
  }

  if (license?.licensed) {
    const isLifetime = license.type === 'lifetime'
    return (
      <section className={`${card} overflow-hidden`} aria-labelledby="license-title">
        <CardHeader
          id="license-title"
          title={license.plan || 'Deyn Studio license'}
          status={<Status tone="ok">Active</Status>}
          description={isLifetime ? 'One-time desktop license with future software updates.' : 'Your Deyn Studio license is active.'}
        />

        <Rows className="mx-5 mt-4 border-t border-app-line sm:mx-6">
          <Row label="License type"><span className="capitalize">{license.type || '—'}</span></Row>
          <Row label="Access">{isLifetime ? 'Lifetime' : displayDate(license.expiresAt)}</Row>
          <Row label="Devices"><DevicePips used={license.devicesUsed} limit={license.deviceLimit} /><span className="tabular-nums">{license.devicesUsed} of {license.deviceLimit}</span></Row>
        </Rows>

        <div className="border-t border-app-line px-5 py-5 sm:px-6">
          <h3 className="m-0 text-[13px] font-semibold">Activated devices</h3>

          {devicesError ? (
            <p role="status" className="m-0 mt-3 text-sm leading-6 text-app-mute">Device details are temporarily unavailable. Refresh the page to try again.</p>
          ) : devices.length ? (
            <ul className="m-0 mt-1 list-none divide-y divide-app-line p-0">
              {devices.map((device, index) => (
                <li key={`${device.platform || 'desktop'}-${device.appVersion || 'unknown'}-${device.lastSeenAt || index}`} className="flex items-center gap-3 py-3">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg border border-app-line bg-app-raised text-app-mute"><Laptop className="size-[18px]" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-medium">{displayPlatform(device.platform)}{device.appVersion ? <span className="font-normal text-app-mute"> · Deyn Studio {device.appVersion}</span> : null}</p>
                    {displayLastActivity(device.lastSeenAt) ? <p className="m-0 text-xs text-app-faint">Last active {displayLastActivity(device.lastSeenAt)}</p> : <p className="m-0 text-xs text-app-faint">Device {index + 1}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 mt-3 text-sm text-app-mute">No devices have activated this license yet.</p>
          )}

          <p className="m-0 mt-3 text-xs leading-5 text-app-faint">Need to move an activation? <Link href="/support" className="text-app-mute underline underline-offset-2 hover:text-app-ink">Contact support</Link>.</p>
        </div>

        <Note title="AI usage is separate from your desktop license.">The license doesn’t include cloud AI credits. After sponsored trial access, use your own OpenRouter key; provider charges may apply. Local tools remain available on your device.</Note>
      </section>
    )
  }

  if (checkoutState === 'success') {
    return (
      <Message title="Payment received. Your license is being activated." actions={<RefreshLicenseStatusButton />}>
        It can take a short moment for the payment confirmation to reach your account.
      </Message>
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
      <section className={card} aria-labelledby="license-state-title">
        <CardHeader
          id="license-state-title"
          title={`Your previous license is ${state.toLowerCase()}.`}
          status={<Status tone="danger">{state}</Status>}
          description={license.message || 'Contact Deyn Studio support if you think this status is incorrect.'}
        />
        <div className="flex flex-wrap items-center gap-3 px-5 pb-5 pt-5 sm:px-6">
          {license.status === 'refunded' || license.status === 'expired' ? <BuyLicenseButton priceLabel={priceLabel} autoStart={autoBuy && !checkoutState} /> : null}
          <Link href="/support" className={button.secondary}>Contact support</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={`${card} overflow-hidden`} aria-labelledby="lifetime-license-title">
      <CardHeader
        id="lifetime-license-title"
        title="Lifetime desktop license"
        description="Own Deyn Studio’s desktop media tools. There’s no recurring desktop license fee."
      />
      <ul className="m-0 grid list-none gap-2.5 p-0 px-5 pt-4 text-sm sm:px-6">
        {['Every desktop media tool', 'Future software updates', 'Use on up to two devices'].map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-app-ink"><Check aria-hidden="true" weight="bold" className="size-3.5 text-app-ok" />{item}</li>
        ))}
      </ul>
      <div className="flex flex-wrap items-start gap-3 px-5 pb-5 pt-5 sm:px-6">
        <BuyLicenseButton priceLabel={priceLabel} autoStart={autoBuy && !checkoutState && !licenseError} />
        <Link href="/support" className={button.quiet + ' !h-10 !px-3 !text-sm'}>Contact support</Link>
      </div>
      {checkoutState === 'cancelled' ? <p className="m-0 -mt-1 px-5 pb-5 text-sm text-app-mute sm:px-6">Checkout was canceled. You haven’t been charged.</p> : null}
      <Note title="AI usage is separate from desktop ownership.">The lifetime license doesn’t add cloud AI credits. Sponsored trial actions are limited; after the trial or after purchase, cloud AI uses your own OpenRouter key and may incur provider charges. Local tools such as on-device transcription don’t use those credits.</Note>
    </section>
  )
}

export function AccountDashboard({ user, license, licenseError, trialSnapshot, trialError, licenseDevices, devicesError, creatorApplication, creatorError = false, creatorKeyUsage = null, priceLabel, checkoutState, autoBuy = false, downloadUrls, isTrialAdmin = false }) {
  const showTrial = !licenseError && license?.status === 'none'
  // The creator program is for accounts without a license; an existing application stays visible either way.
  const showCreatorProgram = Boolean(creatorApplication || creatorError || !license?.licensed)

  const licensePanel = <LicensePanel license={license} licenseError={licenseError} priceLabel={priceLabel} devices={licenseDevices} devicesError={devicesError} checkoutState={checkoutState} autoBuy={autoBuy} />

  return (
    <AccountShell active="overview" profile={accountProfile(user)} isAdmin={isTrialAdmin} title="Overview" description="Your license, trial usage, and desktop access in one place." width="max-w-5xl">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="order-first lg:order-last"><AppAccess variant="panel" downloadUrls={downloadUrls} licensed={Boolean(license?.licensed)} /></div>
        <div className="grid gap-5">
          {showTrial ? <TrialUsagePanel snapshot={trialSnapshot} error={trialError} /> : null}
          {licensePanel}
          {showCreatorProgram ? <CreatorProgramPanel application={creatorApplication} keyUsage={creatorKeyUsage} error={creatorError} /> : null}
        </div>
      </div>
    </AccountShell>
  )
}
