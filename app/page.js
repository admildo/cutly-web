import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { getLicenseStatus } from '@/lib/license'

const safeExternalUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

const displayDate = (value) => {
  if (!value) return 'No expiry'
  const date = new Date(value)
  return Number.isNaN(date.valueOf())
    ? 'No expiry'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default async function Home() {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null
  let license = null
  let licenseError = false

  if (userId) {
    try {
      license = await getLicenseStatus(userId)
    } catch {
      licenseError = true
    }
  }

  const checkoutUrl = safeExternalUrl(process.env.NEXT_PUBLIC_LICENSE_PURCHASE_URL)
  const supportUrl = safeExternalUrl(process.env.NEXT_PUBLIC_SUPPORT_URL)

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-6 text-[#171717] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <Link href="/" className="text-sm font-semibold tracking-[0.22em]">CUTLY</Link>
          {userId ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-black/55 sm:block">{user?.primaryEmailAddress?.emailAddress}</span>
              <UserButton />
            </div>
          ) : null}
        </header>

        {!userId ? (
          <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-xl flex-col justify-center py-16">
            <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-black/45">ACCOUNT & LICENSING</p>
            <h1 className="max-w-md text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Your Cutly account, in one place.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-black/60">Sign in to view your current license, manage your account, or add a new license.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignInButton forceRedirectUrl="/">
                <button className="rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black">Sign in</button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/">
                <button className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium transition hover:border-black/35">Create account</button>
              </SignUpButton>
            </div>
          </section>
        ) : (
          <section className="py-12 sm:py-16">
            <p className="text-xs font-semibold tracking-[0.16em] text-black/45">ACCOUNT & LICENSING</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Your license</h1>
                <p className="mt-3 text-base text-black/60">A clear view of what is active on your Cutly account.</p>
              </div>
              <p className="text-sm text-black/45">{user?.firstName ? `Welcome back, ${user.firstName}.` : 'Cutly account'}</p>
            </div>

            {licenseError ? (
              <div className="mt-10 rounded-2xl border border-amber-600/25 bg-amber-50 p-6">
                <p className="font-medium">Your license could not be checked right now.</p>
                <p className="mt-2 text-sm leading-6 text-black/60">Your account is still signed in. Please try again in a moment.</p>
              </div>
            ) : license?.licensed ? (
              <div className="mt-10 overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 p-6 sm:p-8">
                  <div>
                    <p className="text-sm font-medium text-black/55">Current plan</p>
                    <h2 className="mt-1 text-2xl font-medium tracking-[-0.03em]">{license.plan || 'Cutly license'}</h2>
                  </div>
                  <span className="rounded-full bg-[#eaf7ee] px-3 py-1.5 text-xs font-semibold text-[#15733a]">Active</span>
                </div>
                <dl className="grid divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="p-6 sm:p-8"><dt className="text-sm text-black/50">Devices in use</dt><dd className="mt-2 text-lg font-medium">{license.devicesUsed} of {license.deviceLimit}</dd></div>
                  <div className="p-6 sm:p-8"><dt className="text-sm text-black/50">License type</dt><dd className="mt-2 text-lg font-medium capitalize">{license.type || '—'}</dd></div>
                  <div className="p-6 sm:p-8"><dt className="text-sm text-black/50">Renews / expires</dt><dd className="mt-2 text-lg font-medium">{displayDate(license.expiresAt)}</dd></div>
                </dl>
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
                <p className="text-sm font-medium text-black/55">No active license</p>
                <h2 className="mt-2 max-w-lg text-2xl font-medium tracking-[-0.03em]">Add a Cutly license to start creating.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">A license is linked to this account and includes up to two active devices.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {checkoutUrl ? <a href={checkoutUrl} className="rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black">Add a license</a> : null}
                  {supportUrl ? <a href={supportUrl} className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium transition hover:border-black/35">Contact Cutly</a> : null}
                  {!checkoutUrl && !supportUrl ? <p className="text-sm text-black/50">License checkout will be available here soon.</p> : null}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
