/**
 * POST /api/stack
 * Add an app to the user's stack.
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getUserKey } from './index.get'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'stack_add', limit: 60, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const userKey = getUserKey(event)
  const body = await readBody(event)
  const { app_id, price_usd, billing_period = 'month', seats = 1, renewal_date, notes } = body || {}

  if (!app_id) throw createError({ statusCode: 400, statusMessage: 'app_id is required' })

  const db = getDb()
  const app = db.prepare('SELECT id, name, logo, category FROM app_listings WHERE id = ?').get(app_id) as any
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const existing = db.prepare('SELECT id FROM user_stacks WHERE user_key = ? AND app_id = ?').get(userKey, app_id) as any
  const now = new Date().toISOString()

  if (existing) {
    db.prepare(`UPDATE user_stacks SET price_usd=?, billing_period=?, seats=?, renewal_date=?, notes=?, updated_at=? WHERE id=?`)
      .run(price_usd ?? null, billing_period, seats, renewal_date ?? null, notes ?? null, now, existing.id)
    return { id: existing.id, action: 'updated' }
  }

  const id = makeId('stk')
  db.prepare(`
    INSERT INTO user_stacks (id, user_key, app_id, app_name, app_logo, category, price_usd, billing_period, seats, renewal_date, notes, added_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userKey, app_id, app.name, app.logo, app.category, price_usd ?? null, billing_period, seats, renewal_date ?? null, notes ?? null, now, now)

  // Update stack_overlaps for all other apps in this user's stack
  const otherApps = db.prepare('SELECT app_id FROM user_stacks WHERE user_key = ? AND app_id != ?').all(userKey, app_id) as { app_id: string }[]
  const overlapNow = new Date().toISOString()
  for (const other of otherApps) {
    const [a, b] = [app_id, other.app_id].sort()
    const overlapExists = db.prepare('SELECT id FROM stack_overlaps WHERE app_id_a = ? AND app_id_b = ?').get(a, b) as any
    if (overlapExists) {
      db.prepare('UPDATE stack_overlaps SET co_occurrence = co_occurrence + 1, last_updated = ? WHERE id = ?').run(overlapNow, overlapExists.id)
    } else {
      db.prepare('INSERT INTO stack_overlaps (id, app_id_a, app_id_b, co_occurrence, last_updated) VALUES (?,?,?,1,?)').run(makeId('so'), a, b, overlapNow)
    }
  }

  return { id, action: 'added' }
})
