/**
 * GET /api/vendor/deals
 * Returns all deals for the authenticated vendor.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()
  const deals = db.prepare(`
    SELECT d.*, a.name AS app_name
    FROM vendor_deals d
    LEFT JOIN apps a ON a.id = d.app_id
    WHERE d.vendor_id = ?
    ORDER BY d.created_at DESC
  `).all(user.id)
  return deals
})
