/**
 * GET /api/buyer/stack
 * Returns the authenticated buyer's software stack.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const row = db.prepare('SELECT * FROM buyer_stacks WHERE user_id = ?').get(user.id) as {
    id: string; tools: string; total_spend: number; overlap_alerts: string; updated_at: string
  } | undefined

  if (!row) {
    return { tools: [], totalSpend: 0, overlapAlerts: [] }
  }

  return {
    tools: JSON.parse(row.tools),
    totalSpend: row.total_spend,
    overlapAlerts: JSON.parse(row.overlap_alerts),
    updatedAt: row.updated_at
  }
})
