/**
 * PUT /api/admin/users/[id]/status
 * Ban, suspend, or restore a user account. Admin only.
 * Body: { status: 'active' | 'banned' | 'suspended', reason?: string }
 */
import { getDb, logActivity } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

const VALID_STATUSES = ['active', 'banned', 'suspended']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: string; reason?: string }>(event)
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const db = getDb()
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(id) as { id: string; email: string } | undefined
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  db.prepare(`UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(body.status, id)

  logActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: `user.${body.status}`,
    entityType: 'user',
    entityId: id,
    meta: { reason: body.reason, targetEmail: user.email }
  })

  return { ok: true, status: body.status }
})
