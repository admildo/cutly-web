import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/robots.txt',
  '/sitemap.xml',
  '/about(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/acceptable-use(.*)',
  '/copyright(.*)',
  '/open-source(.*)',
  '/support(.*)',
  '/download(.*)',
  '/blog(.*)',
  '/updates(.*)',
  // Read-only public configuration fetched by the desktop app.
  '/catalogs(.*)',
  '/api/stripe/webhook(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/account(.*)',
  // The page checks the session itself and sends visitors to the site's own /sign-in,
  // instead of Clerk's hosted account portal.
  '/dashboard(.*)',
  '/api/account(.*)',
  '/desktop-auth(.*)',
  // These endpoints authenticate the Electron bearer token themselves. Clerk
  // middleware only has access to browser cookies, so protecting them here
  // rejects a valid desktop sign-in before the route handler can verify it.
  '/api/auth/desktop-session(.*)',
  '/api/desktop/access(.*)',
  '/api/trial/ai(.*)',
  '/api/license(.*)',
  '/api/webhooks(.*)',
  // Payload uses its own CMS login and collection access controls.
  '/admin(.*)',
  '/api/cms(.*)'
])

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) await auth.protect()
  },
  {
    // Use a per-request nonce and strict-dynamic instead of trusting arbitrary
    // HTTPS script origins. Clerk's CSP integration also adds its required hosts.
    // Blog cover images are editor-supplied HTTPS URLs, so images may load from any HTTPS host.
    // The hero demo is framed from YouTube's privacy-enhanced embed domain, the only video host the site frames.
    // The account portal is a separate host, and the signed-in pages must be allowed to call it (sign-out, sign-in redirects).
    contentSecurityPolicy: { strict: true, directives: { 'img-src': ['https:'], 'frame-src': ['https://www.youtube-nocookie.com'], 'connect-src': ['https://accounts.deynstudio.com'] } }
  }
)

export const config = {
  matcher: [
    '/((?!_next|catalogs/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|avif|mp4|m4v|mov|webm|mp3|wav|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ]
}
