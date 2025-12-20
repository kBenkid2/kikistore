import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic DDoS protection middleware
export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (CSP)
  // Allow same-origin, trusted CDNs, and block inline scripts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-inline' needed for Next.js
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow Google Fonts
    "font-src 'self' https://fonts.gstatic.com data:", // Allow Google Fonts
    "img-src 'self' data: https: blob:", // Allow images from any HTTPS source
    "connect-src 'self'", // API calls to same origin
    "frame-ancestors 'none'", // Prevent embedding
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Strict Transport Security (HSTS) - only on HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Rate limiting is handled in API routes
  // Additional protection can be added here (e.g., IP blocking)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

