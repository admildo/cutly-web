import Link from 'next/link'
import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Deyn Studio Support', description: 'Get help with Deyn Studio, your account, or your license.', path: '/support' })

export default function SupportPage() {
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL
  return <InfoPage eyebrow="SUPPORT" title="Help with Deyn Studio" intro="Find quick answers about sign-in, downloads, and your license. For account help, contact Deyn Studio support.">
    <Section title="Sign-in and license"><p>Start sign-in in Deyn Studio, then finish in your browser. If the app does not reopen, launch it again. Your license follows the account you used to sign in and covers the device limit shown on your plan.</p></Section>
    <Section title="Downloads and media"><p>Use public video links that do not require sign-in or DRM access. If a download fails, the source may have changed or may be limiting requests. Process only media you have permission to use.</p></Section>
    <Section title="Privacy and legal"><p>Review our <Link href="/privacy">Privacy Policy</Link>, <Link href="/terms">Terms of Service</Link>, and <Link href="/acceptable-use">Acceptable Use</Link> policy. Open-source acknowledgements are available in our <Link href="/open-source">Open-source notices</Link>.</p></Section>
    <Section title="Contact"><p>{supportUrl ? <a href={supportUrl}>Contact Deyn Studio support</a> : 'Support contact details are not available yet.'}</p></Section>
  </InfoPage>
}
