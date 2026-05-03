/**
 * POST /api/contracts
 * Create a contract.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'contract_create', limit: 30, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const user = await requireUser(event)
  const body = await readBody(event)
  const { app_name, vendor_name, app_id, price_usd, billing_period, seats, start_date, end_date, auto_renews = 0, notes } = body || {}
  if (!app_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'app_name is required' })

  const db = getDb()
  const now = new Date().toISOString()
  const id = makeId('con')

  db.prepare(`
    INSERT INTO contracts (id, user_id, app_id, app_name, vendor_name, price_usd, billing_period, seats, start_date, end_date, auto_renews, notes, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, user.id, app_id || null, app_name.trim(), vendor_name?.trim() || null, price_usd || null, billing_period || null, seats || null, start_date || null, end_date || null, auto_renews ? 1 : 0, notes?.trim() || null, now, now)

  return { id, message: 'Contract saved' }
})
