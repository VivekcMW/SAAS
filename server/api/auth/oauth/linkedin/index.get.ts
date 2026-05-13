/**
 * GET /api/auth/oauth/linkedin
 * Redirects to LinkedIn OAuth authorization URL.
 * Requires LINKEDIN_CLIENT_ID in env.
 */
import { randomBytes } from 'node:crypto'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID

  if (!clientId) {
    throw createError({ statusCode: 501, statusMessage: 'LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID.' })
  }

  const state = randomBytes(16).toString('hex')

  setCookie(event, 'oauth_state_li', state, {
    maxAge: 600,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/oauth/linkedin/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state
  })

  return sendRedirect(event, `https://www.linkedin.com/oauth/v2/authorization?${params}`)
})
