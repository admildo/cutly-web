import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/desktop-auth(.*)',
  // These endpoints authenticate the Electron bearer token themselves. Clerk
  // middleware only has access to browser cookies, so protecting them here
  // rejects a valid desktop sign-in before the route handler can verify it.
  '/api/auth/desktop-session(.*)',
  '/api/license(.*)',
  '/api/webhooks(.*)'
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ]
}
