'use client'

import { useAuth, useSignIn, useSignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const displayAuthError = (error) => error?.longMessage || error?.message || 'We couldn’t start sign-in. Please try again.'

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.7c3.9-3.6 6-8.8 6-14.9Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5c-1.8 1.2-4.1 2-6.8 2-5.2 0-9.6-3.5-11.2-8.1H5.9v5.1C9.3 39.6 16 44 24 44Z" />
      <path fill="#FBBC05" d="M12.8 28.1a12 12 0 0 1 0-7.7v-5.1H5.9a20 20 0 0 0 0 17.9l6.9-5.1Z" />
      <path fill="#EA4335" d="M24 12.3c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4 16 4 9.3 8.4 5.9 15.3l6.9 5.1c1.6-4.6 6-8.1 11.2-8.1Z" />
    </svg>
  )
}

export function AuthForm({ mode = 'sign-in', returnTo = '/' }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const isSignUp = mode === 'sign-up'
  const isReady = authLoaded && !isSignedIn && signIn && signUp

  useEffect(() => {
    if (authLoaded && isSignedIn) window.location.replace(returnTo)
  }, [authLoaded, isSignedIn, returnTo])

  const continueWithGoogle = async () => {
    if (!isReady || pending) return

    setPending(true)
    setError('')
    const callbackUrl = `/sso-callback?returnTo=${encodeURIComponent(returnTo)}`

    try {
      const attempt = isSignUp ? signUp : signIn
      const { error: authError } = await attempt.sso({
        strategy: 'oauth_google',
        redirectUrl: returnTo,
        redirectCallbackUrl: callbackUrl,
      })

      if (authError) setError(displayAuthError(authError))
    } catch (authError) {
      setError(displayAuthError(authError))
    } finally {
      setPending(false)
    }
  }

  return (
    <section aria-labelledby="auth-title">
      <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a6a4a4]">
        {isSignUp ? 'CREATE YOUR ACCOUNT' : 'ACCOUNT ACCESS'}
      </p>
      <h1 id="auth-title" className="mb-0 text-[clamp(32px,4vw,42px)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#f2f0ef]">
        {isSignUp ? 'Make room for your next great clip.' : 'Welcome back.'}
      </h1>
      <p className="mb-0 mt-3 max-w-[370px] text-[15px] leading-6 text-[#a6a4a4]">
        {isSignUp
          ? 'Create your Cutly account to connect your desktop editor and license.'
          : 'Sign in to your Cutly account and get back to creating.'}
      </p>

      {authLoaded && isSignedIn ? (
        <p role="status" className="mb-0 mt-6 text-[14px] text-[#a6a4a4]">You’re already signed in. Taking you back…</p>
      ) : <button
        type="button"
        onClick={continueWithGoogle}
        disabled={!isReady || pending}
        className="mt-8 inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-[#cccbca] bg-[#f2f0ef] px-5 text-[15px] font-semibold text-[#171716] shadow-[0_5px_24px_rgb(0_0_0/.2)] transition-colors hover:border-[#f2f0ef] hover:bg-[#cccbca] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6a4a4] disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? (
          <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-[#a6a4a4] border-t-[#171716]" />
        ) : <GoogleMark />}
        <span>{pending ? 'Connecting…' : 'Continue with Google'}</span>
      </button>}

      {error ? <p role="alert" className="mb-0 mt-4 rounded-lg border border-[#807e7e] bg-[#242322] px-3.5 py-3 text-[13px] leading-5 text-[#f2f0ef]">{error}</p> : null}

      <p className="mb-0 mt-7 text-center text-[13px] text-[#a6a4a4]">
        {isSignUp ? 'Already have an account?' : 'New to Cutly?'}{' '}
        <Link
          href={isSignUp ? `/sign-in?returnTo=${encodeURIComponent(returnTo)}` : `/sign-up?returnTo=${encodeURIComponent(returnTo)}`}
          className="font-semibold text-[#f2f0ef] underline decoration-[#807e7e] underline-offset-4 transition-colors hover:text-[#cccbca]"
        >
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
      <div id="clerk-captcha" />
    </section>
  )
}
