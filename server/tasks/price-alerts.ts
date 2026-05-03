/**
 * Nitro scheduled task: price-alerts:daily
 * Checks for price drops on apps that users have set price alerts for.
 * Sends an email notification when an app's price drops.
 *
 * We track the last-seen price in the admin_settings key
 * "price_snapshot:{appId}" to detect changes without a dedicated DB column.
 *
 * Schedule: add to nuxt.config.ts scheduledTasks as '0 8 * * *' (daily 08:00 UTC)
 */
import { getDb, logActivity } from '~/server/utils/database'
import { sendEmail } from '~/server/utils/email'

export default defineTask({
  meta: {
    name: 'price-alerts:daily',
    description: 'Send price-drop notification emails to subscribed users',
  },
  async run() {
    const db = getDb()

    // Load all active price alerts, joined with current app pricing
    const alerts = db.prepare(`
      SELECT pa.id, pa.app_id, pa.email, pa.threshold, pa.created_at,
             al.name AS app_name, al.slug AS app_slug,
             al.pricing_type, al.pricing_value
      FROM price_alerts pa
      JOIN app_listings al ON al.id = pa.app_id
      WHERE al.status = 'published'
    `).all() as Array<{
      id: string; app_id: string; email: string; threshold: string
      created_at: string; app_name: string; app_slug: string | null
      pricing_type: string; pricing_value: number | null
    }>

    if (alerts.length === 0) return { result: 'no alerts to process' }

    // Load price snapshots from admin_settings
    const snapshotRows = db.prepare(
      `SELECT key, value FROM admin_settings WHERE key LIKE 'price_snapshot:%'`
    ).all() as Array<{ key: string; value: string }>

    const snapshots = new Map<string, number | null>(
      snapshotRows.map(r => [r.key.replace('price_snapshot:', ''), Number(r.value) || null])
    )

    let notified = 0
    const seen = new Set<string>()          // one email per app per run
    const now = new Date().toISOString()

    for (const alert of alerts) {
      const snapshotKey = alert.app_id
      const prevPrice = snapshots.get(snapshotKey) ?? null
      const currPrice = alert.pricing_value

      // Determine if this is a price drop worth alerting on
      const isDropped = (
        prevPrice !== null &&
        currPrice !== null &&
        currPrice < prevPrice
      ) || (
        // App switched from paid to free
        prevPrice !== null && prevPrice > 0 && currPrice === null && alert.pricing_type === 'free'
      )

      // threshold: 'any' = any drop triggers; numeric string = only if drops below that amount
      let thresholdMet = isDropped
      if (thresholdMet && alert.threshold !== 'any') {
        const thresholdVal = Number(alert.threshold)
        if (!isNaN(thresholdVal) && currPrice !== null && currPrice > thresholdVal) {
          thresholdMet = false
        }
      }

      const dedupeKey = `${alert.app_id}:${alert.email}`
      if (!thresholdMet || seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      const appUrl = `${process.env.SITE_URL || 'https://moonmart.ai'}/app/${alert.app_slug || alert.app_id}`
      const oldPriceStr = prevPrice ? `$${prevPrice}/mo` : 'paid'
      const newPriceStr = currPrice ? `$${currPrice}/mo` : (alert.pricing_type === 'free' ? 'Free' : 'Contact')

      try {
        await sendEmail({
          to: alert.email,
          subject: `Price drop alert: ${alert.app_name} is now ${newPriceStr}`,
          text: `Good news! ${alert.app_name} dropped in price.

Previous price: ${oldPriceStr}
New price: ${newPriceStr}

View the listing: ${appUrl}

You received this because you set a price alert for this app. To unsubscribe, visit your account settings.`,
          html: `<p>Good news! <strong>${alert.app_name}</strong> dropped in price.</p>
<table>
  <tr><td><strong>Previous price</strong></td><td>${oldPriceStr}</td></tr>
  <tr><td><strong>New price</strong></td><td>${newPriceStr}</td></tr>
</table>
<p><a href="${appUrl}">View the listing →</a></p>
<p style="color:#999;font-size:12px">You received this because you set a price alert for this app.</p>`,
        })
        notified++
        logActivity({ action: 'price_alert.triggered', entityType: 'app', entityId: alert.app_id })
      } catch (err) {
        console.error('[price-alerts] email failed for', alert.email, err)
      }
    }

    // Update snapshots for all apps seen in this run
    const upsert = db.prepare(
      `INSERT INTO admin_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    const upsertMany = db.transaction(() => {
      for (const alert of alerts) {
        const key = `price_snapshot:${alert.app_id}`
        const value = alert.pricing_value !== null ? String(alert.pricing_value) : '0'
        upsert.run(key, value, now)
      }
    })
    upsertMany()

    return { result: `processed ${alerts.length} alerts, notified ${notified}` }
  },
})
