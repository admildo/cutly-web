'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  CREATOR_AUDIENCES,
  CREATOR_PLAN_LIMITS,
  CREATOR_PLATFORMS,
  creatorAudienceLabel as audienceLabel,
  formatCreatorDate as formatDate,
  formatCreatorUsd
} from '@/lib/creator-program-options'
import { CardHeader, Rows, Row, Status, button, card, field, fieldLabel, textarea } from './dashboard-ui'

const primaryButton = button.primary
const quietButton = button.small

const STATUS = {
  pending: { label: 'Under review', title: 'We’re reviewing your application.', text: 'The decision will appear here.' },
  approved: { label: 'Approved', title: 'You’re in the creator program.', text: 'Your free license is set up in this account.' },
  declined: { label: 'Not approved', title: 'This application wasn’t approved.', text: 'Contact Deyn Studio support if you have questions about this decision.' }
}

function ApplicationForm() {
  const router = useRouter()
  const [profileUrl, setProfileUrl] = useState('')
  const [platforms, setPlatforms] = useState([])
  const [audience, setAudience] = useState('')
  const [plan, setPlan] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const togglePlatform = (platform) => {
    setPlatforms((current) => (current.includes(platform)
      ? current.filter((item) => item !== platform)
      : [...current, platform]))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/creator-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl, platforms, audience, plan })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'We couldn’t send your application. Please try again.')
      // Keep the button busy: the refreshed page replaces this form with the application's status.
      router.refresh()
    } catch (submitError) {
      setError(submitError.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 px-5 pb-5 pt-5 sm:px-6">
      <label className={fieldLabel}>
        Main channel or profile link
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          maxLength={300}
          placeholder="youtube.com/@yourname"
          value={profileUrl}
          onChange={(event) => setProfileUrl(event.target.value)}
          className={field}
        />
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-[13px] font-medium text-app-ink">Where do you publish?</legend>
        <div className="flex flex-wrap gap-2">
          {CREATOR_PLATFORMS.map((platform) => {
            const selected = platforms.includes(platform)
            return (
              <button
                key={platform}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePlatform(platform)}
                className={`h-9 rounded-lg border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${selected ? 'border-app-ink bg-app-ink text-[#0c0c0e]' : 'border-app-line bg-app-raised text-app-mute hover:border-[#38383e] hover:text-app-ink'}`}
              >
                {platform}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className={fieldLabel}>
        Audience size
        <select required value={audience} onChange={(event) => setAudience(event.target.value)} className={field}>
          <option value="" disabled>Choose a range</option>
          {CREATOR_AUDIENCES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label className={fieldLabel}>
        What will you make with Deyn Studio?
        <textarea
          required
          minLength={CREATOR_PLAN_LIMITS.min}
          maxLength={CREATOR_PLAN_LIMITS.max}
          rows={4}
          value={plan}
          onChange={(event) => setPlan(event.target.value)}
          className={textarea}
        />
        <span className="text-xs font-normal text-app-faint">{plan.length} of {CREATOR_PLAN_LIMITS.max} characters</span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 max-w-sm text-xs leading-5 text-app-faint">You can apply once. The decision appears here.</p>
        <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Sending…' : 'Send application'}</button>
      </div>

      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p role="alert" className="m-0 text-app-danger">{error}</p> : null}
      </div>
    </form>
  )
}

// Shows the approved creator's OpenRouter key. The key is fetched only when asked for, so it is not in the page.
function CreatorKey({ creditLimitCents, usage }) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const reveal = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/creator-program/key')
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'We couldn’t show your key. Please try again.')
      setKey(result.key)
    } catch (revealError) {
      setError(revealError.message)
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(key)
      setCopied(true)
    } catch {
      setError('Copying did not work. Select the key and copy it by hand.')
    }
  }

  return (
    <div className="rounded-lg border border-app-line bg-app-bg px-4 py-4">
      <p className="m-0 text-sm font-medium text-app-ink">Your OpenRouter key</p>
      <p className="mb-0 mt-1.5 text-sm leading-6 text-app-mute">
        Paste it into the OpenRouter key field in Deyn Studio. It can spend up to {formatCreatorUsd(creditLimitCents / 100)} in total, then it stops working.
      </p>
      {usage ? (
        <p className="mb-0 mt-2 text-xs tabular-nums text-app-faint">
          {formatCreatorUsd(usage.usage)} used{usage.limitRemaining == null ? '' : ` · ${formatCreatorUsd(usage.limitRemaining)} left`}
        </p>
      ) : null}

      {key ? (
        <div className="mt-4 grid gap-3">
          <code className="block break-all rounded-lg border border-app-line bg-app-panel px-3 py-2.5 font-mono text-xs leading-5 text-app-ink">{key}</code>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copy} className={quietButton}>{copied ? 'Copied' : 'Copy key'}</button>
            <button type="button" onClick={() => setKey('')} className={quietButton}>Hide</button>
            <p className="m-0 text-xs text-app-faint">Keep it private. Anyone with this key can spend the limit.</p>
          </div>
        </div>
      ) : (
        <button type="button" onClick={reveal} disabled={busy} className={`${quietButton} mt-4`}>{busy ? 'Loading…' : 'Show key'}</button>
      )}

      <div aria-live="polite" className="text-sm">
        {error ? <p role="alert" className="m-0 mt-3 text-app-danger">{error}</p> : null}
      </div>
    </div>
  )
}

