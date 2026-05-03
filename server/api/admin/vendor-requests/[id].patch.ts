/**
 * PATCH /api/admin/vendor-requests/:id
 * Admin approves or rejects a vendor role request.
 * On approval: upgrades user.role to 'vendor' and creates a vendor_profile.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, makeId, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: string; adminNote?: string }>(event)
  if (!['approved', 'rejected'].includes(body?.status ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'status must be "approved" or "rejected"' })
  }

  const db = getDb()
  const req = db.prepare('SELECT * FROM vendor_role_requests WHERE id = ?').get(id) as {
    id: string
    user_id: string
    company_name: string
    website_url: string | null
    status: string
  } | undefined

  if (!req) throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  if (req.status !== 'pending') throw createError({ statusCode: 409, statusMessage: 'Request already reviewed' })

  const now = new Date().toISOString()

  // Update request status
  db.prepare(`
    UPDATE vendor_role_requests
    SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = ?
    WHERE id = ?
  `).run(body!.status, body?.adminNote?.trim() || null, admin.id, now, id)

  if (body!.status === 'approved') {
    // Upgrade user role
    db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run('vendor', now, req.user_id)

    // Create vendor_profile if not exists
    const existing = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(req.user_id)
    if (!existing) {
      const slug = req.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)
      db.prepare(`
        INSERT INTO vendor_profiles (id, user_id, company_name, company_slug, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', ?, ?)
      `).run(makeId('vendor'), req.user_id, req.company_name, `${slug}-${req.user_id.slice(-6)}`, now, now)
    }
  }

  logActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: `vendor_request.${body!.status}`,
    entityType: 'vendor_role_request',
    entityId: id,
  })

  return { ok: true, status: body!.status }
})
