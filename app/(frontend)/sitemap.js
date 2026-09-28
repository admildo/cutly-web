import { getPayload } from 'payload'
import config from '@payload-config'
import { siteOrigin } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const publicPages = [
  ['', 1],
  ['/about', 0.6],
  ['/blog', 0.8],
  ['/download', 0.7],
  ['/support', 0.5],
  ['/open-source', 0.3],
  ['/privacy', 0.2],
  ['/terms', 0.2],
  ['/acceptable-use', 0.2]
]

export default async function sitemap() {
  const payload = await getPayload({ config })
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 1000,
    depth: 0
  })

  const staticEntries = publicPages.map(([path, priority]) => ({
    url: new URL(path || '/', siteOrigin).toString(),
    priority
  }))
  const postEntries = posts.map((post) => ({
    url: new URL(`/blog/${encodeURIComponent(post.slug)}`, siteOrigin).toString(),
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.7
  }))

  return [...staticEntries, ...postEntries]
}
