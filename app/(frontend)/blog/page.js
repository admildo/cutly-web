import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = createPageMetadata({
  title: 'Video Editing Tips and News',
  description: 'Practical video editing tips, creator stories, and product news from Deyn Studio.',
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
    <main className="min-h-screen [color-scheme:dark] bg-[#171716] px-6 py-20 text-[#f2f0ef] sm:px-10">
      <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-sm text-[#a6a4a4] hover:text-[#f2f0ef]">← Deyn Studio home</Link>
      <header className="mb-12 mt-10 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#a6a4a4]">Deyn Studio Journal</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">Stories, tips, and updates</h1>
      </header>
      {posts.length === 0 ? (
        <p className="rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-8 text-[#a6a4a4]">
          No posts yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-[#807e7e]/50 bg-[#242322]">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImageUrl} alt={post.coverImageAlt || `Cover image for ${post.title}`} className="aspect-[16/9] w-full object-cover" />
              ) : null}
              <div className="p-6">
                <time className="text-sm text-[#a6a4a4]" dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en', { dateStyle: 'long' })}
                </time>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="text-[#f2f0ef] hover:underline">{post.title}</Link>
                </h2>
                <p className="mt-3 leading-7 text-[#a6a4a4]">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </main>
  )
}
