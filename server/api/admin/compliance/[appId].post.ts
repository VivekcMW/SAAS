/**
 * POST /api/admin/compliance/[appId]
 * Admin-only: upsert a compliance badge for an app.
 * Body: { badgeType, region, status?, verifiedAt?, sourceUrl? }
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

const VALID_BADGES = ['gdpr', 'dpiit', 'mas', 'soc2', 'iso27001', 'hipaa', 'ccpa', 'pdpa']
const VALID_REGIONS = ['global', 'eu', 'india', 'singapore', 'us', 'uk', 'apac']
const VALID_STATUSES = ['verified', 'pending', 'expired', 'not_applicable']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const appId = getRouterParam(event, 'appId')
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'appId is required' })

  const body = await readBody<{
    badgeType?: string
    region?: string
    status?: string
    verifiedAt?: string
    sourceUrl?: string
  }>(event)

  const badgeType = body?.badgeType?.toLowerCase()
  const region = body?.region?.toLowerCase() ?? 'global'
  const status = body?.status ?? 'verified'

  if (!badgeType || !VALID_BADGES.includes(badgeType)) {
    throw createError({ statusCode: 400, statusMessage: `badgeType must be one of: ${VALID_BADGES.join(', ')}` })
  }
  if (!VALID_REGIONS.includes(region)) {
    throw createError({ statusCode: 400, statusMessage: `region must be one of: ${VALID_REGIONS.join(', ')}` })
  }
  if (!VALID_STATUSES.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const db = getDb()

  // Verify app exists
  const app = db.prepare(`SELECT id FROM app_listings WHERE id = ? LIMIT 1`).get(appId)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App listing not found' })

  const id = `badge_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO vendor_compliance_badges (id, app_id, badge_type, region, status, verified_at, source_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(app_id, badge_type, region) DO UPDATE SET
      status = excluded.status,
      verified_at = excluded.verified_at,
      source_url = excluded.source_url
  `).run(id, appId, badgeType, region, status, body?.verifiedAt ?? now, body?.sourceUrl ?? null, now)

  // Recalculate compliance_score for the app
  const verifiedCount = (db.prepare(`SELECT COUNT(*) AS n FROM vendor_compliance_badges WHERE app_id = ? AND status = 'verified'`).get(appId) as { n: number }).n
  const totalCount = (db.prepare(`SELECT COUNT(*) AS n FROM vendor_compliance_badges WHERE app_id = ?`).get(appId) as { n: number }).n
  const score = totalCount > 0 ? verifiedCount / totalCount : 0
  db.prepare(`UPDATE app_listings SET compliance_score = ? WHERE id = ?`).run(score, appId)

  return { success: true, appId, badgeType, region, status }
})
