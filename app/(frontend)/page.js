import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { DynamicIslandNav } from '@/app/components/DynamicIslandNav'
import { HeroSpiral } from '@/app/components/HeroSpiral'
import { ProductStory } from '@/app/components/ProductStory'
import { MediaAssistantTools } from '@/app/components/MediaAssistantTools'
import { WhyUs } from '@/app/components/WhyUs'
import { SiteFooter } from '@/app/components/SiteChrome'
import { FAQSection } from '@/app/components/FAQSection'
import { PricingCard } from '@/app/components/PricingCard'
import { createPageMetadata, serializeJsonLd, siteOrigin } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Turn Long Videos Into Shareable Clips',
  description: 'Find the best moments in a long video, add captions and portrait framing, and export clips from one desktop app.',
  path: '/',
  image: { url: '/cutly-hero-moon.png', width: 1672, height: 941, alt: 'Deyn Studio desktop app showing a video clip workflow' }
})

const safeExternalUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function MarketingPage({ downloadUrl, isSignedIn }) {
  const ctaUrl = downloadUrl || '/download'

  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-[#08090c] text-[#f1f3fa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Deyn Studio',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'macOS, Windows, Linux',
            description: 'A desktop app for finding moments in long videos, editing captions and framing, and exporting shareable clips.',
            url: siteOrigin
          })
        }}
      />
      <DynamicIslandNav downloadUrl={ctaUrl} isSignedIn={isSignedIn} />
      <HeroSpiral downloadUrl={ctaUrl} />

      <ProductStory />

      <MediaAssistantTools />

      <WhyUs />



      <section className="mx-auto scroll-mt-[24px] w-[min(900px,calc(100%_-_48px))] px-6 py-[clamp(76px,7vw,96px)] max-[700px]:py-[clamp(60px,9vw,72px)] max-[600px]:w-[calc(100%_-_24px)] max-[600px]:px-0" id="pricing">
        <div className="mx-auto mb-10 max-w-[700px] text-center max-[600px]:mb-8">
          <span className="text-sm text-[#aab7d7]">Pricing</span>
          <h2 className="mt-4 text-[clamp(54px,6vw,72px)] font-medium leading-[.96] tracking-[-.065em] text-[#f0f2f8] max-[600px]:text-[48px]">A lifetime license.<br />One payment.</h2>
          <p className="mx-auto mb-0 mt-5 max-w-[520px] text-[15px] leading-[1.7] text-[#9398a4]">Use Deyn Studio on up to two devices. Future desktop updates are included.</p>
        </div>
        <div className="relative mx-auto max-w-[560px] max-[600px]:max-w-none">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-[38px] bg-[radial-gradient(ellipse_at_50%_38%,rgb(157_139_103/.13),transparent_72%)] blur-2xl" />
          <PricingCard>
            <span className="inline-flex rounded-full bg-[#a48c5e]/[0.14] px-3.5 py-1.5 text-[12px] font-semibold text-[#e5d2a8]">Launch price</span>
            <p className="mb-0 mt-5 text-[12px] font-semibold uppercase tracking-[.13em] text-[#b8b6ae]">Lifetime license</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3 text-[#f4f2ed]">
              <span className="text-[58px] font-medium leading-none tracking-[-.07em] max-[600px]:text-[52px]">€39</span>
              <s aria-label="Regular price €69" className="text-[24px] font-medium leading-none tracking-[-.04em] text-[#b0a0a1] decoration-white decoration-[0.5px] max-[600px]:text-[21px]">€69</s>
              <span className="rounded-full bg-[#8e9b7a]/[0.14] px-2.5 py-1 text-[11px] font-semibold tracking-[.01em] text-[#c9d5b8]">43% off</span>
            </div>
            <p className="mx-auto mb-0 mt-3 max-w-[400px] text-[14px] leading-[1.6] text-[#c1c3cc]">Find moments, edit captions, and export from one desktop app.</p>
            <ul className="mx-auto mb-0 mt-6 grid w-fit list-none gap-3 p-0 text-left text-[14px] text-[#ececf0] max-[600px]:gap-2.5 max-[600px]:text-[13px]">
              {['Find and edit clips from long videos', 'Caption and reframe each clip', 'Transcribe on your device', 'Future desktop updates included'].map((benefit) => <li className="flex items-center gap-3" key={benefit}><span className="text-[15px] text-[#c6c9d2]" aria-hidden="true">✓</span>{benefit}</li>)}
            </ul>
            <p className="mx-auto mb-0 mt-5 max-w-[440px] text-[12px] leading-[1.6] text-[#aaa9a3]">Eligible accounts get a limited AI trial. After it ends, add an OpenRouter API key and choose a model. OpenRouter bills that usage; local transcription has no per-use fee.</p>
            <Link href="/sign-up" className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-[#f2f2ee] text-[15px] font-semibold text-[#17171a] no-underline transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c4ff]">Get lifetime access</Link>
            <small className="mt-3 block text-center text-[12px] text-[#a9a79f]">For macOS, Windows, and Linux.</small>
            <div className="mt-2.5 text-center text-[12px] text-[#a9acb7]">{isSignedIn ? 'Manage your Deyn Studio account:' : 'Already have Deyn Studio?'} <Link href={isSignedIn ? '/dashboard' : '/sign-in'} className="rounded-sm text-[#c5cbe0] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9c4ff]">{isSignedIn ? 'Dashboard' : 'Log in'}</Link></div>
          </PricingCard>
        </div>
      </section>

      <FAQSection />


      <div className="mx-auto w-[min(1120px,calc(100%_-_48px))] text-[#858d9d] [&_footer]:mt-[55px] [&_footer_a]:text-[#8c93a2] [&_footer_a]:transition-colors [&_footer_a]:hover:text-[#f1f3fa] [&_footer_a]:focus-visible:rounded-sm [&_footer_a]:focus-visible:outline [&_footer_a]:focus-visible:outline-2 [&_footer_a]:focus-visible:outline-offset-2 [&_footer_a]:focus-visible:outline-[#a9c4ff]"><SiteFooter dark /></div>
    </main>
  )
}

export default async function Home() {
  const { userId } = await auth()
  const downloadUrl = safeExternalUrl(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL)

  return <MarketingPage downloadUrl={downloadUrl} isSignedIn={Boolean(userId)} />
}
