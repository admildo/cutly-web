import Link from 'next/link'
import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Cutly Support', description: 'Get help using the Cutly desktop app, account, and license.', path: '/support' })

export default function SupportPage() {
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL
  return <InfoPage eyebrow="SUPPORT" title="Help with Cutly" intro="Start with these common checks. If you need help with an account or license, contact Cutly support.">
    <Section title="Sign-in and license"><p>Start sign-in from the desktop app, then complete it in your browser. If the app does not return after sign-in, reopen Cutly and try again. Licenses are tied to the account used to sign in and can be active on the number of devices shown in your plan.</p></Section>
    <Section title="Downloads and media"><p>Cutly supports public media that does not require a sign-in and is not DRM-protected. A failed download can also mean that the source platform has changed or is temporarily limiting requests. Make sure you have permission to use any media you process.</p></Section>
    <Section title="Privacy and legal"><p>Review our <Link href="/privacy">Privacy Policy</Link>, <Link href="/terms">Terms of Service</Link>, and <Link href="/acceptable-use">Acceptable Use</Link> policy. Open-source acknowledgements are available in our <Link href="/open-source">Open-source notices</Link>.</p></Section>
    <Section title="Contact"><p>{supportUrl ? <a href={supportUrl}>Contact Cutly support</a> : 'Support contact details will be published here before the public launch.'}</p></Section>
  </InfoPage>
}
