/**
 * POST /api/apps/suggest
 * Suggest a URL for the auto-discovery pipeline.
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 5, windowMs: 60 * 60 * 1000, prefix: 'suggest' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many suggestions. Please try again later.' })
  }

  const body = await readBody<{ url?: string; submittedBy?: string }>(event)

  const url = body?.url?.trim()
  if (!url?.startsWith('http')) {
    throw createError({ statusCode: 400, statusMessage: 'A valid URL is required.' })
  }

  if (url.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'URL too long.' })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM discovery_queue WHERE website_url = ?').get(url) as { id: string } | undefined

  if (existing) {
    return {
      success: true,
      message: "Thanks! This tool is already in our review pipeline.",
      queueId: existing.id
    }
  }

  const queueId = makeId('dsc')
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO discovery_queue
      (id, source, website_url, extracted_data, confidence_score, status, created_at)
    VALUES (?, 'suggest', ?, '{}', 0, 'pending', ?)
  `).run(queueId, url, now)

  return {
    success: true,
    message: "Thanks! We'll review this tool and list it within 24 hours.",
    queueId
  }
})
