/**
 * GET /api/rfp/:slug
 * Get a single RFP with its responses.
 */
import { getDb } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = getDb()

  const rfp = db.prepare('SELECT * FROM rfps WHERE slug = ?').get(slug) as any
  if (!rfp) throw createError({ statusCode: 404, statusMessage: 'RFP not found' })

  const sessionUser = await getSessionUser(event)
  const isOwner = sessionUser?.id === rfp.user_id

  const responses = isOwner
    ? db.prepare(`SELECT r.*, vp.company_name, al.name AS app_name, al.slug AS app_slug FROM rfp_responses r LEFT JOIN vendor_profiles vp ON vp.id = r.vendor_id LEFT JOIN app_listings al ON al.id = r.app_id WHERE r.rfp_id = ? ORDER BY r.created_at DESC`).all(rfp.id)
    : []

  return { rfp, responses, is_owner: isOwner }
})
