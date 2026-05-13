/**
 * GET /api/auth/oauth/microsoft/callback
 * Handles Microsoft OAuth callback.
 */
import { getCookie, deleteCookie } from 'h3'
import { getDb, makeId, logActivity } from '~/server/utils/database'
import { createSession, findUserByEmail } from '~/server/utils/auth'
import { logGeoEvent } from '~/server/utils/geoTracker'

interface MicrosoftTokenResponse { access_token: string; token_type: string }
interface MicrosoftUser { id: string; displayName?: string; givenName?: string; surname?: string; mail?: string; userPrincipalName?: string }

export default defineEventHandler(async (event) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return sendRedirect(event, '/login?error=oauth_not_configured')
  }

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const storedState = getCookie(event, 'oauth_state_ms')

  if (!state || state !== storedState) {
    return sendRedirect(event, '/login?error=invalid_state')
  }
  deleteCookie(event, 'oauth_state_ms')

  if (!code) return sendRedirect(event, '/login?error=missing_code')

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/oauth/microsoft/callback`

  // Exchange code for access token
  const tokenRes = await $fetch<MicrosoftTokenResponse>(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    }
  ).catch(() => null)

  if (!tokenRes?.access_token) {
    return sendRedirect(event, '/login?error=token_exchange_failed')
  }

  const msUser = await $fetch<MicrosoftUser>('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenRes.access_token}` }
  }).catch(() => null)

  if (!msUser) return sendRedirect(event, '/login?error=profile_fetch_failed')

  const email = (msUser.mail || msUser.userPrincipalName || '').toLowerCase()
  if (!email) return sendRedirect(event, '/login?error=no_email')

  const db = getDb()
  const now = new Date().toISOString()

  let user = findUserByEmail(email)
  if (user) {
    db.prepare(`UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ? AND email_verified = 0`)
      .run(now, user.id)
  } else {
    const firstName = msUser.givenName || msUser.displayName?.split(' ')[0] || 'User'
    const lastName = msUser.surname || msUser.displayName?.split(' ').slice(1).join(' ') || ''
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
    action: 'oauth_login_microsoft',
    entityType: 'user',
    entityId: user.id,
  })
  logGeoEvent(event, { userId: user.id, eventType: 'oauth_login' })

  return sendRedirect(event, '/dashboard')
})
