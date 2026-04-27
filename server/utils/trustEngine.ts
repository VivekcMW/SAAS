/**
 * Compute and cache Vendor Health Score.
 * score = (verified_pct × 0.4) + (response_rate × 0.3) + (freshness × 0.2) + (clean_flag_rate × 0.1)
 * All inputs are 0–1 floats, output is 0–100.
 */
import { getDb, makeId } from './database'

export interface HealthScoreBreakdown {
  verified_pct: number
  response_rate: number
  review_velocity: number
  flagged_count: number
  avg_rating: number
  review_count: number
  score: number
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  computed_at: string
}

export function computeVendorHealthScore(vendorId: string): HealthScoreBreakdown {
  const db = getDb()

  // All published app_listings for this vendor
  const apps = db.prepare(`
    SELECT id FROM app_listings WHERE vendor_id = ? AND status = 'published'
  `).all(vendorId) as { id: string }[]

  const appIds = apps.map(a => a.id)
  if (!appIds.length) {
    return emptyScore(vendorId)
  }

  const placeholders = appIds.map(() => '?').join(',')

  // Review aggregates
  const reviewStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN purchase_verified = 1 THEN 1 ELSE 0 END) as verified,
      SUM(CASE WHEN flag_count > 0 THEN 1 ELSE 0 END) as flagged,
      AVG(rating) as avg_rating,
      SUM(CASE WHEN created_at > datetime('now', '-30 days') THEN 1 ELSE 0 END) as recent
    FROM reviews
    WHERE app_id IN (${placeholders}) AND status = 'published'
  `).get(...appIds) as { total: number; verified: number; flagged: number; avg_rating: number; recent: number }

  const total = reviewStats.total || 0
  const verified = reviewStats.verified || 0
  const flagged = reviewStats.flagged || 0
  const avgRating = reviewStats.avg_rating || 0
  const recentCount = reviewStats.recent || 0

  // Enquiry response rate (responded enquiries / total enquiries)
  const enquiryStats = db.prepare(`
    SELECT
      COUNT(DISTINCT e.id) as total,
      COUNT(DISTINCT CASE WHEN em.id IS NOT NULL THEN e.id END) as responded
    FROM enquiries e
    LEFT JOIN enquiry_messages em ON em.enquiry_id = e.id AND em.sender_role = 'vendor'
    WHERE e.app_id IN (${placeholders})
  `).get(...appIds) as { total: number; responded: number }

  const enquiryTotal = enquiryStats.total || 0
  const responseRate = enquiryTotal > 0 ? enquiryStats.responded / enquiryTotal : 0.5 // default 50% if no enquiries

  // Compute components (all 0–1)
  const verifiedPct = total > 0 ? verified / total : 0
  const flagRate = total > 0 ? flagged / total : 0
  const cleanFlagRate = 1 - Math.min(flagRate, 1)
  // Freshness: reviews in last 30 days / max(total,1), capped at 1
  const freshness = Math.min(recentCount / Math.max(total, 1), 1)

  const score =
    verifiedPct * 40 +
    responseRate * 30 +
    freshness * 20 +
    cleanFlagRate * 10

  const now = new Date().toISOString()

  // Upsert into vendor_health_scores
  const existing = db.prepare(`SELECT id FROM vendor_health_scores WHERE vendor_id = ?`).get(vendorId) as { id: string } | undefined
  if (existing) {
    db.prepare(`
      UPDATE vendor_health_scores SET
        response_rate = ?, avg_rating = ?, review_count = ?, review_velocity = ?,
        flagged_count = ?, verified_pct = ?, score = ?, computed_at = ?
      WHERE vendor_id = ?
    `).run(responseRate, avgRating, total, recentCount, flagged, verifiedPct, score, now, vendorId)
  } else {
    db.prepare(`
      INSERT INTO vendor_health_scores
        (id, vendor_id, response_rate, avg_rating, review_count, review_velocity, flagged_count, verified_pct, score, computed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(makeId('vhs'), vendorId, responseRate, avgRating, total, recentCount, flagged, verifiedPct, score, now)
  }

  return {
    verified_pct: verifiedPct,
    response_rate: responseRate,
    review_velocity: recentCount,
    flagged_count: flagged,
    avg_rating: avgRating,
    review_count: total,
    score: Math.round(score * 10) / 10,
    label: scoreLabel(score),
    computed_at: now
  }
}

function scoreLabel(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

function emptyScore(vendorId: string): HealthScoreBreakdown {
  return {
    verified_pct: 0, response_rate: 0, review_velocity: 0,
    flagged_count: 0, avg_rating: 0, review_count: 0,
    score: 0, label: 'Poor', computed_at: new Date().toISOString()
  }
}

/**
 * Compute an authenticity score (0–1) for a single review.
 * Used at submission time and stored in reviews.authenticity_score.
 */
export function computeReviewAuthenticity(opts: {
  purchaseVerified: boolean
  hasTitle: boolean
  bodyLength: number
  hasPros: boolean
  hasCons: boolean
  hasUseCase: boolean
  hasUserRole: boolean
  hasCompanySize: boolean
}): number {
  let score = 0
  if (opts.purchaseVerified) score += 0.40
  if (opts.bodyLength >= 100) score += 0.15
  else if (opts.bodyLength >= 50) score += 0.08
  if (opts.hasPros) score += 0.10
  if (opts.hasCons) score += 0.10
  if (opts.hasUseCase) score += 0.10
  if (opts.hasUserRole) score += 0.08
  if (opts.hasCompanySize) score += 0.07
  return Math.min(score, 1)
}
