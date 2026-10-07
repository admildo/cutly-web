import { AppAccess } from '@/app/components/AppAccess'
import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Download Deyn Studio', description: 'Download or open the Deyn Studio desktop app.', path: '/download' })

const safeExternalUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch { return null }
}

export default function DownloadPage() {
  const downloadUrl = safeExternalUrl(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL)
  return <InfoPage eyebrow="DEYN STUDIO DESKTOP" title="Open or download Deyn Studio" intro="Manage your account here. Find, edit, and export clips in the desktop app.">
    <AppAccess downloadUrl={downloadUrl} allowReleasePage={false} />
    <Section title="Before you install"><p>Download Deyn Studio from an official release. Keep the app updated, and only process media you have permission to use.</p></Section>
  </InfoPage>
}
