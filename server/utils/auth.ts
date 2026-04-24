import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import type { DbUser } from './database'
import { getDb, makeId, makeSlug } from './database'

const SESSION_COOKIE = 'saasworld_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  companyName: string | null
  companySize: string | null
  jobTitle: string | null
  phoneNumber: string | null
  role: 'buyer' | 'vendor' | 'admin'
  plan: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  companyName?: string
  companySize?: string
  jobTitle?: string
  phoneNumber?: string
  role?: 'buyer' | 'vendor' | 'admin'
  plan?: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split(':')
  if (algorithm !== 'scrypt' || !salt || !key) {
    return false
  }

  const hashBuffer = Buffer.from(key, 'hex')
  const suppliedBuffer = scryptSync(password, salt, hashBuffer.length)
  return timingSafeEqual(hashBuffer, suppliedBuffer)
}

export function ensureSeedCredentials() {
  const db = getDb()
  const seedAccounts = [
    { email: 'demo@saasworld.com', password: 'demo123' },
    { email: 'admin@saasworld.com', password: 'admin123' },
    { email: 'buyer@saasworld.com', password: 'buyer123' }
  ]

  const updatePassword = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
  const selectUser = db.prepare('SELECT password_hash FROM users WHERE email = ?')
  const insertUser = db.prepare(`
    INSERT INTO users (
      id, email, password_hash, first_name, last_name, full_name,
      company_name, company_size, job_title, phone_number, role, plan,
      created_at, updated_at
    ) VALUES (
      @id, @email, @password_hash, @first_name, @last_name, @full_name,
      @company_name, @company_size, @job_title, @phone_number, @role, @plan,
      @created_at, @updated_at
    )
  `)

  seedAccounts.forEach(account => {
    const row = selectUser.get(account.email) as { password_hash?: string } | undefined

    // Create the buyer seed if missing (vendor + admin are already seeded in database.ts)
    if (!row) {
      if (account.email === 'buyer@saasworld.com') {
        const now = new Date().toISOString()
        insertUser.run({
          id: 'user_buyer_demo',
          email: account.email,
          password_hash: hashPassword(account.password),
          first_name: 'Demo',
          last_name: 'Buyer',
          full_name: 'Demo Buyer',
          company_name: 'Acme Corp',
          company_size: '11-50',
          job_title: 'Operations Lead',
          phone_number: '+1-555-0102',
          role: 'buyer',
          plan: 'Free',
          created_at: now,
          updated_at: now
        })
      }
      return
    }

    if (row.password_hash && !row.password_hash.includes('placeholder')) {
      return
    }

    updatePassword.run(hashPassword(account.password), account.email)
  })
}

function mapUser(user: DbUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: user.full_name,
    companyName: user.company_name,
    companySize: user.company_size,
    jobTitle: user.job_title,
    phoneNumber: user.phone_number,
    role: user.role,
    plan: user.plan
  }
}

export function findUserByEmail(email: string) {
  const db = getDb()
  ensureSeedCredentials()
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizeEmail(email)) as DbUser | undefined
  return row
}

