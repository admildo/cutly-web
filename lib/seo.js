const normalizeOrigin = (value) => {
  if (!value) return null
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return new URL(withProtocol).origin
  } catch {
    return null
  }
}

const isProductionDeployment =
  process.env.VERCEL_ENV === 'production' ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production')

// Production pages and server integrations must use the official public origin,
// even if a stale Vercel deployment URL is still configured.
export const siteOrigin =
  (isProductionDeployment && 'https://deynstudio.com') ||
  normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeOrigin(process.env.CUTLY_SITE_URL) ||
  normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  'http://localhost:3000'

export const siteUrl = new URL(siteOrigin)

export const defaultSocialImage = {
  url: '/app-shots/home-p.png',
  width: 1920,
  height: 1440,
  alt: 'Deyn Studio desktop app finding video clips'
}

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultSocialImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  absoluteTitle = false
}) {
  const fullTitle = `${title} | Deyn Studio`
  const imageData = typeof image === 'string'
    ? { url: image, alt: defaultSocialImage.alt }
    : image || defaultSocialImage
  const openGraph = {
    type,
    url: path,
    siteName: 'Deyn Studio',
    locale: 'en_US',
    title: fullTitle,
    description,
    images: [imageData]
  }

  if (type === 'article') {
    openGraph.publishedTime = publishedTime
    openGraph.modifiedTime = modifiedTime
    openGraph.authors = ['Deyn Studio']
  }

  return {
    title: absoluteTitle ? { absolute: fullTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageData.url]
    }
  }
}

export const serializeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c')
