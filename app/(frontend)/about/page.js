import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'About', description: 'Learn how Deyn Studio turns long videos into clips you can review, caption, frame, and export on your desktop.', path: '/about' })

export default function AboutPage() {
  return <InfoPage eyebrow="ABOUT DEYN STUDIO" title="Make more from every recording." intro="Deyn Studio turns long videos into clips you can review, caption, frame, and export on your desktop.">
    <Section title="Find moments and finish clips"><p>Import a video or paste a supported public link. Ask AI to find strong moments, choose the clips you want, then edit captions and framing before you export.</p></Section>
    <Section title="Tools for the rest of the job"><p>Deyn Studio also includes tools for transcription, audio cleanup, background removal, video conversion, and document tasks.</p></Section>
    <Section title="Your media and privacy"><p>Whisper transcription and background removal run on your device. Cloud AI and transcription send the data needed for that task to OpenRouter. See the <a href="/privacy">Privacy Policy</a> for details.</p></Section>
    <Section title="Use media responsibly"><p>Use Deyn Studio with media you own or have permission to use. It does not bypass DRM, sign-in requirements, or other access controls. You are responsible for the content you process and where you publish it.</p></Section>
  </InfoPage>
}
