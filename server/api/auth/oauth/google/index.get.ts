/**
 * GET /api/auth/oauth/google
 * Redirects to Google OAuth authorization URL.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env.
 */
import { randomBytes } from 'node:crypto'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    throw createError({ statusCode: 501, statusMessage: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID.' })
  }

  const state = randomBytes(16).toString('hex')
  const baseUrl = config.public?.siteUrl || process.env.SITE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`

  // Store state in short-lived cookie to prevent CSRF
  setCookie(event, 'oauth_state', state, {
    maxAge: 600,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online'
  })

  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})
