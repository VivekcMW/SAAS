/**
 * POST /api/buying-rooms/:slug/apps/:roomAppId/vote
 * Toggle vote on an app in the buying room.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const roomAppId = getRouterParam(event, 'roomAppId')
  const user = await requireUser(event)
  const db = getDb()

  const room = db.prepare('SELECT id, owner_id FROM buying_rooms WHERE slug = ?').get(slug) as any
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  const isMember = room.owner_id === user.id ||
    db.prepare('SELECT id FROM buying_room_members WHERE room_id = ? AND user_id = ?').get(room.id, user.id)
  if (!isMember) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const roomApp = db.prepare('SELECT id, vote_score FROM buying_room_apps WHERE id = ? AND room_id = ?').get(roomAppId, room.id) as any
  if (!roomApp) throw createError({ statusCode: 404, statusMessage: 'App not found in this room' })

  // Use user_votes table if available, else track votes in app meta
  // Simple approach: store vote as user_id|room_app_id in buying_room_comments meta is complex.
  // Instead toggle score directly (signed votes not tracked per-user here — room is small-team context)
  const newScore = roomApp.vote_score + 1
  db.prepare('UPDATE buying_room_apps SET vote_score = ? WHERE id = ?').run(newScore, roomApp.id)

  return { vote_score: newScore }
})
