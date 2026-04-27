/**
 * PATCH /api/admin/reviews/:id
 * Approve, reject, or publish a review. Admin only.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

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
  const review = db.prepare(`SELECT id, app_id FROM reviews WHERE id = ?`).get(id) as { id: string; app_id: string } | undefined
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
  }

  return { id, status, message: `Review ${status}` }
})
