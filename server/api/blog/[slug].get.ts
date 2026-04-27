import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const slug = event.context.params?.slug as string

  const post = db.prepare(`
    SELECT id, slug, title, excerpt, category, author, author_title,
           read_minutes, image, tags, toc, content, published_at
    FROM blog_posts WHERE slug = ? AND status = 'published'
  `).get(slug) as any

  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  return {
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    toc: JSON.parse(post.toc || '[]')
  }
})
