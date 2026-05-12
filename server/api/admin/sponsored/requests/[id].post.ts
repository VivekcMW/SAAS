/**
 * POST /api/admin/sponsored/requests/:id
 * Approve or reject a vendor sponsorship request. Admin-only.
 * Body: { action: 'approve' | 'reject', reason?: string }
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing request id' })

  const body = await readBody<{ action: 'approve' | 'reject'; reason?: string }>(event)

  if (!body?.action || !['approve', 'reject'].includes(body.action)) {
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' })
  }
  if (body.action === 'reject' && !body.reason?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'A rejection reason is required' })
  }

  const db = getDb()
  const row = db.prepare('SELECT id FROM sponsored_requests WHERE id = ?').get(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Request not found' })

  const newStatus = body.action === 'approve' ? 'approved' : 'rejected'
  db.prepare(`
    UPDATE sponsored_requests
    SET status = ?, rejection_reason = ?, reviewed_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, body.reason ?? null, id)

  logActivity({
    actorId:    admin.id,
    actorEmail: admin.email,
    action:     `sponsored_request.${body.action}`,
    entityType: 'sponsored_request',
    entityId:   id,
    meta:       body.reason ? { reason: body.reason } : undefined,
  })

  return { success: true, id, status: newStatus }
})
