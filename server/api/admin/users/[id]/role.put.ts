/**
 * PUT /api/admin/users/[id]/role
 * Change a user's role. Admin-only.
 *
 * Body: { role: 'buyer' | 'vendor' | 'admin' }
 * Returns: { success: true, user: { id, email, role } }
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

const VALID_ROLES = new Set(['buyer', 'vendor', 'admin'])

export default defineEventHandler(async (event) => {
  const admin = await requireUser(event)

  if (admin.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const targetId = getRouterParam(event, 'id')
  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const body = await readBody<{ role?: string }>(event)
  if (!body?.role || !VALID_ROLES.has(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'role must be one of: buyer, vendor, admin' })
  }

  const db = getDb()
  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(targetId) as
    | { id: string; email: string; role: string } | undefined

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  // Prevent admin from demoting themselves
  if (user.id === admin.id && body.role !== 'admin') {
    throw createError({ statusCode: 400, statusMessage: 'You cannot change your own admin role' })
  }

  const now = new Date().toISOString()
  db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(body.role, now, targetId)

  return {
    success: true,
    user: { id: user.id, email: user.email, previousRole: user.role, newRole: body.role }
  }
})
