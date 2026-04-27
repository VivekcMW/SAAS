import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 12, 50)
  const offset = (page - 1) * limit

  let where = `WHERE status = 'published'`
  const params: any[] = []
  if (category && category !== 'all') {
    where += ` AND category = ?`
    params.push(category)
  }

  const total = (db.prepare(`SELECT COUNT(*) as n FROM blog_posts ${where}`).get(...params) as any).n
  const posts = db.prepare(`
    SELECT id, slug, title, excerpt, category, author, author_title,
           read_minutes, image, tags, published_at
    FROM blog_posts ${where}
    ORDER BY published_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as any[]

  return {
    posts: posts.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })),
    total,
    page,
    pages: Math.ceil(total / limit)
  }
})
