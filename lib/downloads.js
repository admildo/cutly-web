// Where the installers are. Each platform folder in the update bucket has the manifest the desktop
// app checks for updates (latest-mac.yml on macOS, latest.yml on Windows). Reading it here means
// the download links always match the published release, with no per-release configuration.

const BASE_URL = (process.env.NEXT_PUBLIC_APP_UPDATES_URL || 'https://files.deynstudio.com').replace(
  /\/+$/,
  ''
)

const PLATFORMS = {
  silicon: { folder: 'mac-arm', manifest: 'latest-mac.yml', installer: /\.dmg$/ },
  intel: { folder: 'mac-intel', manifest: 'latest-mac.yml', installer: /\.dmg$/ },
  windows: { folder: 'windows', manifest: 'latest.yml', installer: /\.exe$/ }
}

// The manifest is a small, generated YAML file; its file entries are read without a YAML library.
const installerFrom = (text, pattern) => {
  const names = [...text.matchAll(/^\s*-?\s*url:\s*(\S+)\s*$/gm)].map((match) => match[1])
  return names.find((name) => pattern.test(name)) || null
}

export const DOWNLOAD_PLATFORMS = Object.keys(PLATFORMS)

const readPlatform = async ({ folder, manifest, installer }) => {
  try {
    // Read on every request, so a release is linked as soon as its manifest is published. A slow bucket
    // gives up after four seconds and the platform falls back to the release page.
    const response = await fetch(`${BASE_URL}/${folder}/${manifest}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000)
    })
    if (!response.ok) return null
    const name = installerFrom(await response.text(), installer)
    return name ? `${BASE_URL}/${folder}/${name}` : null
  } catch {
    return null
  }
}

/** The current installer for one platform on the file host, or null when none is published. */
export const getInstallerUrl = (platform) => (PLATFORMS[platform] ? readPlatform(PLATFORMS[platform]) : null)

/** The version number in an installer's URL, such as "1.1.5" in Deyn-1.1.5-arm64.dmg. */
export const versionOfInstaller = (url) => /(\d+\.\d+\.\d+)/.exec(url.split('/').pop())?.[1] || 'unknown'

/**
 * Download links per platform, or null for a platform with no published installer. A published
 * installer is linked through /download/get/<platform>, which counts the download and then sends the
 * visitor to the file. A platform whose manifest cannot be read falls back to the release page, if
 * one is configured.
 */
export const getDownloadUrls = async () => {
  const releasePage = (() => {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL)
      return url.protocol === 'https:' ? url.toString() : null
    } catch {
      return null
    }
  })()
  const entries = await Promise.all(
    Object.entries(PLATFORMS).map(async ([key, platform]) => [
      key,
      (await readPlatform(platform)) ? `/download/get/${key}` : releasePage
    ])
  )
  return Object.fromEntries(entries)
}
