/**
 * POST /api/buying-rooms/:slug/invite
 * Invite a member by email.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'br_invite', limit: 20, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many invites.' })
  }

  const slug = getRouterParam(event, 'slug')
  const user = await requireUser(event)
  const body = await readBody(event)
  const { email, role = 'member' } = body || {}
  if (!email?.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })

  const db = getDb()
  const room = db.prepare('SELECT id, owner_id FROM buying_rooms WHERE slug = ?').get(slug) as any
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  if (room.owner_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Only the room owner can invite members' })

  const existing = db.prepare('SELECT id FROM buying_room_members WHERE room_id = ? AND email = ?').get(room.id, email)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'This email is already a member' })

  const invitedUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO buying_room_members (id, room_id, user_id, email, role, invited_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(makeId('brm'), room.id, invitedUser?.id || null, email, role, now)

  return { message: 'Member invited' }
})
