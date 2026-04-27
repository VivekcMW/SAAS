/**
 * GET /api/vendor/health-score
 * Returns the Vendor Health Score for the current vendor.
 */
import { requireVendor } from '~/server/utils/auth'
import { computeVendorHealthScore } from '~/server/utils/trustEngine'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const profile = db.prepare(`SELECT id FROM vendor_profiles WHERE user_id = ?`).get(user.id) as { id: string } | undefined
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  // Check if cached and recent (< 1 hour)
  const cached = db.prepare(`
    SELECT * FROM vendor_health_scores
    WHERE vendor_id = ? AND computed_at > datetime('now', '-1 hour')
  `).get(profile.id) as Record<string, unknown> | undefined

  if (cached) {
    return {
      ...cached,
      label: scoreLabel(cached.score as number),
      algorithm_url: '/trust/review-algorithm'
    }
  }

  const score = computeVendorHealthScore(profile.id)
  return { ...score, algorithm_url: '/trust/review-algorithm' }
})

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}
