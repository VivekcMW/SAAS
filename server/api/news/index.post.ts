/**
 * POST /api/news
 * Vendor creates a news post (starts as draft).
 */
import { createError, defineEventHandler, readBody } from 'h3'
import { getDb, makeId, makeSlug } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

const VALID_TYPES = ['product-update', 'feature', 'culture', 'announcement', 'case-study'] as const

export default defineEventHandler(async (event) => {
  const user = requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const body = await readBody(event)

  const title     = typeof body.title === 'string' ? body.title.trim() : ''
  const excerpt   = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const bodyMd    = typeof body.bodyMarkdown === 'string' ? body.bodyMarkdown.trim() : ''
  const postType  = VALID_TYPES.includes(body.postType) ? body.postType : 'announcement'

  if (!title) throw createError({ statusCode: 400, statusMessage: 'title is required' })
  if (!excerpt) throw createError({ statusCode: 400, statusMessage: 'excerpt is required' })
  if (!bodyMd) throw createError({ statusCode: 400, statusMessage: 'bodyMarkdown is required' })

  const db = getDb()
  const now = new Date().toISOString()
  const id = makeId('news')

  // Ensure unique slug
  let baseSlug = makeSlug(title)
  let slug = baseSlug
  let attempt = 0
  while (db.prepare('SELECT id FROM news_posts WHERE slug = ?').get(slug)) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  // Validate optional app_id belongs to this vendor
  const appId = typeof body.appId === 'string' ? body.appId : null
  if (appId) {
    const app = db.prepare('SELECT id FROM app_listings WHERE id = ? AND vendor_id = ?').get(appId, vendor.id)
    if (!app) throw createError({ statusCode: 400, statusMessage: 'Invalid appId — must belong to your listings' })
  }

  db.prepare(`
    INSERT INTO news_posts (id, vendor_id, app_id, post_type, title, slug, excerpt, body_markdown,
      cover_image, status, featured, view_count, upvote_count, published_at, admin_note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, 0, 0, NULL, NULL, ?, ?)
  `).run(id, vendor.id, appId, postType, title, slug,
    excerpt.slice(0, 300), bodyMd,
    typeof body.coverImage === 'string' ? body.coverImage : null,
    now, now)

  // Insert tags
  const tags: string[] = Array.isArray(body.tags) ? body.tags.map(String).slice(0, 8) : []
  const insertTag = db.prepare('INSERT OR IGNORE INTO news_post_tags (post_id, tag) VALUES (?, ?)')
  for (const tag of tags) {
    insertTag.run(id, tag.trim().toLowerCase().slice(0, 40))
  }

  return { success: true, id, slug }
})
