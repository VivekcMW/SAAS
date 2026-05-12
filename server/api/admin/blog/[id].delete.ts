/**
 * DELETE /api/admin/blog/[id]
 * Deletes a blog post. Admin only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = getDb()
  const post = db.prepare('SELECT id FROM blog_posts WHERE id = ?').get(id)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id)
  return { ok: true }
})
