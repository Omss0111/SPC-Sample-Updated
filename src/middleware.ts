import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const dashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (dashboardRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\.(?:jpg|png|gif|svg|css|js|ico)).*)', '/dashboard(.*)'],
}