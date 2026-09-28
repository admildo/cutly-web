import { AppAccess } from '@/app/components/AppAccess'
import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Download Cutly', description: 'Download or open the Cutly desktop app.', path: '/download' })

const safeExternalUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch { return null }
}

export default function DownloadPage() {
  const downloadUrl = safeExternalUrl(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL)
  return <InfoPage eyebrow="CUTLY DESKTOP" title="Open or download Cutly" intro="The account portal manages your identity and license. Create and export clips in the desktop app.">
    <AppAccess downloadUrl={downloadUrl} allowReleasePage={false} />
    <Section title="Before you install"><p>Download only from an official Cutly release. Keep the app updated, and only process media you have the right to use.</p></Section>
  </InfoPage>
}
