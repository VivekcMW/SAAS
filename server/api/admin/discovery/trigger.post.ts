/**
 * POST /api/admin/discovery/trigger
 * Manually triggers the auto-discovery pipeline (adds sample items to queue for dev).
 * In production, this would trigger the actual scripts/discovery/runner.ts process.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ urls?: string[] }>(event)
  const urls = body?.urls?.filter(u => typeof u === 'string' && u.startsWith('http')) ?? []

  if (urls.length === 0) {
    return { success: false, message: 'Provide urls[] to trigger discovery.' }
  }

  if (urls.length > 10) {
    throw createError({ statusCode: 400, statusMessage: 'Max 10 URLs per trigger request.' })
  }

  const db = getDb()
  const results: Array<{ url: string; status: string; score?: number; id?: string }> = []
  const now = new Date().toISOString()

  for (const url of urls) {
    // Deduplicate by domain
    const existing = db.prepare('SELECT id FROM discovery_queue WHERE website_url = ?').get(url)
    if (existing) {
      results.push({ url, status: 'duplicate' })
      continue
    }

    let extracted = {}
    let score = 0
    let queueStatus = 'pending'

    try {
      const pageText = await fetchPageText(url)
      const listing = await extractWithAI(pageText, url)
      score = computeScore(listing.confidence)
      queueStatus = routeByScore(score)
      extracted = listing
    }
    catch (err) {
      console.error('[discovery/trigger] extraction failed for', url, err)
      queueStatus = 'pending'
    }

    const itemId = makeId('dsc')
    db.prepare(`
      INSERT INTO discovery_queue
        (id, source, website_url, extracted_data, confidence_score, status, processed_at, created_at)
      VALUES (?, 'manual', ?, ?, ?, ?, ?, ?)
    `).run(itemId, url, JSON.stringify(extracted), score, queueStatus, now, now)

    results.push({ url, status: queueStatus, score, id: itemId })
  }

  return { success: true, results }
})
