/**
 * POST /api/admin/badges/assign
 * Assign or remove a badge from an app listing. Admin-only.
 * Body: { appId, badgeType, action: 'assign'|'remove', reason?, expiresAt? }
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, makeId, logActivity } from '~/server/utils/database'

const VALID_BADGE_TYPES = ['editor_choice', 'trending', 'popular', 'highly_rated', 'new', 'featured', 'verified', 'top_rated']
const VALID_ACTIONS = ['assign', 'remove']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{ appId?: string; badgeType?: string; action?: string; reason?: string; expiresAt?: string }>(event)

  if (!body?.appId || !body?.badgeType || !body?.action) {
    throw createError({ statusCode: 400, statusMessage: 'appId, badgeType, and action are required' })
  }
  if (!VALID_BADGE_TYPES.includes(body.badgeType)) {
    throw createError({ statusCode: 400, statusMessage: `badgeType must be one of: ${VALID_BADGE_TYPES.join(', ')}` })
  }
  if (!VALID_ACTIONS.includes(body.action)) {
    throw createError({ statusCode: 400, statusMessage: 'action must be "assign" or "remove"' })
  }

  const db = getDb()
  const app = db.prepare('SELECT id, name FROM app_listings WHERE id = ?').get(body.appId) as { id: string; name: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App listing not found' })

  if (body.action === 'assign') {
    const id = makeId('badge')
    db.prepare(`
      INSERT INTO app_badges (id, app_id, badge_type, assigned_by, reason, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(app_id, badge_type) DO UPDATE SET
        assigned_by = excluded.assigned_by,
        reason = excluded.reason,
        expires_at = excluded.expires_at,
        created_at = datetime('now')
    `).run(id, body.appId, body.badgeType, admin.id, body.reason ?? null, body.expiresAt ?? null)
  } else {
    db.prepare('DELETE FROM app_badges WHERE app_id = ? AND badge_type = ?').run(body.appId, body.badgeType)
  }

  logActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: `badge.${body.action}`,
    entityType: 'listing',
    entityId: body.appId,
    meta: { appName: app.name, badgeType: body.badgeType, reason: body.reason }
  })

  return { success: true, action: body.action, appId: body.appId, badgeType: body.badgeType }
})
