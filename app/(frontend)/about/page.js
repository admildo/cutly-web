import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'About', description: 'Learn about Cutly, the desktop app for turning long-form media into short clips.', path: '/about' })

export default function AboutPage() {
  return <InfoPage eyebrow="ABOUT CUTLY" title="Make the best moments easier to find." intro="Cutly is a desktop app for turning long-form media into short, shareable clips with local editing tools and optional AI-assisted discovery.">
    <Section title="What Cutly does"><p>Import a local file or download a supported public video, find the moments worth sharing, refine the result, and export a clip with captions and social-ready framing.</p></Section>
    <Section title="Built for responsible use"><p>Cutly is designed for media you own or are authorised to use. It does not bypass DRM, sign-in requirements, or other access controls. You are responsible for the content you process and where you publish it.</p></Section>
    <Section title="How it works"><p>Core media work happens in the desktop app. Depending on the tools you choose, Cutly may use your configured AI or transcription provider to analyse audio and suggest clip moments. Review the Privacy Policy for details about account and product data.</p></Section>
  </InfoPage>
}
