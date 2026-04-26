/**
 * GET /api/news
 * Public paginated news feed. Filterable by post_type, tag, vendor_id.
 */
import { defineEventHandler, getQuery } from 'h3'
import { getDb, type DbNewsPost } from '~/server/utils/database'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const page    = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(24, Math.max(1, Number(query.per_page) || 12))
  const offset  = (page - 1) * perPage
  const type    = typeof query.type === 'string' ? query.type : undefined
  const tag     = typeof query.tag === 'string' ? query.tag : undefined
  const vendorId = typeof query.vendor_id === 'string' ? query.vendor_id : undefined
  const appId   = typeof query.app_id === 'string' ? query.app_id : undefined
  const featured = query.featured === 'true'

  const db = getDb()
  const conditions = ["np.status = 'published'"]
  const params: Array<string | number> = []

  if (type) { conditions.push('np.post_type = ?'); params.push(type) }
  if (vendorId) { conditions.push('np.vendor_id = ?'); params.push(vendorId) }
  if (appId) { conditions.push('np.app_id = ?'); params.push(appId) }
  if (featured) { conditions.push('np.featured = 1') }
  if (tag) {
    conditions.push('EXISTS (SELECT 1 FROM news_post_tags nt WHERE nt.post_id = np.id AND nt.tag = ?)')
    params.push(tag)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const total = (db.prepare(
    `SELECT COUNT(*) as n FROM news_posts np ${where}`
  ).get(...params) as { n: number }).n

  const rows = db.prepare(`
    SELECT np.*,
           vp.company_name as vendor_name,
           vp.company_slug as vendor_slug,
           u.full_name as author_name,
           al.name as app_name,
           al.slug as app_slug,
           al.logo as app_logo
    FROM news_posts np
    JOIN vendor_profiles vp ON vp.id = np.vendor_id
    JOIN users u ON u.id = vp.user_id
    LEFT JOIN app_listings al ON al.id = np.app_id
    ${where}
    ORDER BY np.featured DESC, np.published_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, perPage, offset) as (DbNewsPost & {
    vendor_name: string; vendor_slug: string; author_name: string
    app_name: string | null; app_slug: string | null; app_logo: string | null
  })[]

  // Attach tags for each post
  const postIds = rows.map(r => r.id)
  const tagMap: Record<string, string[]> = {}
  if (postIds.length > 0) {
    const placeholders = postIds.map(() => '?').join(',')
    const tagRows = db.prepare(
      `SELECT post_id, tag FROM news_post_tags WHERE post_id IN (${placeholders})`
    ).all(...postIds) as { post_id: string; tag: string }[]
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
    featured: Boolean(r.featured),
    upvoteCount: r.upvote_count,
    viewCount: r.view_count,
    publishedAt: r.published_at,
    tags: tagMap[r.id] || [],
    vendor: { id: r.vendor_id, name: r.vendor_name, slug: r.vendor_slug },
    authorName: r.author_name,
    app: r.app_id ? { id: r.app_id, name: r.app_name, slug: r.app_slug, logo: r.app_logo } : null
  }))

  return { success: true, posts, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) }
})
