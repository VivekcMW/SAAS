/**
 * POST /api/integrations/suggest
 * Community-suggest a new integration for an app.
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'int_suggest', limit: 10, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many suggestions.' })
  }

  const body = await readBody(event)
  const { app_id, partner_name, description, integration_type = 'native', direction = 'bidirectional' } = body || {}
  if (!app_id) throw createError({ statusCode: 400, statusMessage: 'app_id is required' })
  if (!partner_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'partner_name is required' })
  if (!['native', 'api', 'webhook', 'zapier', 'other'].includes(integration_type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid integration_type' })
  }

  const db = getDb()
  const app = db.prepare('SELECT id FROM app_listings WHERE id = ?').get(app_id) as { id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  // Check for partner app match
  const partnerApp = db.prepare("SELECT id, name, logo FROM app_listings WHERE LOWER(name) LIKE LOWER(?) LIMIT 1").get(`%${partner_name.trim()}%`) as any

  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO integrations (id, app_id, partner_app_id, partner_name, partner_logo, description, integration_type, direction, verified, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?)
  `).run(makeId('int'), app_id, partnerApp?.id || null, partner_name.trim(), partnerApp?.logo || null, description?.trim() || null, integration_type, direction, now, now)

  return { message: 'Integration suggestion submitted. Thank you!' }
})
