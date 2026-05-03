/**
 * GET /api/admin/discovery/runs
 * Returns recent agent crawler run history from agent_runs table.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = getDb()
  const q = getQuery(event)
  const limit = Math.min(Number(q.limit) || 50, 200)

  const runs = db.prepare(`
    SELECT id, source, started_at, finished_at,
           urls_found, urls_new, urls_failed, status
    FROM agent_runs
    ORDER BY started_at DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: string
    source: string
    started_at: string
    finished_at: string | null
    urls_found: number
    urls_new: number
    urls_failed: number
    status: string
  }>

  return { runs }
})
