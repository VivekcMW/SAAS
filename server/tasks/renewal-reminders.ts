import { getDb } from '~/server/utils/database'

interface StackItem {
  id: string
  user_id: string
  app_id: string
  renewal_date: string
}

export default defineTask({
  meta: {
    name: 'renewals:reminders',
    description: 'Flag stack items renewing within the next 30 days that have not yet been reminded'
  },
  async run() {
    const db = getDb()

    // Find stack items with renewal_date in [today, today+30] with no reminder sent
    const upcoming = db
      .prepare(
        `SELECT us.id, us.user_id, us.app_id, us.renewal_date
         FROM user_stacks us
         WHERE us.renewal_date IS NOT NULL
           AND date(us.renewal_date) BETWEEN date('now') AND date('now', '+30 days')
           AND NOT EXISTS (
             SELECT 1 FROM renewal_reminders rr
             WHERE rr.stack_item_id = us.id AND rr.sent = 1
           )`
      )
      .all() as StackItem[]

    const now = new Date().toISOString()
    const insert = db.prepare(
      `INSERT OR IGNORE INTO renewal_reminders (id, stack_item_id, user_id, days_before, sent, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`
    )

    let queued = 0
    for (const item of upcoming) {
      const reminderId = `rem_${item.id}_30d`
      const result = insert.run(reminderId, item.id, item.user_id, 30, now)
      queued += result.changes
    }

    return { result: 'ok', queued, found: upcoming.length }
  }
})
