/**
 * GET /api/auth/oauth/google/callback
 * Handles Google OAuth callback: exchanges code for tokens, upserts user, creates session.
 */
import { getCookie, deleteCookie } from 'h3'
import { getDb, makeId, makeSlug } from '~/server/utils/database'
import { createSession, findUserByEmail } from '~/server/utils/auth'
import { createHash } from 'node:crypto'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
}

interface GoogleUserInfo {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  picture?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID
  const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET
  const baseUrl = config.public?.siteUrl || process.env.SITE_URL || 'http://localhost:3000'

  if (!clientId || !clientSecret) {
    return sendRedirect(event, '/login?error=oauth_not_configured')
  }

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const storedState = getCookie(event, 'oauth_state')

  // CSRF check
  if (!state || state !== storedState) {
    return sendRedirect(event, '/login?error=invalid_state')
  }
  deleteCookie(event, 'oauth_state')

  if (!code) {
    return sendRedirect(event, '/login?error=missing_code')
  }

  // Exchange code for tokens
  const tokenRes = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${baseUrl}/api/auth/oauth/google/callback`,
      grant_type: 'authorization_code'
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).catch(() => null)

  if (!tokenRes?.access_token) {
    return sendRedirect(event, '/login?error=token_exchange_failed')
  }

  // Fetch user profile
  const profile = await $fetch<GoogleUserInfo>('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenRes.access_token}` }
  }).catch(() => null)

  if (!profile?.email) {
    return sendRedirect(event, '/login?error=profile_fetch_failed')
  }

  const db = getDb()
  const now = new Date().toISOString()

  // Upsert user
  let user = findUserByEmail(profile.email)
  if (!user) {
    const userId = makeId('user')
    const firstName = profile.given_name || profile.name.split(' ')[0] || 'User'
    const lastName = profile.family_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, full_name,
        role, plan, email_verified, created_at, updated_at)
      VALUES (?, ?, '', ?, ?, ?, 'buyer', 'free', 1, ?, ?)
    `).run(userId, profile.email, firstName, lastName, fullName, now, now)
    user = findUserByEmail(profile.email)
  } else {
    // Mark email as verified if not already
    db.prepare(`UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ? AND email_verified = 0`)
      .run(now, user.id)
  }

  if (!user) return sendRedirect(event, '/login?error=user_creation_failed')

  await createSession(event, user.id)
  return sendRedirect(event, '/dashboard')
})
