/**
 * PUT /api/admin/blog/[id]
 * Updates a blog post. Admin only.
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

  const body = await readBody<{
    title?: string; excerpt?: string; category?: string; content?: string
    author?: string; author_title?: string; read_minutes?: number; image?: string
    tags?: string[]; status?: string; published_at?: string
  }>(event)

  const sets: string[] = []
  const vals: unknown[] = []

  const fields: Record<string, unknown> = {
    title: body.title, excerpt: body.excerpt, category: body.category,
    content: body.content, author: body.author, author_title: body.author_title,
    read_minutes: body.read_minutes, image: body.image, status: body.status,
    published_at: body.published_at,
  }
  if (body.tags !== undefined) { sets.push('tags = ?'); vals.push(JSON.stringify(body.tags)) }

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) { sets.push(`${key} = ?`); vals.push(val) }
  }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  sets.push('updated_at = ?')
  vals.push(new Date().toISOString())
  vals.push(id)

  db.prepare(`UPDATE blog_posts SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  return { ok: true }
})
