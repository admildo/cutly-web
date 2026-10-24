import { getPublishedPosts } from '@/lib/blog'
import { siteOrigin } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const escapeXml = (value = '') =>
  String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])

export async function GET() {
  const posts = await getPublishedPosts(50)
  const items = posts.map((post) => {
    const link = `${siteOrigin}/blog/${encodeURIComponent(post.slug)}`
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`
  })
  const lastBuild = posts[0] ? new Date(posts[0].updatedAt || posts[0].publishedAt) : new Date()

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Deyn Studio Journal</title>
    <link>${siteOrigin}/blog</link>
    <description>Video editing tips, creator stories, and product news from Deyn Studio.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${siteOrigin}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`
  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600'
    }
  })
}
