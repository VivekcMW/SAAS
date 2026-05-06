/**
 * Discovery Agent — Nitro Scheduled Tasks
 *
 * Registered in nuxt.config.ts scheduledTasks:
 *   '0 3 * * *'    → discovery:daily        (Product Hunt + Hacker News + Reddit)
 *   '0 2 * * 0'    → discovery:weekly       (YC + GitHub + IndieHackers + AppSumo + Zapier)
 *   '0 4 * * *'    → discovery:enrich       (Proxycurl enrichment batch)
 *   '0 1 * * 6'    → discovery:extended     (Cat 1: AwesomeLists + VC Tier1 + BetaList + AlternativeTo)
 *   '0 3 * * 0'    → discovery:crunchbase   (Cat 1: Crunchbase discovery)
 *   '0 2 * * 6'    → discovery:vc-t2        (VC Tier 2 — 150 mid-size VCs)
 *   '0 4 * * 6'    → discovery:corporate-vc (Corporate VC arms — 30 firms)
 *   '0 5 * * 6'    → discovery:vc-agg       (VC Aggregators — Wellfound/F6S/Signal/SaaSHub)
 *   '0 4 * * 0'    → discovery:angels       (Angel networks — Republic/Wefunder/Seedrs/etc)
 *   '0 5 * * *'    → discovery:screenshots  (Cat 2: Screenshot capture)
 *   '0 3 * * 3'    → discovery:pricing      (Cat 2: Pricing monitor)
 *   '0 2 * * 4'    → discovery:reviews      (Cat 2: Review sync)
 *   '0 2 * * 5'    → discovery:cb-enrich    (Cat 2: Crunchbase enrichment)
 *   '0 1 * * 0'    → discovery:dedup        (Cat 3: Duplicate merger)
 *
 * Can also be manually triggered via:
 *   POST /api/admin/discovery/trigger  (existing endpoint, for URL-by-URL)
 *   POST /api/admin/discovery/run      (new endpoint, for full source run)
 */

// ── Category 0 — Original crawlers ───────────────────────────────────────────
import { runYCCrawler } from '~/server/utils/discovery/crawlers/yc'
import { runProductHuntCrawler } from '~/server/utils/discovery/crawlers/producthunt'
import { runGitHubCrawler } from '~/server/utils/discovery/crawlers/github'
import { runHackerNewsCrawler } from '~/server/utils/discovery/crawlers/hackernews'
import { runIndieHackersCrawler } from '~/server/utils/discovery/crawlers/indiehackers'
import { runRedditCrawler } from '~/server/utils/discovery/crawlers/reddit'
import { runAppSumoCrawler } from '~/server/utils/discovery/crawlers/appsumo'
import { runZapierCrawler } from '~/server/utils/discovery/crawlers/zapier'

// ── Category 1 — Original new crawlers ───────────────────────────────────────
import { runAwesomeListsCrawler } from '~/server/utils/discovery/crawlers/awesomelists'
import { runVCPortfolioCrawler } from '~/server/utils/discovery/crawlers/vcportfolios'
import { runBetaListCrawler } from '~/server/utils/discovery/crawlers/betalist'
import { runAlternativeToCrawler } from '~/server/utils/discovery/crawlers/alternativeto'
import { runCrunchbaseCrawler } from '~/server/utils/discovery/crawlers/crunchbase'

// ── VC Expansion — Tier 2, Corporate, Aggregators, Angel Networks ─────────────
import { runVCTier2Crawler } from '~/server/utils/discovery/crawlers/vcportfolios-tier2'
import { runCorporateVCCrawler } from '~/server/utils/discovery/crawlers/corporate-vc'
import { runVCAggregatorCrawler } from '~/server/utils/discovery/crawlers/vc-aggregators'
import { runAngelNetworkCrawler } from '~/server/utils/discovery/crawlers/angel-networks'

// ── Dynamic worldwide mining (no hardcoded URLs) ─────────────────────────────
import { runDynamicVCCrawler } from '~/server/utils/discovery/crawlers/vc-dynamic'

