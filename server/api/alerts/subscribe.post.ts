import { getDb, makeId } from '~/server/utils/database'

interface Body {
  appId?: string
  email?: string
  threshold?: 'any' | 'increase' | 'decrease'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)

  if (!body?.appId || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'appId and email are required' })
  }

  if (!/.+@.+\..+/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid email' })
  }

  const db = getDb()
  const email = body.email.toLowerCase()
  const threshold = body.threshold || 'any'
  const now = new Date().toISOString()

  // Confirm the app exists
  const app = db.prepare('SELECT id FROM app_listings WHERE id = ?').get(body.appId) as { id: string } | undefined
  if (!app) {
    throw createError({ statusCode: 404, statusMessage: 'App not found' })
  }

  // UPSERT: update threshold if already subscribed
  const existing = db.prepare(
    'SELECT id FROM price_alerts WHERE app_id = ? AND email = ?'
  ).get(body.appId, email) as { id: string } | undefined

  if (existing) {
    db.prepare('UPDATE price_alerts SET threshold = ? WHERE id = ?').run(threshold, existing.id)
    return { ok: true, message: `Updated price alert for ${email}.`, updated: true }
  }

  db.prepare(
    'INSERT INTO price_alerts (id, app_id, email, threshold, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(makeId('pa'), body.appId, email, threshold, now)

  return {
    ok: true,
    message: `Subscribed ${email} to price alerts for ${body.appId}.`,
    updated: false
  }
})
