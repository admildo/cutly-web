import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { DynamicIslandNav } from '@/app/components/DynamicIslandNav'
import { HeroSpiral } from '@/app/components/HeroSpiral'
import { ProductStory } from '@/app/components/ProductStory'
import { MediaAssistantTools } from '@/app/components/MediaAssistantTools'
import { SpotAssistant } from '@/app/components/SpotAssistant'
import { WhyUs } from '@/app/components/WhyUs'
import { SiteFooter } from '@/app/components/SiteChrome'
import { FAQSection } from '@/app/components/FAQSection'
import { PricingCard } from '@/app/components/PricingCard'
import { createPageMetadata, defaultSocialImage, serializeJsonLd, siteOrigin } from '@/lib/seo'
import { LIFETIME_LICENSE_PRICE_EUR, LIFETIME_LICENSE_PRICE_LABEL } from '@/lib/pricing'
import { getDownloadUrls } from '@/lib/downloads'

export const metadata = createPageMetadata({
  title: 'AI Video Clip Maker for Desktop',
  description: `Turn long videos into clips with Deyn Studio. Find the best moments, add captions, reframe, and export from one desktop app. ${LIFETIME_LICENSE_PRICE_LABEL} once, no subscription.`,
  path: '/',
  absoluteTitle: true
})

function MarketingPage({ downloadUrls, isSignedIn }) {

  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-[#08090c] text-[#f1f3fa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            '@id': `${siteOrigin}/#software`,
            name: 'Deyn Studio',
            url: siteOrigin,
            image: new URL(defaultSocialImage.url, siteOrigin).toString(),
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'macOS',
            description: 'A desktop app for finding moments in long videos, editing captions and framing, and exporting shareable clips.',
            creator: { '@id': `${siteOrigin}/#organization` },
            offers: {
              '@type': 'Offer',
              price: LIFETIME_LICENSE_PRICE_EUR.toFixed(2),
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url: new URL('/sign-up', siteOrigin).toString()
            }
          })
        }}
      />
      <DynamicIslandNav downloadUrls={downloadUrls} isSignedIn={isSignedIn} />
      <HeroSpiral downloadUrls={downloadUrls} />

      <ProductStory />

      <MediaAssistantTools />

      {/* DECISION: placed after Media Assistant so the in-app tool comes first and Spot Assistant reads as "the same power, anywhere on your Mac". Move above it if you want Spot Assistant to lead. */}
      <SpotAssistant />

      <WhyUs />



      <section className="mx-auto scroll-mt-[24px] w-[min(900px,calc(100%_-_48px))] px-6 section-pad max-[600px]:w-[calc(100%_-_40px)] max-[600px]:px-0" id="pricing">
        <div className="mx-auto section-title-gap max-w-[700px] text-center">
          <span className="text-[12px] font-medium uppercase tracking-[.2em] text-[#aab7d7]">Pricing</span>
          <h2 className="mt-4 section-title text-[#f0f2f8]">A lifetime license.<br />One payment.</h2>
          <p className="mx-auto mb-0 mt-5 max-w-[520px] text-[15px] leading-[1.7] text-[#9398a4]">Use Deyn Studio on up to two devices. Future desktop updates are included.</p>
        </div>
        <div className="relative mx-auto max-w-[560px] max-[600px]:max-w-none">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-[38px] bg-[radial-gradient(ellipse_at_50%_38%,rgb(157_139_103/.13),transparent_72%)] blur-2xl" />
          <PricingCard>
            {/* DECISION: "Launch price" with a crossed-out €69 and no end date can read as invented urgency. Either say when
                it ends, or drop the strikethrough and keep "58% off". Left as it was. */}
            <span className="inline-flex rounded-full bg-[#a48c5e]/[0.14] px-3.5 py-1.5 text-[12px] font-semibold text-[#e5d2a8]">Launch price</span>
            <p className="mb-0 mt-5 text-[12px] font-semibold uppercase tracking-[.13em] text-[#b8b6ae]">Lifetime license</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3 text-[#f4f2ed]">
              <span className="text-[58px] font-medium leading-none tracking-[-.07em] max-[600px]:text-[52px]">{LIFETIME_LICENSE_PRICE_LABEL}</span>
              <s aria-label="Regular price €69" className="text-[24px] font-medium leading-none tracking-[-.04em] text-[#b0a0a1] decoration-white decoration-[0.5px] max-[600px]:text-[21px]">€69</s>
              <span className="rounded-full bg-[#8e9b7a]/[0.14] px-2.5 py-1 text-[12px] font-semibold tracking-[.01em] text-[#c9d5b8]">58% off</span>
            </div>
            <p className="mx-auto mb-0 mt-3 max-w-[400px] text-balance text-[14px] leading-[1.6] text-[#c1c3cc]">Find moments, edit captions, and export from one desktop app.</p>
            <ul className="mx-auto mb-0 mt-6 grid w-fit list-none gap-3 p-0 text-left text-[14px] text-[#ececf0] max-[600px]:gap-2.5 max-[600px]:text-[13px]">
              {['Find and edit clips from long videos', 'Caption and reframe each clip', 'Spot Assistant: download, compress, convert and caption from any app', 'Transcribe on your device', 'Future desktop updates included'].map((benefit) => <li className="flex items-center gap-3" key={benefit}><span className="text-[15px] text-[#c6c9d2]" aria-hidden="true">✓</span>{benefit}</li>)}
            </ul>
            {/* DECISION: the "limited AI trial" disclosure moved out of this card into the FAQ ("What does the AI trial include?"). Put it back here if you want it next to the buy button. */}
            <p className="mx-auto mb-0 mt-5 max-w-[440px] text-[12px] leading-[1.6] text-[#aaa9a3]">No subscription. Pay for AI only when you use it, with your own OpenRouter key. Local transcription is always free.</p>
            <Link href={isSignedIn ? '/dashboard?buy=1' : `/sign-up?returnTo=${encodeURIComponent('/dashboard?buy=1')}`} className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-[#f2f2ee] text-[15px] font-semibold text-[#17171a] no-underline transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c4ff]">Get Deyn Studio · {LIFETIME_LICENSE_PRICE_LABEL}</Link>
            <small className="mt-3 block text-center text-[12px] text-[#a9a79f]">Available for macOS. Windows and Linux are coming soon.</small>
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
  const downloadUrls = await getDownloadUrls()

  return <MarketingPage downloadUrls={downloadUrls} isSignedIn={Boolean(userId)} />
}
