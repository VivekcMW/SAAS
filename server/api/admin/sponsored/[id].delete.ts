/**
 * DELETE /api/admin/sponsored/:id
 * Remove a sponsorship. Admin-only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = getDb()
  try {
    const row = db.prepare('SELECT id, app_name FROM sponsored_slots WHERE id = ?').get(id) as { id: string; app_name: string } | undefined
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Sponsorship not found' })
    db.prepare('DELETE FROM sponsored_slots WHERE id = ?').run(id)
    logActivity({ actorId: admin.id, actorEmail: admin.email, action: 'sponsored.delete', entityType: 'sponsored_slot', entityId: id, meta: { appName: row.app_name } })
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 404) throw err
  }

  return { id, deleted: true }
})
