/**
 * Zapier App Directory Crawler
 * Source: https://zapier.com/apps (public API + HTML fallback)
 * Schedule: Weekly
 * Auth: None required
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const ZAPIER_BASE = 'https://zapier.com'
const ZAPIER_APPS_API = 'https://api.zapier.com/v1/apps'
const ZAPIER_APPS_BROWSE = `${ZAPIER_BASE}/apps`
const NEXT_DATA_RE = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/

interface ZapierApp {
  name: string
  url: string
  zapierUrl: string
  description: string
  category: string
  slug: string
}

type RawItem = Record<string, unknown>

const CATEGORY_MAP: Record<string, string> = {
  'crm': 'CRM', 'project-management': 'Project Management',
  'marketing': 'Marketing', 'email': 'Marketing', 'analytics': 'Analytics',
  'ecommerce': 'E-Commerce', 'productivity': 'Productivity',
  'communication': 'Communication', 'finance': 'Finance & Accounting',
  'hr': 'HR & Recruitment', 'customer-support': 'Customer Support',
  'developer-tools': 'Developer Tools', 'sales': 'Sales',
  'design': 'Design', 'security': 'Security', 'data': 'Data & BI'
}

function strVal(v: unknown, fb = ''): string {
  return typeof v === 'string' ? v : fb
}

function mapCategory(raw: string): string {
  const key = raw.toLowerCase().replaceAll(/\s+/g, '-')
  return CATEGORY_MAP[key] ?? 'Other'
}

async function fetchFromApi(page: number): Promise<ZapierApp[] | null> {
  const params = new URLSearchParams({ per_page: '100', page: String(page) })
  const res = await fetch(`${ZAPIER_APPS_API}?${params}`, {
    signal: AbortSignal.timeout(15_000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaasWorldBot/1.0)', 'Accept': 'application/json' }
  })
  if (!res.ok) return null
  const json = await res.json() as { objects?: RawItem[] }
  if (!json.objects?.length) return null
  return json.objects
    .filter(a => a.homepage_url ?? a.url)
    .map(a => ({
      name: strVal(a.name),
      url: strVal(a.homepage_url ?? a.url),
      zapierUrl: a.slug ? `${ZAPIER_BASE}/apps/${strVal(a.slug)}` : ZAPIER_APPS_BROWSE,
      description: strVal(a.description),
      category: mapCategory(strVal(a.primary_category)),
      slug: strVal(a.slug)
    }))
}

function parseHtmlApps(html: string): ZapierApp[] {
  const dataMatch = NEXT_DATA_RE.exec(html)
  if (!dataMatch?.[1]) return []
  try {
    const data = JSON.parse(dataMatch[1]) as { props?: RawItem }
    const pp = data?.props?.pageProps as RawItem | undefined
    const items: RawItem[] = (pp?.apps as RawItem[] | undefined) ?? (pp?.initialApps as RawItem[] | undefined) ?? []
    const results: ZapierApp[] = []
    for (const item of items) {
      const homepage = strVal(item.homepage_url ?? item.url)
      if (!homepage.startsWith('http')) continue
      const slug = strVal(item.slug)
      results.push({
        name: strVal(item.name),
        url: homepage,
        zapierUrl: slug ? `${ZAPIER_BASE}/apps/${slug}` : ZAPIER_APPS_BROWSE,
        description: strVal(item.description),
        category: mapCategory(strVal(item.primary_category)),
        slug
      })
    }
    return results
  }
  catch { return [] }
}

async function fetchZapierPage(page: number): Promise<ZapierApp[]> {
  try {
    const fromApi = await fetchFromApi(page)
    if (fromApi?.length) return fromApi
  }
  catch { /* fall through */ }

  const browseUrl = page === 1 ? ZAPIER_APPS_BROWSE : `${ZAPIER_APPS_BROWSE}?page=${page}`
  const res = await fetch(browseUrl, {
    signal: AbortSignal.timeout(20_000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaasWorldBot/1.0)', 'Accept': 'text/html' }
  })
  if (!res.ok) throw new Error(`Zapier browse HTTP ${res.status}`)
  return parseHtmlApps(await res.text())
}

function buildExtracted(app: ZapierApp): Record<string, unknown> {
  return {
    name: app.name, tagline: app.description.slice(0, 120),
    short_description: app.description, long_description: '',
    category: app.category, pricing_type: 'contact', pricing_starts_at: null,
    target_audience: '', key_features: [], integrations: ['Zapier'],
    logo_url: null, website_url: app.url, founded_year: null,
    zapier_listing: app.zapierUrl,
    confidence: {
      name: app.name ? 0.9 : 0.2,
      description: app.description.length > 30 ? 0.7 : 0.2,
      category: app.category === 'Other' ? 0.2 : 0.75,
      pricing: 0.1, features: 0.1,
      overall: app.name ? 0.6 : 0.25
    }
  }
}

async function aiEnrich(app: ZapierApp, extracted: Record<string, unknown>): Promise<void> {
  try {
    const pageText = await fetchPageText(app.url)
    const ai = await extractWithAI(pageText, app.url)
    extracted.tagline = ai.tagline || extracted.tagline
    extracted.short_description = ai.short_description || extracted.short_description
    extracted.long_description = ai.long_description
    if (extracted.category === 'Other') extracted.category = ai.category
    extracted.pricing_type = ai.pricing_type
    extracted.pricing_starts_at = ai.pricing_starts_at
    extracted.key_features = ai.key_features
    extracted.target_audience = ai.target_audience
    extracted.logo_url = ai.logo_url
    extracted.confidence = ai.confidence
  }
  catch { /* keep Zapier data */ }
}

export async function runZapierCrawler(limit = 150): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'zapier', ?, 'running')`).run(runId, new Date().toISOString())

  let found = 0, added = 0, failed = 0

  try {
    const allApps: ZapierApp[] = []
    for (let page = 1; page <= 5 && allApps.length < limit; page++) {
      const batch = await fetchZapierPage(page)
      if (!batch.length) break
      allApps.push(...batch)
      await new Promise(r => setTimeout(r, 2000))
    }

    const withUrls = allApps.filter(a => a.url.startsWith('http'))
    found = withUrls.length
    const newSet = new Set(filterNew(withUrls.map(a => a.url)))
    const toProcess = withUrls.filter(a => newSet.has(a.url)).slice(0, limit)
    const now = new Date().toISOString()

    for (const app of toProcess) {
      try {
        const extracted = buildExtracted(app)
        await aiEnrich(app, extracted)
        const score = computeScore(extracted.confidence as FieldConfidence)
        const itemId = makeId('dsc')
        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score, status, processed_at, created_at)
          VALUES (?, 'zapier', ?, ?, ?, ?, ?, ?, ?)
        `).run(itemId, app.zapierUrl, app.url, JSON.stringify(extracted), score, routeByScore(score), now, now)
        added++
      }
      catch (err) { console.error('[zapier-crawler] Failed for', app.url, err); failed++ }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  catch (err) {
    console.error('[zapier-crawler] Fatal error', err)
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=? WHERE id=?`)
    .run(new Date().toISOString(), found, added, failed, runId)
  console.log(`[zapier-crawler] Done. found=${found} added=${added} failed=${failed}`)
  return { found, added, failed }
}
