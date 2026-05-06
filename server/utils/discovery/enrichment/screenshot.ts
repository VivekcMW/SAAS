/**
 * Screenshot Enrichment Agent
 * Captures app landing page screenshots for use as thumbnails on listing pages.
 *
 * Strategy (in order of preference):
 *   1. Screenshotone API (SCREENSHOTONE_API_KEY) — most reliable, handles JS
 *   2. Urlbox API (URLBOX_API_KEY + URLBOX_SECRET) — alternative
 *   3. Fallback: skip (no screenshot generated)
 *
 * Runs against:
 *   - app_listings with no screenshot_url
 *   - discovery_queue items with status = 'auto_submit'
 *
 * Schedule: Daily (5am UTC) — processes up to 50 apps per run to stay in API limits
 */
import { getDb, makeId } from '~/server/utils/database'

const SCREENSHOT_WIDTH = 1280
const SCREENSHOT_HEIGHT = 800

interface ScreenshotResult {
  url: string
  storedPath: string | null
  error?: string
}

/** Call Screenshotone API */
async function captureViaScreenshotone(websiteUrl: string): Promise<string> {
  const apiKey = process.env.SCREENSHOTONE_API_KEY
  if (!apiKey) throw new Error('SCREENSHOTONE_API_KEY not set')

  const params = new URLSearchParams({
    access_key: apiKey,
    url: websiteUrl,
    viewport_width: String(SCREENSHOT_WIDTH),
    viewport_height: String(SCREENSHOT_HEIGHT),
    format: 'webp',
    image_quality: '85',
    block_ads: 'true',
    block_cookie_banners: 'true',
    delay: '2',
    timeout: '30'
  })

  const screenshotUrl = `https://api.screenshotone.com/take?${params}`

  // Verify the URL is accessible (returns the image directly)
  const res = await fetch(screenshotUrl, { signal: AbortSignal.timeout(40_000) })
  if (!res.ok) throw new Error(`Screenshotone API ${res.status}`)

  // Return the URL itself — it can be stored as a CDN reference
  // In production: download and upload to your own S3/R2 bucket
  return screenshotUrl
}

/** Call Urlbox API */
async function captureViaUrlbox(websiteUrl: string): Promise<string> {
  const apiKey = process.env.URLBOX_API_KEY
  const secret = process.env.URLBOX_SECRET
  if (!apiKey || !secret) throw new Error('URLBOX_API_KEY or URLBOX_SECRET not set')

  // Urlbox uses HMAC-SHA1 token for auth
  const { createHmac } = await import('crypto')
  const queryString = `url=${encodeURIComponent(websiteUrl)}&width=${SCREENSHOT_WIDTH}&height=${SCREENSHOT_HEIGHT}&format=webp&quality=85&block_ads=true&delay=2000`
  const token = createHmac('sha1', secret).update(queryString).digest('hex')

  return `https://api.urlbox.io/v1/${apiKey}/${token}/png?${queryString}`
}

export async function captureScreenshot(websiteUrl: string): Promise<ScreenshotResult> {
  // Try Screenshotone first
  if (process.env.SCREENSHOTONE_API_KEY) {
    try {
      const url = await captureViaScreenshotone(websiteUrl)
      return { url, storedPath: url }
    }
    catch (err) {
      console.warn('[screenshot] Screenshotone failed:', err)
    }
  }

  // Try Urlbox as fallback
  if (process.env.URLBOX_API_KEY && process.env.URLBOX_SECRET) {
    try {
      const url = await captureViaUrlbox(websiteUrl)
      return { url, storedPath: url }
    }
    catch (err) {
      console.warn('[screenshot] Urlbox failed:', err)
    }
  }

  return { url: '', storedPath: null, error: 'No screenshot provider configured' }
}

export interface ScreenshotBatchResult {
  processed: number
  succeeded: number
  failed: number
  skipped: number
}

export async function runScreenshotEnrichmentBatch(
  batchSize = 50
): Promise<ScreenshotBatchResult> {
  const db = getDb()

  if (!process.env.SCREENSHOTONE_API_KEY && !process.env.URLBOX_API_KEY) {
    console.warn('[screenshot] No screenshot provider configured — skipping batch')
    return { processed: 0, succeeded: 0, failed: 0, skipped: 0 }
  }

  // Find published app listings that have no screenshot
  const apps = db.prepare(`
    SELECT id, website, name
    FROM app_listings
    WHERE status = 'published'
      AND (screenshot_url IS NULL OR screenshot_url = '')
    ORDER BY created_at DESC
    LIMIT ?
  `).all(batchSize) as Array<{ id: string; website: string; name: string }>

  let processed = 0
  let succeeded = 0
  let failed = 0
  const skipped = batchSize - apps.length

  for (const app of apps) {
    processed++
    try {
      const result = await captureScreenshot(app.website)
      if (result.storedPath) {
        db.prepare(
          `UPDATE app_listings SET screenshot_url = ?, updated_at = ? WHERE id = ?`
        ).run(result.storedPath, new Date().toISOString(), app.id)
        console.log(`[screenshot] Captured for ${app.name} (${app.id})`)
        succeeded++
      }
      else {
        console.warn(`[screenshot] No provider succeeded for ${app.name}`)
        failed++
      }
    }
    catch (err) {
      console.error(`[screenshot] Error for ${app.name}:`, err)
      failed++
    }

    // Respect API rate limits
    await new Promise(r => setTimeout(r, 1500))
  }

  return { processed, succeeded, failed, skipped }
}
