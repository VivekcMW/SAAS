/**
 * PATCH /api/admin/reviews/[reviewId]/status
 * Approve or reject a review. Admin only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'
import { sendEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const reviewId = getRouterParam(event, 'reviewId')
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: 'Missing reviewId' })

  const body = await readBody(event)
  const status = String(body?.status ?? '')
  if (!['approved', 'rejected'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'status must be approved or rejected' })
  }

  const db = getDb()

  const review = db.prepare(`
    SELECT r.*, a.name AS app_name FROM reviews r
    LEFT JOIN app_listings a ON a.id = r.app_id
    WHERE r.id = ?
  `).get(reviewId) as any
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  db.prepare('UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, new Date().toISOString(), reviewId)

  logActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: `review.${status}`,
    entityType: 'review',
    entityId: reviewId,
  })

  // Notify reviewer if email is known
  if (review.user_email && status === 'approved') {
    await sendEmail({
      to: review.user_email,
      subject: `Your review for ${review.app_name} has been published`,
      html: `<p>Hi ${review.user_name},</p><p>Your review for <strong>${review.app_name}</strong> has been approved and is now live on Moonmart.</p><p>Thank you for contributing!</p>`,
    }).catch(() => {})
  }

  return { success: true, status }
})
