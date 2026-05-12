/**
 * DELETE /api/vendor/deals/[id]
 * Deletes a deal owned by the authenticated vendor.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = getDb()
  const deal = db.prepare('SELECT vendor_id FROM vendor_deals WHERE id = ?').get(id) as { vendor_id: string } | undefined
  if (!deal) throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
  if (deal.vendor_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  db.prepare('DELETE FROM vendor_deals WHERE id = ?').run(id)
  logActivity({ actorId: user.id, action: 'deal_deleted', entityType: 'vendor_deal', entityId: id })

  return { ok: true }
})
