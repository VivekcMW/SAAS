/**
 * GET /api/stack/similar
 * Returns apps frequently used alongside the user's current stack (co-occurrence).
 */
import { getDb } from '~/server/utils/database'
import { getUserKey } from './index.get'

export default defineEventHandler(async (event) => {
  const userKey = getUserKey(event)
  const db = getDb()

  const stackApps = db.prepare('SELECT app_id FROM user_stacks WHERE user_key = ?').all(userKey) as { app_id: string }[]
  if (!stackApps.length) return { suggestions: [] }

  const ids = stackApps.map(s => s.app_id)
  const placeholders = ids.map(() => '?').join(', ')

  // Find apps that co-occur most with any app in the stack but aren't in the stack yet
  const suggestions = db.prepare(`
    SELECT
      CASE WHEN so.app_id_a IN (${placeholders}) THEN so.app_id_b ELSE so.app_id_a END AS suggested_app_id,
      SUM(so.co_occurrence) AS total_overlap
    FROM stack_overlaps so
    WHERE (so.app_id_a IN (${placeholders}) OR so.app_id_b IN (${placeholders}))
      AND CASE WHEN so.app_id_a IN (${placeholders}) THEN so.app_id_b ELSE so.app_id_a END NOT IN (${placeholders})
    GROUP BY suggested_app_id
    ORDER BY total_overlap DESC
    LIMIT 6
  `).all(...ids, ...ids, ...ids, ...ids, ...ids) as { suggested_app_id: string; total_overlap: number }[]

  if (!suggestions.length) return { suggestions: [] }

  const appIds = suggestions.map(s => s.suggested_app_id)
  const appMap = new Map<string, any>()
  for (const appId of appIds) {
    const a = db.prepare('SELECT id, name, logo, category, rating, review_count, slug FROM app_listings WHERE id = ?').get(appId)
    if (a) appMap.set(appId, a)
  }

  return {
    suggestions: suggestions
      .filter(s => appMap.has(s.suggested_app_id))
      .map(s => ({ ...appMap.get(s.suggested_app_id), overlap_score: s.total_overlap }))
  }
})