// ── Category 2 — Enrichment agents ───────────────────────────────────────────
import { runProxycurlEnrichmentBatch } from '~/server/utils/discovery/enrichment/proxycurl'
import { runScreenshotEnrichmentBatch } from '~/server/utils/discovery/enrichment/screenshot'
import { runPricingMonitor } from '~/server/utils/discovery/enrichment/pricing-monitor'
import { runReviewSync } from '~/server/utils/discovery/enrichment/review-sync'
import { runCrunchbaseEnrichmentBatch } from '~/server/utils/discovery/enrichment/crunchbase-enrich'

// ── Category 3 — Validation agents ───────────────────────────────────────────
import { runDuplicateMerger } from '~/server/utils/discovery/validation/duplicate-merger'

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

// ── Cat 1: Extended discovery (Sat 1am UTC) ───────────────────────────────────

export const extendedTask = defineTask({
  meta: {
    name: 'discovery:extended',
    description: 'Extended Cat 1 crawlers: AwesomeLists + VC Portfolios + BetaList + AlternativeTo'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }

    console.log('[discovery:extended] Starting extended crawl...')
    const results: Record<string, unknown> = {}

    // Awesome Lists (GitHub markdown repos — no auth needed)
    try {
      results.awesomelists = await runAwesomeListsCrawler(200)
    }
    catch (err) {
      console.error('[discovery:extended] AwesomeLists failed:', err)
      results.awesomelists = { error: String(err) }
    }

    // VC Portfolio pages (public HTML)
    try {
      results.vcportfolios = await runVCPortfolioCrawler(300)
    }
    catch (err) {
      console.error('[discovery:extended] VC Portfolios failed:', err)
      results.vcportfolios = { error: String(err) }
    }

    // BetaList (public — no auth needed)
    try {
      results.betalist = await runBetaListCrawler(100)
    }
    catch (err) {
      console.error('[discovery:extended] BetaList failed:', err)
      results.betalist = { error: String(err) }
    }

    // AlternativeTo (public — no auth needed)
    try {
      results.alternativeto = await runAlternativeToCrawler(150)
    }
    catch (err) {
      console.error('[discovery:extended] AlternativeTo failed:', err)
      results.alternativeto = { error: String(err) }
    }

    console.log('[discovery:extended] Complete:', results)
    return { result: 'ok', ...results }
  }
})

// ── Cat 1: Crunchbase discovery (Sun 3am UTC) ─────────────────────────────────

