/**
 * GET /api/auth/oauth/linkedin/callback
 * Handles LinkedIn OAuth callback using OpenID Connect (OIDC).
 * Uses the /v2/userinfo endpoint (available with openid + profile + email scopes).
 */
import { getCookie, deleteCookie } from 'h3'
import { getDb, makeId, logActivity } from '~/server/utils/database'
import { createSession, findUserByEmail } from '~/server/utils/auth'
import { logGeoEvent } from '~/server/utils/geoTracker'

interface LinkedInTokenResponse { access_token: string; token_type: string }
interface LinkedInUserInfo { sub: string; name?: string; given_name?: string; family_name?: string; email?: string; picture?: string }

export default defineEventHandler(async (event) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return sendRedirect(event, '/login?error=oauth_not_configured')
  }

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const storedState = getCookie(event, 'oauth_state_li')

  if (!state || state !== storedState) {
    return sendRedirect(event, '/login?error=invalid_state')
  }
  deleteCookie(event, 'oauth_state_li')

  if (!code) return sendRedirect(event, '/login?error=missing_code')

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/oauth/linkedin/callback`

  // Exchange code for access token
  const tokenRes = await $fetch<LinkedInTokenResponse>(
    'https://www.linkedin.com/oauth/v2/accessToken',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      }).toString()
    }
  ).catch(() => null)

  if (!tokenRes?.access_token) {
    return sendRedirect(event, '/login?error=token_exchange_failed')
  }

  // Fetch profile using OIDC userinfo endpoint
  const liUser = await $fetch<LinkedInUserInfo>('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenRes.access_token}` }
  }).catch(() => null)

  if (!liUser) return sendRedirect(event, '/login?error=profile_fetch_failed')

  const email = (liUser.email || '').toLowerCase()
  if (!email) return sendRedirect(event, '/login?error=no_email')

  const db = getDb()
  const now = new Date().toISOString()

  let user = findUserByEmail(email)
  if (user) {
    db.prepare(`UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ? AND email_verified = 0`)
      .run(now, user.id)
  } else {
    const firstName = liUser.given_name || liUser.name?.split(' ')[0] || 'User'
    const lastName = liUser.family_name || liUser.name?.split(' ').slice(1).join(' ') || ''
    const fullName = `${firstName} ${lastName}`.trim()
    const userId = makeId('user')
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, full_name,
        role, plan, email_verified, created_at, updated_at)
      VALUES (?, ?, '', ?, ?, ?, 'buyer', 'free', 1, ?, ?)
    `).run(userId, email, firstName, lastName, fullName, now, now)
    user = findUserByEmail(email)
  }

  if (!user) return sendRedirect(event, '/login?error=user_creation_failed')

  await createSession(event, user.id)

  logActivity({
    actorId: user.id,
    actorEmail: user.email,
    action: 'oauth_login_linkedin',
    entityType: 'user',
    entityId: user.id,
  })
  logGeoEvent(event, { userId: user.id, eventType: 'oauth_login' })

  return sendRedirect(event, '/dashboard')
})
