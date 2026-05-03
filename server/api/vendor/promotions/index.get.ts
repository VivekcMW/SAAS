/**
 * GET /api/vendor/promotions
 * Returns all promotions for the authenticated vendor.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  if (!vendorRow) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const rows = db.prepare(`
    SELECT p.id, p.type, p.label, p.status, p.budget, p.spend, p.clicks, p.leads,
           p.starts_at, p.ends_at, p.created_at,
           al.name as app_name, al.id as app_id
    FROM vendor_promotions p
    JOIN app_listings al ON al.id = p.app_id
    WHERE p.vendor_id = ?
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all(vendorRow.id) as Array<{
    id: string; type: string; label: string; status: string; budget: number; spend: number;
    clicks: number; leads: number; starts_at: string | null; ends_at: string | null;
    created_at: string; app_name: string; app_id: string;
  }>

  return {
    promotions: rows.map(r => ({
      id: r.id,
      listingId: r.app_id,
      listingName: r.app_name,
      type: r.type,
      label: r.label,
      status: r.status,
      budget: r.budget,
      spend: r.spend,
      clicks: r.clicks,
      leads: r.leads,
      startsAt: r.starts_at,
      endsAt: r.ends_at ? new Date(r.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
    }))
  }
})