export const crunchbaseDiscoveryTask = defineTask({
  meta: {
    name: 'discovery:crunchbase',
    description: 'Discover new SaaS companies via Crunchbase API'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    if (!process.env.CRUNCHBASE_API_KEY) {
      return { result: 'skipped', reason: 'CRUNCHBASE_API_KEY not set' }
    }

    console.log('[discovery:crunchbase] Starting Crunchbase discovery...')
    const result = await runCrunchbaseCrawler(100)
    console.log('[discovery:crunchbase] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Cat 2: Screenshots (daily 5am UTC) ───────────────────────────────────────

export const screenshotTask = defineTask({
  meta: {
    name: 'discovery:screenshots',
    description: 'Capture landing page screenshots for app listings missing thumbnails'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    if (!process.env.SCREENSHOTONE_API_KEY && !process.env.URLBOX_API_KEY) {
      return { result: 'skipped', reason: 'No screenshot provider key configured' }
    }

    console.log('[discovery:screenshots] Starting screenshot batch...')
    const result = await runScreenshotEnrichmentBatch(50)
    console.log('[discovery:screenshots] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Cat 2: Pricing monitor (Wednesday 3am UTC) ───────────────────────────────

export const pricingTask = defineTask({
  meta: {
    name: 'discovery:pricing',
    description: 'Re-crawl app websites to detect pricing changes'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }

    console.log('[discovery:pricing] Starting pricing monitor...')
    const result = await runPricingMonitor(50)
    console.log('[discovery:pricing] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Cat 2: Review sync (Thursday 2am UTC) ────────────────────────────────────

export const reviewSyncTask = defineTask({
  meta: {
    name: 'discovery:reviews',
    description: 'Sync review counts and ratings from SaaSHub, Trustpilot, G2'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }

    console.log('[discovery:reviews] Starting review sync...')
    const result = await runReviewSync(100)
    console.log('[discovery:reviews] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Cat 2: Crunchbase enrichment (Friday 2am UTC) ────────────────────────────

export const crunchbaseEnrichTask = defineTask({
  meta: {
    name: 'discovery:cb-enrich',
    description: 'Enrich app listings with Crunchbase funding and company data'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    if (!process.env.CRUNCHBASE_API_KEY) {
      return { result: 'skipped', reason: 'CRUNCHBASE_API_KEY not set' }
    }

    console.log('[discovery:cb-enrich] Starting Crunchbase enrichment...')
    const result = await runCrunchbaseEnrichmentBatch(30)
    console.log('[discovery:cb-enrich] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Cat 3: Duplicate merger (Sunday 1am UTC) ─────────────────────────────────

export const dedupTask = defineTask({
  meta: {
    name: 'discovery:dedup',
    description: 'Find and merge near-duplicate app listings'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }

    console.log('[discovery:dedup] Starting duplicate merger...')
    const result = await runDuplicateMerger()
    console.log('[discovery:dedup] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── VC Tier 2 — 150 mid-size VCs (Saturday 3am UTC) ──────────────────────────

export const vcTier2Task = defineTask({
  meta: {
    name: 'discovery:vc-t2',
    description: 'VC Tier 2: 150 mid-size, sector-specialist, APAC & LatAm VCs'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    console.log('[discovery:vc-t2] Starting VC Tier 2 crawl...')
    const result = await runVCTier2Crawler(400)
    console.log('[discovery:vc-t2] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Corporate VC — 30 corporate venture arms (Saturday 6am UTC) ──────────────

export const corporateVCTask = defineTask({
  meta: {
    name: 'discovery:corporate-vc',
    description: 'Corporate VC: Salesforce Ventures, M12, Intel Capital, SAP.iO and 27 more'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    console.log('[discovery:corporate-vc] Starting corporate VC crawl...')
    const result = await runCorporateVCCrawler(300)
    console.log('[discovery:corporate-vc] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── VC Aggregators — Wellfound/F6S/Signal/SaaSHub (Saturday 5am UTC) ─────────

export const vcAggregatorTask = defineTask({
  meta: {
    name: 'discovery:vc-agg',
    description: 'VC Aggregators: Wellfound, F6S, Signal by NFX, SaaSHub, Landscape.vc'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    console.log('[discovery:vc-agg] Starting VC aggregator crawl...')
    const result = await runVCAggregatorCrawler(500)
    console.log('[discovery:vc-agg] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Angel Networks — Republic/Wefunder/Seedrs/AngelList (Sunday 4am UTC) ─────

export const angelNetworksTask = defineTask({
  meta: {
    name: 'discovery:angels',
    description: 'Angel networks: Republic, Wefunder, StartEngine, Seedrs, Crowdcube, AngelList, OurCrowd'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    console.log('[discovery:angels] Starting angel network crawl...')
    const result = await runAngelNetworkCrawler(300)
    console.log('[discovery:angels] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// ── Dynamic Worldwide Mining — RSS NLP + EDGAR + Trade Dirs + GitHub (Sunday 6am UTC) ──

export const vcDynamicTask = defineTask({
  meta: {
    name: 'discovery:vc-dynamic',
    description: 'Worldwide dynamic VC mining: RSS funding NLP (17 feeds, 10 regions) + SEC EDGAR Form D + 12 trade association directories + GitHub awesome-vc lists + self-learning vc_sources portfolio crawls'
  },
  async run() {
    if (process.env.DISCOVERY_AGENT_ENABLED === 'false') {
      return { result: 'disabled' }
    }
    console.log('[discovery:vc-dynamic] Starting worldwide dynamic VC mining...')
    const result = await runDynamicVCCrawler(400)
    console.log('[discovery:vc-dynamic] Complete:', result)
    return { result: 'ok', ...result }
  }
})

// Default export for Nitro task resolution
export default dailyTask
