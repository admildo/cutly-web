import { auth } from '@clerk/nextjs/server'
import { countryFromRequest } from '@/lib/country'
import { DOWNLOAD_PLATFORMS, getInstallerUrl, versionOfInstaller } from '@/lib/downloads'
import { isAutomatedAgent, recordDownload } from '@/lib/download-stats'
import { enforceRateLimit } from '@/lib/rate-limiting'

export const runtime = 'nodejs'

const redirect = (location) =>
  new Response(null, { status: 302, headers: { Location: location, 'Cache-Control': 'no-store, max-age=0' } })

// Counts a download from the website, then sends the visitor to the current installer. A visitor always
// gets the file: counting is best effort and never stands in the way.
export async function GET(request, { params }) {
  const { platform } = await params
  if (!DOWNLOAD_PLATFORMS.includes(platform)) return redirect(new URL('/download', request.url).toString())

  const installer = await getInstallerUrl(platform)
  if (!installer) return redirect(new URL('/download', request.url).toString())

  try {
    if (!isAutomatedAgent(request.headers.get('user-agent'))) {
      // Three per visitor, platform and hour: repeat clicks and retries of one download count once or twice, not tenfold.
      const limit = await enforceRateLimit(request, { name: `download-${platform}`, limit: 3, windowSeconds: 3600 })
      if (limit.ok) {
        const { userId } = await auth()
        await recordDownload({
          platform,
          version: versionOfInstaller(installer),
          country: countryFromRequest(request),
          userId: userId || null
        })
      }
    }
  } catch (error) {
    console.error('[download] Could not count a download', error)
  }
  return redirect(installer)
}
