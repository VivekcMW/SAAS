// Admin: list refund requests
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status } = getQuery(event) as { status?: string }

  const db = getDb()
  const row = db.prepare(`SELECT value FROM admin_settings WHERE key = 'refund_requests'`).get() as { value: string } | undefined
  let requests: any[] = row ? JSON.parse(row.value) : []

  if (status && status !== 'all') {
    requests = requests.filter((r: any) => r.status === status)
  }

  return { requests, total: requests.length }
})
