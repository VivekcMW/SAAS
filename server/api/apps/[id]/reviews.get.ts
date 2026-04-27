/**
 * GET /api/apps/:id/reviews
 * Paginated reviews for a published app, with authenticity score.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(20, parseInt(query.limit as string) || 10)
  const offset = (page - 1) * limit
  const sort = (query.sort as string) || 'recent' // recent | helpful | highest | lowest | verified
  const verifiedOnly = query.verified === '1' || query.verified === 'true'

  const db = getDb()

  const app = db.prepare(`SELECT id, rating, review_count FROM app_listings WHERE id = ? AND status = 'published'`).get(appId) as { id: string; rating: number; review_count: number } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const whereExtra = verifiedOnly ? `AND purchase_verified = 1` : ''

  const orderMap: Record<string, string> = {
    recent: 'created_at DESC',
    helpful: 'helpful_votes DESC, created_at DESC',
    highest: 'rating DESC, created_at DESC',
    lowest: 'rating ASC, created_at DESC',
    verified: 'purchase_verified DESC, authenticity_score DESC, created_at DESC'
  }
  const orderBy = orderMap[sort] || orderMap.recent

  const reviews = db.prepare(`
    SELECT id, user_name, rating, title, content, pros, cons, use_case, user_role,
           company_size, outcome_metric, purchase_verified, authenticity_score,
           helpful_votes, flag_count, created_at
    FROM reviews
    WHERE app_id = ? AND status = 'published' ${whereExtra}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(appId, limit, offset) as any[]

  const { total } = db.prepare(`
    SELECT COUNT(*) as total FROM reviews
    WHERE app_id = ? AND status = 'published' ${whereExtra}
  `).get(appId) as { total: number }

  // Distribution
  const dist = db.prepare(`
    SELECT rating, COUNT(*) as count FROM reviews
    WHERE app_id = ? AND status = 'published'
    GROUP BY rating
  `).all(appId) as { rating: number; count: number }[]

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  for (const d of dist) distribution[d.rating] = d.count

  const parsed = reviews.map(r => ({
    ...r,
    pros: safeJson(r.pros, []),
    cons: safeJson(r.cons, []),
    authenticity_label: authenticityLabel(r.authenticity_score),
    authenticity_score: Math.round((r.authenticity_score || 0) * 100)
  }))

  return {
    reviews: parsed,
    total,
    page,
    pages: Math.ceil(total / limit),
    distribution,
    app_rating: app.rating,
    app_review_count: app.review_count
  }
})

function safeJson(v: unknown, fallback: unknown) {
  if (!v) return fallback
  try { return JSON.parse(v as string) } catch { return fallback }
}

function authenticityLabel(score: number | null): string {
  if (score === null || score === undefined) return 'unverified'
  if (score >= 0.8) return 'highly-verified'
  if (score >= 0.5) return 'verified'
  if (score >= 0.3) return 'basic'
  return 'unverified'
}
