import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createPageMetadata, serializeJsonLd, siteOrigin } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function getPost(slug) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } }
      ]
    },
    limit: 1
  })
  return docs[0]
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post not found | Deyn Studio', robots: { index: false, follow: false } }
  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImageUrl || undefined,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt || post.publishedAt
  })
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen [color-scheme:dark] bg-[#171716] px-6 py-20 text-[#f2f0ef] sm:px-10">
      <article className="mx-auto mt-10 max-w-3xl">
      <Link href="/blog" className="text-sm text-[#a6a4a4] hover:text-[#f2f0ef]">← All posts</Link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt || post.publishedAt,
              mainEntityOfPage: new URL(`/blog/${encodeURIComponent(post.slug)}`, siteOrigin).toString(),
              image: post.coverImageUrl || undefined,
              author: { '@type': 'Organization', name: 'Deyn Studio', url: siteOrigin },
              publisher: { '@type': 'Organization', name: 'Deyn Studio', url: siteOrigin }
            })
          }}
        />
        <time className="text-sm text-[#a6a4a4]" dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('en', { dateStyle: 'long' })}
        </time>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-xl leading-8 text-[#a6a4a4]">{post.excerpt}</p>
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.coverImageAlt || `Cover image for ${post.title}`} className="mt-10 w-full rounded-2xl border border-[#807e7e]/40 object-cover" />
        ) : null}
        <div className="prose prose-invert mt-10 max-w-none prose-headings:text-[#f2f0ef] prose-p:text-[#a6a4a4] prose-a:text-[#cccbca] prose-strong:text-[#f2f0ef] prose-blockquote:border-[#807e7e] prose-blockquote:text-[#a6a4a4]">
          <RichText data={post.content} />
        </div>
      </article>
    </main>
  )
}
