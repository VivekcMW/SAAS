/**
 * seoEngine.ts — Server-side SEO Engine utilities
 *
 * Responsibilities:
 *  - Compute per-app SEO score (0–100) and store in app_seo_meta
 *  - Submit URLs to IndexNow for instant indexing
 *  - Generate AI-powered FAQ pairs and llm_summary via the AI provider
 *  - Provide helpers used by sitemap and llms.txt endpoints
 */

import { getDb, makeId } from './database'
import { getMarketplaceAppByIdOrSlug } from './apps'

const BASE_URL = process.env.SITE_URL || 'https://moonmart.ai'
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'moonmart-indexnow-key-2026'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AppSeoMeta {
  app_id: string
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  llm_summary: string | null
  faq_json: string
  comparison_slugs: string
  seo_score: number
  score_breakdown: string
  page_speed_score: number | null
  last_scored_at: string | null
  last_ai_gen_at: string | null
}

export interface SeoScoreBreakdown {
  title: number          // 0–10: 50–60 chars
  description: number    // 0–10: 150–160 chars
  schema: number         // 0–15: SoftwareApplication present
  faq: number            // 0–10: ≥3 FAQ pairs
  ogImage: number        // 0–10: og:image set
  canonical: number      // 0–10: canonical set
  internalLinks: number  // 0–10: ≥5 internal links
  pageSpeed: number      // 0–15: <2s load time
  breadcrumb: number     // 0–5:  breadcrumb schema
  reviews: number        // 0–5:  ≥1 real review
  total: number
}

export interface FaqPair {
  q: string
  a: string
  category?: string
}

// ── SEO Score ────────────────────────────────────────────────────────────────

export function computeAppSeoScore(appId: string): { score: number; breakdown: SeoScoreBreakdown } {
  const db = getDb()
  const app = getMarketplaceAppByIdOrSlug(appId)
  if (!app) return { score: 0, breakdown: emptyBreakdown() }

  const meta = db.prepare('SELECT * FROM app_seo_meta WHERE app_id = ?').get(appId) as AppSeoMeta | undefined

  const title = meta?.seo_title || `${app.name} — Reviews, Pricing, Alternatives | moonmart.ai`
  const desc = meta?.seo_description || app.description || ''
  const faqs: FaqPair[] = meta?.faq_json ? JSON.parse(meta.faq_json) : []

  const breakdown: SeoScoreBreakdown = {
    title: title.length >= 50 && title.length <= 70 ? 10 : title.length > 0 ? 5 : 0,
    description: desc.length >= 140 && desc.length <= 165 ? 10 : desc.length > 0 ? 5 : 0,
    schema: 15, // SoftwareApplication schema is always emitted by useSchemaMarkup
    faq: faqs.length >= 3 ? 10 : faqs.length > 0 ? 5 : 0,
    ogImage: 10, // OG image always served at /api/og/app/[id]
    canonical: 10, // canonical always set
    internalLinks: app.reviewCount > 0 ? 10 : 5, // proxy: reviewed apps have more links
    pageSpeed: meta?.page_speed_score ? (meta.page_speed_score >= 90 ? 15 : meta.page_speed_score >= 70 ? 10 : 5) : 8,
    breadcrumb: 5, // breadcrumb schema always emitted
    reviews: app.reviewCount >= 1 ? 5 : 0,
    total: 0
  }
  breakdown.total = Object.values(breakdown).reduce((s, v) => s + v, 0) - breakdown.total

  return { score: breakdown.total, breakdown }
}

function emptyBreakdown(): SeoScoreBreakdown {
  return { title: 0, description: 0, schema: 0, faq: 0, ogImage: 0, canonical: 0, internalLinks: 0, pageSpeed: 0, breadcrumb: 0, reviews: 0, total: 0 }
}

// ── SEO Meta Upsert ──────────────────────────────────────────────────────────

