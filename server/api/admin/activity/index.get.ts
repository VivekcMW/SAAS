/**
 * GET /api/admin/activity
 * Returns recent platform activity log entries. Admin-only.
 * Query: ?limit=50&offset=0&action=&entityType=
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

interface ActivityRow {
  id: string
  actor_id: string | null
  actor_email: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  meta: string | null
  created_at: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 200)
  const offset = Number(query.offset) || 0
  const action = query.action as string | undefined
  const entityType = query.entityType as string | undefined

  const db = getDb()

  let sql = `
    SELECT id, actor_id, actor_email, action, entity_type, entity_id, meta, created_at
    FROM activity_log
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (action) {
    sql += ' AND action LIKE ?'
    params.push(`%${action}%`)
  }
  if (entityType) {
    sql += ' AND entity_type = ?'
    params.push(entityType)
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const rows = db.prepare(sql).all(...params) as ActivityRow[]

  const activities = rows.map(r => ({
    id: r.id,
    actorId: r.actor_id,
    actorEmail: r.actor_email,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    meta: r.meta ? JSON.parse(r.meta) : null,
    createdAt: r.created_at
  }))

  const total = (db.prepare('SELECT COUNT(*) as n FROM activity_log').get() as { n: number }).n

  return { activities, total, limit, offset }
})
