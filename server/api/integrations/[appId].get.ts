/**
 * GET /api/integrations/:appId
 * Returns the integration graph for an app.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'appId')
  const db = getDb()

  const app = db.prepare('SELECT id FROM app_listings WHERE id = ?').get(appId) as { id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const integrations = db.prepare(`
    SELECT
      i.id, i.partner_name, i.partner_logo, i.description,
      i.integration_type, i.direction, i.vote_score, i.verified, i.status,
      al.id AS partner_app_id, al.name AS partner_app_name, al.slug AS partner_app_slug
    FROM integrations i
    LEFT JOIN app_listings al ON al.id = i.partner_app_id
    WHERE i.app_id = ? AND i.status = 'active'
    ORDER BY i.verified DESC, i.vote_score DESC
  `).all(appId) as any[]

  const byType = integrations.reduce<Record<string, any[]>>((acc, int) => {
    const key = int.integration_type
    if (!acc[key]) acc[key] = []
    acc[key].push(int)
    return acc
  }, {})

  return { integrations, by_type: byType, total: integrations.length }
})
