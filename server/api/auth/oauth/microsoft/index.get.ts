/**
 * GET /api/auth/oauth/microsoft
 * Redirects to Microsoft OAuth authorization URL.
 * Requires MICROSOFT_CLIENT_ID in env.
 */
import { randomBytes } from 'node:crypto'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID

  if (!clientId) {
    throw createError({ statusCode: 501, statusMessage: 'Microsoft OAuth not configured. Set MICROSOFT_CLIENT_ID.' })
  }

  const state = randomBytes(16).toString('hex')

  setCookie(event, 'oauth_state_ms', state, {
    maxAge: 600,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/oauth/microsoft/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'openid email profile User.Read',
    response_mode: 'query',
    state
  })

  return sendRedirect(event, `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`)
})
