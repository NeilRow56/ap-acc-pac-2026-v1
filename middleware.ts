import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Normalize env URLs
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || null
const PREVIEW_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  : null
const DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
const ALLOWED_ORIGINS = [APP_URL, PREVIEW_URL, ...DEV_ORIGINS].filter(
  Boolean
) as string[]

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip auth API routes
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
  if (!isAuthRoute) {
    const origin =
      req.headers.get('origin') || req.headers.get('referer') || null

    if (origin) {
      try {
        const normalized = new URL(origin).origin.replace(/\/$/, '')
        const allowed = ALLOWED_ORIGINS.map(o => o.replace(/\/$/, ''))

        if (!allowed.includes(normalized)) {
          console.warn(
            `[middleware] Suspicious request origin: ${normalized}. Allowed: ${allowed.join(', ')}`
          )
        }
      } catch {
        console.warn(`[middleware] Invalid Origin/Referer header: ${origin}`)
      }
    }

    // Security headers for frontend pages
    if (APP_URL && req.nextUrl.hostname === new URL(APP_URL).hostname) {
      res.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload'
      )
      res.headers.set(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self'",
          "connect-src 'self' https://api.resend.com",
          "img-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self' data:"
        ].join('; ')
      )
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/.*).*)']
}
