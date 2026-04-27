/**
 * PUT /api/admin/reviews/[id]/status
 * Approve or reject a review.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: 'approved' | 'rejected'; adminNote?: string }>(event)
  if (!body?.status || !['approved', 'rejected'].includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'status must be "approved" or "rejected"' })
  }

  const db = getDb()
  const review = db.prepare('SELECT id, app_id, status FROM reviews WHERE id = ?').get(id) as
    | { id: string; app_id: string; status: string } | undefined
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

  return { success: true, status: body.status }
})
