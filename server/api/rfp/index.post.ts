/**
 * POST /api/rfp
 * Create a new RFP.
 */
import { getDb, makeId, makeSlug } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'rfp_create', limit: 10, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many RFPs. Try again later.' })
  }

  const user = await requireUser(event)
  const body = await readBody(event)
  const { title, category, budget_min, budget_max, currency = 'USD', seats, requirements, deadline } = body || {}

  if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })
  if (title.trim().length < 10) throw createError({ statusCode: 400, statusMessage: 'Title must be at least 10 characters' })

  const db = getDb()
  const now = new Date().toISOString()
  const baseSlug = makeSlug(title)
  let slug = baseSlug
  let attempt = 0
  while (db.prepare('SELECT id FROM rfps WHERE slug = ?').get(slug)) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const id = makeId('rfp')
  db.prepare(`
    INSERT INTO rfps (id, user_id, title, slug, category, budget_min, budget_max, currency, seats, requirements, deadline, status, response_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0, ?, ?)
  `).run(id, user.id, title.trim(), slug, category || null, budget_min || null, budget_max || null, currency, seats || null, requirements || null, deadline || null, now, now)

  return { id, slug, message: 'RFP published' }
})
