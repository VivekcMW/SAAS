/**
 * POST /api/demos
 * Submit a demo booking request. Rate-limited to 3/hour per IP.
 * Stores the request in demo_bookings table and returns success.
 */
import { createError, defineEventHandler, getRequestIP, readBody } from 'h3'
import { getDb, makeId } from '~/server/utils/database'

const rateMap = new Map<string, number[]>()
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  hits.push(now)
  rateMap.set(ip, hits)
  return hits.length > RATE_LIMIT
}

export default defineEventHandler(async (event) => {
  const ip =
    (event.node.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
    || getRequestIP(event)
    || 'unknown'

  if (isRateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many demo requests — please try again later' })
  }

  const body = await readBody(event)

  const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
  const lastName  = typeof body?.lastName  === 'string' ? body.lastName.trim()  : ''
  const email     = typeof body?.email     === 'string' ? body.email.trim().toLowerCase() : ''
  const company   = typeof body?.company   === 'string' ? body.company.trim()   : ''
  const role      = typeof body?.role      === 'string' ? body.role.trim()      : ''
  const teamSize  = typeof body?.size      === 'string' ? body.size.trim()      : ''

  if (!firstName || !lastName || !email || !company || !role || !teamSize) {
    throw createError({ statusCode: 400, statusMessage: 'All required fields must be filled' })
  }

  // Basic email format guard
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  if (!body?.consent) {
    throw createError({ statusCode: 400, statusMessage: 'Consent is required' })
  }

  const db = getDb()
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO demo_bookings (id, first_name, last_name, email, company, role, team_size, goal, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    makeId('demo'),
    firstName,
    lastName,
    email,
    company,
    role,
    teamSize,
    typeof body.goal === 'string' ? body.goal.trim().slice(0, 1000) : null,
    now
  )

  return { success: true }
})
