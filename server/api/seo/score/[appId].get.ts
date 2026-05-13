/**
 * GET /api/seo/score/[appId]
 *
 * Returns the SEO score and breakdown for an app.
 * Accessible by the owning vendor or any admin.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'
import { computeAppSeoScore, upsertAppSeoMeta } from '~/server/utils/seoEngine'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const appId = getRouterParam(event, 'appId') || ''
  const db = getDb()

  // Verify access
  const app = db.prepare('SELECT id, name, slug, vendor_id FROM app_listings WHERE id = ?').get(appId) as { id: string; name: string; slug: string; vendor_id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })
  if (app.vendor_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // Get stored meta or compute on demand
  let meta = db.prepare('SELECT * FROM app_seo_meta WHERE app_id = ?').get(appId) as Record<string, unknown> | undefined
  if (!meta || !meta.last_scored_at) {
    const { score, breakdown } = computeAppSeoScore(appId)
    upsertAppSeoMeta(appId, {
      seo_score: score,
      score_breakdown: JSON.stringify(breakdown),
      last_scored_at: new Date().toISOString(),
    })
    meta = db.prepare('SELECT * FROM app_seo_meta WHERE app_id = ?').get(appId) as Record<string, unknown>
  }

  const breakdown = meta?.score_breakdown ? JSON.parse(meta.score_breakdown as string) : {}
  const score = Number(meta?.seo_score || 0)

  // Generate actionable suggestions
  const suggestions: string[] = []
  if ((breakdown.title || 0) < 10) suggestions.push('Add a custom SEO title (50–70 chars)')
  if ((breakdown.description || 0) < 10) suggestions.push('Write a meta description (140–165 chars)')
  if ((breakdown.faq || 0) < 10) suggestions.push('Add at least 3 FAQ pairs to your listing')
  if ((breakdown.reviews || 0) < 5) suggestions.push('Encourage customers to leave reviews')
  if ((breakdown.pageSpeed || 0) < 10) suggestions.push('Improve page speed score (target 90+)')

  return {
    appId,
    appName: app.name,
    score,
    label: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work',
    breakdown,
    suggestions,
    lastScoredAt: meta?.last_scored_at || null,
  }
})
