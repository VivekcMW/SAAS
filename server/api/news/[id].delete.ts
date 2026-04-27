/**
 * DELETE /api/news/:id
 * Vendor deletes their own draft or rejected post.
 */
import { createError, defineEventHandler, getRouterParams } from 'h3'
import { getDb } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })

  const db = getDb()
  const post = db.prepare("SELECT status FROM news_posts WHERE id = ? AND vendor_id = ?").get(id, vendor.id) as
    { status: string } | undefined

  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found or access denied' })
  if (post.status === 'published') throw createError({ statusCode: 400, statusMessage: 'Published posts cannot be deleted. Contact admin.' })

  db.prepare('DELETE FROM news_posts WHERE id = ? AND vendor_id = ?').run(id, vendor.id)

  return { success: true }
})
