import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getLicenseStatus } from '@/lib/license'
import { AppAccess } from '@/app/components/AppAccess'
import { BuyLicenseButton } from '@/app/components/BuyLicenseButton'
import { FloatingNav } from '@/app/components/FloatingNav'
import { HeroSection } from '@/app/components/HeroSection'
import { ProductStory } from '@/app/components/ProductStory'
import { FeatureBento } from '@/app/components/FeatureBento'
import { BuiltForWork } from '@/app/components/BuiltForWork'
import { SiteFooter, SiteHeader } from '@/app/components/SiteChrome'
import { RefreshLicenseStatusButton } from '@/app/components/RefreshLicenseStatusButton'
import { AccountMenu } from '@/app/components/AccountMenu'
import { createPageMetadata, serializeJsonLd, siteOrigin } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Turn Long Videos Into Shareable Clips',
  description: 'Cutly is a desktop video clip editor that helps creators find moments, add captions, reframe, and export short clips from long videos.',
  path: '/',
  image: { url: '/cutly-hero-moon.png', width: 1672, height: 941, alt: 'Cutly desktop video clip editor' }
})

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

function MarketingPage({ downloadUrl }) {
  const ctaUrl = downloadUrl || '/download'

  return (
    <main className="min-h-screen overflow-x-clip bg-[#08090c] text-[#f1f3fa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Cutly',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'macOS, Windows, Linux',
            description: 'A desktop video clip editor for finding moments, adding captions, reframing, and exporting short clips from long videos.',
            url: siteOrigin
          })
        }}
      />
      <FloatingNav downloadUrl={ctaUrl} />
      <HeroSection downloadUrl={ctaUrl} />

      <ProductStory />

      <FeatureBento />

      <BuiltForWork />

      <section className="mx-auto mb-[130px] w-[min(1000px,calc(100%_-_48px))] border-t border-[#252a36] px-6 py-[100px] max-[600px]:mb-[90px] max-[600px]:w-[calc(100%_-_24px)] max-[600px]:px-0 max-[600px]:py-[70px]" id="pricing">
        <div className="mx-auto mb-12 max-w-[700px] text-center max-[600px]:mb-9">
          <span className="text-sm text-[#aab7d7]">Pricing</span>
          <h2 className="mt-4 text-[clamp(54px,6vw,72px)] font-medium leading-[.96] tracking-[-.065em] text-[#f0f2f8] max-[600px]:text-[48px]">Pay once.<br />Keep creating.</h2>
          <p className="mx-auto mb-0 mt-5 max-w-[480px] text-[15px] leading-[1.7] text-[#9398a4]">A lifetime Cutly license for your account, with future desktop updates included.</p>
        </div>
        <div className="relative mx-auto max-w-[760px] max-[600px]:max-w-none">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-8 rounded-[42px] bg-[radial-gradient(ellipse_at_50%_38%,rgb(157_139_103/.14),transparent_72%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-[#494947] bg-[linear-gradient(145deg,#2b2b2a,#20201f_55%,#171716)] p-10 shadow-[0_32px_90px_rgb(0_0_0/.48)] backdrop-blur-2xl max-[600px]:rounded-[20px] max-[600px]:p-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex rounded-full border border-[#a48c5e]/35 bg-[#a48c5e]/[0.12] px-3.5 py-1.5 text-[12px] font-semibold text-[#e5d2a8]">Early bird</span>
              <span className="inline-flex rounded-full border border-[#8e9b7a]/35 bg-[#8e9b7a]/[0.12] px-3.5 py-1.5 text-[12px] font-semibold text-[#d5dfc1]">Save $40 · 58% off</span>
            </div>
            <h2 className="mb-0 mt-6 text-[30px] font-semibold leading-[1.12] tracking-[-.045em] text-[#f1f1f4] max-[600px]:mt-5 max-[600px]:text-[25px]">Make more of every recording</h2>
            <p className="mb-0 mt-3 max-w-[590px] text-[17px] leading-[1.55] text-[#c1c3cc] max-[600px]:text-[15px]">Own Cutly outright at the reduced early-bird price.</p>
            <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-1 text-[#f4f2ed]">
              <span className="text-[68px] font-medium leading-none tracking-[-.07em] max-[600px]:text-[58px]">$29</span>
              <span className="mb-2 inline-flex items-baseline gap-2 text-[12px] text-[#a8a7a1]">
                <span>Was</span>
                <s className="text-[21px] decoration-[#9a9992] decoration-1">$69</s>
              </span>
            </div>
            <p className="mb-0 mt-2 text-[13px] font-medium tracking-[.01em] text-[#b8b6ae]">One-time payment · Lifetime license</p>
            <div className="my-7 h-px bg-white/[0.12]" />
            <ul className="mb-0 mt-0 grid list-none gap-4 p-0 text-[16px] text-[#ececf0] max-[600px]:gap-3.5 max-[600px]:text-[14px]">
              {['Moment suggestions and clip editing', 'Local Whisper transcription', 'Captions and social formats', 'Use on up to two devices', 'Future desktop updates included'].map((benefit) => <li className="flex items-center gap-3" key={benefit}><span className="text-[16px] text-[#c6c9d2]" aria-hidden="true">✓</span>{benefit}</li>)}
            </ul>
            <p className="mb-0 mt-6 max-w-[590px] text-[15px] leading-[1.6] text-[#c1c3cc] max-[600px]:text-[13px]">Use bundled Whisper locally, or choose OpenRouter when a cloud transcription workflow suits you.</p>
            <Link href="/sign-up" className="mt-7 inline-flex min-h-[58px] w-full items-center justify-center rounded-[13px] bg-[#f2f2ee] text-[16px] font-semibold text-[#17171a] no-underline transition-colors hover:bg-white">Get the early-bird license</Link>
            <small className="mt-4 block text-center text-[13px] text-[#a9a79f]">Yours to keep. Future updates included.</small>
            <div className="mt-3 text-center text-[12px] text-[#a9acb7]">Already have Cutly? <Link href="/sign-in" className="text-[#c5cbe0] underline underline-offset-4">Log in</Link></div>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-[104px] w-[min(688px,calc(100%_-_48px))] pt-[48px] max-[600px]:mb-[72px] max-[600px]:w-[calc(100%_-_24px)] max-[600px]:pt-6" id="faq">
        <div className="mx-auto max-w-[544px] text-center">
          <h2 className="m-0 text-[clamp(34px,4.32vw,51px)] font-medium leading-[1.02] tracking-[-.06em] text-[#f0f2f8] max-[600px]:text-[34px]">Frequently asked questions</h2>
          <p className="mx-auto mb-0 mt-4 max-w-[416px] text-[13px] leading-[1.6] text-[#9398a4]">Quick answers about Cutly, transcription, licensing, and getting started.</p>
        </div>
        <div className="mt-[43px] grid gap-2 max-[600px]:mt-[29px]">
          {[
            ['What does Cutly do?', 'Cutly turns longer videos into shorter clips. It helps you transcribe, find moments, caption, reframe, and export.'],
            ['Can Cutly transcribe locally?', 'Yes. Cutly bundles Whisper for local transcription and also supports OpenRouter as a cloud option.'],
            ['Which computers can run Cutly?', 'Cutly supports macOS, Windows, and Linux.'],
            ['Where are exports saved?', 'Exported clips are currently saved in your Documents folder.']
          ].map(([question, answer]) => (
            <details className="group  px-[19px] transition-colors duration-200  max-[600px]:px-[13px]" key={question}>
              <summary className="flex min-h-[53px] cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-medium text-[#e4e6ed] marker:hidden [&::-webkit-details-marker]:hidden max-[600px]:min-h-[48px] max-[600px]:text-[12px]">
                {question}
                <svg className="h-[14px] w-[14px] shrink-0 text-[white] transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </summary>
              <p className="mb-0 max-w-[560px] pb-4 pr-8 text-[12px] leading-[1.7] text-[#9298a5]">{answer}</p>
            </details>
          ))}
        </div>
        <p className="mb-0 mt-[22px] text-center text-[12px] text-[#858d9d]">Need more help? <Link className="text-[#a9c4ff] underline-offset-4 hover:underline" href="/support">Contact support.</Link></p>
      </section>

      <section className="relative mx-auto flex min-h-[520px] w-[min(1260px,calc(100%_-_48px))] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-[#2b3140] bg-[linear-gradient(rgb(3_5_9/.48),rgb(3_5_9/.48)),url('/cutly-hero-moon.png')] bg-cover bg-[position:center_35%] text-center text-white shadow-[0_40px_100px_rgb(0_0_0/.3)] max-[600px]:min-h-[420px] max-[600px]:rounded-[18px]"><h2 className="relative z-10 m-0 text-[clamp(60px,8vw,104px)] font-medium leading-[.94] tracking-[-.07em] max-[600px]:text-[54px]">Make more of<br />every recording.</h2><a className="relative z-10 mt-[30px] rounded-[10px] border border-white/15 bg-[#f2f2ee] px-[21px] py-4 text-sm font-semibold text-[#0b0b0d]" href={ctaUrl}>Try Cutly for desktop</a></section>
      <div className="mx-auto w-[min(1120px,calc(100%_-_48px))] text-[#687083] [&_footer]:mt-[55px] [&_footer]:border-[#252a36] [&_footer_a]:text-[#8c93a2]"><SiteFooter /></div>
    </main>
  )
}

function LicensePanel({ license, licenseError, checkoutState }) {
  if (licenseError) {
    return (
      <div className="mt-10 rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
        <p className="font-medium">We couldn’t check your license.</p>
        <p className="mt-2 text-sm leading-6 text-[#a6a4a4]">Your account is signed in. Please try again; we won’t ask you to buy while the status is unavailable.</p>
      </div>
    )
  }

  if (license?.licensed) {
    return (
      <div className="mt-10 overflow-hidden rounded-2xl border border-[#807e7e]/50 bg-[#242322]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#807e7e]/40 p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-[#a6a4a4]">Your plan</p>
            <h2 className="mt-1 text-2xl font-medium tracking-[-0.03em]">{license.plan || 'Cutly license'}</h2>
          </div>
          <span className="rounded-full bg-[#cccbca] px-3 py-1.5 text-xs font-semibold text-[#171716]">Active</span>
        </div>
        <dl className="grid divide-y divide-[#807e7e]/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#a6a4a4]">Devices in use</dt><dd className="mt-2 text-lg font-medium">{license.devicesUsed} of {license.deviceLimit}</dd></div>
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#a6a4a4]">License type</dt><dd className="mt-2 text-lg font-medium capitalize">{license.type || '—'}</dd></div>
          <div className="p-6 sm:p-8"><dt className="text-sm text-[#a6a4a4]">Access</dt><dd className="mt-2 text-lg font-medium">{license.type === 'lifetime' ? 'Lifetime' : displayDate(license.expiresAt)}</dd></div>
        </dl>
      </div>
    )
  }

  if (checkoutState === 'success') {
    return (
      <div className="mt-10 rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
        <p className="font-medium">Payment received. Your license is being activated.</p>
        <p className="mt-2 text-sm leading-6 text-[#a6a4a4]">It can take a short moment for the payment confirmation to reach your account.</p>
        <div className="mt-5"><RefreshLicenseStatusButton /></div>
      </div>
    )
  }

  if (license?.status && license.status !== 'none') {
    const state = license.status === 'expired' ? 'Expired' : license.status === 'refunded' ? 'Refunded' : 'Inactive'
    return (
      <div className="mt-10 rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
        <p className="text-sm font-medium text-[#a6a4a4]">License {state.toLowerCase()}</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Your previous license is {state.toLowerCase()}.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#a6a4a4]">{license.message || 'Contact Cutly support if you think this status is incorrect.'}</p>
        <Link href="/support" className="mt-5 inline-flex rounded-full border border-[#807e7e] px-5 py-3 text-sm font-medium text-[#cccbca] transition hover:border-[#cccbca] hover:text-[#f2f0ef]">Contact support</Link>
      </div>
    )
  }

  return (
    <div className="mt-10 rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
      <p className="text-sm font-medium text-[#a6a4a4]">No license yet</p>
      <h2 className="mt-2 max-w-lg text-2xl font-medium tracking-[-0.03em]">Get Cutly on your account.</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#a6a4a4]">A one-time license includes future desktop updates and use on up to two devices.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <BuyLicenseButton />
        <Link href="/support" className="rounded-full border border-[#807e7e] px-5 py-3 text-sm font-medium text-[#cccbca] transition hover:border-[#cccbca] hover:text-[#f2f0ef]">Contact support</Link>
      </div>
      {checkoutState === 'cancelled' ? <p className="mt-4 text-sm text-[#a6a4a4]">Checkout was canceled. You haven’t been charged.</p> : null}
    </div>
  )
}

function AccountDashboard({ user, license, licenseError, checkoutState, downloadUrl }) {
  return (
    <main className="min-h-screen [color-scheme:dark] bg-[#171716] px-5 py-6 text-[#f2f0ef] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <SiteHeader dashboard><div className="flex items-center gap-3"><span className="hidden text-sm text-[#a6a4a4] sm:block">{user?.primaryEmailAddress?.emailAddress}</span><AccountMenu /></div></SiteHeader>
        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#a6a4a4]">ACCOUNT & LICENSING</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6"><div><h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Your license</h1><p className="mt-3 text-base text-[#a6a4a4]">A clear view of what is active on your Cutly account.</p></div><p className="text-sm text-[#807e7e]">{user?.firstName ? `Welcome back, ${user.firstName}.` : 'Cutly account'}</p></div>
          <LicensePanel license={license} licenseError={licenseError} checkoutState={checkoutState} />
          <div className="mt-10"><AppAccess downloadUrl={downloadUrl} licensed={Boolean(license?.licensed)} /></div>
        </section>
        <SiteFooter dark />
      </div>
    </main>
  )
}

export default async function Home({ searchParams }) {
  const { userId } = await auth()
  const { checkout: checkoutState } = searchParams ? await searchParams : {}
  const downloadUrl = safeExternalUrl(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL)
  if (!userId) return <MarketingPage downloadUrl={downloadUrl} />

  const user = await currentUser()
  let license = null
  let licenseError = false
  try {
    license = await getLicenseStatus(userId)
  } catch (error) {
    console.error('Could not load the dashboard license status:', error)
    licenseError = true
  }
  return <AccountDashboard user={user} license={license} licenseError={licenseError} checkoutState={checkoutState} downloadUrl={downloadUrl} />
}
