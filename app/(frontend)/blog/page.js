import Link from 'next/link'
import { createPageMetadata, serializeJsonLd, siteOrigin, socialImage } from '@/lib/seo'
import { formatShortDate, getCoverImage, getPublishedPosts, getReadingMinutes } from '@/lib/blog'

export const dynamic = 'force-dynamic'

const description = 'Practical video editing tips, creator stories, and product news from the team building Deyn Studio.'

export const metadata = {
  ...createPageMetadata({
    title: 'Journal: Video Editing Tips and Product News',
    description,
    path: '/blog',
    image: socialImage('blog', 'Deyn Studio journal: video editing tips, creator stories, and product news')
  }),
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: 'Deyn Studio Journal' }] }
  }
}

function PostMeta({ post }) {
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-3 text-sm text-[var(--blog-faint)]">
      <time dateTime={post.publishedAt}>{formatShortDate(post.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{getReadingMinutes(post)} min read</span>
    </p>
  )
}

function Cover({ post, priority = false }) {
  const cover = getCoverImage(post)
  if (!cover) return null
  return (
    <div className="aspect-[16/10] overflow-hidden rounded-xl border border-[var(--blog-line)] bg-[var(--blog-card)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover.url}
        alt={cover.alt}
        width={1280}
        height={800}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className="blog-cover h-full w-full object-cover"
      />
    </div>
  )
}

export default async function BlogPage() {
  const posts = await getPublishedPosts(100)
  const [featured, ...rest] = posts

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${siteOrigin}/blog#blog`,
        name: 'Deyn Studio Journal',
        description,
        url: `${siteOrigin}/blog`,
        inLanguage: 'en',
        publisher: { '@id': `${siteOrigin}/#organization` },
        blogPost: posts.slice(0, 20).map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${siteOrigin}/blog/${encodeURIComponent(post.slug)}`,
          datePublished: post.publishedAt
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Deyn Studio', item: siteOrigin },
          { '@type': 'ListItem', position: 2, name: 'Journal', item: `${siteOrigin}/blog` }
        ]
      }
    ]
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-8 sm:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <header className="pb-14 pt-16 sm:pb-20 sm:pt-24">
        <h1 className="blog-serif m-0 max-w-3xl text-[clamp(2.75rem,6.5vw,5rem)] font-normal leading-[1.02] tracking-[-0.025em]">
          The Deyn Studio Journal
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--blog-muted)]">
          Video editing tips, creator stories, and notes from the team building Deyn Studio.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-[var(--blog-line)] bg-[var(--blog-card)] p-8 text-[var(--blog-muted)]">
          No posts yet. Check back soon.
        </p>
      ) : (
        <>
          <Link
            href={`/blog/${featured.slug}`}
            className={`blog-link group grid gap-8 no-underline md:items-center md:gap-14 ${getCoverImage(featured) ? 'md:grid-cols-[1.15fr_1fr]' : ''}`}
          >
            <Cover post={featured} priority />
            <div className="max-w-3xl">
              <p className="m-0 mb-4 text-xs font-medium uppercase tracking-[0.16em] text-[var(--blog-accent)]">Latest</p>
              <h2 className="blog-title blog-serif m-0 text-[clamp(1.9rem,3.6vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.02em] text-balance">
                {featured.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--blog-muted)]">{featured.excerpt}</p>
              <div className="mt-6"><PostMeta post={featured} /></div>
            </div>
          </Link>

          {rest.length > 0 ? (
            <section aria-labelledby="all-posts" className="mt-20 sm:mt-28">
              <h2 id="all-posts" className="m-0 border-b border-[var(--blog-line)] pb-4 text-xs font-medium uppercase tracking-[0.16em] text-[var(--blog-faint)]">
                All posts
              </h2>
              <ul className="m-0 list-none p-0">
                {rest.map((post) => (
                  <li key={post.id} className="border-b border-[var(--blog-line)]">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="blog-link grid gap-3 py-8 no-underline sm:grid-cols-[11rem_1fr] sm:gap-10 sm:py-10"
                    >
                      <div className="pt-1.5"><PostMeta post={post} /></div>
                      <div className="max-w-2xl">
                        <h3 className="blog-title blog-serif m-0 text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance">
                          {post.title}
                        </h3>
                        <p className="mt-3 leading-7 text-[var(--blog-muted)]">{post.excerpt}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </main>
  )
}
