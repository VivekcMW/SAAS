/**
 * POST /api/apps/:id/view
 * Track a page view for an app. Called client-side on app detail page load.
 * De-duped per visitor_key within 1-hour window.
 */
import { defineEventHandler, getRouterParam } from 'h3'
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'id')
  if (!appId) return { ok: false }

  const db = getDb()

  const app = db.prepare(
    "SELECT id, vendor_id FROM app_listings WHERE (id = ? OR slug = ?) AND status = 'published' LIMIT 1"
  ).get(appId, appId) as { id: string; vendor_id: string } | undefined

  if (!app) return { ok: false }

  const user = await getSessionUser(event)
  const ip = (
    event.node.req.headers['x-forwarded-for'] as string | undefined
  )?.split(',')[0]?.trim() || event.node.req.socket?.remoteAddress || 'anon'

  const viewerKey = user
    ? `u:${user.id}`
    : `i:${createHash('sha256').update(ip).digest('hex').slice(0, 16)}`

  const now = new Date()
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

  // One view per visitor per hour per app
  const existing = db.prepare(
    'SELECT id FROM app_views WHERE app_id = ? AND viewer_key = ? AND created_at >= ? LIMIT 1'
  ).get(app.id, viewerKey, windowStart)

  if (!existing) {
    db.prepare(
      'INSERT INTO app_views (id, app_id, vendor_id, viewer_key, ref, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      makeId('view'),
      app.id,
      app.vendor_id,
      viewerKey,
      (event.node.req.headers['referer'] as string | undefined) || null,
      now.toISOString()
    )
  }

  return { ok: true }
})
