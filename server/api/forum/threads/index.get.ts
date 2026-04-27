/**
 * GET /api/forum/threads
 * List forum threads, paginated, optionally filtered by category.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = (query.category as string) || ''
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, parseInt(query.limit as string) || 20)
  const offset = (page - 1) * limit

  const db = getDb()
  const where = category ? `WHERE category = ?` : ``
  const params: unknown[] = category ? [category, limit, offset] : [limit, offset]
  const countParams: unknown[] = category ? [category] : []

  const threads = db.prepare(`
    SELECT id, author_name, title, category, pinned, locked,
           reply_count, view_count, last_reply_at, created_at
    FROM forum_threads
    ${where}
    ORDER BY pinned DESC, last_reply_at DESC
    LIMIT ? OFFSET ?
  `).all(...params)

  const { total } = db.prepare(`
    SELECT COUNT(*) as total FROM forum_threads ${where}
  `).get(...countParams) as { total: number }

  return { threads, total, page, pages: Math.ceil(total / limit) }
})
