import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/acceptable-use(.*)',
  '/open-source(.*)',
  '/support(.*)',
  '/download(.*)',
  '/blog(.*)',
  '/updates(.*)',
  '/api/stripe/webhook(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/desktop-auth(.*)',
  // These endpoints authenticate the Electron bearer token themselves. Clerk
  // middleware only has access to browser cookies, so protecting them here
  // rejects a valid desktop sign-in before the route handler can verify it.
  '/api/auth/desktop-session(.*)',
  '/api/license(.*)',
  '/api/webhooks(.*)',
  // Payload uses its own CMS login and collection access controls.
  '/admin(.*)',
  '/api/cms(.*)'
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|avif|mp4|m4v|mov|webm|mp3|wav|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ]
}
