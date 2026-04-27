/**
 * POST /api/admin/discovery/[id]/reject
 * Rejects a discovery queue item with a reason.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ reason?: string }>(event)
  const db = getDb()

  const item = db.prepare('SELECT id, status FROM discovery_queue WHERE id = ?').get(id) as
    | { id: string; status: string } | undefined
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Discovery item not found' })
  if (item.status === 'rejected') throw createError({ statusCode: 409, statusMessage: 'Already rejected' })

  const now = new Date().toISOString()
  db.prepare(`
    UPDATE discovery_queue SET status = 'rejected', reject_reason = ?, processed_at = ? WHERE id = ?
  `).run(body?.reason?.trim() || 'Rejected by admin', now, id)

  return { success: true }
})
