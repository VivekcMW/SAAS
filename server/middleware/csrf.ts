/**
 * CSRF protection — double-submit cookie pattern.
 *
 * How it works:
 *  1. On every GET request (or if the cookie is missing), a CSRF token is
 *     generated and stored in a non-httpOnly cookie (`csrf_token`).
 *  2. The Nuxt client reads that cookie via `useCsrf()` composable and attaches
 *     it as an `X-CSRF-Token` header on every state-changing $fetch call.
 *  3. This middleware validates that header on POST / PUT / PATCH / DELETE
 *     requests to `/api/**` (except public webhooks).
 *
 * Excluded paths (must bypass for external callers):
 *  - /api/billing/webhook  — Stripe signs its own payload
 *  - /api/health           — public read-only
 *  - /api/auth/verify-email — email-link GET flow
 */
import { getCookie, setCookie } from 'h3'
import { randomBytes } from 'node:crypto'

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const BYPASS_PATHS = new Set([
  '/api/billing/webhook',
  '/api/health',
  '/api/auth/verify-email',
  '/api/robots.txt',
  '/api/sitemap.xml',
  '/api/sitemap-apps.xml',
  '/api/sitemap-blog.xml',
  '/api/sitemap-categories.xml',
  '/api/og'
])

function generateToken() {
  return randomBytes(32).toString('hex')
}

export default defineEventHandler((event) => {
  const path = event.path?.split('?')[0] ?? ''
  const method = event.method?.toUpperCase() ?? 'GET'

  // Only apply to /api routes
  if (!path.startsWith('/api/')) return

  // Always ensure the CSRF cookie exists (also covers GET refresh)
  let token = getCookie(event, CSRF_COOKIE)
  if (!token) {
    token = generateToken()
    setCookie(event, CSRF_COOKIE, token, {
      httpOnly: false,   // Must be readable by JS
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    })
  }

  // Skip validation for safe methods and bypassed paths
  if (SAFE_METHODS.has(method) || BYPASS_PATHS.has(path)) return

  // For state-changing requests: validate the header matches the cookie
  const headerToken = getRequestHeader(event, CSRF_HEADER)

  if (!headerToken || headerToken !== token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF token mismatch. Please refresh the page and try again.'
    })
  }
})
