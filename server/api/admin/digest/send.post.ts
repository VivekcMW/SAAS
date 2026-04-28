/**
 * POST /api/admin/digest/send
 * Sends the weekly digest email to all users who have opted in.
 * Admin-only. Intended to be called by a cron job or manually from the admin panel.
 *
 * Body (optional):
 *   { dryRun: true }  — builds emails but does not send; returns count only.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'
import { buildWeeklyDigestEmail, sendEmail } from '~/server/utils/email'

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rawBody = await readBody(event).catch(() => ({}))
  const dryRun = (rawBody as Record<string, unknown>)?.dryRun === true

  const db = getDb()
  const weekNumber = isoWeekNumber(new Date())

  // Users who want weekly digest (no explicit opt-out)
  const recipients = db.prepare(`
    SELECT id, email, first_name FROM users
    WHERE email_verified = 1 AND role != 'admin'
    ORDER BY created_at DESC
    LIMIT 5000
  `).all() as Array<{ id: string; email: string; first_name: string }>

  // New apps published in the last 7 days
  const newApps = db.prepare(`
    SELECT name, tagline, slug FROM app_listings
    WHERE status = 'published' AND published_at >= datetime('now', '-7 days')
    ORDER BY published_at DESC LIMIT 10
  `).all() as Array<{ name: string; tagline: string; slug: string }>

  // Top categories by activity this week
  const topCats = db.prepare(`
    SELECT category, COUNT(*) as c FROM buyer_intent_events
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY category ORDER BY c DESC LIMIT 3
  `).all() as Array<{ category: string }>
  const topCategories = topCats.map(r => r.category).filter(Boolean)

  let sent = 0
  for (const user of recipients) {
    const email = buildWeeklyDigestEmail({
      to: user.email,
      firstName: user.first_name || 'there',
      newApps,
      topCategories,
      weekNumber
    })
    if (!dryRun) {
      await sendEmail(email).catch(err =>
        console.error(`[digest] failed for ${user.email}:`, err)
      )
    }
    sent++
  }

  return {
    success: true,
    dryRun,
    recipientCount: sent,
    weekNumber,
    newAppsIncluded: newApps.length
  }
})