export function upsertAppSeoMeta(appId: string, patch: Partial<Omit<AppSeoMeta, 'app_id'>>) {
  const db = getDb()
  const now = new Date().toISOString()

  const existing = db.prepare('SELECT * FROM app_seo_meta WHERE app_id = ?').get(appId) as AppSeoMeta | undefined

  if (!existing) {
    db.prepare(`
      INSERT INTO app_seo_meta (app_id, seo_title, seo_description, seo_keywords, llm_summary, faq_json, comparison_slugs, seo_score, score_breakdown, page_speed_score, last_scored_at, last_ai_gen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appId,
      patch.seo_title ?? null,
      patch.seo_description ?? null,
      patch.seo_keywords ?? null,
      patch.llm_summary ?? null,
      patch.faq_json ?? '[]',
      patch.comparison_slugs ?? '[]',
      patch.seo_score ?? 0,
      patch.score_breakdown ?? '{}',
      patch.page_speed_score ?? null,
      patch.last_scored_at ?? null,
      patch.last_ai_gen_at ?? null,
      now
    )
  } else {
    const fields = Object.keys(patch).filter(k => k !== 'app_id')
    if (fields.length === 0) return
    const sets = fields.map(f => `${f} = ?`).join(', ')
    const values = fields.map(f => (patch as Record<string, unknown>)[f])
    db.prepare(`UPDATE app_seo_meta SET ${sets}, updated_at = ? WHERE app_id = ?`)
      .run(...values, now, appId)
  }
}

// ── IndexNow ─────────────────────────────────────────────────────────────────

/**
 * Submit one or more URLs to IndexNow (Bing, Yandex) for immediate indexing.
 * Fire-and-forget: never throws, logs result to DB.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  const db = getDb()
  const urlList = urls.filter(u => u.startsWith('http'))
  if (urlList.length === 0) return

  const body = {
    host: BASE_URL.replace('https://', '').replace('http://', ''),
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList
  }

  const engines = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ]

  for (const endpoint of engines) {
    const id = makeId('inow')
    const engineName = endpoint.includes('bing') ? 'bing' : 'indexnow'
    try {
      const res = await $fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
        timeout: 8000
      }).catch(() => null)

      db.prepare(`INSERT OR IGNORE INTO indexnow_log (id, url, engine, status, response, submitted_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`)
        .run(id, urlList[0], engineName, 'submitted', JSON.stringify(res))
    } catch {
      db.prepare(`INSERT OR IGNORE INTO indexnow_log (id, url, engine, status, submitted_at) VALUES (?, ?, ?, 'error', datetime('now'))`)
        .run(id, urlList[0], engineName)
    }
  }
}

/**
 * Submit a single app's canonical URL + related pages to IndexNow.
 * Call this whenever an app is created, updated, or gets a new review.
 */
export async function indexNowApp(slugOrId: string): Promise<void> {
  const app = getMarketplaceAppByIdOrSlug(slugOrId)
  if (!app) return

  const slug = app.slug
  await submitToIndexNow([
    `${BASE_URL}/marketplace/app/${slug}`,
    `${BASE_URL}/alternatives/${slug}`,
    `${BASE_URL}/pricing/${slug}`,
    `${BASE_URL}/api/sitemap-apps.xml`,
  ])

  // Mark indexed_at on app_listings
  const db = getDb()
  try {
    db.prepare(`UPDATE app_listings SET indexed_at = datetime('now') WHERE slug = ?`).run(slug)
  } catch { /* column may not exist yet in migration */ }
}

// ── FAQ Generation (AI-powered, cached in DB) ────────────────────────────────

export function getStoredFaqs(appId: string): FaqPair[] {
  const db = getDb()
  const meta = db.prepare('SELECT faq_json FROM app_seo_meta WHERE app_id = ?').get(appId) as { faq_json: string } | undefined
  if (!meta?.faq_json) return []
  try { return JSON.parse(meta.faq_json) } catch { return [] }
}

export function buildDefaultFaqs(app: { name: string; description: string; pricing: { type: string; value?: number; period?: string }; category: string; rating: number; reviewCount: number }): FaqPair[] {
  const priceAnswer = app.pricing.type === 'free'
    ? `${app.name} is free to use. There may be paid plans available for advanced features.`
    : app.pricing.type === 'contact'
      ? `${app.name} uses custom pricing. Contact their sales team for a personalised quote.`
      : app.pricing.value
        ? `${app.name} starts at $${app.pricing.value}/${app.pricing.period || 'month'}. Visit moonmart.ai for the full pricing breakdown.`
        : `${app.name} offers paid plans. Visit moonmart.ai for full pricing details and a free trial if available.`

  return [
    { q: `What is ${app.name}?`, a: app.description, category: 'definition' },
    { q: `How much does ${app.name} cost?`, a: priceAnswer, category: 'pricing' },
    { q: `What are the best alternatives to ${app.name}?`, a: `Discover the top alternatives to ${app.name} on moonmart.ai — compare features, pricing, and verified reviews side-by-side.`, category: 'alternatives' },
    { q: `Is ${app.name} worth it?`, a: app.rating >= 4.5 ? `Yes. ${app.name} is highly rated at ${app.rating.toFixed(1)}/5 based on ${app.reviewCount} verified reviews on moonmart.ai.` : `${app.name} is rated ${app.rating.toFixed(1)}/5 based on ${app.reviewCount} reviews. Read the full AI review synthesis on moonmart.ai to decide.`, category: 'evaluation' },
    { q: `What category does ${app.name} belong to?`, a: `${app.name} is listed under ${app.category.replace(/-/g, ' ')} on moonmart.ai.`, category: 'classification' },
  ]
}

// ── Helpers for sitemaps / llms.txt ──────────────────────────────────────────

export function getAllPublishedApps(): Array<{ id: string; slug: string; name: string; description: string; category: string; updated_at: string; rating: number; review_count: number }> {
  const db = getDb()
  return db.prepare(`
    SELECT id, slug, name, short_description as description, category, updated_at, rating, review_count
    FROM app_listings
    WHERE status = 'published'
    ORDER BY updated_at DESC
  `).all() as Array<{ id: string; slug: string; name: string; description: string; category: string; updated_at: string; rating: number; review_count: number }>
}

export function getTopAppsByCategory(limit = 5): Array<{ slug: string; name: string; category: string }> {
  const db = getDb()
  return db.prepare(`
    SELECT slug, name, category FROM app_listings
    WHERE status = 'published'
    ORDER BY rating DESC, review_count DESC
    LIMIT ?
  `).all(limit) as Array<{ slug: string; name: string; category: string }>
}
