/**
 * PUT /api/vendor/deals/[id]
 * Updates a deal owned by the authenticated vendor.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = getDb()
  const deal = db.prepare('SELECT vendor_id FROM vendor_deals WHERE id = ?').get(id) as { vendor_id: string } | undefined
  if (!deal) throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
  if (deal.vendor_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readBody<{
    title?: string; description?: string; discount_pct?: number
    promo_code?: string; starts_at?: string; expires_at?: string
    max_claims?: number; active?: boolean
  }>(event)

  const sets: string[] = []
  const vals: unknown[] = []

  if (body.title !== undefined) { sets.push('title = ?'); vals.push(body.title.trim()) }
  if (body.description !== undefined) { sets.push('description = ?'); vals.push(body.description) }
  if (body.discount_pct !== undefined) { sets.push('discount_pct = ?'); vals.push(body.discount_pct) }
  if (body.promo_code !== undefined) { sets.push('promo_code = ?'); vals.push(body.promo_code) }
  if (body.starts_at !== undefined) { sets.push('starts_at = ?'); vals.push(body.starts_at) }
  if (body.expires_at !== undefined) { sets.push('expires_at = ?'); vals.push(body.expires_at) }
  if (body.max_claims !== undefined) { sets.push('max_claims = ?'); vals.push(body.max_claims) }
  if (body.active !== undefined) { sets.push('active = ?'); vals.push(body.active ? 1 : 0) }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  vals.push(id)
  db.prepare(`UPDATE vendor_deals SET ${sets.join(', ')} WHERE id = ?`).run(...vals)

  return { ok: true }
})
