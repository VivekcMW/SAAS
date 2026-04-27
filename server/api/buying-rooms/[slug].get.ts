/**
 * GET /api/buying-rooms/:slug
 * Get a buying room with members, apps, and comments.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const user = await requireUser(event)
  const db = getDb()

  const room = db.prepare('SELECT * FROM buying_rooms WHERE slug = ?').get(slug) as any
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Buying room not found' })

  // Access check — owner or member
  const isMember = room.owner_id === user.id ||
    db.prepare('SELECT id FROM buying_room_members WHERE room_id = ? AND user_id = ?').get(room.id, user.id)
  if (!isMember) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const members = db.prepare(`
    SELECT brm.id, brm.role, brm.invited_at, u.name, u.email
    FROM buying_room_members brm LEFT JOIN users u ON u.id = brm.user_id
    WHERE brm.room_id = ?
  `).all(room.id) as any[]

  const apps = db.prepare(`
    SELECT bra.id, bra.vote_score, bra.status, bra.notes, bra.added_at,
           al.id AS app_id, al.name, al.slug AS app_slug, al.logo_url
    FROM buying_room_apps bra JOIN app_listings al ON al.id = bra.app_id
    WHERE bra.room_id = ? ORDER BY bra.vote_score DESC
  `).all(room.id) as any[]

  const comments = db.prepare(`
    SELECT brc.id, brc.author_name, brc.body, brc.created_at,
           al.name AS app_name, al.slug AS app_slug
    FROM buying_room_comments brc LEFT JOIN app_listings al ON al.id = brc.app_id
    WHERE brc.room_id = ? ORDER BY brc.created_at ASC
  `).all(room.id) as any[]

  return { room, members, apps, comments, is_owner: room.owner_id === user.id }
})
