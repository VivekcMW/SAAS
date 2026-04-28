/**
 * GET /api/compliance/[appId]
 * Returns compliance badges for an app, grouped by region.
 * Public — no auth required.
 */
import { getDb } from '~/server/utils/database'

interface BadgeRow {
  id: string
  badge_type: string
  region: string
  status: string
  verified_at: string | null
  source_url: string | null
}

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'appId')
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'appId is required' })

  const db = getDb()

  const badges = db.prepare(`
    SELECT id, badge_type, region, status, verified_at, source_url
    FROM vendor_compliance_badges
    WHERE app_id = ?
    ORDER BY region, badge_type
  `).all(appId) as BadgeRow[]

  // Group by region
  const grouped: Record<string, BadgeRow[]> = {}
  for (const b of badges) {
    if (!grouped[b.region]) grouped[b.region] = []
    grouped[b.region].push(b)
  }

  // Compute compliance score: verified badges / max possible (8 badge types)
  const verifiedCount = badges.filter(b => b.status === 'verified').length
  const score = badges.length > 0 ? Math.round((verifiedCount / Math.max(badges.length, 1)) * 100) : null

  return { appId, badges, grouped, score, total: badges.length }
})
