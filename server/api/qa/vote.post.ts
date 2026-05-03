/**
 * POST /api/qa/vote
 * Upvote or downvote a question or answer.
 * Body: { target_type: 'question'|'answer', target_id, value: 1|-1 }
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'qa_vote', limit: 60, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many votes. Try again later.' })
  }

  const body = await readBody(event)
  const { target_type, target_id, value } = body || {}

  if (!['question', 'answer'].includes(target_type)) {
    throw createError({ statusCode: 400, statusMessage: "target_type must be 'question' or 'answer'" })
  }
  if (value !== 1 && value !== -1) {
    throw createError({ statusCode: 400, statusMessage: 'value must be 1 or -1' })
  }

  // Anonymised voter key (IP + ua hash)
  const ua = getHeader(event, 'user-agent') || ''
  const voterKey = createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 20)

  const db = getDb()

  // Check target exists
  const table = target_type === 'question' ? 'questions' : 'answers'
  const target = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(target_id) as { id: string } | undefined
  if (!target) throw createError({ statusCode: 404, statusMessage: `${target_type} not found` })

  const existing = db.prepare(`
    SELECT id, value FROM qa_votes WHERE voter_key = ? AND target_type = ? AND target_id = ?
  `).get(voterKey, target_type, target_id) as { id: string; value: number } | undefined

  const now = new Date().toISOString()

  if (existing) {
    if (existing.value === value) {
      // Undo vote
      db.prepare(`DELETE FROM qa_votes WHERE id = ?`).run(existing.id)
      db.prepare(`UPDATE ${table} SET vote_score = vote_score - ? WHERE id = ?`).run(value, target_id)
      return { vote_score_delta: -value, action: 'removed' }
    } else {
      // Change vote
      db.prepare(`UPDATE qa_votes SET value = ?, created_at = ? WHERE id = ?`).run(value, now, existing.id)
      db.prepare(`UPDATE ${table} SET vote_score = vote_score + ? WHERE id = ?`).run(value * 2, target_id)
      return { vote_score_delta: value * 2, action: 'changed' }
    }
  }

  db.prepare(`
    INSERT INTO qa_votes (id, voter_key, target_type, target_id, value, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(makeId('vot'), voterKey, target_type, target_id, value, now)
  db.prepare(`UPDATE ${table} SET vote_score = vote_score + ? WHERE id = ?`).run(value, target_id)

  return { vote_score_delta: value, action: 'added' }
})
