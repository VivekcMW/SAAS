import { createHash } from 'node:crypto'
import { getDb } from '~/server/utils/database'
import { checkRateLimit } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  // 30 votes per IP per hour across all items
  if (!checkRateLimit(ip, { limit: 30, windowMs: 3_600_000, prefix: 'roadmap-vote' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const body = await readBody(event)
  const itemId = typeof body?.item_id === 'string' ? body.item_id.trim() : ''
  if (!itemId) {
    throw createError({ statusCode: 400, statusMessage: 'item_id is required' })
  }

  const db = getDb()

  // Verify item exists
  const item = db.prepare('SELECT id FROM roadmap_items WHERE id = ?').get(itemId) as { id: string } | undefined
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Roadmap item not found' })
  }

  // Voter key: hash of ip + item_id (prevents double-voting per item per IP)
  const voterKey = createHash('sha256').update(`${ip}:${itemId}`).digest('hex')
  const now = new Date().toISOString()

  // Insert vote (PRIMARY KEY constraint prevents duplicates)
  const insertVote = db.prepare(
    'INSERT OR IGNORE INTO roadmap_votes (item_id, voter_key, created_at) VALUES (?, ?, ?)'
  )
  const result = insertVote.run(itemId, voterKey, now)

  if (result.changes === 0) {
    // Already voted
    const current = db.prepare('SELECT votes FROM roadmap_items WHERE id = ?').get(itemId) as { votes: number }
    return { voted: false, votes: current.votes, message: 'Already voted' }
  }

  // Increment vote count
  db.prepare('UPDATE roadmap_items SET votes = votes + 1, updated_at = ? WHERE id = ?').run(now, itemId)

  const updated = db.prepare('SELECT votes FROM roadmap_items WHERE id = ?').get(itemId) as { votes: number }

  return { voted: true, votes: updated.votes, item_id: itemId }
})
