'use client'

import { useAuth, useClerk, useSignIn, useSignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthLayout } from './AuthLayout'

const readableError = (error) => error?.longMessage || error?.message || 'Please try signing in again.'

export function OAuthCallback({ returnTo = '/' }) {
  const clerk = useClerk()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const hasStarted = useRef(false)
  const [error, setError] = useState('')
  const [needsProfile, setNeedsProfile] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationStrategy, setVerificationStrategy] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [saving, setSaving] = useState(false)

  const finalize = useCallback(async (resource) => {
    const { error: finalizeError } = await resource.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          setError('Your account needs another security step. Please restart sign-in or contact Cutly support.')
          return
        }
        window.location.replace(decorateUrl(returnTo))
      },
    })

    if (finalizeError) setError(readableError(finalizeError))
  }, [returnTo])

  useEffect(() => {
    if (!authLoaded || !signIn || !signUp) return
    if (isSignedIn && signIn.status !== 'complete' && signUp.status !== 'complete') {
      window.location.replace(returnTo)
      return
    }
    if (hasStarted.current) return
    hasStarted.current = true

    const completeAuthentication = async () => {
      try {
        if (signIn.status === 'complete') {
          await finalize(signIn)
          return
        }

        if (signUp.isTransferable) {
          const { error: transferError } = await signIn.create({ transfer: true })
          if (transferError) throw transferError
          if (signIn.status === 'complete') {
            await finalize(signIn)
            return
          }
          if (signIn.status !== 'needs_second_factor' && signIn.status !== 'needs_client_trust') {
            throw new Error('This Google account needs another sign-in method. Return to sign in and choose a supported option.')
          }
        }

        if (signIn.status === 'needs_first_factor' && !signIn.supportedFirstFactors?.every((factor) => factor.strategy === 'enterprise_sso')) {
          throw new Error('This account needs another verification method. Please restart sign-in.')
        }

        if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
          const availableStrategies = (signIn.supportedSecondFactors || [])
            .map((factor) => factor.strategy)
            .filter((strategy) => ['totp', 'backup_code', 'email_code', 'phone_code'].includes(strategy))
          const selectedStrategy = ['totp', 'email_code', 'phone_code', 'backup_code'].find((strategy) => availableStrategies.includes(strategy))
          if (!selectedStrategy) throw new Error('This account needs a verification method that is not available here. Please contact Cutly support.')

          setNeedsVerification(true)
          setVerificationStrategy(selectedStrategy)
          if (selectedStrategy === 'email_code') {
            const { error: sendError } = await signIn.mfa.sendEmailCode()
            if (sendError) throw sendError
          } else if (selectedStrategy === 'phone_code') {
            const { error: sendError } = await signIn.mfa.sendPhoneCode()
            if (sendError) throw sendError
          }
          return
        }

        if (signIn.isTransferable) {
          const { error: transferError } = await signUp.create({ transfer: true })
          if (transferError) throw transferError
          if (signUp.status === 'complete') {
            await finalize(signUp)
            return
          }
          if (signUp.status === 'missing_requirements' && signUp.missingFields?.length) {
            setNeedsProfile(true)
            return
          }
        }

        if (signUp.status === 'complete') {
          await finalize(signUp)
          return
        }

        if (signUp.status === 'missing_requirements' && signUp.missingFields?.length) {
          setNeedsProfile(true)
          return
        }

        const existingSessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId
        if (existingSessionId) {
          await clerk.setActive({
            session: existingSessionId,
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) {
                setError('Your account needs another security step. Please restart sign-in or contact Cutly support.')
                return
              }
              window.location.replace(decorateUrl(returnTo))
            },
          })
          return
        }

        throw new Error('We couldn’t complete sign-in. Please try again.')
      } catch (authError) {
        setError(readableError(authError))
      }
    }

    void completeAuthentication()
  }, [authLoaded, isSignedIn, signIn, signUp, clerk, finalize, returnTo])

  const finishProfile = async (event) => {
    event.preventDefault()
    if (saving) return

    const missing = signUp.missingFields || []
    const updates = {}
    if (missing.includes('first_name')) updates.firstName = firstName.trim()
    if (missing.includes('last_name')) updates.lastName = lastName.trim()
    if (missing.includes('legal_accepted')) updates.legalAccepted = legalAccepted

    const unsupported = missing.some((field) => !['first_name', 'last_name', 'legal_accepted'].includes(field))
    if (unsupported) {
      setError('We need one more account detail that can’t be collected here. Please contact Cutly support.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const { error: updateError } = await signUp.update(updates)
      if (updateError) throw updateError
      if (signUp.status === 'complete') {
        await finalize(signUp)
      } else {
        setError('Please check the details and try again.')
      }
    } catch (updateError) {
      setError(readableError(updateError))
    } finally {
      setSaving(false)
    }
  }

  const chooseVerificationStrategy = async (strategy) => {
    setVerificationStrategy(strategy)
    setVerificationCode('')
    setError('')
    try {
      if (strategy === 'email_code') {
        const { error: sendError } = await signIn.mfa.sendEmailCode()
        if (sendError) throw sendError
      } else if (strategy === 'phone_code') {
        const { error: sendError } = await signIn.mfa.sendPhoneCode()
        if (sendError) throw sendError
      }
    } catch (authError) {
      setError(readableError(authError))
    }
  }

  const verifySecondFactor = async (event) => {
    event.preventDefault()
    if (!signIn || verifying) return

    setVerifying(true)
    setError('')
    try {
      const params = { code: verificationCode.trim() }
      const result = verificationStrategy === 'totp'
        ? await signIn.mfa.verifyTOTP(params)
        : verificationStrategy === 'backup_code'
          ? await signIn.mfa.verifyBackupCode(params)
          : verificationStrategy === 'email_code'
            ? await signIn.mfa.verifyEmailCode(params)
            : await signIn.mfa.verifyPhoneCode(params)
      if (result.error) throw result.error
      if (signIn.status === 'complete') {
        await finalize(signIn)
      } else {
        setError('That code did not complete verification. Check it and try again.')
      }
    } catch (authError) {
      setError(readableError(authError))
    } finally {
      setVerifying(false)
    }
  }

  const missing = signUp?.missingFields || []
  const availableVerificationStrategies = (signIn?.supportedSecondFactors || [])
    .map((factor) => factor.strategy)
    .filter((strategy, index, strategies) => ['totp', 'backup_code', 'email_code', 'phone_code'].includes(strategy) && strategies.indexOf(strategy) === index)

  return (
    <AuthLayout>
      <section aria-live="polite" aria-busy={!error && !needsProfile && !needsVerification}>
        {needsVerification ? (
          <>
            <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a6a4a4]">SECURE SIGN-IN</p>
            <h1 className="mb-0 text-[32px] font-semibold leading-tight tracking-[-0.05em] text-[#f2f0ef]">Verify it’s you.</h1>
            <p className="mb-0 mt-3 text-[15px] leading-6 text-[#a6a4a4]">Complete the extra security step on your Cutly account to continue.</p>
            <form className="mt-7 space-y-4" onSubmit={verifySecondFactor}>
              {availableVerificationStrategies.length > 1 ? (
                <label className="block text-[13px] font-medium text-[#cccbca]">
                  Verification method
                  <select value={verificationStrategy} onChange={(event) => void chooseVerificationStrategy(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#807e7e] bg-[#242322] px-4 text-[15px] text-[#f2f0ef] outline-none focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20">
                    {availableVerificationStrategies.map((strategy) => <option key={strategy} value={strategy}>{strategy === 'totp' ? 'Authenticator app' : strategy === 'backup_code' ? 'Backup code' : strategy === 'email_code' ? 'Email code' : 'Text message'}</option>)}
                  </select>
                </label>
              ) : null}
              <label className="block text-[13px] font-medium text-[#cccbca]">
                {verificationStrategy === 'totp' ? 'Authenticator code' : verificationStrategy === 'backup_code' ? 'Backup code' : 'Verification code'}
                <input autoComplete="one-time-code" inputMode={verificationStrategy === 'backup_code' ? 'text' : 'numeric'} required value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#807e7e] bg-[#242322] px-4 text-[15px] text-[#f2f0ef] outline-none focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20" />
              </label>
              {error ? <p role="alert" className="m-0 rounded-lg border border-[#807e7e] bg-[#242322] px-3.5 py-3 text-[13px] leading-5 text-[#f2f0ef]">{error}</p> : null}
              <button type="submit" disabled={verifying || !verificationCode.trim()} className="min-h-12 w-full rounded-xl bg-[#f2f0ef] px-5 text-[14px] font-semibold text-[#171716] transition-colors hover:bg-[#cccbca] disabled:cursor-wait disabled:opacity-60">
                {verifying ? 'Verifying…' : 'Verify and continue'}
              </button>
              {verificationStrategy === 'email_code' || verificationStrategy === 'phone_code' ? (
                <button type="button" onClick={() => void chooseVerificationStrategy(verificationStrategy)} className="w-full py-2 text-[13px] font-medium text-[#cccbca] underline underline-offset-4 hover:text-[#f2f0ef]">Send a new code</button>
              ) : null}
            </form>
          </>
        ) : needsProfile ? (
          <>
            <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a6a4a4]">FINISH SETUP</p>
            <h1 className="mb-0 text-[32px] font-semibold leading-tight tracking-[-0.05em] text-[#f2f0ef]">One last detail.</h1>
            <p className="mb-0 mt-3 text-[15px] leading-6 text-[#a6a4a4]">Add the details needed to finish your Cutly account.</p>
            <form className="mt-7 space-y-4" onSubmit={finishProfile}>
              {missing.includes('first_name') ? (
                <label className="block text-[13px] font-medium text-[#cccbca]">
                  First name
                  <input autoComplete="given-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#807e7e] bg-[#242322] px-4 text-[15px] text-[#f2f0ef] outline-none placeholder:text-[#807e7e] focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20" />
                </label>
              ) : null}
              {missing.includes('last_name') ? (
                <label className="block text-[13px] font-medium text-[#cccbca]">
                  Last name
                  <input autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#807e7e] bg-[#242322] px-4 text-[15px] text-[#f2f0ef] outline-none placeholder:text-[#807e7e] focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20" />
                </label>
              ) : null}
              {missing.includes('legal_accepted') ? (
                <label className="flex items-start gap-3 text-[13px] leading-5 text-[#a6a4a4]">
                  <input type="checkbox" checked={legalAccepted} onChange={(event) => setLegalAccepted(event.target.checked)} required className="mt-1 accent-[#cccbca]" />
                  <span>I agree to the Cutly <Link href="/terms" className="text-[#f2f0ef] underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="text-[#f2f0ef] underline underline-offset-2">Privacy Policy</Link>.</span>
                </label>
              ) : null}
              {error ? <p role="alert" className="m-0 rounded-lg border border-[#807e7e] bg-[#242322] px-3.5 py-3 text-[13px] leading-5 text-[#f2f0ef]">{error}</p> : null}
              <button type="submit" disabled={saving} className="min-h-12 w-full rounded-xl bg-[#f2f0ef] px-5 text-[14px] font-semibold text-[#171716] transition-colors hover:bg-[#cccbca] disabled:cursor-wait disabled:opacity-60">
                {saving ? 'Saving…' : 'Continue'}
              </button>
            </form>
          </>
        ) : error ? (
          <>
            <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a6a4a4]">SIGN-IN ISSUE</p>
            <h1 className="mb-0 text-[32px] font-semibold leading-tight tracking-[-0.05em] text-[#f2f0ef]">We couldn’t finish signing in.</h1>
            <p role="alert" className="mb-0 mt-3 text-[14px] leading-6 text-[#a6a4a4]">{error}</p>
            <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f2f0ef] px-5 text-[14px] font-semibold text-[#171716] no-underline transition-colors hover:bg-[#cccbca]">
              Back to sign in
            </Link>
          </>
        ) : (
          <div className="py-6 text-center">
            <span aria-hidden="true" className="mx-auto block h-8 w-8 animate-spin rounded-full border-[3px] border-[#807e7e] border-t-[#f2f0ef]" />
            <h1 className="mb-0 mt-6 text-[26px] font-semibold tracking-[-0.04em] text-[#f2f0ef]">Connecting your account</h1>
            <p className="mb-0 mt-2 text-[14px] text-[#a6a4a4]">This should only take a moment.</p>
          </div>
        )}
      </section>
    </AuthLayout>
  )
}
