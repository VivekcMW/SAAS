/**
 * AppSumo Crawler
 * Source: https://appsumo.com/browse/ (public HTML product listings)
 * Schedule: Weekly
 * Auth: None required
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const APPSUMO_BASE = 'https://appsumo.com'
const APPSUMO_BROWSE = `${APPSUMO_BASE}/browse/`
const NEXT_DATA_RE = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/

interface AppSumoProduct {
  name: string
  url: string
  sumoUrl: string
  tagline: string
  category: string
}

type RawItem = Record<string, unknown>

const CATEGORY_MAP: Record<string, string> = {
  'marketing': 'Marketing', 'productivity': 'Productivity', 'business': 'Operations',
  'design': 'Design', 'development': 'Developer Tools', 'sales': 'Sales',
  'social-media': 'Marketing', 'analytics': 'Analytics',
  'finance': 'Finance & Accounting', 'education': 'Education',
  'customer-support': 'Customer Support', 'crm': 'CRM'
}

function strVal(v: unknown, fb = ''): string {
  return typeof v === 'string' ? v : fb
}

function mapCategory(raw: string): string {
  const key = raw.toLowerCase().replaceAll(/\s+/g, '-')
  return CATEGORY_MAP[key] ?? 'Other'
}

function parseNextDataProducts(html: string): AppSumoProduct[] {
  const dataMatch = NEXT_DATA_RE.exec(html)
  if (!dataMatch?.[1]) return []
  try {
    const nextData = JSON.parse(dataMatch[1]) as { props?: RawItem }
    const pp = (nextData?.props?.pageProps as RawItem | undefined) ?? {}
    const items: RawItem[] =
      ((pp?.dehydratedState as RawItem | undefined)?.queries as RawItem[] | undefined)?.[0]
        ? (((pp.dehydratedState as RawItem).queries as RawItem[])[0]?.state as RawItem)?.data as RawItem[]
        : (pp?.products as RawItem[] | undefined) ?? []

    const results: AppSumoProduct[] = []
    for (const item of (items ?? [])) {
      const website = strVal(item.url ?? item.website_url ?? item.product_url)
      if (!website.startsWith('http')) continue
      const slug = strVal(item.slug ?? item.public_slug)
      results.push({
        name: strVal(item.name ?? item.product_name),
        url: website,
        sumoUrl: slug ? `${APPSUMO_BASE}/products/${slug}` : APPSUMO_BROWSE,
        tagline: strVal(item.tagline ?? item.headline ?? item.short_description),
        category: mapCategory(strVal(item.category ?? item.primary_category))
      })
    }
    return results
  }
  catch { return [] }
}

function parseProductLinks(html: string): AppSumoProduct[] {
  const productLinkRe = /href="(\/products\/[a-z0-9-]+)"/g
  const slugsSeen = new Set<string>()
  const results: AppSumoProduct[] = []
  let m: RegExpExecArray | null
  while ((m = productLinkRe.exec(html)) !== null) {
    const path = m[1]
    if (slugsSeen.has(path)) continue
    slugsSeen.add(path)
    results.push({ name: '', url: '', sumoUrl: `${APPSUMO_BASE}${path}`, tagline: '', category: 'Other' })
  }
  return results
}

async function fetchAppSumoPage(page = 1): Promise<AppSumoProduct[]> {
  const url = `${APPSUMO_BROWSE}?page=${page}&ordering=-published_at`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaasWorldBot/1.0)', 'Accept': 'text/html' }
  })
  if (!res.ok) throw new Error(`AppSumo HTTP ${res.status}`)
  const html = await res.text()
  const fromJson = parseNextDataProducts(html)
  return fromJson.length ? fromJson : parseProductLinks(html)
}

async function fetchProductWebsiteUrl(sumoUrl: string): Promise<string | null> {
  try {
    const res = await fetch(sumoUrl, { signal: AbortSignal.timeout(15_000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaasWorldBot/1.0)' } })
    if (!res.ok) return null
    const html = await res.text()
    const visitRe = /href="(https?:\/\/(?!appsumo)[^"]+)"[^>]*>(?:Visit|Go to|Launch)/i
    const m = visitRe.exec(html)
    if (m?.[1]) return m[1]
    const dm = NEXT_DATA_RE.exec(html)
    if (dm?.[1]) {
      const data = JSON.parse(dm[1]) as { props?: RawItem }
      const pp = data?.props?.pageProps as RawItem | undefined
      const prod = pp?.product as RawItem | undefined
      const siteUrl = strVal(prod?.url ?? prod?.website_url)
      if (siteUrl.startsWith('http')) return siteUrl
    }
    return null
  }
  catch { return null }
}

function buildExtracted(product: AppSumoProduct): Record<string, unknown> {
  return {
    name: product.name, tagline: product.tagline, short_description: product.tagline,
    long_description: '', category: product.category,
    pricing_type: 'paid', pricing_starts_at: null,
    target_audience: '', key_features: [], integrations: [],
    logo_url: null, website_url: product.url, founded_year: null,
    appsumo_listing: product.sumoUrl,
    confidence: {
      name: product.name ? 0.85 : 0.2,
      description: product.tagline ? 0.65 : 0.1,
      category: product.category === 'Other' ? 0.2 : 0.7,
      pricing: 0.5, features: 0.1,
      overall: product.name ? 0.55 : 0.3
    }
  }
}

async function aiEnrich(product: AppSumoProduct, extracted: Record<string, unknown>): Promise<void> {
  try {
    const pageText = await fetchPageText(product.url)
    const ai = await extractWithAI(pageText, product.url)
    if (!extracted.name) extracted.name = ai.name
    extracted.tagline = ai.tagline || extracted.tagline
    extracted.short_description = ai.short_description
    extracted.long_description = ai.long_description
    if (extracted.category === 'Other') extracted.category = ai.category
    extracted.pricing_type = ai.pricing_type
    extracted.pricing_starts_at = ai.pricing_starts_at
    extracted.key_features = ai.key_features
    extracted.target_audience = ai.target_audience
    extracted.logo_url = ai.logo_url
    extracted.confidence = ai.confidence
  }
  catch { /* keep AppSumo metadata */ }
}

