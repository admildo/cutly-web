import { AppAccess } from '@/app/components/AppAccess'
import { InfoPage, Section } from '@/app/components/InfoPage'

import { getDownloadUrls } from '@/lib/downloads'
import { createPageMetadata, socialImage } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Download', description: 'Download Deyn Studio for macOS and manage your desktop app account. Windows and Linux versions are coming soon.', path: '/download', image: socialImage('download', 'Deyn Studio desktop editor with a transcript, captions, and export controls') })

export default async function DownloadPage() {
  const downloadUrls = await getDownloadUrls()
  return <InfoPage eyebrow="DEYN STUDIO DESKTOP" title="Open or download Deyn Studio" intro="Manage your account here. Find, edit, and export clips in the desktop app.">
    <AppAccess downloadUrls={downloadUrls} allowReleasePage={false} />
    <Section title="Before you install"><p>Download Deyn Studio from an official release. Keep the app updated, and only process media you have permission to use.</p></Section>
  </InfoPage>
}
