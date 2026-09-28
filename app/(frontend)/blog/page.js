import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = createPageMetadata({
  title: 'Video Editing Tips and News',
  description: 'Practical video editing tips, creator stories, and product news from Cutly.',
  path: '/blog'
})

export default async function BlogPage() {
  const payload = await getPayload({ config })
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 50
  })

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-20 sm:px-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">← Cutly home</Link>
      <header className="mb-12 mt-10 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">Cutly Journal</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">Stories, tips, and updates</h1>
      </header>
      {posts.length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-neutral-600">
          No posts yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImageUrl} alt={post.coverImageAlt || `Cover image for ${post.title}`} className="aspect-[16/9] w-full object-cover" />
              ) : null}
              <div className="p-6">
                <time className="text-sm text-neutral-500" dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en', { dateStyle: 'long' })}
                </time>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                </h2>
                <p className="mt-3 leading-7 text-neutral-600">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
