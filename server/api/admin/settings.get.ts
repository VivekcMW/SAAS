/**
 * GET /api/admin/settings
 * Returns all platform settings as a key→value object. Admin-only.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler((event) => {
  const admin = await requireUser(event)
  if (admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const rows = getDb().prepare('SELECT key, value, updated_at FROM admin_settings ORDER BY key')
    .all() as Array<{ key: string; value: string; updated_at: string }>

  const settings: Record<string, unknown> = {}
  for (const row of rows) {
    try { settings[row.key] = JSON.parse(row.value) } catch { settings[row.key] = row.value }
  }

  return { settings }
})
