// Admin: reject a refund request
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const { reason } = await readBody<{ reason?: string }>(event) ?? {}

  const db = getDb()
  const row = db.prepare(`SELECT value FROM admin_settings WHERE key = 'refund_requests'`).get() as { value: string } | undefined
  const requests: any[] = row ? JSON.parse(row.value) : []

  const idx = requests.findIndex((r: any) => r.id === id)
  if (idx === -1) throw createError({ statusCode: 404, message: 'Refund request not found' })

  if (requests[idx].status !== 'pending') {
    throw createError({ statusCode: 409, message: `Request is already ${requests[idx].status}` })
  }

  const now = new Date().toISOString()
  requests[idx] = {
    ...requests[idx],
    status: 'rejected',
    rejectedAt: now,
    rejectedBy: (admin as any).email,
    rejectionReason: (reason ?? '').trim().slice(0, 500)
  }

  db.prepare(`
    INSERT INTO admin_settings (key, value, updated_by, updated_at) VALUES ('refund_requests', ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
  `).run(JSON.stringify(requests), (admin as any).email, now)

  logActivity({
    actorId: (admin as any).id,
    actorEmail: (admin as any).email,
    action: 'refund.rejected',
    entityType: 'refund_request',
    entityId: id,
    meta: { reason }
  })

  return { success: true }
})
