/**
 * POST /api/apps/:id/reviews/:reviewId/reply
 * Vendor replies to a review. One reply per review; subsequent calls update it.
 */
import { defineEventHandler, getRouterParams, readBody } from 'h3'
import { getDb, makeId } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)

  if (!vendor) {
    throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })
  }

  const { id: appId, reviewId } = getRouterParams(event)
  if (!appId || !reviewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing app id or review id' })
  }

  const body = await readBody(event)
  const replyBody = typeof body?.body === 'string' ? body.body.trim() : ''

  if (!replyBody || replyBody.length < 2 || replyBody.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Reply must be between 2 and 2000 characters' })
  }

  const db = getDb()

  // Verify the review belongs to this vendor's app and is approved
  const review = db.prepare(`
    SELECT r.id FROM reviews r
    JOIN app_listings a ON a.id = r.app_id
    WHERE r.id = ? AND a.id = ? AND a.vendor_id = ? AND r.status = 'approved'
    LIMIT 1
  `).get(reviewId, appId, vendor.id) as { id: string } | undefined

  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found or access denied' })
  }

  const now = new Date().toISOString()

  const existing = db.prepare(
    'SELECT id FROM review_replies WHERE review_id = ? LIMIT 1'
  ).get(reviewId) as { id: string } | undefined

  if (existing) {
    db.prepare(
      'UPDATE review_replies SET body = ?, updated_at = ? WHERE id = ?'
    ).run(replyBody, now, existing.id)
    return { success: true, id: existing.id, body: replyBody, updated: true }
  }

  const id = makeId('rr')
  db.prepare(
    'INSERT INTO review_replies (id, review_id, vendor_id, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, reviewId, vendor.id, replyBody, now, now)

  return { success: true, id, body: replyBody, updated: false }
})
