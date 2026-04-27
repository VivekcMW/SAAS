/**
 * POST /api/reviews/:id/flag
 * Flag a suspicious review.
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const VALID_REASONS = ['fake', 'spam', 'conflict_of_interest', 'offensive', 'other']

export default defineEventHandler(async (event) => {
  const reviewId = getRouterParam(event, 'id')
  const ip = getClientIp(event)

  if (!checkRateLimit(ip, { prefix: 'flag_review', limit: 10, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many flag requests.' })
  }

  const body = await readBody(event)
  const { flag_reason, details } = body || {}

  if (!VALID_REASONS.includes(flag_reason)) {
    throw createError({ statusCode: 400, statusMessage: `flag_reason must be one of: ${VALID_REASONS.join(', ')}` })
  }

  const db = getDb()
  const review = db.prepare(`SELECT id FROM reviews WHERE id = ?`).get(reviewId)
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  // One flag per IP per review
  const existingFlag = db.prepare(`SELECT id FROM review_flags WHERE review_id = ? AND reporter_key = ?`).get(reviewId, ip)
  if (existingFlag) throw createError({ statusCode: 409, statusMessage: 'Already flagged' })

  const id = makeId('flg')
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO review_flags (id, review_id, reporter_key, flag_reason, details, resolved, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(id, reviewId, ip, flag_reason, details?.trim() || null, now)

  db.prepare(`UPDATE reviews SET flag_count = flag_count + 1 WHERE id = ?`).run(reviewId)

  // Auto-hide if too many flags
  db.prepare(`
    UPDATE reviews SET status = 'flagged' WHERE id = ? AND flag_count >= 5 AND status = 'published'
  `).run(reviewId)

  return { message: 'Review flagged. Thank you for keeping Moonmart trustworthy.' }
})
