import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AuthForm } from '../components/AuthForm'
import { AuthLayout } from '../components/AuthLayout'
import { DesktopAuthChoice } from '../components/DesktopAuthChoice'
import { normalizeInternalReturnPath } from '@/lib/auth-redirect'

export const metadata = { title: 'Connecting to Deyn Studio', robots: { index: false, follow: false } }
import { createDesktopAuthGrant } from '@/lib/desktop-auth'

const getCallback = (redirectUri, state) => {
  if (typeof redirectUri !== 'string' || typeof state !== 'string' || !state || state.length > 128) {
    return null
  }

  try {
    const callback = new URL(redirectUri)
    const isLoopback = callback.hostname === '127.0.0.1' || callback.hostname === 'localhost'
    if (callback.protocol !== 'http:' || !isLoopback || callback.pathname !== '/callback') return null
    return callback
  } catch {
    return null
  }
}

export default async function DesktopAuthPage({ searchParams }) {
  const params = await searchParams
  const { redirect_uri: redirectUri, state } = params
  const callback = getCallback(redirectUri, state)

  if (!callback) {
    return (
      <AuthLayout>
        <div className="rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
          <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-[#343332] text-[#cccbca]">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 6.25v4.25m0 3.25h.01M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mb-0 text-[25px] font-semibold leading-tight tracking-[-0.04em]">This link can’t connect to Deyn Studio desktop</h1>
          <p className="mb-0 mt-3 text-[14px] leading-6 text-[#807e7e]">
            Close this tab and start again from the Deyn Studio desktop app so it can receive your sign-in securely.
          </p>
          <a href="/download" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#171716] px-5 text-[14px] font-semibold text-[#f2f0ef] no-underline transition-colors hover:bg-[#343332]">
            Get Deyn Studio for desktop
          </a>
        </div>
      </AuthLayout>
    )
  }

  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated) {
    const returnUrl = new URL('/desktop-auth', 'https://cutly.invalid')
    returnUrl.searchParams.set('redirect_uri', callback.toString())
    returnUrl.searchParams.set('state', state)
    returnUrl.searchParams.set('continue', '1')
    const returnTo = normalizeInternalReturnPath(`${returnUrl.pathname}${returnUrl.search}`)
    return (
      <AuthLayout>
        <AuthForm mode="sign-in" returnTo={returnTo} oidcPrompt="select_account" />
      </AuthLayout>
    )
  }

  if (params?.continue !== '1') {
    const user = await currentUser()
    return (
      <AuthLayout>
        <DesktopAuthChoice email={user?.primaryEmailAddress?.emailAddress || null} />
      </AuthLayout>
    )
  }

  callback.searchParams.set('token', createDesktopAuthGrant(userId))
  callback.searchParams.set('state', state)
  redirect(callback.toString())
}