const ENDED = {
  label: 'License revoked',
  title: 'Your creator access has ended.',
  text: 'Your license was revoked, so your OpenRouter key was turned off.'
}

function DisabledKey() {
  return (
    <div className="rounded-lg border border-app-line bg-app-bg px-4 py-4">
      <p className="m-0 text-sm font-medium text-app-ink">Your OpenRouter key is disabled</p>
      <p className="mb-0 mt-1.5 text-sm leading-6 text-app-mute">It no longer works in Deyn Studio. Contact Deyn Studio support if you think this is a mistake.</p>
    </div>
  )
}

function ApplicationStatus({ application, keyUsage }) {
  const copy = application.status === 'approved' && application.keyDisabled ? ENDED : (STATUS[application.status] || STATUS.pending)
  const tone = application.status === 'approved' && !application.keyDisabled ? 'ok' : application.status === 'pending' ? 'warn' : 'neutral'

  return (
    <div className="grid gap-5 px-5 pb-5 pt-5 sm:px-6">
      <div>
        <Status tone={tone}>{copy.label}</Status>
        <h3 className="mb-0 mt-2 text-base font-semibold tracking-[-0.01em] text-app-ink">{copy.title}</h3>
        <p className="mb-0 mt-1 max-w-xl text-sm leading-6 text-app-mute">{copy.text}</p>
        {application.decisionNote ? (
          <p className="mb-0 mt-3 max-w-xl rounded-lg border border-app-line bg-app-bg px-4 py-3 text-sm leading-6 text-app-ink">{application.decisionNote}</p>
        ) : null}
      </div>

      {application.status === 'approved' && application.hasKey ? (
        application.keyDisabled
          ? <DisabledKey />
          : <CreatorKey creditLimitCents={application.creditLimitCents} usage={keyUsage} />
      ) : null}

      <Rows className="border-t border-app-line">
        <Row label="Channel or profile">
          <a href={application.profileUrl} target="_blank" rel="noopener noreferrer" className="block max-w-[16rem] truncate underline underline-offset-2 sm:max-w-sm">
            {application.profileUrl.replace(/^https:\/\//, '')}
          </a>
        </Row>
        <Row label="Where you publish">{application.platforms.join(', ')}</Row>
        <Row label="Audience size">{audienceLabel(application.audience)}</Row>
        <div className="py-3 text-sm">
          <dt className="text-app-mute">What you’ll make</dt>
          <dd className="m-0 mt-1.5 leading-6 text-app-ink">{application.plan}</dd>
        </div>
      </Rows>

      <p className="mb-0 text-xs leading-5 text-app-faint">
        Submitted {formatDate(application.createdAt)}.{' '}
        {application.status === 'pending' ? null : <>Questions? <Link href="/support" className="underline underline-offset-2 hover:text-app-ink">Contact support</Link>.</>}
      </p>
    </div>
  )
}

export function CreatorProgramPanel({ application, keyUsage = null, error = false }) {
  return (
    <section id="creator-program" aria-labelledby="creator-program-title" className={`${card} scroll-mt-6 overflow-hidden`}>
      <CardHeader
        id="creator-program-title"
        title="Creator program"
        description="For creators who publish video with Deyn Studio. Approved creators get a free license and usage credits for AI actions."
      />

      {error ? (
        <p role="status" className="m-0 px-5 pb-5 pt-4 text-sm text-app-mute sm:px-6">We couldn’t load your creator application. Refresh the page to try again.</p>
      ) : application ? (
        <ApplicationStatus application={application} keyUsage={keyUsage} />
      ) : (
        <div className="pt-1"><ApplicationForm /></div>
      )}
    </section>
  )
}
