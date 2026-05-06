/**
 * Pricing Monitor Agent
 * Re-crawls published app websites to detect pricing changes.
 * Alerts admins and marks the listing as needing review when pricing changes.
 *
 * Schedule: Weekly (Wednesday 3am UTC)
 * Strategy:
 *   1. Fetch published apps with pricing_type = 'paid' (these can change)
 *   2. Re-fetch their pricing page (or homepage)
 *   3. Use AI to extract current pricing
 *   4. Compare against stored pricing — flag changes
 *   5. Log to pricing_change_log table; notify admin if significant change
 *
 * Significant change = price diff > 15% OR type changed (paid → free etc.)
 */
import { getDb, makeId } from '~/server/utils/database'
import { fetchPageText, extractWithAI } from '~/server/utils/ai-extractor'
import type { PricingType } from '~/server/utils/ai-extractor'

export interface PricingChangeEntry {
  appId: string
  appName: string
  oldType: PricingType
  newType: PricingType
  oldPrice: number | null
  newPrice: number | null
  detectedAt: string
}

export interface PricingMonitorResult {
  processed: number
  changed: number
  unchanged: number
  failed: number
  changes: PricingChangeEntry[]
}

function isPricingSignificantlyDifferent(
  oldType: string,
  newType: string,
  oldPrice: number | null,
  newPrice: number | null
): boolean {
  // Any pricing model change is significant
  if (oldType !== newType) return true

  // Price changed by more than 15%
  if (oldPrice !== null && newPrice !== null) {
    const diff = Math.abs(newPrice - oldPrice) / Math.max(oldPrice, 1)
    if (diff > 0.15) return true
  }

  // Price appeared or disappeared
  if ((oldPrice === null) !== (newPrice === null)) return true

  return false
}

export async function runPricingMonitor(
  batchSize = 50
): Promise<PricingMonitorResult> {
  const db = getDb()

  // Find apps that are paid and haven't been re-checked in 7 days
  const apps = db.prepare(`
    SELECT
      id, name, website,
      pricing_type, pricing_value,
      pricing_checked_at
    FROM app_listings
    WHERE status = 'published'
      AND pricing_type IN ('paid', 'freemium')
      AND (
        pricing_checked_at IS NULL
        OR pricing_checked_at < datetime('now', '-7 days')
      )
    ORDER BY pricing_checked_at ASC NULLS FIRST
    LIMIT ?
  `).all(batchSize) as Array<{
    id: string
    name: string
    website: string
    pricing_type: PricingType
    pricing_value: number | null
    pricing_checked_at: string | null
  }>

  const result: PricingMonitorResult = {
    processed: 0,
    changed: 0,
    unchanged: 0,
    failed: 0,
    changes: []
  }

  for (const app of apps) {
    result.processed++
    try {
      // Try to fetch the pricing page first, fall back to homepage
      const pricingUrls = [
        app.website.replace(/\/$/, '') + '/pricing',
        app.website
      ]

      let pageText = ''
      for (const url of pricingUrls) {
        try {
          pageText = await fetchPageText(url)
          if (pageText.length > 500) break
        }
        catch { /* try next */ }
      }

      if (!pageText) {
        result.failed++
        continue
      }

      const extracted = await extractWithAI(pageText, app.website)
      const now = new Date().toISOString()

      // Mark as checked regardless of change
      db.prepare(
        `UPDATE app_listings SET pricing_checked_at = ? WHERE id = ?`
      ).run(now, app.id)

      const hasChanged = isPricingSignificantlyDifferent(
        app.pricing_type,
        extracted.pricing_type,
        app.pricing_value,
        extracted.pricing_starts_at
      )

      if (hasChanged) {
        const changeId = makeId('pch')

        // Log the change
        db.prepare(`
          INSERT INTO pricing_change_log
            (id, app_id, old_type, new_type, old_price, new_price, detected_at, reviewed)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `).run(
          changeId,
          app.id,
          app.pricing_type,
          extracted.pricing_type,
          app.pricing_value,
          extracted.pricing_starts_at,
          now
        )

        // Update the listing with new pricing and flag for admin review
        db.prepare(`
          UPDATE app_listings
          SET pricing_type = ?,
              pricing_value = ?,
              pricing_verified = 0,
              updated_at = ?
          WHERE id = ?
        `).run(
          extracted.pricing_type,
          extracted.pricing_starts_at,
          now,
          app.id
        )

        const change: PricingChangeEntry = {
          appId: app.id,
          appName: app.name,
          oldType: app.pricing_type,
          newType: extracted.pricing_type,
          oldPrice: app.pricing_value,
          newPrice: extracted.pricing_starts_at,
          detectedAt: now
        }

        result.changes.push(change)
        result.changed++

        console.log(
          `[pricing-monitor] Change detected for ${app.name}: ` +
          `${app.pricing_type}($${app.pricing_value}) → ${extracted.pricing_type}($${extracted.pricing_starts_at})`
        )
      }
      else {
        result.unchanged++
      }
    }
    catch (err) {
      console.error(`[pricing-monitor] Failed for ${app.name}:`, err)
      result.failed++
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  return result
}
