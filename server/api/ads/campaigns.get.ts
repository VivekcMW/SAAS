/**
 * GET /api/ads/campaigns
 *
 * Returns all SEM campaigns for the authenticated vendor.
 * Query param: ?appId=xxx to filter by app.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()
  const appId = getQuery(event).appId as string | undefined

  let query = `
    SELECT sc.*, al.name as app_name, al.slug as app_slug
    FROM sem_campaigns sc
    LEFT JOIN app_listings al ON al.id = sc.app_id
    WHERE sc.vendor_id = ?
  `
  const params: unknown[] = [user.id]
  if (appId) { query += ' AND sc.app_id = ?'; params.push(appId) }
  query += ' ORDER BY sc.created_at DESC'

  const campaigns = db.prepare(query).all(...params)
  return { campaigns }
})
