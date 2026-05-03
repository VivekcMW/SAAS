/**
 * PATCH /api/admin/reviews/:id
 * Approve, reject, or publish a review. Admin only.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'
import { sendEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status, admin_note } = body || {}

  const VALID = ['published', 'rejected', 'pending']
  if (!VALID.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${VALID.join(', ')}` })
  }

  const db = getDb()
  const review = db.prepare(`
    SELECT r.id, r.app_id, r.user_email, r.user_name, r.title, r.rating, a.name AS app_name, a.slug AS app_slug
    FROM reviews r
    LEFT JOIN app_listings a ON a.id = r.app_id
    WHERE r.id = ?
  `).get(id) as { id: string; app_id: string; user_email: string | null; user_name: string; title: string; rating: number; app_name: string; app_slug: string } | undefined
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  db.prepare(`UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?`).run(status, new Date().toISOString(), id)

  // Resolve open flags if published or rejected
  if (status !== 'pending') {
    db.prepare(`UPDATE review_flags SET resolved = 1 WHERE review_id = ?`).run(id)
  }

  // Recompute app rating when published
  if (status === 'published') {
    const stats = db.prepare(`
      SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE app_id = ? AND status = 'published'
    `).get(review.app_id) as { avg: number; cnt: number }
    db.prepare(`UPDATE app_listings SET rating = ?, review_count = ?, updated_at = ? WHERE id = ?`)
      .run(Math.round((stats.avg || 0) * 10) / 10, stats.cnt, new Date().toISOString(), review.app_id)

    // Notify the reviewer by email
    if (review.user_email) {
      const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
      sendEmail({
        to: review.user_email,
        subject: `Your review of ${review.app_name} is now live`,
        text: `Hi ${review.user_name},

Great news! Your ${review.rating}-star review of ${review.app_name} has been approved and is now live on Moonmart.

View your review: ${baseUrl}/app/${review.app_slug}

Thank you for helping the community make better software decisions.

— The Moonmart Team
`
      }).catch(err => console.error('[admin/reviews] reviewer notification failed:', err))
    }
  }

  if (status === 'rejected' && review.user_email) {
    sendEmail({
      to: review.user_email,
      subject: `Update on your review of ${review.app_name}`,
      text: `Hi ${review.user_name},

Your review of ${review.app_name} was not approved at this time.${admin_note ? `\n\nReason: ${admin_note}` : ''}

If you think this was a mistake, please contact our support team.

— The Moonmart Team
`
    }).catch(err => console.error('[admin/reviews] rejection notification failed:', err))
  }

  return { id, status, message: `Review ${status}` }
})
