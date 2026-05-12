/**
 * POST /api/admin/blog
 * Creates a new blog post. Admin only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{
    title?: string; excerpt?: string; category?: string; content?: string
    author?: string; author_title?: string; read_minutes?: number; image?: string
    tags?: string[]; status?: string; published_at?: string
  }>(event)

  if (!body?.title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })
  if (!body.excerpt?.trim()) throw createError({ statusCode: 400, statusMessage: 'excerpt is required' })
  if (!body.category?.trim()) throw createError({ statusCode: 400, statusMessage: 'category is required' })

  const db = getDb()
  const id = makeId('blog')
  const now = new Date().toISOString()

  let slug = slugify(body.title)
  // Ensure unique slug
  const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug)
  if (existing) slug = `${slug}-${id.slice(-6)}`

  db.prepare(`
    INSERT INTO blog_posts (id, slug, title, excerpt, category, content, author, author_title, read_minutes, image, tags, status, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, slug, body.title.trim(), body.excerpt.trim(), body.category.trim(),
    body.content ?? '', body.author ?? 'Moonmart Editorial',
    body.author_title ?? null, body.read_minutes ?? 8, body.image ?? null,
    JSON.stringify(body.tags ?? []),
    body.status ?? 'draft',
    body.published_at ?? now, now, now
  )

  return { ok: true, id, slug }
})
