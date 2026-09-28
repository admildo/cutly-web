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
  if (!post) return { title: 'Post not found | Cutly', robots: { index: false, follow: false } }
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
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-20 sm:px-10">
      <Link href="/blog" className="text-sm text-neutral-500 hover:text-neutral-900">← All posts</Link>
      <article className="mt-10">
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
              author: { '@type': 'Organization', name: 'Cutly', url: siteOrigin },
              publisher: { '@type': 'Organization', name: 'Cutly', url: siteOrigin }
            })
          }}
        />
        <time className="text-sm text-neutral-500" dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('en', { dateStyle: 'long' })}
        </time>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-xl leading-8 text-neutral-600">{post.excerpt}</p>
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.coverImageAlt || `Cover image for ${post.title}`} className="mt-10 w-full rounded-2xl object-cover" />
        ) : null}
        <div className="prose prose-neutral mt-10 max-w-none">
          <RichText data={post.content} />
        </div>
      </article>
    </main>
  )
}
