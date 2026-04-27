/**
 * POST /api/buying-rooms/:slug/apps
 * Add an app to the buying room.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const user = await requireUser(event)
  const body = await readBody(event)
  const { app_id, notes } = body || {}
  if (!app_id) throw createError({ statusCode: 400, statusMessage: 'app_id is required' })

  const db = getDb()
  const room = db.prepare("SELECT id, owner_id, status FROM buying_rooms WHERE slug = ?").get(slug) as any
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  if (room.status !== 'active') throw createError({ statusCode: 400, statusMessage: 'Room is not active' })

  const isMember = room.owner_id === user.id ||
    db.prepare('SELECT id FROM buying_room_members WHERE room_id = ? AND user_id = ?').get(room.id, user.id)
  if (!isMember) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const app = db.prepare('SELECT id FROM app_listings WHERE id = ?').get(app_id) as any
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const existing = db.prepare('SELECT id FROM buying_room_apps WHERE room_id = ? AND app_id = ?').get(room.id, app_id)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'App already in this room' })

  db.prepare(`
    INSERT INTO buying_room_apps (id, room_id, app_id, added_by, vote_score, status, notes, added_at)
    VALUES (?, ?, ?, ?, 0, 'shortlisted', ?, ?)
  `).run(makeId('bra'), room.id, app_id, user.id, notes?.trim() || null, new Date().toISOString())

  return { message: 'App added to room' }
})
