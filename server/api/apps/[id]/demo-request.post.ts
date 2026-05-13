/**
 * POST /api/apps/[id]/demo-request
 * Submits a demo booking request. Notifies the vendor and saves to DB.
 */
import { getDb, makeId, logActivity } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { sendEmail, ADMIN_EMAIL } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'id')
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'Missing app id' })

  // Rate limit: 3 demo requests per hour per IP
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { limit: 3, windowMs: 60 * 60 * 1000, prefix: 'demo' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many demo requests. Please try again later.' })
  }

  const body = await readBody(event)
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const company = String(body?.company ?? '').trim()
  const message = String(body?.message ?? '').trim()
  const preferredDate = String(body?.preferredDate ?? '').trim()

  if (!name || !email) {
    throw createError({ statusCode: 400, statusMessage: 'name and email are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  const db = getDb()

  // Ensure demo_requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS demo_requests (
      id             TEXT PRIMARY KEY,
      app_id         TEXT NOT NULL,
      user_id        TEXT,
      name           TEXT NOT NULL,
      email          TEXT NOT NULL,
      company        TEXT NOT NULL DEFAULT '',
      message        TEXT NOT NULL DEFAULT '',
      preferred_date TEXT NOT NULL DEFAULT '',
      status         TEXT NOT NULL DEFAULT 'pending',
      created_at     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dr_app ON demo_requests(app_id);
    CREATE INDEX IF NOT EXISTS idx_dr_status ON demo_requests(status);
  `)

  const app = db.prepare('SELECT id, name, vendor_id FROM app_listings WHERE id = ? OR slug = ?')
    .get(appId, appId) as { id: string; name: string; vendor_id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const sessionUser = await getSessionUser(event)
  const id = makeId('dr')
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO demo_requests (id, app_id, user_id, name, email, company, message, preferred_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(id, app.id, sessionUser?.id ?? null, name, email, company, message, preferredDate, now)

  // Notify vendor via email
  const vendorUser = db.prepare('SELECT email, full_name FROM users WHERE id = (SELECT user_id FROM vendor_profiles WHERE id = ?)')
    .get(app.vendor_id) as { email: string; full_name: string } | undefined

  const notifyEmail = vendorUser?.email ?? ADMIN_EMAIL
  if (notifyEmail) {
    await sendEmail({
      to: notifyEmail,
      subject: `New demo request for ${app.name}`,
      html: `
        <p>Hi ${vendorUser?.full_name ?? 'there'},</p>
        <p><strong>${name}</strong> (${email}) from <em>${company || 'N/A'}</em> has requested a demo for <strong>${app.name}</strong>.</p>
        ${preferredDate ? `<p>Preferred date: <strong>${preferredDate}</strong></p>` : ''}
        ${message ? `<p>Message: ${message}</p>` : ''}
        <p>Log in to your vendor dashboard to follow up.</p>
      `,
    }).catch(() => { /* don't fail if email is misconfigured */ })
  }

  if (sessionUser) {
    logActivity({
      actorId: sessionUser.id,
      actorEmail: sessionUser.email,
      action: 'demo_request',
      entityType: 'app',
      entityId: app.id,
    })
  }

  return { success: true, id }
})
