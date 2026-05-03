/**
 * POST /api/reviews/[id]/reply
 * Vendor publishes a reply to a review on their listing.
 * One reply per review (upsert: vendors can update their reply).
 */
import { getDb, makeId } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const reviewId = getRouterParam(event, 'id')
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: 'Review id is required' })

  if (!checkRateLimit(getClientIp(event), { prefix: 'review-reply', limit: 20, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const body = await readBody<{ body?: string }>(event)
  const replyBody = body?.body?.trim()
  if (!replyBody || replyBody.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Reply must be at least 5 characters.' })
  }
  if (replyBody.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Reply must be 2000 characters or fewer.' })
  }

  const db = getDb()
  const vendor = await getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 403, statusMessage: 'Vendor profile not found' })

  // Verify the review is for one of this vendor's apps
  const review = db.prepare(`
    SELECT r.id, r.user_email, r.user_name, a.name AS app_name
    FROM reviews r
    INNER JOIN app_listings a ON a.id = r.app_id
    WHERE r.id = ? AND a.vendor_id = ? AND r.status = 'published'
  `).get(reviewId, vendor.id) as { id: string; user_email: string | null; user_name: string; app_name: string } | undefined
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found on your listings' })

  const now = new Date().toISOString()

  // Upsert — vendor can edit their reply
  const existing = db.prepare(`SELECT id FROM review_replies WHERE review_id = ?`).get(reviewId) as { id: string } | undefined
  if (existing) {
    db.prepare(`UPDATE review_replies SET body = ?, updated_at = ? WHERE review_id = ?`)
      .run(replyBody, now, reviewId)
    return { id: existing.id, updated: true }
  }

  const replyId = makeId('rreply')
  db.prepare(`
    INSERT INTO review_replies (id, review_id, vendor_id, body, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(replyId, reviewId, vendor.id, replyBody, now, now)

  return { id: replyId, updated: false }
})
