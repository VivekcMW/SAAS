/**
 * PUT /api/admin/reviews/[id]/status
 * Approve or reject a review.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'
import { sendEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: 'approved' | 'rejected'; adminNote?: string }>(event)
  if (!body?.status || !['approved', 'rejected'].includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'status must be "approved" or "rejected"' })
  }

  const db = getDb()
  const review = db.prepare('SELECT id, app_id, user_email, user_name, title, rating, status FROM reviews WHERE id = ?').get(id) as
    | { id: string; app_id: string; user_email: string | null; user_name: string; title: string; rating: number; status: string } | undefined
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  const now = new Date().toISOString()
  db.prepare('UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?').run(body.status, now, id)

  // Re-compute app rating if approved or un-approved
  const { avg, cnt } = db.prepare(`
    SELECT AVG(rating) as avg, COUNT(*) as cnt
    FROM reviews WHERE app_id = ? AND status = 'approved'
  `).get(review.app_id) as { avg: number; cnt: number }

  db.prepare('UPDATE app_listings SET rating = ?, review_count = ?, updated_at = ? WHERE id = ?')
    .run(Math.round((avg ?? 0) * 10) / 10, cnt ?? 0, now, review.app_id)

  // Notify the reviewer when their review goes live
  if (body.status === 'approved' && review.user_email) {
    const app = db.prepare('SELECT name FROM app_listings WHERE id = ?').get(review.app_id) as { name: string } | undefined
    sendEmail({
      to: review.user_email,
      subject: `Your review of ${app?.name ?? 'the app'} is live on Moonmart`,
      text: `Hi ${review.user_name},\n\nYour ${review.rating}-star review "${review.title}" has been approved and is now live on Moonmart.\n\nThank you for helping the community make better software decisions!\n\n— The Moonmart Team`
    }).catch(err => console.error('[reviews/status] reviewer notify failed:', err))
  }

  return { success: true, status: body.status }
})
