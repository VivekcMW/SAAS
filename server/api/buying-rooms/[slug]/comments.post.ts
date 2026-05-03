/**
 * POST /api/buying-rooms/:slug/comments
 * Post a comment in the buying room.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'br_comment', limit: 60, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many comments.' })
  }

  const slug = getRouterParam(event, 'slug')
  const user = await requireUser(event)
  const body = await readBody(event)
  const { body: commentBody, app_id } = body || {}
  if (!commentBody?.trim()) throw createError({ statusCode: 400, statusMessage: 'body is required' })
  if (commentBody.trim().length > 2000) throw createError({ statusCode: 400, statusMessage: 'Comment too long (max 2000 chars)' })

  const db = getDb()
  const room = db.prepare("SELECT id, owner_id, status FROM buying_rooms WHERE slug = ?").get(slug) as any
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  const isMember = room.owner_id === user.id ||
    db.prepare('SELECT id FROM buying_room_members WHERE room_id = ? AND user_id = ?').get(room.id, user.id)
  if (!isMember) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const dbUser = db.prepare('SELECT name, email FROM users WHERE id = ?').get(user.id) as any
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO buying_room_comments (id, room_id, app_id, user_id, author_name, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(makeId('brc'), room.id, app_id || null, user.id, dbUser?.name || dbUser?.email || 'Member', commentBody.trim(), now)

  return { message: 'Comment posted' }
})
