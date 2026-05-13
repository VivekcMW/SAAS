/**
 * GET /google[token].html (via server/routes for non-api paths)
 * Serves Google Search Console domain verification.
 * Set GOOGLE_SITE_VERIFICATION env var to the token (no "google" prefix, no ".html").
 * Google fetches: https://moonmart.ai/google{GOOGLE_SITE_VERIFICATION}.html
 */
import type { H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const token = process.env.GOOGLE_SITE_VERIFICATION
  if (!token) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return `google-site-verification: google${token}.html`
})
