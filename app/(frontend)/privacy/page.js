import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Privacy Policy', description: 'How Cutly handles account, license, and desktop-app data.', path: '/privacy' })

export default function PrivacyPage() {
  return <InfoPage eyebrow="LEGAL · EFFECTIVE SEPTEMBER 22, 2026" title="Privacy Policy" intro="This policy explains how Cutly handles information when you use the Cutly website, account portal, and desktop app.">
    <Section title="Information we process"><p>For accounts and licensing, Cutly processes your account identifier, email address, name when provided, license status, and limited device information such as a hashed device identifier, platform, app version, and device activity timestamps. The website uses Clerk for authentication. Licensing, short-lived sign-in, desktop-session, and rate-limit records are stored in Cutly’s Turso database.</p><p>The desktop app stores its settings, project history, and processed files locally on your device. Credentials configured in the desktop app are stored in your operating system’s credential store.</p></Section>
    <Section title="Media and AI services"><p>Cutly can process media locally. When you choose features that use an external provider, such as transcription or AI clip discovery, relevant audio, transcripts, prompts, and service credentials may be sent to the provider you configure so it can perform that feature. Those providers process data under their own terms and privacy policies. Do not submit content you are not permitted to share with them.</p></Section>
    <Section title="Why we use information"><p>We use account and device information to authenticate you, provide and enforce licenses, prevent abuse, secure the service, respond to support requests, and meet legal obligations. We do not sell personal information.</p></Section>
    <Section title="Retention and deletion"><p>Account and license records are retained while needed to operate the service, comply with legal obligations, resolve disputes, and enforce agreements. Desktop-session tokens expire after a limited period and can be revoked when you sign out. Locally stored files and project history remain under your control until you delete them. You may request account-data access or deletion through Cutly support; some information may need to be retained where law permits or requires it.</p></Section>
    <Section title="Security"><p>We use reasonable administrative and technical measures to protect information, including signed, short-lived desktop authentication grants and operating-system credential storage in the desktop app. No system can guarantee absolute security.</p></Section>
    <Section title="Your choices and contact"><p>You can manage your account through the account portal and sign out of the desktop app. For privacy requests or questions, contact Cutly support. If you use a third-party AI, transcription, or payment service through Cutly, contact that provider for data it controls.</p></Section>
    <Section title="Changes"><p>We may update this policy as Cutly evolves. We will post the current version here and update the effective date. Continued use after an update means you accept the revised policy to the extent permitted by law.</p></Section>
  </InfoPage>
}
