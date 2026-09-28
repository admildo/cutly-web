import { siteOrigin } from '@/lib/seo'

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    'Disallow: /sign-in',
    'Disallow: /sign-up',
    'Disallow: /desktop-auth',
    `Sitemap: ${siteOrigin}/sitemap.xml`,
    ''
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
