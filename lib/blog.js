import { getPayload } from 'payload'
import config from '@payload-config'
import { siteOrigin } from '@/lib/seo'

// An uploaded cover wins over the plain URL field.
export const getCoverImage = (post) => {
  const media = post.coverImage && typeof post.coverImage === 'object' ? post.coverImage : null
  const url = media?.url || post.coverImageUrl
  if (!url) return null
  return {
    url,
    absoluteUrl: new URL(url, siteOrigin).toString(),
    alt: media?.alt || post.coverImageAlt || ''
  }
}

const publishedOnly = { _status: { equals: 'published' } }

export async function getPublishedPosts(limit = 100) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: publishedOnly,
    sort: '-publishedAt',
    limit,
    depth: 1
  })
  return docs
}

export async function getPublishedPost(slug) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, publishedOnly] },
    limit: 1
  })
  return docs[0]
}

const collectText = (node) => {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  return (node.children || []).map(collectText).join(' ')
}

export function getPostText(post) {
  return collectText(post.content?.root)
}

export function getReadingMinutes(post) {
  const words = getPostText(post).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export function getWordCount(post) {
  return getPostText(post).split(/\s+/).filter(Boolean).length
}

export const formatPostDate = (value) =>
  new Date(value).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export const formatShortDate = (value) =>
  new Date(value).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
