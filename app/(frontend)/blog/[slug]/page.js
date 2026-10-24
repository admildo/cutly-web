import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { createPageMetadata, serializeJsonLd, siteOrigin } from '@/lib/seo'
import {
  formatPostDate,
  formatShortDate,
  getCoverImage,
  getPublishedPost,
  getPublishedPosts,
  getReadingMinutes,
  getWordCount
} from '@/lib/blog'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) return { title: 'Post not found | Deyn Studio', robots: { index: false, follow: false } }
  return {
    ...createPageMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      image: getCoverImage(post)
        ? { url: getCoverImage(post).absoluteUrl, alt: getCoverImage(post).alt || post.title }
        : undefined,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt
    }),
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: 'Deyn Studio Journal' }] }
    }
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) notFound()

  const cover = getCoverImage(post)
  const url = `${siteOrigin}/blog/${encodeURIComponent(post.slug)}`
  const others = (await getPublishedPosts(7)).filter((p) => p.id !== post.id).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        isPartOf: { '@id': `${siteOrigin}/blog#blog` },
        image: cover?.absoluteUrl,
        wordCount: getWordCount(post),
        inLanguage: 'en',
        author: { '@id': `${siteOrigin}/#organization` },
        publisher: { '@id': `${siteOrigin}/#organization` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Deyn Studio', item: siteOrigin },
          { '@type': 'ListItem', position: 2, name: 'Journal', item: `${siteOrigin}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url }
        ]
      }
    ]
  }

  return (
    <main className="px-6 pb-8 sm:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <article className="mx-auto max-w-[44rem]">
        <header className="pb-10 pt-12 sm:pt-20">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-[var(--blog-faint)]">
            <Link href="/blog" className="text-[var(--blog-muted)] no-underline hover:text-[var(--blog-text)]">← Journal</Link>
          </nav>
          <h1 className="blog-serif m-0 text-[clamp(2.25rem,5.5vw,3.75rem)] font-normal leading-[1.06] tracking-[-0.025em] text-balance">
            {post.title}
          </h1>
          <p className="mt-6 text-xl leading-9 text-[var(--blog-muted)]">{post.excerpt}</p>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 border-t border-[var(--blog-line)] pt-5 text-sm text-[var(--blog-faint)]">
            <span>Deyn Studio</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{getReadingMinutes(post)} min read</span>
          </p>
        </header>
      </article>

      {cover ? (
        <figure className="mx-auto m-0 max-w-[60rem] pb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt={cover.alt}
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/9] w-full rounded-xl border border-[var(--blog-line)] object-cover"
          />
        </figure>
      ) : null}

      <div className="mx-auto max-w-[44rem]">
        <div className="blog-prose">
          <RichText data={post.content} />
        </div>
        <p className="mt-16 border-t border-[var(--blog-line)] pt-6 text-sm text-[var(--blog-faint)]">
          Deyn Studio turns long videos into shareable clips on your desktop.{' '}
          <Link href="/download" className="text-[var(--blog-text)]">Download Deyn Studio</Link>
          {' · '}
          <Link href="/blog/rss.xml" className="text-[var(--blog-text)]">Subscribe via RSS</Link>
        </p>
      </div>

      {others.length > 0 ? (
        <aside aria-labelledby="more-posts" className="mx-auto mt-20 max-w-[1200px] border-t border-[var(--blog-line)] pt-10">
          <h2 id="more-posts" className="blog-serif m-0 text-2xl font-normal tracking-[-0.01em]">Keep reading</h2>
          <ul className="m-0 mt-8 grid list-none gap-8 p-0 md:grid-cols-3">
            {others.map((other) => (
              <li key={other.id}>
                <Link href={`/blog/${other.slug}`} className="blog-link block no-underline">
                  <p className="m-0 text-sm text-[var(--blog-faint)]">
                    <time dateTime={other.publishedAt}>{formatShortDate(other.publishedAt)}</time>
                  </p>
                  <h3 className="blog-title blog-serif mb-0 mt-2 text-xl font-normal leading-snug text-balance">{other.title}</h3>
                  <p className="mt-2 line-clamp-3 text-[0.95rem] leading-6 text-[var(--blog-muted)]">{other.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </main>
  )
}
