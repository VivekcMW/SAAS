/**
 * POST /api/consent
 * Logs GDPR consent choice to DB. Visitor key = hashed IP.
 */
import { defineEventHandler, readBody } from 'h3'
import { getDb, makeId } from '~/server/utils/database'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ analytics?: boolean; marketing?: boolean }>(event)

  const ip = (
    event.node.req.headers['x-forwarded-for'] as string | undefined
  )?.split(',')[0]?.trim() || event.node.req.socket?.remoteAddress || 'unknown'
  const visitorKey = createHash('sha256').update(ip).digest('hex').slice(0, 24)

  const db = getDb()
  const now = new Date().toISOString()
  const analytics = body?.analytics ? 1 : 0
  const marketing = body?.marketing ? 1 : 0

  const existing = db.prepare(
    'SELECT id FROM consent_log WHERE visitor_key = ? LIMIT 1'
  ).get(visitorKey) as { id: string } | undefined

  if (existing) {
    db.prepare(
      'UPDATE consent_log SET analytics = ?, marketing = ?, updated_at = ? WHERE id = ?'
    ).run(analytics, marketing, now, existing.id)
  } else {
    db.prepare(
      'INSERT INTO consent_log (id, visitor_key, analytics, marketing, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(makeId('cl'), visitorKey, analytics, marketing, now, now)
  }

  return { success: true }
})
