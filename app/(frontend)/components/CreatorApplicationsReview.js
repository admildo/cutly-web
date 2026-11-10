'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  CREATOR_CREDIT_LIMIT_CENTS,
  creatorAudienceLabel,
  formatCreatorDate,
  formatCreatorUsd
} from '@/lib/creator-program-options'

const card = 'rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]'
const inputClass = 'w-full resize-y rounded-xl bg-[#0d0e11] px-3 py-2.5 text-sm leading-6 text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]'
const primaryButton = 'min-h-11 rounded-full bg-[#f2f2ee] px-5 text-sm font-semibold text-[#171716] shadow-[0_6px_20px_rgb(0_0_0/.24)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'
const quietButton = 'min-h-9 rounded-full bg-[#222328] px-4 text-xs font-medium text-[#e3e3e5] transition hover:bg-[#2a2b31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'

const creditInputClass = 'min-h-11 w-32 rounded-xl bg-[#0d0e11] px-3 text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]'

const STATUS = {
  pending: { label: 'Pending', className: 'bg-white/[.08] text-[#e5e5e7]' },
  approved: { label: 'Approved', className: 'bg-[#1f2d22] text-[#a9d9b4]' },
  declined: { label: 'Declined', className: 'bg-white/[.07] text-[#a5a6ab]' }
}

export function CreatorApplicationsReview({ applications }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState('')
  const [decliningId, setDecliningId] = useState('')
  const [creditUsd, setCreditUsd] = useState((CREATOR_CREDIT_LIMIT_CENTS.min / 100).toFixed(2))
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const review = async (application, body) => {
    if (busyId) return

    setBusyId(application.id)
    setMessage('')
    setError('')
    const who = application.email || 'The applicant'
    try {
      // An expired session sends the request to Clerk's sign-in, which the browser reports as a network failure.
      let response
      try {
        response = await fetch('/api/admin/creator-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: application.id, ...body })
        })
      } catch {
        throw new Error('Couldn’t reach Deyn Studio. Refresh the page, sign in again if asked, and retry.')
      }
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'The decision could not be saved. Try again.')

      setMessage(body.decision === 'approve'
        ? `Approved. ${who} now has a free license and an OpenRouter key.`
        : `Declined. ${who} will see the decision in their dashboard.`)
      setDecliningId('')
      setNote('')
      router.refresh()
    } catch (reviewError) {
      setError(reviewError.message)
    } finally {
      setBusyId('')
    }
  }

  const startDeclining = (application) => {
    setDecliningId(application.id)
    setNote('')
    setMessage('')
    setError('')
  }

  return (
    <div className="mt-6">
      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p role="alert" className="m-0 mb-3 text-[#e5a5a5]">{error}</p> : null}
        {message ? <p role="status" className="m-0 mb-3 text-[#d4d4d7]">{message}</p> : null}
      </div>

      {applications.length === 0 ? (
        <p className="mt-3 text-sm text-[#a5a6ab]">No creator applications yet.</p>
      ) : (
        <ul className={`m-0 list-none divide-y divide-white/[.07] px-5 sm:px-7 ${card} p-0`}>
          {applications.map((application) => {
            const busy = busyId === application.id
            const declining = decliningId === application.id
            const status = STATUS[application.status] || STATUS.pending

            return (
              <li key={application.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 break-all text-sm font-medium text-[#f2f2ee]">{application.email || application.userId}</p>
                    {application.name ? <p className="m-0 mt-0.5 text-xs text-[#a6a4a4]">{application.name}</p> : null}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}>{status.label}</span>
                </div>

                <p className="m-0 mt-2 text-xs text-[#a6a4a4]">
                  <a href={application.profileUrl} target="_blank" rel="noopener noreferrer" className="text-[#d4d4d7] underline underline-offset-2">
                    {application.profileUrl.replace(/^https:\/\//, '')}
                  </a>
                  {' · '}{application.platforms.join(', ')}
                  {' · '}{creatorAudienceLabel(application.audience)}
                  {' · '}Submitted {formatCreatorDate(application.createdAt)}
                  {application.creditLimitCents ? ` · Key limit ${formatCreatorUsd(application.creditLimitCents / 100)}` : null}
                  {application.keyDisabled ? ' · Key disabled' : null}
                </p>
                <p className="m-0 mt-2 text-sm leading-6 text-[#d4d4d7]">{application.plan}</p>

                {application.status !== 'pending' ? (
                  <p className="m-0 mt-2 text-xs text-[#a6a4a4]">
                    {application.decidedAt ? `Decided ${formatCreatorDate(application.decidedAt)}.` : null}
                    {application.decisionNote ? ` Note to applicant: ${application.decisionNote}` : null}
                  </p>
                ) : declining ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      review(application, { decision: 'decline', note })
                    }}
                    className="mt-4 grid gap-3"
                  >
                    <label className="grid gap-2 text-sm font-medium text-[#f2f2ee]">
                      Note for the applicant (optional)
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" disabled={Boolean(busyId)} className={primaryButton}>{busy ? 'Saving…' : 'Decline application'}</button>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => setDecliningId('')}
                        className={quietButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <label className="grid gap-1.5 text-xs font-medium text-[#d4d4d7]">
                      Spending limit (USD)
                      <input
                        type="number"
                        inputMode="decimal"
                        min={CREATOR_CREDIT_LIMIT_CENTS.min / 100}
                        max={CREATOR_CREDIT_LIMIT_CENTS.max / 100}
                        step="0.01"
                        value={creditUsd}
                        onChange={(event) => setCreditUsd(event.target.value)}
                        className={creditInputClass}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={Boolean(busyId)}
                      onClick={() => review(application, { decision: 'approve', creditLimitCents: Math.round(Number(creditUsd) * 100) })}
                      className={primaryButton}
                    >
                      {busy ? 'Creating key…' : 'Approve, grant license and create key'}
                    </button>
                    <button type="button" disabled={Boolean(busyId)} onClick={() => startDeclining(application)} className={quietButton}>Decline</button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