export async function runAppSumoCrawler(limit = 80): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'appsumo', ?, 'running')`).run(runId, new Date().toISOString())

  let found = 0, added = 0, failed = 0

  try {
    const allProducts: AppSumoProduct[] = []
    for (let page = 1; page <= 5 && allProducts.length < limit; page++) {
      const batch = await fetchAppSumoPage(page)
      if (!batch.length) break
      allProducts.push(...batch)
      await new Promise(r => setTimeout(r, 2000))
    }

    for (const p of allProducts) {
      if (!p.url && p.sumoUrl) {
        p.url = (await fetchProductWebsiteUrl(p.sumoUrl)) ?? ''
        await new Promise(r => setTimeout(r, 1500))
      }
    }

    const withUrls = allProducts.filter(p => p.url.startsWith('http'))
    found = withUrls.length
    const newSet = new Set(filterNew(withUrls.map(p => p.url)))
    const toProcess = withUrls.filter(p => newSet.has(p.url)).slice(0, limit)
    const now = new Date().toISOString()

    for (const product of toProcess) {
      try {
        const extracted = buildExtracted(product)
        await aiEnrich(product, extracted)
        const score = computeScore(extracted.confidence as FieldConfidence)
        const itemId = makeId('dsc')
        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score, status, processed_at, created_at)
          VALUES (?, 'appsumo', ?, ?, ?, ?, ?, ?, ?)
        `).run(itemId, product.sumoUrl, product.url, JSON.stringify(extracted), score, routeByScore(score), now, now)
        added++
      }
      catch (err) { console.error('[appsumo-crawler] Failed for', product.url, err); failed++ }
      await new Promise(r => setTimeout(r, 2500))
    }
  }
  catch (err) {
    console.error('[appsumo-crawler] Fatal error', err)
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=? WHERE id=?`)
    .run(new Date().toISOString(), found, added, failed, runId)
  console.log(`[appsumo-crawler] Done. found=${found} added=${added} failed=${failed}`)
  return { found, added, failed }
}
