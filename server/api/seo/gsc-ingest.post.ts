/**
 * POST /api/seo/gsc-ingest
 * Ingest Google Search Console data via webhook or manual push.
 *
 * Payload (array of rows from GSC API):
 * {
 *   rows: Array<{
 *     keys: [url, query, date],   // dimensions: page, query, date
 *     impressions: number,
 *     clicks: number,
 *     ctr: number,
 *     position: number
 *   }>
 * }
 *
 * Auth: x-internal-secret header (same pattern as IndexNow webhook).
 */
import { getDb, makeId } from '~/server/utils/database'

interface GscRow {
  keys: [string, string, string] // [url, query, date]
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export default defineEventHandler(async (event) => {
  // Internal-only: validate secret header
  const secret = getHeader(event, 'x-internal-secret')
  const expected = process.env.INTERNAL_WEBHOOK_SECRET
  if (!expected || secret !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ rows?: GscRow[] }>(event)
  if (!Array.isArray(body?.rows) || !body.rows.length) {
    throw createError({ statusCode: 400, statusMessage: 'rows array required' })
  }

  const db = getDb()

  // Resolve app_id from URL (match slug in app_listings)
  const appCache = new Map<string, string | null>()
  function resolveAppId(url: string): string | null {
    const match = url.match(/\/marketplace\/app\/([^/?#]+)/)
    if (!match) return null
    const slug = match[1]
    if (appCache.has(slug)) return appCache.get(slug)!
    const row = db.prepare('SELECT id FROM app_listings WHERE slug = ? OR id = ?').get(slug, slug) as { id: string } | undefined
    const id = row?.id ?? null
    appCache.set(slug, id)
    return id
  }

  const upsert = db.prepare(`
    INSERT INTO seo_search_console (id, app_id, url, query, impressions, clicks, ctr, position, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      impressions = excluded.impressions,
      clicks = excluded.clicks,
      ctr = excluded.ctr,
      position = excluded.position
  `)

  // Use composite key: url + query + date as deterministic ID
  const insertMany = db.transaction((rows: GscRow[]) => {
    let inserted = 0
    for (const row of rows) {
      const [url, query, date] = row.keys
      const appId = resolveAppId(url)
      // Deterministic ID from url+query+date hash (simple enough for SQLite)
      const deterministicId = makeId('gsc').slice(0, 4) + Buffer.from(`${url}|${query}|${date}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)
      upsert.run(deterministicId, appId, url, query, row.impressions, row.clicks, row.ctr, row.position, date)
      inserted++
    }
    return inserted
  })

  const count = insertMany(body.rows)
  return { ok: true, ingested: count }
})
