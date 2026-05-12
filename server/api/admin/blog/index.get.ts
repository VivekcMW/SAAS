/**
 * GET /api/admin/blog
 * Returns all blog posts (all statuses). Admin only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()
  const posts = db.prepare(`
    SELECT id, slug, title, excerpt, category, author, read_minutes, image, tags, content, status, published_at, created_at
    FROM blog_posts ORDER BY created_at DESC LIMIT 200
  `).all()
  return posts
})
