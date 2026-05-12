/**
 * PATCH /api/admin/sponsored/:id
 * Partial update — used for pause/resume. Admin-only.
 * Body: { status: 'active' | 'scheduled' | 'paused' | 'expired' }
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

const VALID_STATUSES = ['active', 'scheduled', 'paused', 'expired']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: string }>(event)
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const db = getDb()
  const now = new Date().toISOString()
  try {
    const row = db.prepare('SELECT id FROM sponsored_slots WHERE id = ?').get(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Sponsorship not found' })
    db.prepare('UPDATE sponsored_slots SET status = ?, updated_at = ? WHERE id = ?').run(body.status, now, id)
    logActivity({ actorId: admin.id, actorEmail: admin.email, action: `sponsored.${body.status}`, entityType: 'sponsored_slot', entityId: id })
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 404) throw err
  }

  return { id, status: body.status, updatedAt: now }
})
