'use client'

import { useState } from 'react'

const inputClass = 'min-h-11 w-full rounded-xl bg-[#0d0e11] px-3 text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]'
const primaryButton = 'min-h-11 rounded-full bg-[#f2f2ee] px-5 text-sm font-semibold text-[#171716] shadow-[0_6px_20px_rgb(0_0_0/.24)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'
const quietButton = 'min-h-9 rounded-full bg-[#222328] px-4 text-xs font-medium text-[#e3e3e5] transition hover:bg-[#2a2b31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'

const describe = (license) => {
  const expiry = license.expiresAt ? `, until ${license.expiresAt.slice(0, 10)}` : ''
  return `${license.planName} · ${license.status}${expiry} · ${license.deviceLimit} devices · ${license.paymentProvider || 'unknown source'}`
}

const request = async (method, url, body) => {
  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'The request failed. Try again.')
  return result
}

export function LicenseGrantForm() {
  const [email, setEmail] = useState('')
  const [found, setFound] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const run = async (task) => {
    if (busy) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      await task()
    } catch (taskError) {
      setError(taskError.message || 'The request failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const lookup = (event) => {
    event.preventDefault()
    setFound(null)
    return run(async () => {
      setFound(await request('GET', `/api/admin/licenses?email=${encodeURIComponent(email.trim())}`))
    })
  }

  const refresh = async () => setFound(await request('GET', `/api/admin/licenses?email=${encodeURIComponent(found.user.email)}`))

  const grant = (event) => {
    event.preventDefault()
    return run(async () => {
      await request('POST', '/api/admin/licenses', {
        email: found.user.email,
        reason
      })
      setReason('')
      await refresh()
      setMessage(`License granted to ${found.user.email}. The app picks it up within a day, or straight away on Refresh.`)
    })
  }

  const revoke = (license) => {
    const note = window.prompt(`Revoke "${license.planName}" for ${found.user.email}? Give a reason:`)
    if (!note) return undefined
    return run(async () => {
      await request('DELETE', '/api/admin/licenses', { licenseId: license.id, reason: note })
      await refresh()
      setMessage('License revoked.')
    })
  }

  const hasActive = found?.licenses.some((license) => license.status === 'active')

  return (
    <div className="mt-6 overflow-hidden rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]">
      <form onSubmit={lookup} className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-7 sm:py-6">
        <label className="grid gap-2 text-sm font-medium text-[#f2f0ef]">
          Account email
          <input type="email" required autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </label>
        <button type="submit" disabled={busy} className={`${primaryButton} self-end`}>Find account</button>
      </form>

      {found ? (
        <div className="divide-y divide-white/[.07] border-t border-white/[.07] px-5 sm:px-7">
          <div className="py-5">
            <p className="m-0 text-sm font-medium text-[#f2f0ef]">{found.user.name || found.user.email}</p>
            <p className="mb-0 mt-1 text-xs text-[#a6a4a4]">
              {found.user.email} · {found.user.emailVerified ? 'email verified' : 'email not verified'} · {found.user.id}
            </p>
          </div>

          <ul className="m-0 list-none p-0">
            {found.licenses.length === 0 ? <li className="py-4 text-sm text-[#a6a4a4]">No licenses yet.</li> : null}
            {found.licenses.map((license) => (
              <li key={license.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-[#d4d4d7]">
                <span>{describe(license)}</span>
                {license.status === 'active' && license.paymentProvider === 'admin' ? (
                  <button type="button" disabled={busy} onClick={() => revoke(license)} className={quietButton}>Revoke</button>
                ) : null}
              </li>
            ))}
          </ul>

          {hasActive ? (
            <p className="m-0 py-5 text-sm text-[#a6a4a4]">This account already has an active license. Revoke a granted one to replace it; paid licenses end through Stripe.</p>
          ) : (
            <form onSubmit={grant} className="grid gap-4 py-5">
              <p className="m-0 text-sm text-[#a6a4a4]">Grants the same lifetime license as a purchase, on 2 devices.</p>
              <label className="grid gap-2 text-sm font-medium text-[#f2f0ef]">
                Reason (kept in the audit log)
                <input type="text" required minLength={3} maxLength={200} value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} />
              </label>
              <div>
                <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Working…' : 'Grant lifetime license'}</button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      <div aria-live="polite" className="min-h-5 px-5 pb-5 text-sm sm:px-7">
        {error ? <p role="alert" className="m-0 text-[#e5a5a5]">{error}</p> : null}
        {message ? <p role="status" className="m-0 text-[#d4d4d7]">{message}</p> : null}
      </div>
    </div>
  )
}
