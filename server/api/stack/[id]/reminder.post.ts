/**
 * POST /api/stack/:id/reminder
 * Set a renewal reminder for a stack item.
 */
import { getDb, makeId } from '~/server/utils/database'
import { getUserKey } from '../index.get'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userKey = getUserKey(event)
  const db = getDb()

  const item = db.prepare('SELECT id FROM user_stacks WHERE id = ? AND user_key = ?').get(id, userKey) as any
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Stack item not found' })

  const body = await readBody(event)
  const { remind_at } = body || {}
  if (!remind_at) throw createError({ statusCode: 400, statusMessage: 'remind_at (ISO date) is required' })

  const now = new Date().toISOString()
  const existing = db.prepare('SELECT id FROM renewal_reminders WHERE stack_item_id = ? AND sent = 0').get(id) as any
  if (existing) {
    db.prepare('UPDATE renewal_reminders SET remind_at = ? WHERE id = ?').run(remind_at, existing.id)
    return { message: 'Reminder updated' }
  }

  db.prepare('INSERT INTO renewal_reminders (id, user_key, stack_item_id, remind_at, sent, created_at) VALUES (?,?,?,?,0,?)')
    .run(makeId('rem'), userKey, id, remind_at, now)
  return { message: 'Reminder set' }
})
