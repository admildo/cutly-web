import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Acceptable Use', description: 'Rules for using Deyn Studio responsibly.', path: '/acceptable-use' })

export default function AcceptableUsePage() {
  return <InfoPage eyebrow="LEGAL · EFFECTIVE SEPTEMBER 22, 2026" title="Acceptable Use" intro="Deyn Studio helps you make clips from media. Please use it in a way that respects people, platforms, and rights holders.">
    <Section title="What you may do"><p>Use Deyn Studio with content you own, have permission to use, or may lawfully use under an applicable exception. Follow the terms of the source platform, the terms of any AI or transcription provider you connect, and all applicable laws.</p></Section>
    <Section title="What you may not do"><ul><li>Download, copy, process, or publish content without the rights or permissions required to do so.</li><li>Bypass DRM, paywalls, sign-in gates, geo-restrictions, platform controls, or other access restrictions.</li><li>Use Deyn Studio to infringe copyright, privacy, publicity, or other rights; impersonate another person; or create unlawful, harmful, or deceptive content.</li><li>Interfere with the service, probe for vulnerabilities, automate abusive requests, or attempt to access another person’s account or license.</li><li>Use Deyn Studio in any way that violates applicable law or a third party’s terms.</li></ul></Section>
    <Section title="Enforcement"><p>We may investigate suspected misuse and may suspend or terminate access where reasonably necessary. We may cooperate with lawful requests and rights-holder notices as required by law.</p></Section>
  </InfoPage>
}
