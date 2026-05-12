/**
 * POST /api/status/subscribe
 * Subscribes an email to status page incident notifications.
 */
import { readBody } from 'h3'
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 3, windowMs: 60 * 60 * 1000, prefix: 'status-sub' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many subscription attempts. Try again later.' })
  }

  const body = await readBody<{ email?: string }>(event)
  const email = body?.email?.trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email address is required' })
  }

  const db = getDb()
  // Store as an activity_log entry to avoid adding a new table
  db.prepare(`
    INSERT INTO activity_log (id, actor_email, action, entity_type, meta, created_at)
    VALUES (?, ?, 'status_subscribe', 'status_notification', ?, datetime('now'))
  `).run(makeId('ssub'), email, JSON.stringify({ email }))

  return { ok: true, message: 'Subscribed! You will be notified of incidents.' }
})
