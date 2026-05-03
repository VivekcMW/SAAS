/**
 * POST /api/vendor/reviews/:reviewId/reply
 * Lets an authenticated vendor submit or update their public reply to a review
 * on one of their own app listings. One reply per review (UPSERT).
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { getDb, makeId, logActivity } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  // Resolve the vendor profile
  const vendor = await getVendorProfileForUser(user.id)
  if (!vendor) {
    throw createError({ statusCode: 403, statusMessage: 'Vendor profile not found' })
  }

  const reviewId = getRouterParam(event, 'reviewId')
  if (!reviewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing reviewId' })
  }

  const body = await readBody(event)
  const body_text = typeof body?.body === 'string' ? body.body.trim() : ''

  if (!body_text) {
    throw createError({ statusCode: 400, statusMessage: 'Reply body is required' })
  }
  if (body_text.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Reply must be 2000 characters or fewer' })
  }

  // Confirm the review belongs to an app owned by this vendor
  const review = db.prepare(`
    SELECT r.id
    FROM reviews r
    JOIN app_listings a ON a.id = r.app_id
    WHERE r.id = ? AND a.vendor_id = ? AND r.status = 'approved'
  `).get(reviewId, vendor.id) as { id: string } | undefined

  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found or not owned by this vendor' })
  }

  const now = new Date().toISOString()

  // Upsert: one reply per review
  const existing = db.prepare(
    'SELECT id FROM review_replies WHERE review_id = ?'
  ).get(reviewId) as { id: string } | undefined

  if (existing) {
    db.prepare(
      'UPDATE review_replies SET body = ?, updated_at = ? WHERE id = ?'
    ).run(body_text, now, existing.id)
    logActivity({ actorId: user.id, actorEmail: user.email, action: 'review.reply_posted', entityType: 'review', entityId: reviewId })
    return { id: existing.id, action: 'updated', updatedAt: now }
  }

  const id = makeId('rr')
  db.prepare(`
    INSERT INTO review_replies (id, review_id, vendor_id, body, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, reviewId, vendor.id, body_text, now, now)

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'review.reply_posted', entityType: 'review', entityId: reviewId })

  return { id, action: 'created', createdAt: now }
})
