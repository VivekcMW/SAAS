/**
 * Review Sync Agent
 * Pulls review counts and aggregate ratings from public sources to
 * keep social proof numbers fresh on listings.
 *
 * Sources (public, no scraping ToS violation):
 *   - SaaSHub (API) — free, no key needed
 *   - Trustpilot (public JSON endpoint per domain) — free
 *   - G2 (limited public JSON) — read-only, no auth needed for public stats
 *
 * Schedule: Weekly (Thursday 2am UTC)
 * Batch: 100 apps per run
 *
 * Only updates review_count and rating — never overwrites editorial content.
 */
import { getDb } from '~/server/utils/database'

interface ReviewStats {
  rating: number | null
  reviewCount: number | null
  source: string
}

const USER_AGENT = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

/** Query SaaSHub public API for a product by website domain */
async function fetchSaaSHubStats(websiteDomain: string): Promise<ReviewStats | null> {
  try {
    const res = await fetch(
      `https://api.saashub.com/products/by-url?url=${encodeURIComponent(websiteDomain)}`,
      {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(12_000)
      }
    )
    if (!res.ok) return null
    const data = await res.json() as {
      average_rating?: number
      ratings_count?: number
    }
    if (!data.ratings_count) return null
    return {
      rating: data.average_rating ? Math.round(data.average_rating * 10) / 10 : null,
      reviewCount: data.ratings_count,
      source: 'saashub'
    }
  }
  catch { return null }
}

/** Scrape Trustpilot public stats widget (JSON endpoint) */
async function fetchTrustpilotStats(websiteDomain: string): Promise<ReviewStats | null> {
  try {
    // Trustpilot serves public stats as JSON for their widget
    const res = await fetch(
      `https://www.trustpilot.com/api/categoriespages/get-business-unit?domain=${encodeURIComponent(websiteDomain)}`,
      {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(12_000)
      }
    )
    if (!res.ok) return null
    const data = await res.json() as {
      score?: { trustScore?: number; stars?: number }
      numberOfReviews?: { total?: number }
    }
    if (!data.numberOfReviews?.total) return null
    return {
      rating: data.score?.trustScore ? Math.round(data.score.trustScore * 10) / 10 : null,
      reviewCount: data.numberOfReviews.total,
      source: 'trustpilot'
    }
  }
  catch { return null }
}

/** Try G2 public product page for rating snippet */
async function fetchG2Stats(appName: string): Promise<ReviewStats | null> {
  try {
    // G2 embeds a JSON-LD block with AggregateRating
    const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const res = await fetch(
      `https://www.g2.com/products/${slug}/reviews`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(12_000)
      }
    )
    if (!res.ok) return null
    const html = await res.text()

    // Extract JSON-LD AggregateRating
    const jsonLdMatch = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    let match: RegExpExecArray | null
    const re = new RegExp(jsonLdMatch.source, 'gi')
    while ((match = re.exec(html)) !== null) {
      try {
        const json = JSON.parse(match[1])
        const agg = json?.aggregateRating || json?.['@graph']?.find(
          (g: { '@type': string }) => g['@type'] === 'AggregateRating'
        )
        if (agg?.reviewCount && agg?.ratingValue) {
          return {
            rating: Math.round(parseFloat(agg.ratingValue) * 10) / 10,
            reviewCount: parseInt(agg.reviewCount, 10),
            source: 'g2'
          }
        }
      }
      catch { /* continue */ }
    }
    return null
  }
  catch { return null }
}

/** Fetch review stats from multiple sources, return best result */
async function fetchReviewStats(
  appName: string,
  websiteUrl: string
): Promise<ReviewStats | null> {
  let domain = ''
  try {
    domain = new URL(websiteUrl).hostname.replace(/^www\./, '')
  }
  catch { return null }

  // Try in order: SaaSHub → Trustpilot → G2
  const saashub = await fetchSaaSHubStats(domain)
  if (saashub?.reviewCount) return saashub

  await new Promise(r => setTimeout(r, 500))
  const trustpilot = await fetchTrustpilotStats(domain)
  if (trustpilot?.reviewCount) return trustpilot

  await new Promise(r => setTimeout(r, 500))
  const g2 = await fetchG2Stats(appName)
  if (g2?.reviewCount) return g2

  return null
}

export interface ReviewSyncResult {
  processed: number
  updated: number
  unchanged: number
  failed: number
}

export async function runReviewSync(
  batchSize = 100
): Promise<ReviewSyncResult> {
  const db = getDb()

  // Find apps not synced in last 7 days
  const apps = db.prepare(`
    SELECT id, name, website, rating, review_count, review_synced_at
    FROM app_listings
    WHERE status = 'published'
      AND (
        review_synced_at IS NULL
        OR review_synced_at < datetime('now', '-7 days')
      )
    ORDER BY review_synced_at ASC NULLS FIRST
    LIMIT ?
  `).all(batchSize) as Array<{
    id: string
    name: string
    website: string
    rating: number
    review_count: number
    review_synced_at: string | null
  }>

  const result: ReviewSyncResult = {
    processed: 0,
    updated: 0,
    unchanged: 0,
    failed: 0
  }

  for (const app of apps) {
    result.processed++
    try {
      const stats = await fetchReviewStats(app.name, app.website)
      const now = new Date().toISOString()

      if (!stats?.reviewCount) {
        // Mark checked even if no data found (avoid re-checking too soon)
        db.prepare(`UPDATE app_listings SET review_synced_at = ? WHERE id = ?`).run(now, app.id)
        result.unchanged++
        continue
      }

      // Only update if we have more reviews than currently stored (external sources may lag)
      const shouldUpdate = stats.reviewCount > (app.review_count || 0)
        || (stats.rating !== null && stats.rating !== app.rating)

      if (shouldUpdate) {
        const updates: string[] = ['review_synced_at = ?', 'updated_at = ?']
        const params: (string | number | null)[] = [now, now]

        if (stats.reviewCount > (app.review_count || 0)) {
          updates.push('review_count = ?')
          params.push(stats.reviewCount)
        }
        if (stats.rating !== null) {
          updates.push('rating = ?')
          params.push(stats.rating)
        }
        if (stats.source) {
          updates.push('review_source = ?')
          params.push(stats.source)
        }

        params.push(app.id)
        db.prepare(
          `UPDATE app_listings SET ${updates.join(', ')} WHERE id = ?`
        ).run(...params)

        console.log(`[review-sync] Updated ${app.name}: ${stats.reviewCount} reviews, ${stats.rating}★ (${stats.source})`)
        result.updated++
      }
      else {
        db.prepare(`UPDATE app_listings SET review_synced_at = ? WHERE id = ?`).run(now, app.id)
        result.unchanged++
      }
    }
    catch (err) {
      console.error(`[review-sync] Failed for ${app.name}:`, err)
      result.failed++
    }

    await new Promise(r => setTimeout(r, 1200))
  }

  return result
}
