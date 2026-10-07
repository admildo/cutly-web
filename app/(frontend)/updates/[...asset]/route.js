const ASSET_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

function getStorageBase() {
  const configuredUrl = process.env.DEYN STUDIO_UPDATE_STORAGE_URL
  if (!configuredUrl) return null

  try {
    const url = new URL(configuredUrl)
    if (
      url.protocol !== 'https:' ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) return null

    url.pathname = `${url.pathname.replace(/\/+$/, '')}/`
    return url
  } catch {
    return null
  }
}

async function forwardToReleaseStore(request, context) {
  const storageBase = getStorageBase()
  if (!storageBase) {
    return new Response('Deyn Studio update storage is not configured.', { status: 503 })
  }

  const { asset } = await context.params
  if (!asset?.length || asset.some((part) => !ASSET_SEGMENT.test(part) || part === '.' || part === '..')) {
    return new Response('Invalid update asset path.', { status: 400 })
  }

  const target = new URL(asset.map(encodeURIComponent).join('/'), storageBase)
  return new Response(null, {
    status: 307,
    headers: {
      Location: target.toString(),
      'Cache-Control': 'no-store'
    }
  })
}

export const GET = forwardToReleaseStore
export const HEAD = forwardToReleaseStore
