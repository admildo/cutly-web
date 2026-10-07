'use client'

import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'

export function DesktopAuthChoice({ email }) {
  const { signOut } = useClerk()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const continueWithCurrentAccount = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('continue', '1')
    window.location.assign(url.toString())
  }

  const useAnotherAccount = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('continue', '1')
      await signOut({ redirectUrl: url.toString() })
    } catch {
      setBusy(false)
      setError('Could not switch accounts. Please try again.')
    }
  }

  return (
    <section aria-labelledby="desktop-auth-title">
      <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a6a4a4]">
        DESKTOP SIGN-IN
      </p>
      <h1 id="desktop-auth-title" className="mb-0 text-[clamp(32px,4vw,42px)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#f2f0ef]">
        Choose your account.
      </h1>
      <p className="mb-0 mt-3 text-[15px] leading-6 text-[#a6a4a4]">
        This browser is signed in{email ? ' as' : ''}{' '}
        {email ? <strong className="break-all font-medium text-[#f2f0ef]">{email}</strong> : 'to a Deyn account'}.
        {' '}Choose which account to connect to Deyn Studio.
      </p>

      <button
        type="button"
        onClick={continueWithCurrentAccount}
        disabled={busy}
        className="mt-8 inline-flex min-h-[56px] w-full items-center justify-center rounded-xl bg-[#f2f0ef] px-5 text-[15px] font-semibold text-[#171716] transition-colors hover:bg-[#cccbca] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6a4a4] disabled:cursor-wait disabled:opacity-65"
      >
        Continue with this account
      </button>
      <button
        type="button"
        onClick={useAnotherAccount}
        disabled={busy}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#807e7e] px-5 text-[14px] font-semibold text-[#f2f0ef] transition-colors hover:border-[#cccbca] hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6a4a4] disabled:cursor-wait disabled:opacity-65"
      >
        {busy ? 'Switching account…' : 'Use another Google account'}
      </button>
      <p className="mb-0 mt-3 text-center text-[12px] leading-5 text-[#807e7e]">
        This signs out of Deyn in this browser and asks Google to show its account chooser.
      </p>
      {error ? <p role="alert" className="mb-0 mt-4 text-[13px] leading-5 text-[#ff9f91]">{error}</p> : null}
    </section>
  )
}
