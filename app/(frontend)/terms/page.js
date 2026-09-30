import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Terms of Service', description: 'Terms for using Cutly and its account portal.', path: '/terms' })

export default function TermsPage() {
  return <InfoPage eyebrow="LEGAL · EFFECTIVE SEPTEMBER 22, 2026" title="Terms of Service" intro="These terms govern your use of Cutly’s website, account portal, and desktop app.">
    <Section title="Using Cutly"><p>You may use Cutly only in compliance with these terms, applicable law, and the rights of content owners. You must be old enough to form a binding agreement where you live. Keep your account credentials secure and promptly tell us about suspected unauthorised use.</p></Section>
    <Section title="Content and rights"><p>You retain ownership of content you provide to Cutly. You grant Cutly only the limited permissions necessary to operate the services you choose. You represent that you have all rights, permissions, and consents needed to download, process, edit, and publish your content. Cutly does not grant rights to third-party videos, music, images, performances, or trademarks.</p></Section>
    <Section title="Licenses and payments"><p>A Cutly license is personal to the account that purchased it and may be used only within its stated device limit. Licenses are not transferable unless Cutly agrees in writing. Fees, renewal terms, refunds, and taxes are shown at checkout or in the applicable order terms. We may suspend or revoke access for fraud, chargebacks, material breach, or misuse.</p></Section>
    <Section title="Free trial"><p>Eligible accounts may receive a limited number of sponsored AI actions before purchasing a license. Trial access requires a verified account, is tied to the account and device used to start it, and is subject to per-feature limits and an overall service budget. Trial limits may change or be paused as disclosed in the app. Attempts to evade trial limits, create accounts to obtain repeated trials, or disrupt the service are prohibited. After buying a license, sponsored trial limits no longer apply; AI provider charges are then governed by the OpenRouter account and key you configure.</p></Section>
    <Section title="Third-party services"><p>Some features rely on third-party software and services. Your use of them may be subject to their separate terms. Cutly is not responsible for third-party services, their availability, or their handling of your data. Open-source notices are available on the Open Source page.</p></Section>
    <Section title="Disclaimers and liability"><p>Cutly is provided on an “as is” and “as available” basis to the fullest extent permitted by law. We do not guarantee uninterrupted operation, that clip suggestions will meet your needs, or that any download will be available. To the fullest extent permitted by law, Cutly’s total liability for claims related to the service is limited to the amount you paid for Cutly in the twelve months before the claim. Nothing in these terms excludes liability that cannot legally be excluded.</p></Section>
    <Section title="Termination and changes"><p>You may stop using Cutly at any time. We may suspend or end access when reasonably necessary to protect the service, users, or rights holders. We may update these terms by posting a revised version here. If you do not agree, stop using Cutly.</p></Section>
    <Section title="Contact"><p>Questions about these terms can be sent to Cutly support.</p></Section>
  </InfoPage>
}
