/**
 * GET /api/auth/oauth/github/callback
 * Handles GitHub OAuth callback.
 */
import { getCookie, deleteCookie } from 'h3'
import { getDb, makeId } from '~/server/utils/database'
import { createSession, findUserByEmail } from '~/server/utils/auth'

interface GitHubTokenResponse { access_token: string; token_type: string }
interface GitHubUser { id: number; login: string; name?: string; email?: string | null; avatar_url?: string }
interface GitHubEmail { email: string; primary: boolean; verified: boolean }

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = config.githubClientId || process.env.GITHUB_CLIENT_ID
  const clientSecret = config.githubClientSecret || process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return sendRedirect(event, '/login?error=oauth_not_configured')
  }

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const storedState = getCookie(event, 'oauth_state_gh')

  if (!state || state !== storedState) {
    return sendRedirect(event, '/login?error=invalid_state')
  }
  deleteCookie(event, 'oauth_state_gh')

  if (!code) return sendRedirect(event, '/login?error=missing_code')

  // Exchange code for access token
  const tokenRes = await $fetch<GitHubTokenResponse>('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  }).catch(() => null)

  if (!tokenRes?.access_token) {
    return sendRedirect(event, '/login?error=token_exchange_failed')
  }

  const authHeaders = { Authorization: `Bearer ${tokenRes.access_token}`, Accept: 'application/vnd.github+json' }

  // Fetch GitHub user
  const ghUser = await $fetch<GitHubUser>('https://api.github.com/user', { headers: authHeaders }).catch(() => null)
  if (!ghUser) return sendRedirect(event, '/login?error=profile_fetch_failed')

  // Fetch primary email if not in profile
  let email = ghUser.email
  if (!email) {
    const emails = await $fetch<GitHubEmail[]>('https://api.github.com/user/emails', { headers: authHeaders }).catch(() => [] as GitHubEmail[])
    const primary = emails.find((e) => e.primary && e.verified)
    email = primary?.email || null
  }

  if (!email) return sendRedirect(event, '/login?error=no_email')

  const db = getDb()
  const now = new Date().toISOString()

  let user = findUserByEmail(email)
  if (!user) {
    const nameParts = (ghUser.name || ghUser.login).split(' ')
    const firstName = nameParts[0] || ghUser.login
    const lastName = nameParts.slice(1).join(' ') || ''
    const fullName = `${firstName} ${lastName}`.trim()
    const userId = makeId('user')
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, full_name,
        role, plan, email_verified, created_at, updated_at)
      VALUES (?, ?, '', ?, ?, ?, 'buyer', 'free', 1, ?, ?)
    `).run(userId, email, firstName, lastName, fullName, now, now)
    user = findUserByEmail(email)
  } else {
    db.prepare(`UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ? AND email_verified = 0`)
      .run(now, user.id)
  }

  if (!user) return sendRedirect(event, '/login?error=user_creation_failed')

  await createSession(event, user.id)
  return sendRedirect(event, '/dashboard')
})
