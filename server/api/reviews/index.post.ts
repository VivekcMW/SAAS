/**
 * POST /api/reviews
 * Submit a review for an app.
 * Optionally verified via a proof-of-use token (verified_purchase_token).
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { computeReviewAuthenticity } from '~/server/utils/trustEngine'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'post_review', limit: 3, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many review submissions. Try again later.' })
  }

  const body = await readBody(event)
  const {
    app_id, rating, title, content, pros, cons,
    use_case, user_role, company_size, outcome_metric,
    verified_purchase_token, author_name, author_email
  } = body || {}

  if (!app_id) throw createError({ statusCode: 400, statusMessage: 'app_id is required' })
  if (!rating || rating < 1 || rating > 5) throw createError({ statusCode: 400, statusMessage: 'rating must be 1–5' })
  if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })
  if (!content?.trim() || content.trim().length < 20) {
    throw createError({ statusCode: 400, statusMessage: 'content must be at least 20 characters' })
  }

  const db = getDb()

  // Validate app exists
  const app = db.prepare(`SELECT id FROM app_listings WHERE id = ? AND status = 'published'`).get(app_id)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const user = await getSessionUser(event).catch(() => null)
  const now = new Date().toISOString()

  // Check for verified purchase token
  let purchaseVerified = false
  let verifiedPurchaseId: string | null = null
  if (verified_purchase_token) {
    const vp = db.prepare(`
      SELECT id FROM verified_purchases
      WHERE token = ? AND app_id = ? AND used = 0 AND expires_at > ?
    `).get(verified_purchase_token, app_id, now) as { id: string } | undefined
    if (vp) {
      purchaseVerified = true
      verifiedPurchaseId = vp.id
      db.prepare(`UPDATE verified_purchases SET used = 1 WHERE id = ?`).run(vp.id)
    }
  }

  // Compute authenticity score
  const prosArr = Array.isArray(pros) ? pros : (pros ? [pros] : [])
  const consArr = Array.isArray(cons) ? cons : (cons ? [cons] : [])
  const authenticityScore = computeReviewAuthenticity({
    purchaseVerified,
    hasTitle: !!title.trim(),
    bodyLength: content.trim().length,
    hasPros: prosArr.length > 0,
    hasCons: consArr.length > 0,
    hasUseCase: !!use_case?.trim(),
    hasUserRole: !!user_role?.trim(),
    hasCompanySize: !!company_size?.trim()
  })

  const id = makeId('rev')
  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : (author_name?.trim() || 'Anonymous')

  db.prepare(`
    INSERT INTO reviews (
      id, app_id, user_id, user_name, user_email, rating, title, content,
      pros, cons, use_case, user_role, company_size, outcome_metric,
      purchase_verified, verified_purchase_id, authenticity_score,
      verified, helpful_votes, flag_count, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      0, 0, 0, 'pending', ?, ?
    )
  `).run(
    id, app_id, user?.id || null, displayName, user?.email || author_email?.trim() || null,
    Math.round(rating), title.trim(), content.trim(),
    JSON.stringify(prosArr), JSON.stringify(consArr),
    use_case?.trim() || null, user_role?.trim() || null, company_size?.trim() || null,
    outcome_metric?.trim() || null,
    purchaseVerified ? 1 : 0, verifiedPurchaseId,
    authenticityScore, now, now
  )

  return {
    id,
    message: 'Review submitted and pending moderation.',
    authenticity_score: authenticityScore,
    purchase_verified: purchaseVerified
  }
})
