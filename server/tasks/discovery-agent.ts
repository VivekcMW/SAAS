/**
 * Discovery Agent — Nitro Scheduled Tasks
 *
 * Registered in nuxt.config.ts scheduledTasks:
 *   '0 3 * * *'    → discovery:daily    (Product Hunt + Hacker News + Reddit)
 *   '0 2 * * 0'    → discovery:weekly   (YC + GitHub + IndieHackers + AppSumo + Zapier)
 *   '0 4 * * *'    → discovery:enrich   (Proxycurl enrichment batch)
 *
 * Can also be manually triggered via:
 *   POST /api/admin/discovery/trigger  (existing endpoint, for URL-by-URL)
 *   POST /api/admin/discovery/run      (new endpoint, for full source run)
 */
import { runYCCrawler } from '~/server/utils/discovery/crawlers/yc'
import { runProductHuntCrawler } from '~/server/utils/discovery/crawlers/producthunt'
import { runGitHubCrawler } from '~/server/utils/discovery/crawlers/github'
import { runHackerNewsCrawler } from '~/server/utils/discovery/crawlers/hackernews'
import { runIndieHackersCrawler } from '~/server/utils/discovery/crawlers/indiehackers'
import { runRedditCrawler } from '~/server/utils/discovery/crawlers/reddit'
import { runAppSumoCrawler } from '~/server/utils/discovery/crawlers/appsumo'
import { runZapierCrawler } from '~/server/utils/discovery/crawlers/zapier'
import { runProxycurlEnrichmentBatch } from '~/server/utils/discovery/enrichment/proxycurl'

// ── Daily sources (Product Hunt + Hacker News) ───────────────────────────────

export const dailyTask = defineTask({
  meta: {
    name: 'discovery:daily',
    description: 'Run daily discovery crawlers: Product Hunt + Hacker News Show HN'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }

    console.log('[discovery:daily] Starting daily crawl...')
    const results: Record<string, unknown> = {}

    // Product Hunt (requires PRODUCT_HUNT_API_TOKEN)
    if (process.env.PRODUCT_HUNT_API_TOKEN) {
      try {
        results.producthunt = await runProductHuntCrawler(100)
      }
      catch (err) {
        console.error('[discovery:daily] Product Hunt failed:', err)
        results.producthunt = { error: String(err) }
      }
    }
    else {
      console.warn('[discovery:daily] Skipping Product Hunt — PRODUCT_HUNT_API_TOKEN not set')
      results.producthunt = { skipped: 'no token' }
    }

    // Hacker News (no auth required)
    try {
      results.hackernews = await runHackerNewsCrawler(60)
    }
    catch (err) {
      console.error('[discovery:daily] Hacker News failed:', err)
      results.hackernews = { error: String(err) }
    }

    // Reddit (requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET)
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      try {
        results.reddit = await runRedditCrawler(60)
      }
      catch (err) {
        console.error('[discovery:daily] Reddit failed:', err)
        results.reddit = { error: String(err) }
      }
    }
    else {
      console.warn('[discovery:daily] Skipping Reddit — REDDIT_CLIENT_ID/SECRET not set')
      results.reddit = { skipped: 'no credentials' }
    }

    console.log('[discovery:daily] Complete:', results)
    return { result: 'ok', ...results }
  }
})

// ── Weekly sources (YC + GitHub) ─────────────────────────────────────────────

export const weeklyTask = defineTask({
  meta: {
    name: 'discovery:weekly',
    description: 'Run weekly discovery crawlers: Y Combinator + GitHub Topics'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }

    console.log('[discovery:weekly] Starting weekly crawl...')
    const results: Record<string, unknown> = {}

    // Y Combinator (no auth, public JSON)
    try {
      results.yc = await runYCCrawler(200)
    }
    catch (err) {
      console.error('[discovery:weekly] YC failed:', err)
      results.yc = { error: String(err) }
    }

    // GitHub (GITHUB_TOKEN optional but recommended)
    try {
      results.github = await runGitHubCrawler(150)
    }
    catch (err) {
      console.error('[discovery:weekly] GitHub failed:', err)
      results.github = { error: String(err) }
    }

    // IndieHackers (no auth required)
    try {
      results.indiehackers = await runIndieHackersCrawler(80)
    }
    catch (err) {
      console.error('[discovery:weekly] IndieHackers failed:', err)
      results.indiehackers = { error: String(err) }
    }

    // AppSumo (no auth required)
    try {
      results.appsumo = await runAppSumoCrawler(80)
    }
    catch (err) {
      console.error('[discovery:weekly] AppSumo failed:', err)
      results.appsumo = { error: String(err) }
    }

    // Zapier (no auth required)
    try {
      results.zapier = await runZapierCrawler(150)
    }
    catch (err) {
      console.error('[discovery:weekly] Zapier failed:', err)
      results.zapier = { error: String(err) }
    }

    console.log('[discovery:weekly] Complete:', results)
    return { result: 'ok', ...results }
  }
})

// ── Enrichment task (Proxycurl — runs daily after crawlers) ──────────────────

export const enrichTask = defineTask({
  meta: {
    name: 'discovery:enrich',
    description: 'Enrich discovery queue items with Proxycurl company + founder data'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    if (!process.env.PROXYCURL_API_KEY) {
      return { result: 'skipped', reason: 'PROXYCURL_API_KEY not set' }
    }

    console.log('[discovery:enrich] Starting Proxycurl enrichment batch...')
    const result = await runProxycurlEnrichmentBatch(20)
    console.log('[discovery:enrich] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// Default export for Nitro task resolution
export default dailyTask
