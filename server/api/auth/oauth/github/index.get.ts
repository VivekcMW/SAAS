/**
 * GET /api/auth/oauth/github
 * Redirects to GitHub OAuth authorization URL.
 * Requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in env.
 */
import { randomBytes } from 'node:crypto'
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = config.githubClientId || process.env.GITHUB_CLIENT_ID

  if (!clientId) {
    throw createError({ statusCode: 501, statusMessage: 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID.' })
  }

  const state = randomBytes(16).toString('hex')

  setCookie(event, 'oauth_state_gh', state, {
    maxAge: 600,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:user user:email',
    state
  })

  return sendRedirect(event, `https://github.com/login/oauth/authorize?${params}`)
})
