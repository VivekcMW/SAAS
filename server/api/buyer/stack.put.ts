/**
 * PUT /api/buyer/stack
 * Update the authenticated buyer's software stack.
 *
 * Body: { tools: StackTool[] }
 * Each tool: { app_id?, name, category, monthly_cost?, renewal_date?, notes? }
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

interface StackTool {
  app_id?: string
  name: string
  category: string
  monthly_cost?: number
  renewal_date?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ tools?: StackTool[] }>(event)

  if (!Array.isArray(body?.tools)) {
    throw createError({ statusCode: 400, statusMessage: 'tools array is required' })
  }

  // Sanitise
  const tools = body.tools.map(t => ({
    app_id: typeof t.app_id === 'string' ? t.app_id : null,
    name: String(t.name || '').trim().slice(0, 100),
    category: String(t.category || '').trim().slice(0, 60),
    monthly_cost: typeof t.monthly_cost === 'number' ? t.monthly_cost : null,
    renewal_date: typeof t.renewal_date === 'string' ? t.renewal_date : null,
    notes: typeof t.notes === 'string' ? t.notes.trim().slice(0, 500) : null
  })).filter(t => t.name)

  const totalSpend = tools.reduce((s, t) => s + (t.monthly_cost ?? 0), 0)
  const now = new Date().toISOString()
  const db = getDb()

  const existing = db.prepare('SELECT id FROM buyer_stacks WHERE user_id = ?').get(user.id) as { id: string } | undefined

  if (existing) {
    db.prepare(`
      UPDATE buyer_stacks SET tools = ?, total_spend = ?, overlap_alerts = '[]', updated_at = ? WHERE user_id = ?
    `).run(JSON.stringify(tools), totalSpend, now, user.id)
  } else {
    db.prepare(`
      INSERT INTO buyer_stacks (id, user_id, tools, total_spend, overlap_alerts, updated_at)
      VALUES (?, ?, ?, ?, '[]', ?)
    `).run(makeId('stk'), user.id, JSON.stringify(tools), totalSpend, now)
  }

  return { success: true, totalSpend, toolCount: tools.length }
})
