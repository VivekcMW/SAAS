/**
 * Nitro scheduled task: digest:weekly
 * Calls the admin digest endpoint to send weekly summary emails to opted-in users.
 * Scheduled every Monday at 08:00 UTC via nuxt.config.ts scheduledTasks.
 */
import { getDb } from '~/server/utils/database'
import { buildWeeklyDigestEmail, sendEmail } from '~/server/utils/email'

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export default defineTask({
  meta: {
    name: 'digest:weekly',
    description: 'Send weekly digest emails to opted-in users'
  },
  async run() {
    const db = getDb()
    const weekNumber = isoWeekNumber(new Date())

    const recipients = db.prepare(`
      SELECT u.id, u.email, u.first_name
      FROM users u
      WHERE u.digest_opt_out IS NOT 1
        AND u.email_verified = 1
        AND u.email IS NOT NULL
      ORDER BY u.created_at ASC
      LIMIT 2000
    `).all() as Array<{ id: string; email: string; first_name: string | null }>

    if (!recipients.length) {
      return { result: 'ok', sent: 0, skipped: 0 }
    }

    const topApps = db.prepare(`
      SELECT id, name, short_description, category, pricing_type, logo, slug
      FROM app_listings
      WHERE status = 'published'
      ORDER BY trending DESC, rating DESC
      LIMIT 6
    `).all() as Array<{
      id: string; name: string; short_description: string
      category: string; pricing_type: string; logo: string; slug: string
    }>

    const newApps = topApps.map(a => ({
      name: a.name,
      tagline: a.short_description,
      slug: a.slug
    }))

    const topCategories: string[] = [...new Set(topApps.map(a => a.category))].slice(0, 3)

    let sent = 0
    let skipped = 0

    for (const user of recipients) {
      const alreadySent = db.prepare(`
        SELECT 1 FROM digest_sends WHERE user_id = ? AND week_number = ?
      `).get(user.id, weekNumber)

      if (alreadySent) { skipped++; continue }

      const email = buildWeeklyDigestEmail({
        to: user.email,
        firstName: user.first_name || 'there',
        weekNumber,
        newApps,
        topCategories
      })

      const result = await sendEmail(email).catch(() => ({ ok: false }))
      if (result.ok) {
        db.prepare(
          `INSERT OR IGNORE INTO digest_sends (user_id, week_number, sent_at) VALUES (?, ?, ?)`
        ).run(user.id, weekNumber, new Date().toISOString())
        sent++
      }
    }

    return { result: 'ok', sent, skipped }
  }
})
