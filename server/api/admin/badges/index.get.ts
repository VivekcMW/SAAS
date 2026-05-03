/**
 * GET /api/admin/badges
 * List all app badge assignments. Admin-only.
 * Query: ?appId=&badgeType=&limit=50&offset=0
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 200)
  const offset = Number(query.offset) || 0
  const appId = query.appId as string | undefined
  const badgeType = query.badgeType as string | undefined

  const db = getDb()

  let sql = `
    SELECT ab.id, ab.app_id, ab.badge_type, ab.assigned_by, ab.reason, ab.expires_at, ab.created_at,
           al.name as app_name, al.status as app_status,
           u.email as assigned_by_email
    FROM app_badges ab
    JOIN app_listings al ON al.id = ab.app_id
    LEFT JOIN users u ON u.id = ab.assigned_by
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (appId) {
    sql += ' AND ab.app_id = ?'
    params.push(appId)
  }
  if (badgeType) {
    sql += ' AND ab.badge_type = ?'
    params.push(badgeType)
  }

  sql += ' ORDER BY ab.created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const rows = db.prepare(sql).all(...params) as Array<{
    id: string; app_id: string; badge_type: string; assigned_by: string; reason: string | null;
    expires_at: string | null; created_at: string; app_name: string; app_status: string;
    assigned_by_email: string | null;
  }>

  const total = (db.prepare('SELECT COUNT(*) as n FROM app_badges').get() as { n: number }).n

  return {
    badges: rows.map(r => ({
      id: r.id,
      appId: r.app_id,
      appName: r.app_name,
      appStatus: r.app_status,
      badgeType: r.badge_type,
      assignedBy: r.assigned_by_email || r.assigned_by,
      reason: r.reason,
      expiresAt: r.expires_at,
      createdAt: r.created_at
    })),
    total,
    limit,
    offset
  }
})
