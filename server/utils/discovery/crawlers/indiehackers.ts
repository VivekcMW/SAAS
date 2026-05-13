/**
 * IndieHackers Crawler
 * Source: https://www.indiehackers.com/products (public HTML + structured JSON-LD)
 * Schedule: Weekly
 * Auth: None required
 * Est. apps: ~30-80 per run
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const IH_BASE = 'https://www.indiehackers.com'
const IH_PRODUCTS_URL = `${IH_BASE}/products`
const NEXT_DATA_RE = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/

const SKIP_DOMAINS = [
  'github.com', 'gitlab.com', 'twitter.com', 'x.com',
  'youtube.com', 'medium.com', 'reddit.com', 'indiehackers.com'
]

interface IHProduct {
  name: string
  url: string
  ihUrl: string
  tagline: string
  revenue: string
}

type RawItem = Record<string, unknown>

function strVal(v: unknown, fb = ''): string {
  return typeof v === 'string' ? v : fb
}

function isSaasUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return !SKIP_DOMAINS.some(s => host.endsWith(s))
  }
  catch { return false }
}

function parseFromNextData(html: string, _pageUrl: string): IHProduct[] {
  const dataMatch = NEXT_DATA_RE.exec(html)
  if (!dataMatch?.[1]) return []

  try {
    const nextData = JSON.parse(dataMatch[1]) as { props?: { pageProps?: RawItem } }
    const pp = nextData?.props?.pageProps
    const productList: RawItem[] = (
      (pp?.products as RawItem[] | undefined) ??
      ((pp?.initialData as RawItem | undefined)?.products as RawItem[] | undefined) ??
      []
    )

    const results: IHProduct[] = []
    for (const p of productList) {
      const website = strVal(p.url ?? p.websiteUrl ?? p.website)
      const name = strVal(p.name ?? p.title)
      const slug = strVal(p.slug)
      if (!website || !isSaasUrl(website)) continue
      results.push({
        name,
        url: website.startsWith('http') ? website : `https://${website}`,
        ihUrl: `${IH_BASE}/products/${slug}`,
        tagline: strVal(p.tagline ?? p.description),
        revenue: strVal(p.revenueAmount ?? p.mrr)
      })
    }
    return results
  }
  catch { return [] }
}

function parseFromAnchors(html: string, pageUrl: string): IHProduct[] {
  const cardRe = /href="(https?:\/\/[^"]+)"[^>]*>[^<]*<\/a>/g
  const results: IHProduct[] = []
  const seen = new Set<string>()
  let m: RegExpExecArray | null

  while ((m = cardRe.exec(html)) !== null) {
    const href = m[1]
    if (!href || seen.has(href) || !isSaasUrl(href)) continue
    seen.add(href)
    results.push({ name: '', url: href, ihUrl: pageUrl, tagline: '', revenue: '' })
  }
  return results
}

async function fetchIHPage(pageNum: number): Promise<IHProduct[]> {
  const url = pageNum === 1 ? IH_PRODUCTS_URL : `${IH_PRODUCTS_URL}?page=${pageNum}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaasWorldBot/1.0)', 'Accept': 'text/html' }
  })
  if (!res.ok) throw new Error(`IndieHackers HTTP ${res.status}`)
  const html = await res.text()
  const fromJson = parseFromNextData(html, url)
  return fromJson.length ? fromJson : parseFromAnchors(html, url)
}

async function enrichItem(product: IHProduct, extracted: Record<string, unknown>): Promise<void> {
  try {
    const pageText = await fetchPageText(product.url)
    const ai = await extractWithAI(pageText, product.url)
    extracted.name = extracted.name || ai.name
    extracted.tagline = ai.tagline || extracted.tagline
    extracted.short_description = ai.short_description
    extracted.long_description = ai.long_description
    extracted.category = ai.category
    extracted.pricing_type = ai.pricing_type
    extracted.pricing_starts_at = ai.pricing_starts_at
    extracted.key_features = ai.key_features
    extracted.target_audience = ai.target_audience
    extracted.logo_url = ai.logo_url
    extracted.confidence = ai.confidence
  }
  catch { /* site unreachable */ }
}

export async function runIndieHackersCrawler(limit = 80): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'indiehackers', ?, 'running')`).run(runId, startedAt)

  let found = 0, added = 0, failed = 0

  try {
    const allProducts: IHProduct[] = []
    for (let page = 1; page <= 5 && allProducts.length < limit; page++) {
      const batch = await fetchIHPage(page)
      if (!batch.length) break
      allProducts.push(...batch)
      await new Promise(r => setTimeout(r, 2000))
    }

    found = allProducts.length
    const newUrls = filterNew(allProducts.map(p => p.url))
    const newSet = new Set(newUrls)
    const toProcess = allProducts.filter(p => newSet.has(p.url)).slice(0, limit)
    const now = new Date().toISOString()

    for (const product of toProcess) {
      try {
        const extracted: Record<string, unknown> = {
          name: product.name, tagline: product.tagline,
          short_description: product.tagline, long_description: '',
          category: 'Other', pricing_type: 'contact', pricing_starts_at: null,
          target_audience: '', key_features: [], integrations: [],
          logo_url: null, website_url: product.url, founded_year: null,
          ih_revenue: product.revenue,
          confidence: {
            name: product.name ? 0.8 : 0.2, description: product.tagline ? 0.6 : 0.1,
            category: 0.2, pricing: 0.1, features: 0.1, overall: product.name ? 0.4 : 0.2
          }
        }
        await enrichItem(product, extracted)
        const score = computeScore(extracted.confidence as FieldConfidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')
        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score, status, processed_at, created_at)
          VALUES (?, 'indiehackers', ?, ?, ?, ?, ?, ?, ?)
        `).run(itemId, product.ihUrl, product.url, JSON.stringify(extracted), score, status, now, now)
        added++
      }
      catch (err) { console.error('[ih-crawler] Failed for', product.url, err); failed++ }
      await new Promise(r => setTimeout(r, 2500))
    }
  }
  catch (err) {
    console.error('[ih-crawler] Fatal error', err)
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=? WHERE id=?`)
    .run(new Date().toISOString(), found, added, failed, runId)
  console.log(`[ih-crawler] Done. found=${found} added=${added} failed=${failed}`)
  return { found, added, failed }
}
