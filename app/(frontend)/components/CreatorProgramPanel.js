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

const surface = 'rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]'
const inputClass = 'min-h-11 w-full rounded-xl bg-[#0d0e11] px-3 text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]'
const primaryButton = 'min-h-11 rounded-full bg-[#f2f2ee] px-5 text-sm font-semibold text-[#171716] shadow-[0_6px_20px_rgb(0_0_0/.24)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'
const quietButton = 'min-h-9 rounded-full bg-[#222328] px-4 text-xs font-medium text-[#e3e3e5] transition hover:bg-[#2a2b31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'

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
    <form onSubmit={submit} className="grid gap-6 px-5 py-6 sm:px-7 sm:py-7">
      <label className="grid gap-2 text-sm font-medium text-[#f2f0ef]">
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
          className={inputClass}
        />
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-[#f2f0ef]">Where do you publish?</legend>
        <div className="flex flex-wrap gap-2">
          {CREATOR_PLATFORMS.map((platform) => {
            const selected = platforms.includes(platform)
            return (
              <button
                key={platform}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePlatform(platform)}
                className={`min-h-10 rounded-full px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selected ? 'bg-[#f2f2ee] text-[#17171a]' : 'bg-[#222328] text-[#d4d4d7] hover:bg-[#2a2b31]'}`}
              >
                {platform}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-medium text-[#f2f0ef]">
        Audience size
        <select required value={audience} onChange={(event) => setAudience(event.target.value)} className={inputClass}>
          <option value="" disabled>Choose a range</option>
          {CREATOR_AUDIENCES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#f2f0ef]">
        What will you make with Deyn Studio?
        <textarea
          required
          minLength={CREATOR_PLAN_LIMITS.min}
          maxLength={CREATOR_PLAN_LIMITS.max}
          rows={4}
          value={plan}
          onChange={(event) => setPlan(event.target.value)}
          className="w-full resize-y rounded-xl bg-[#0d0e11] px-3 py-2.5 text-sm leading-6 text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]"
        />
        <span className="text-xs font-normal text-[#85868c]">{plan.length} of {CREATOR_PLAN_LIMITS.max} characters</span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 max-w-sm text-xs leading-5 text-[#85868c]">You can apply once. The decision appears here.</p>
        <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Sending…' : 'Send application'}</button>
      </div>

      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p role="alert" className="m-0 text-[#e5a5a5]">{error}</p> : null}
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
    <div className="rounded-2xl bg-[#1d1e22] px-4 py-4 sm:px-5">
      <p className="m-0 text-sm font-medium text-[#ededeb]">Your OpenRouter key</p>
      <p className="mb-0 mt-1.5 text-sm leading-6 text-[#a5a6ab]">
        Paste it into the OpenRouter key field in Deyn Studio. It can spend up to {formatCreatorUsd(creditLimitCents / 100)} in total, then it stops working.
      </p>
      {usage ? (
        <p className="mb-0 mt-2 text-xs text-[#929399]">
          {formatCreatorUsd(usage.usage)} used{usage.limitRemaining == null ? '' : ` · ${formatCreatorUsd(usage.limitRemaining)} left`}
        </p>
      ) : null}

      {key ? (
        <div className="mt-4 grid gap-3">
          <code className="block break-all rounded-xl bg-[#0d0e11] px-3 py-3 text-xs leading-5 text-[#e5e5e7]">{key}</code>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copy} className={quietButton}>{copied ? 'Copied' : 'Copy key'}</button>
            <button type="button" onClick={() => setKey('')} className={quietButton}>Hide</button>
            <p className="m-0 text-xs text-[#85868c]">Keep it private. Anyone with this key can spend the limit.</p>
          </div>
        </div>
      ) : (
        <button type="button" onClick={reveal} disabled={busy} className={`${quietButton} mt-4`}>{busy ? 'Loading…' : 'Show key'}</button>
      )}

      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p role="alert" className="m-0 mt-3 text-[#e5a5a5]">{error}</p> : null}
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
    <div className="rounded-2xl bg-[#1d1e22] px-4 py-4 sm:px-5">
      <p className="m-0 text-sm font-medium text-[#ededeb]">Your OpenRouter key is disabled</p>
      <p className="mb-0 mt-1.5 text-sm leading-6 text-[#a5a6ab]">It no longer works in Deyn Studio. Contact Deyn Studio support if you think this is a mistake.</p>
    </div>
  )
}

function ApplicationStatus({ application, keyUsage }) {
  const copy = application.status === 'approved' && application.keyDisabled ? ENDED : (STATUS[application.status] || STATUS.pending)

  return (
    <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-7">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs font-medium text-[#e5e5e7]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#c9cace]" />{copy.label}
        </span>
        <h3 className="mb-0 mt-4 text-xl font-medium tracking-[-0.03em] text-[#ededeb]">{copy.title}</h3>
        <p className="mb-0 mt-2 max-w-xl text-sm leading-6 text-[#a5a6ab]">{copy.text}</p>
        {application.decisionNote ? (
          <p className="mb-0 mt-3 max-w-xl rounded-2xl bg-[#1d1e22] px-4 py-3 text-sm leading-6 text-[#d4d4d7]">{application.decisionNote}</p>
        ) : null}
      </div>

      {application.status === 'approved' && application.hasKey ? (
        application.keyDisabled
          ? <DisabledKey />
          : <CreatorKey creditLimitCents={application.creditLimitCents} usage={keyUsage} />
      ) : null}

      <dl className="mb-0 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5 sm:col-span-2">
          <dt className="text-xs text-[#929399]">Channel or profile</dt>
          <dd className="mb-0 mt-1.5 truncate text-sm font-medium">
            <a href={application.profileUrl} target="_blank" rel="noopener noreferrer" className="text-[#dedee1] underline underline-offset-2">
              {application.profileUrl.replace(/^https:\/\//, '')}
            </a>
          </dd>
        </div>
        <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5">
          <dt className="text-xs text-[#929399]">Where you publish</dt>
          <dd className="mb-0 mt-1.5 text-sm font-medium">{application.platforms.join(', ')}</dd>
        </div>
        <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5">
          <dt className="text-xs text-[#929399]">Audience size</dt>
          <dd className="mb-0 mt-1.5 text-sm font-medium">{audienceLabel(application.audience)}</dd>
        </div>
        <div className="rounded-2xl bg-[#1d1e22] px-4 py-3.5 sm:col-span-2">
          <dt className="text-xs text-[#929399]">What you’ll make</dt>
          <dd className="mb-0 mt-1.5 text-sm leading-6 text-[#d4d4d7]">{application.plan}</dd>
        </div>
      </dl>

      <p className="mb-0 text-xs leading-5 text-[#85868c]">
        Submitted {formatDate(application.createdAt)}.{' '}
        {application.status === 'pending' ? null : <>Questions? <Link href="/support" className="text-[#dedee1] underline underline-offset-2">Contact support</Link>.</>}
      </p>
    </div>
  )
}

export function CreatorProgramPanel({ application, keyUsage = null, error = false }) {
  return (
    <section id="creator-program" aria-labelledby="creator-program-title" className={`${surface} scroll-mt-6 overflow-hidden`}>
      <header className="px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">CREATOR PROGRAM</p>
        <h2 id="creator-program-title" className="mt-2 text-2xl font-medium tracking-[-0.045em]">Free license and usage credits</h2>
        <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">
          For creators who publish video with Deyn Studio. Approved creators get a free license and usage credits for AI actions.
        </p>
      </header>

      {error ? (
        <p role="status" className="px-5 py-6 text-sm text-[#a5a6ab] sm:px-7">We couldn’t load your creator application. Refresh the page to try again.</p>
      ) : application ? (
        <ApplicationStatus application={application} keyUsage={keyUsage} />
      ) : (
        <ApplicationForm />
      )}
    </section>
  )
}
