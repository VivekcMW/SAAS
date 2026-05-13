/**
 * POST /api/auth/google-one-tap
 * Verifies a Google One Tap / Sign In With Google credential JWT and creates
 * a session for the matching user (creating the account on first sign-in).
 *
 * Verification strategy: Google's tokeninfo endpoint
 *   https://oauth2.googleapis.com/tokeninfo?id_token=<credential>
 * This is Google's own recommended way for server-side verification when you
 * don't want to implement JWKS RS256 manually. It adds one round-trip to Google
 * but is always correct and requires no crypto dependencies.
 */
import { getDb, makeId, logActivity } from '~/server/utils/database'
import { createSession, findUserByEmail } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { logGeoEvent } from '~/server/utils/geoTracker'

interface GoogleTokenInfo {
  sub: string
  email: string
  email_verified: string   // "true" | "false"
  name: string
  given_name?: string
  family_name?: string
  picture?: string
  aud: string
  iss: string
  exp: string
  error_description?: string
}

const VALID_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com'])

async function verifyGoogleCredential(credential: string): Promise<GoogleTokenInfo> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    { signal: AbortSignal.timeout(5000) }
  )
  const info = (await res.json()) as GoogleTokenInfo
  if (info.error_description) throw new Error(info.error_description)
  return info
}

function assertValidClaims(info: GoogleTokenInfo, clientId: string): void {
  if (!VALID_ISSUERS.has(info.iss)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token issuer.' })
  }
  if (info.aud !== clientId) {
    throw createError({ statusCode: 401, statusMessage: 'Token audience mismatch.' })
  }
  if (info.email_verified !== 'true') {
    throw createError({ statusCode: 401, statusMessage: 'Google email is not verified.' })
  }
  if (Number(info.exp) < Math.floor(Date.now() / 1000)) {
    throw createError({ statusCode: 401, statusMessage: 'Token has expired.' })
  }
  if (!info.email) {
    throw createError({ statusCode: 401, statusMessage: 'No email in token.' })
  }
}

function upsertGoogleUser(info: GoogleTokenInfo): ReturnType<typeof findUserByEmail> {
  const db = getDb()
  const now = new Date().toISOString()
  const existing = findUserByEmail(info.email)

  if (existing) {
    // Existing user: ensure email is verified and update avatar if missing
    const sets = ['email_verified = 1', 'updated_at = ?']
    const params: (string | null)[] = [now]
    if (info.picture && !existing.avatar) {
      sets.push('avatar = ?')
      params.push(info.picture)
    }
    params.push(existing.id)
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params)
    return existing
  }

  // New user: create account (buyer role, free plan, email pre-verified via Google)
  const userId = makeId('user')
  const firstName = info.given_name || info.name.split(' ')[0] || 'User'
  const lastName = info.family_name || info.name.split(' ').slice(1).join(' ') || ''
  const fullName = `${firstName} ${lastName}`.trim()

  db.prepare(`
    INSERT INTO users (id, email, password_hash, first_name, last_name, full_name,
      avatar, role, plan, email_verified, created_at, updated_at)
    VALUES (?, ?, '', ?, ?, ?, ?, 'buyer', 'free', 1, ?, ?)
  `).run(userId, info.email, firstName, lastName, fullName, info.picture ?? null, now, now)

  return findUserByEmail(info.email)
}

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 20, windowMs: 60 * 1000, prefix: 'one-tap' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again shortly.' })
  }

  const body = await readBody(event)
  const credential = body?.credential as string | undefined

  if (!credential || typeof credential !== 'string' || credential.length < 100) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid credential.' })
  }

  const config = useRuntimeConfig(event)
  const clientId = (config.googleClientId as string | undefined) || process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    throw createError({ statusCode: 501, statusMessage: 'Google sign-in is not configured on this server.' })
  }

  // ── Verify with Google ────────────────────────────────────────────────────
  let info: GoogleTokenInfo
  try {
    info = await verifyGoogleCredential(credential)
  } catch (_e) {
    throw createError({ statusCode: 401, statusMessage: `Google credential verification failed: ${(e as Error).message}` })
  }

  assertValidClaims(info, clientId)

  // ── Find or create user ───────────────────────────────────────────────────
  const user = upsertGoogleUser(info)
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create user account.' })
  }

  const isNewUser = !findUserByEmail(info.email)?.created_at

  logActivity({
    actorId: user.id,
    actorEmail: user.email,
    action: isNewUser ? 'user.register_google' : 'user.login_google_one_tap',
    entityType: 'user',
    entityId: user.id,
  })

  await createSession(event, user.id)
  logGeoEvent(event, { userId: user.id, eventType: 'oauth_login' })
  return { success: true, user }
})

