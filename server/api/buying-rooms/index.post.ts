/**
 * POST /api/buying-rooms
 * Create a new buying room.
 */
import { getDb, makeId, makeSlug } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'buying_room_create', limit: 10, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again later.' })
  }

  const user = await requireUser(event)
  const body = await readBody(event)
  const { title, description } = body || {}
  if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })

  const db = getDb()
  const now = new Date().toISOString()
  const baseSlug = makeSlug(title)
  let slug = baseSlug
  let attempt = 0
  while (db.prepare('SELECT id FROM buying_rooms WHERE slug = ?').get(slug)) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const id = makeId('br')
  db.prepare(`
    INSERT INTO buying_rooms (id, owner_id, title, slug, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, user.id, title.trim(), slug, description?.trim() || null, now, now)

  return { id, slug, message: 'Buying room created' }
})
