import Link from 'next/link'
import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Copyright and Takedown', description: 'How Deyn Studio handles copyright, and how to report infringement.', path: '/copyright' })

// DECISION: a US DMCA safe harbor also needs a designated agent registered with the US Copyright Office. Register one
// and name the agent here once you decide to rely on it. Until then this page gives rights holders a way to reach us.
export default function CopyrightPage() {
  return <InfoPage eyebrow="LEGAL · EFFECTIVE OCTOBER 24, 2026" title="Copyright and Takedown" intro="Deyn Studio respects creators and rights holders. We do not encourage or permit copyright infringement.">
    <Section title="How Deyn Studio works"><p>Deyn Studio is desktop software. It runs on your device, and your media, downloads, and projects are stored on your device. We do not host, publish, or distribute user videos, and we do not review the content you choose to process. Because of this, we cannot remove a file from someone’s device, but we take reports seriously and act on accounts and licenses where we can.</p><p>Deyn Studio can fetch public videos from links you provide, using open-source tools, only when you ask it to. It does not bypass DRM, paywalls, or sign-in requirements. You are responsible for having the rights to anything you download, edit, or publish. See our <Link href="/terms">Terms of Service</Link> and <Link href="/acceptable-use">Acceptable Use</Link> policy.</p></Section>
    <Section title="Reporting infringement"><p>If you believe someone is using Deyn Studio to infringe your copyright, contact <Link href="/support">Deyn Studio support</Link> with a written notice that includes:</p><ul><li>Your name, address, email, and phone number, and the rights holder you represent.</li><li>A description of the copyrighted work you claim is being infringed.</li><li>Where the infringing material is located, such as the link or source video, and anything you know that identifies the Deyn Studio user or account involved.</li><li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law.</li><li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act for them.</li><li>Your physical or electronic signature.</li></ul><p>Knowingly sending a false or misleading notice may make you liable for damages.</p></Section>
    <Section title="What we do with a notice"><p>We review notices and may suspend or terminate the license or account involved, disable features for it, or take other steps we consider appropriate. We may share the notice with the person it concerns. If you believe a notice was sent in error, contact support with an explanation and your contact details.</p></Section>
    <Section title="Repeat infringers"><p>We terminate the accounts and licenses of people who are repeatedly found to infringe the rights of others, and we may do so without a refund to the extent the law allows.</p></Section>
    <Section title="Trademarks"><p>Deyn Studio is not affiliated with, endorsed by, or sponsored by YouTube, TikTok, Instagram, X, or any other platform or content owner. Third-party names and marks belong to their owners and are used only to identify them.</p></Section>
  </InfoPage>
}
