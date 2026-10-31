import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { BlogPostOgCard } from '@/app/components/BlogPostOgCard'
import { getPublishedPost } from '@/lib/blog'

export const runtime = 'nodejs'

// Share card for a post without a cover image. The Manrope weights in assets/fonts are static cuts (SIL Open Font License) of the Latin subset in scripts/og/fonts.
const [medium, extraBold, mark] = await Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Manrope-Medium.ttf')),
  readFile(join(process.cwd(), 'assets/fonts/Manrope-ExtraBold.ttf')),
  readFile(join(process.cwd(), 'public/favicon/web-app-manifest-192x192.png'))
])

const fonts = [
  { name: 'Manrope', data: medium, weight: 500, style: 'normal' },
  { name: 'Manrope', data: extraBold, weight: 800, style: 'normal' }
]
const logo = `data:image/png;base64,${mark.toString('base64')}`

export async function GET(_request, { params }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) return new Response('Not found', { status: 404 })

  return new ImageResponse(<BlogPostOgCard post={post} logo={logo} />, {
    width: 1200,
    height: 630,
    fonts,
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' }
  })
}
