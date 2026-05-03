/**
 * POST /api/user/request-vendor
 * A buyer submits a request to upgrade their account to vendor role.
 * An admin must approve it via /api/admin/vendor-requests/:id.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 3, windowMs: 60 * 60 * 1000, prefix: 'vendor-request' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again later.' })
  }

  const user = await requireUser(event)

  if (user.role !== 'buyer') {
    throw createError({ statusCode: 400, statusMessage: 'Only buyer accounts can request a vendor upgrade.' })
  }

  const body = await readBody<{ companyName?: string; websiteUrl?: string; reason?: string }>(event)
  if (!body?.companyName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'companyName is required' })
  }

  const db = getDb()

  // Check for existing request
  const existing = db.prepare('SELECT status FROM vendor_role_requests WHERE user_id = ?').get(user.id) as
    | { status: string }
    | undefined

  if (existing) {
    if (existing.status === 'pending') {
      throw createError({ statusCode: 409, statusMessage: 'You already have a pending vendor request.' })
    }
    if (existing.status === 'approved') {
      throw createError({ statusCode: 409, statusMessage: 'Your account is already approved as a vendor.' })
    }
    // Rejected: allow re-submission
    db.prepare('DELETE FROM vendor_role_requests WHERE user_id = ?').run(user.id)
  }

  const id = makeId('vrr')
  db.prepare(`
    INSERT INTO vendor_role_requests (id, user_id, company_name, website_url, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    user.id,
    body.companyName.trim(),
    body.websiteUrl?.trim() || null,
    body.reason?.trim() || null,
    new Date().toISOString(),
  )

  return { ok: true, id, message: 'Vendor request submitted. An admin will review it within 1-2 business days.' }
})
