import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('placeholder');

// Define which routes require authentication. All dashboard routes are protected.
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default isClerkConfigured 
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect()
      }
    })
  : () => {
      // Bypass Clerk middleware when keys are not configured to allow the custom layout fallback page to render
      return NextResponse.next();
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
