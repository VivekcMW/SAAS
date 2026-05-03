/**
 * PUT /api/admin/listings/[id]/status
 * Approve, reject, or archive a listing.
 */
import { getDb, logActivity } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'
import { buildListingStatusEmail, sendEmail } from '~/server/utils/email'

const VALID_STATUSES = ['published', 'draft', 'submitted', 'archived']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: string; adminNote?: string; featured?: boolean }>(event)
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const db = getDb()
  const existing = db.prepare(`
    SELECT a.id, a.name, u.email, u.first_name, u.last_name
    FROM app_listings a
    LEFT JOIN vendor_profiles vp ON vp.id = a.vendor_id
    LEFT JOIN users u ON u.id = vp.user_id
    WHERE a.id = ?
  `).get(id) as { id: string; name: string; email: string | null; first_name: string | null; last_name: string | null } | undefined
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = { status: body.status, updated_at: now }
  if (body.status === 'published') updates.published_at = now
  if (typeof body.featured === 'boolean') updates.featured = body.featured ? 1 : 0

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE app_listings SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), id)

  // Notify vendor by email on approval / rejection
  if ((body.status === 'published' || body.status === 'draft') && existing.email) {
    const mappedStatus = body.status === 'published' ? 'approved' : 'rejected'
    sendEmail(buildListingStatusEmail({
      to: existing.email,
      vendorName: existing.first_name || 'Vendor',
      productName: existing.name,
      status: mappedStatus,
      adminNotes: body.adminNote
    })).catch(err => console.error('[admin/listings/status] email failed:', err))
  }

  logActivity({
    actorId: admin.id ?? null,
    actorEmail: admin.email ?? null,
    action: `listing.status.${body.status}`,
    entityType: 'listing',
    entityId: id,
    meta: { name: existing.name, adminNote: body.adminNote }
  })

  return { success: true, status: body.status }
})
