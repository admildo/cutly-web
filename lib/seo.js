const normalizeOrigin = (value) => {
  if (!value) return null
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return new URL(withProtocol).origin
  } catch {
    return null
  }
}

export const siteOrigin =
  normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeOrigin(process.env.CUTLY_SITE_URL) ||
  normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  'http://localhost:3000'

export const siteUrl = new URL(siteOrigin)

const defaultImage = {
  url: '/cutly-hero-moon.png',
  width: 1672,
  height: 941,
  alt: 'Deyn Studio desktop media workspace'
}

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultImage,
  type = 'website',
  publishedTime,
  modifiedTime
}) {
  const fullTitle = `${title} | Deyn Studio`
  const imageData = typeof image === 'string' ? { url: image, alt: defaultImage.alt } : image
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
    title,
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
