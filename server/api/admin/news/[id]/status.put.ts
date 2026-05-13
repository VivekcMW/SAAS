/**
 * PUT /api/admin/news/:id/status
 * Admin approves or rejects a news post.
 * Body: { status: 'published' | 'rejected', adminNote?: string, featured?: boolean }
 */
import { createError, defineEventHandler, getRouterParams, readBody } from 'h3'
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

const ALLOWED = ['published', 'rejected'] as const

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })

  const db = getDb()
  const post = db.prepare("SELECT id, status FROM news_posts WHERE id = ?").get(id) as
    { id: string; status: string } | undefined
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  const body = await readBody(event)
  const newStatus = body.status
  if (!ALLOWED.includes(newStatus)) throw createError({ statusCode: 400, statusMessage: `status must be one of: ${ALLOWED.join(', ')}` })

  const now = new Date().toISOString()
  const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() : null
  let featured: number | undefined
  if (typeof body.featured === 'boolean') {
    featured = body.featured ? 1 : 0
  }

  const sets = ['status = ?', 'admin_note = ?', 'updated_at = ?']
  const values: Array<string | number | null> = [newStatus, adminNote, now]

  if (newStatus === 'published') {
    sets.push('published_at = ?')
    values.push(now)
  }
  if (featured !== undefined) {
    sets.push('featured = ?')
    values.push(featured)
  }

  values.push(id)
  db.prepare(`UPDATE news_posts SET ${sets.join(', ')} WHERE id = ?`).run(...values)

  return { success: true }
})
