import { auth } from '@clerk/nextjs/server'
import { SignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
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
  const { redirect_uri: redirectUri, state } = await searchParams
  const callback = getCallback(redirectUri, state)

  if (!callback) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center text-white">
        <section className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-semibold">Open Cutly to sign in</h1>
          <p className="mt-3 text-sm text-neutral-300">
            Start sign-in from the Cutly desktop app so it can securely receive the result.
          </p>
        </section>
      </main>
    )
  }

  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated) {
    const returnUrl = new URL('/desktop-auth', 'http://localhost')
    returnUrl.searchParams.set('redirect_uri', callback.toString())
    returnUrl.searchParams.set('state', state)
    return <SignIn forceRedirectUrl={`${returnUrl.pathname}${returnUrl.search}`} routing="hash" />
  }

  callback.searchParams.set('token', createDesktopAuthGrant(userId))
  callback.searchParams.set('state', state)
  redirect(callback.toString())
}
