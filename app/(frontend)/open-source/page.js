import { InfoPage, Section } from '@/app/components/InfoPage'

import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({ title: 'Open-source notices', description: 'Open-source software acknowledgements for Cutly.', path: '/open-source' })

export default function OpenSourcePage() {
  return <InfoPage eyebrow="OPEN SOURCE" title="Open-source notices" intro="Cutly is grateful to the maintainers and contributors of the open-source projects that make parts of the desktop app possible.">
    <Section title="yt-dlp"><p>Cutly uses yt-dlp for supported public-video download workflows. yt-dlp is released under The Unlicense. Copyright and license notices for yt-dlp are available in its source repository.</p><p><a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noreferrer">View the yt-dlp source and license</a></p></Section>
    <Section title="FFmpeg"><p>Cutly uses FFmpeg for media processing. FFmpeg is licensed under the GNU Lesser General Public License, version 2.1 or later, unless a particular build enables GPL components, in which case that build is licensed under the GNU General Public License, version 2 or later. The license that applies to a distributed Cutly build depends on the exact FFmpeg binary included with that build.</p><p><a href="https://ffmpeg.org/legal.html" target="_blank" rel="noreferrer">View FFmpeg licensing information</a></p></Section>
    <Section title="Source, modifications, and notices"><p>Where the applicable license requires it, Cutly makes corresponding source, build configuration, and notices available with the relevant release. The desktop app’s release notes should identify the included FFmpeg build and link to its corresponding source and configuration. Third-party names and trademarks belong to their respective owners.</p></Section>
  </InfoPage>
}
