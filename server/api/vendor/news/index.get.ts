/**
 * GET /api/vendor/news
 * Vendor sees their own posts (all statuses), paginated.
 */
import { defineEventHandler, getQuery } from 'h3'
import { getDb, type DbNewsPost } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)

  const query = getQuery(event)
  const page    = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(50, Math.max(1, Number(query.per_page) || 20))
  const offset  = (page - 1) * perPage
  const status  = typeof query.status === 'string' ? query.status : undefined

  if (!vendor) return { success: true, posts: [], total: 0, page: 1, perPage, totalPages: 1 }

  const db = getDb()
  const conditions = ['np.vendor_id = ?']
  const params: Array<string | number> = [vendor.id]

  if (status && ['draft', 'submitted', 'published', 'rejected'].includes(status)) {
    conditions.push('np.status = ?')
    params.push(status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const total = (db.prepare(`SELECT COUNT(*) as n FROM news_posts np ${where}`).get(...params) as { n: number }).n

  const rows = db.prepare(`
    SELECT np.*, al.name as app_name, al.slug as app_slug
    FROM news_posts np
    LEFT JOIN app_listings al ON al.id = np.app_id
    ${where}
    ORDER BY np.updated_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, perPage, offset) as (DbNewsPost & { app_name: string | null; app_slug: string | null })[]

  const postIds = rows.map(r => r.id)
  const tagMap: Record<string, string[]> = {}
  if (postIds.length > 0) {
    const placeholders = postIds.map(() => '?').join(',')
    const tagRows = db.prepare(`SELECT post_id, tag FROM news_post_tags WHERE post_id IN (${placeholders})`).all(...postIds) as { post_id: string; tag: string }[]
    for (const t of tagRows) {
      if (!tagMap[t.post_id]) tagMap[t.post_id] = []
      tagMap[t.post_id].push(t.tag)
    }
  }

  const posts = rows.map(r => ({
    id: r.id,
    postType: r.post_type,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    coverImage: r.cover_image,
    status: r.status,
    featured: Boolean(r.featured),
    upvoteCount: r.upvote_count,
    viewCount: r.view_count,
    publishedAt: r.published_at,
    adminNote: r.admin_note,
    tags: tagMap[r.id] || [],
    app: r.app_id ? { id: r.app_id, name: r.app_name, slug: r.app_slug } : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }))

  return { success: true, posts, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) }
})
