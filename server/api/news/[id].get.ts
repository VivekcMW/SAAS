/**
 * GET /api/news/:slug
 * Public single news post. Increments view_count.
 */
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getDb, type DbNewsPost } from '~/server/utils/database'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'id')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const db = getDb()

  const row = db.prepare(`
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
    WHERE np.slug = ? AND np.status = 'published'
  `).get(slug) as (DbNewsPost & {
    vendor_name: string; vendor_slug: string; author_name: string
    app_name: string | null; app_slug: string | null; app_logo: string | null
  }) | undefined

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  // Increment view count (fire-and-forget)
  db.prepare('UPDATE news_posts SET view_count = view_count + 1 WHERE id = ?').run(row.id)

  const tags = (db.prepare('SELECT tag FROM news_post_tags WHERE post_id = ?').all(row.id) as { tag: string }[]).map(t => t.tag)

  // Related posts from same vendor (max 3)
  const related = (db.prepare(`
    SELECT id, title, slug, post_type, excerpt, cover_image, published_at, upvote_count
    FROM news_posts WHERE vendor_id = ? AND id != ? AND status = 'published'
    ORDER BY published_at DESC LIMIT 3
  `).all(row.vendor_id, row.id) as Pick<DbNewsPost, 'id' | 'title' | 'slug' | 'post_type' | 'excerpt' | 'cover_image' | 'published_at' | 'upvote_count'>[])

  return {
    success: true,
    post: {
      id: row.id,
      postType: row.post_type,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      bodyMarkdown: row.body_markdown,
      coverImage: row.cover_image,
      featured: Boolean(row.featured),
      upvoteCount: row.upvote_count,
      viewCount: row.view_count + 1,
      publishedAt: row.published_at,
      tags,
      vendor: { id: row.vendor_id, name: row.vendor_name, slug: row.vendor_slug },
      authorName: row.author_name,
      app: row.app_id ? { id: row.app_id, name: row.app_name, slug: row.app_slug, logo: row.app_logo } : null,
      related
    }
  }
})
