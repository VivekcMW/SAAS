/**
 * PUT /api/news/:id
 * Vendor updates their own post (only draft or submitted posts).
 * Also handles submitting for review: body.submit = true.
 */
import { createError, defineEventHandler, getRouterParams, readBody } from 'h3'
import { getDb } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

const VALID_TYPES = ['product-update', 'feature', 'culture', 'announcement', 'case-study'] as const

export default defineEventHandler(async (event) => {
  const user = requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })

  const db = getDb()
  const post = db.prepare("SELECT * FROM news_posts WHERE id = ? AND vendor_id = ?").get(id, vendor.id) as
    { id: string; status: string } | undefined

  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found or access denied' })
  if (post.status === 'published') throw createError({ statusCode: 400, statusMessage: 'Published posts cannot be edited directly' })

  const body = await readBody(event)
  const now = new Date().toISOString()
  const sets: string[] = ['updated_at = ?']
  const values: Array<string | number | null> = [now]

  if (typeof body.title === 'string' && body.title.trim()) { sets.push('title = ?'); values.push(body.title.trim()) }
  if (typeof body.excerpt === 'string') { sets.push('excerpt = ?'); values.push(body.excerpt.trim().slice(0, 300)) }
  if (typeof body.bodyMarkdown === 'string') { sets.push('body_markdown = ?'); values.push(body.bodyMarkdown.trim()) }
  if (VALID_TYPES.includes(body.postType)) { sets.push('post_type = ?'); values.push(body.postType) }
  if (typeof body.coverImage === 'string') { sets.push('cover_image = ?'); values.push(body.coverImage) }
  if (body.coverImage === null) { sets.push('cover_image = ?'); values.push(null) }

  // Submit for review
  if (body.submit === true && post.status === 'draft') {
    sets.push('status = ?')
    values.push('submitted')
  }

  values.push(id, vendor.id)
  db.prepare(`UPDATE news_posts SET ${sets.join(', ')} WHERE id = ? AND vendor_id = ?`).run(...values)

  // Sync tags if provided
  if (Array.isArray(body.tags)) {
    db.prepare('DELETE FROM news_post_tags WHERE post_id = ?').run(id)
    const insertTag = db.prepare('INSERT OR IGNORE INTO news_post_tags (post_id, tag) VALUES (?, ?)')
    for (const tag of body.tags.map(String).slice(0, 8)) {
      insertTag.run(id, tag.trim().toLowerCase().slice(0, 40))
    }
  }

  return { success: true }
})
