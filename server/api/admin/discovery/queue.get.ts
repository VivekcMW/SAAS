/**
 * GET /api/admin/discovery/queue
 * Returns the auto-discovery queue with counts by status.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  await requireAdmin(event)
  const db = getDb()

  const q = getQuery(event)
  const status = typeof q.status === 'string' ? q.status : ''
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 20)
  const offset = (page - 1) * limit

  const conditions = status ? ['status = ?'] : []
  const params: unknown[] = status ? [status] : []

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const items = db.prepare(`
    SELECT id, source, source_url, website_url, extracted_data, confidence_score,
           status, listing_id, reject_reason, claim_email_sent, processed_at, created_at
    FROM discovery_queue
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as Array<{
    id: string; source: string; source_url: string | null; website_url: string
    extracted_data: string; confidence_score: number; status: string
    listing_id: string | null; reject_reason: string | null; claim_email_sent: number
    processed_at: string | null; created_at: string
  }>

  // Status counts
  const counts = db.prepare(`
    SELECT status, COUNT(*) as c FROM discovery_queue GROUP BY status
  `).all() as Array<{ status: string; c: number }>

  const countMap: Record<string, number> = {}
  counts.forEach(({ status: s, c }) => { countMap[s] = c })

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM discovery_queue ${where}`).get(...params) as { total: number }

  return {
    items: items.map(item => ({
      id: item.id,
      source: item.source,
      sourceUrl: item.source_url,
      websiteUrl: item.website_url,
      extracted: (() => { try { return JSON.parse(item.extracted_data) } catch { return {} } })(),
      confidenceScore: item.confidence_score,
      status: item.status,
      listingId: item.listing_id,
      rejectReason: item.reject_reason,
      claimEmailSent: Boolean(item.claim_email_sent),
      processedAt: item.processed_at,
      createdAt: item.created_at
    })),
    counts: {
      pending: countMap.pending ?? 0,
      auto_submitted: countMap.auto_submitted ?? 0,
      review: countMap.review ?? 0,
      approved: countMap.approved ?? 0,
      rejected: countMap.rejected ?? 0,
      discarded: countMap.discarded ?? 0
    },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }
})
