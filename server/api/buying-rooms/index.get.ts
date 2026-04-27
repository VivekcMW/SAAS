/**
 * GET /api/buying-rooms
 * List buying rooms the current user owns or is a member of.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const ownedRooms = db.prepare(`
    SELECT br.id, br.title, br.slug, br.description, br.status, br.created_at,
      (SELECT COUNT(*) FROM buying_room_members WHERE room_id = br.id) AS member_count,
      (SELECT COUNT(*) FROM buying_room_apps WHERE room_id = br.id) AS app_count,
      'owner' AS my_role
    FROM buying_rooms br WHERE br.owner_id = ? ORDER BY br.created_at DESC
  `).all(user.id) as any[]

  const memberRooms = db.prepare(`
    SELECT br.id, br.title, br.slug, br.description, br.status, br.created_at,
      (SELECT COUNT(*) FROM buying_room_members WHERE room_id = br.id) AS member_count,
      (SELECT COUNT(*) FROM buying_room_apps WHERE room_id = br.id) AS app_count,
      brm.role AS my_role
    FROM buying_room_members brm
    JOIN buying_rooms br ON br.id = brm.room_id
    WHERE brm.user_id = ? AND br.owner_id != ?
    ORDER BY br.created_at DESC
  `).all(user.id, user.id) as any[]

  return { rooms: [...ownedRooms, ...memberRooms] }
})