export function createUser(payload: RegisterPayload) {
  const db = getDb()
  const email = normalizeEmail(payload.email)

  if (findUserByEmail(email)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists'
    })
  }

  const now = new Date().toISOString()
  const firstName = payload.firstName.trim()
  const lastName = payload.lastName.trim()
  const fullName = `${firstName} ${lastName}`.trim()
  const companyName = payload.companyName?.trim() || null
  const role = payload.role || 'vendor'
  const userId = makeId('user')

  db.prepare(`
    INSERT INTO users (
      id, email, password_hash, first_name, last_name, full_name,
      company_name, company_size, job_title, phone_number, role, plan,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    email,
    hashPassword(payload.password),
    firstName,
    lastName,
    fullName,
    companyName,
    payload.companySize?.trim() || null,
    payload.jobTitle?.trim() || null,
    payload.phoneNumber?.trim() || null,
    role,
    payload.plan || 'Professional',
    now,
    now
  )

  if (companyName) {
    db.prepare(`
      INSERT INTO vendor_profiles (
        id, user_id, company_name, company_slug, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', ?, ?)
    `).run(
      makeId('vendor'),
      userId,
      companyName,
      `${makeSlug(companyName)}-${createHash('sha1').update(userId).digest('hex').slice(0, 6)}`,
      now,
      now
    )
  }

  return findUserByEmail(email)
}

export function createSession(event: H3Event, userId: string, remember = true) {
  const db = getDb()
  const now = Date.now()
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString()
  const sessionId = makeId('session')

  db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    sessionId,
    userId,
    expiresAt,
    new Date(now).toISOString()
  )

  setCookie(event, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: remember ? new Date(expiresAt) : undefined,
    maxAge: remember ? SESSION_TTL_MS / 1000 : undefined
  })
}

export function destroySession(event: H3Event) {
  const db = getDb()
  const sessionId = getCookie(event, SESSION_COOKIE)

  if (sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  }

  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function getSessionUser(event: H3Event): AuthUser | null {
  const db = getDb()
  ensureSeedCredentials()
  const sessionId = getCookie(event, SESSION_COOKIE)

  if (!sessionId) {
    return null
  }

  const row = db.prepare(`
    SELECT u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > ?
  `).get(sessionId, new Date().toISOString()) as DbUser | undefined

  if (!row) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
    deleteCookie(event, SESSION_COOKIE, { path: '/' })
    return null
  }

  return mapUser(row)
}

export function requireUser(event: H3Event) {
  const user = getSessionUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return user
}

export function requireVendor(event: H3Event) {
  const user = requireUser(event)
  if (!['vendor', 'admin'].includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Vendor access required'
    })
  }

  return user
}

export function authenticateUser(email: string, password: string) {
  const user = findUserByEmail(email)

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  return mapUser(user)
}

export function getVendorProfileForUser(userId: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM vendor_profiles WHERE user_id = ?').get(userId) as {
    id: string
    company_name: string
    company_slug: string
    status: string
  } | undefined
}

// ─── Password Reset ──────────────────────────────────────────────────────────

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60 // 1 hour

/** Generate a secure reset token, persist its hash, return the raw token for emailing. */
export function createPasswordResetToken(email: string): string | null {
  const db = getDb()
  const user = findUserByEmail(email)
  if (!user) return null // Don't reveal whether account exists — caller sends "if found" email

  // Invalidate any previous unused tokens for this user
  db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id)

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS).toISOString()

  db.prepare(`
    INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(makeId('prt'), user.id, tokenHash, expiresAt, now.toISOString())

  return rawToken
}

/** Validate token, reset password, invalidate token. Returns true on success. */
export function resetPasswordWithToken(rawToken: string, newPassword: string): boolean {
  const db = getDb()
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const row = db.prepare(`
    SELECT * FROM password_reset_tokens
    WHERE token_hash = ? AND used = 0 AND expires_at > ?
  `).get(tokenHash, new Date().toISOString()) as { id: string; user_id: string } | undefined

  if (!row) return false

  const newHash = hashPassword(newPassword)
  const now = new Date().toISOString()

  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .run(newHash, now, row.user_id)
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?')
    .run(row.id)
  // Invalidate all sessions for this user after password change
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.user_id)

  return true
}

// ─── Email Verification ──────────────────────────────────────────────────────

const VERIFY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 // 24 hours

/** Generate an email verification token. Returns raw token for emailing. */
export function createEmailVerificationToken(userId: string): string {
  const db = getDb()

  // Remove any previous unverified tokens
  db.prepare('DELETE FROM email_verifications WHERE user_id = ? AND verified_at IS NULL').run(userId)

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + VERIFY_TOKEN_TTL_MS).toISOString()

  db.prepare(`
    INSERT INTO email_verifications (id, user_id, token_hash, expires_at, verified_at, created_at)
    VALUES (?, ?, ?, ?, NULL, ?)
  `).run(makeId('ev'), userId, tokenHash, expiresAt, now.toISOString())

  return rawToken
}

/** Verify the token, mark user email as verified. Returns true on success. */
export function verifyEmailToken(rawToken: string): boolean {
  const db = getDb()
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const row = db.prepare(`
    SELECT * FROM email_verifications
    WHERE token_hash = ? AND verified_at IS NULL AND expires_at > ?
  `).get(tokenHash, new Date().toISOString()) as { id: string; user_id: string } | undefined

  if (!row) return false

  const now = new Date().toISOString()
  db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?')
    .run(now, row.user_id)
  db.prepare('UPDATE email_verifications SET verified_at = ? WHERE id = ?')
    .run(now, row.id)

  return true
}
