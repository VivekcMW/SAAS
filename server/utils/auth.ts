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
    { email: 'admin@saasworld.com', password: 'admin123' }
  ]

  const updatePassword = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
  const selectUser = db.prepare('SELECT password_hash FROM users WHERE email = ?')

  seedAccounts.forEach(account => {
    const row = selectUser.get(account.email) as { password_hash?: string } | undefined
    if (!row || (row.password_hash && !row.password_hash.includes('placeholder'))) {
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
