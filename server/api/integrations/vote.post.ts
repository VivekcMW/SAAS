/**
 * POST /api/integrations/vote
 * Upvote an integration. One vote per IP per integration.
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'int_vote', limit: 30, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many votes.' })
  }

  const body = await readBody(event)
  const { integration_id } = body || {}
  if (!integration_id) throw createError({ statusCode: 400, statusMessage: 'integration_id is required' })

  const db = getDb()
  const integration = db.prepare('SELECT id, vote_score FROM integrations WHERE id = ?').get(integration_id) as { id: string; vote_score: number } | undefined
  if (!integration) throw createError({ statusCode: 404, statusMessage: 'Integration not found' })

  const ua = getHeader(event, 'user-agent') || ''
  const voterKey = createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 20)
  const now = new Date().toISOString()

  const existing = db.prepare('SELECT id FROM integration_votes WHERE integration_id = ? AND voter_key = ?').get(integration_id, voterKey) as { id: string } | undefined
  if (existing) {
    // Undo vote
    db.prepare('DELETE FROM integration_votes WHERE id = ?').run(existing.id)
    db.prepare('UPDATE integrations SET vote_score = vote_score - 1 WHERE id = ?').run(integration_id)
    return { action: 'removed', vote_score: integration.vote_score - 1 }
  }

  db.prepare('INSERT INTO integration_votes (id, integration_id, voter_key, value, created_at) VALUES (?,?,?,1,?)').run(makeId('iv'), integration_id, voterKey, now)
  db.prepare('UPDATE integrations SET vote_score = vote_score + 1 WHERE id = ?').run(integration_id)
  return { action: 'added', vote_score: integration.vote_score + 1 }
})
