import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Normalize env URLs safely
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || null

// Vercel preview URLs (e.g. my-app-12345.vercel.app)
const PREVIEW_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  : null

// Development URLs
const DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

// Final allowed origins list
const ALLOWED_ORIGINS = [APP_URL, PREVIEW_URL, ...DEV_ORIGINS].filter(
  Boolean
) as string[]

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const origin = req.headers.get('origin') || req.headers.get('referer') || null

  // --------- ORIGIN VALIDATION (non-blocking) ----------
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

  // --------- SECURITY HEADERS (production only) ----------
  if (APP_URL) {
    const appHost = new URL(APP_URL).hostname
    if (req.nextUrl.hostname === appHost) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
