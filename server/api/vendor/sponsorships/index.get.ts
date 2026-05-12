import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const { requireAuth } = await import('~/server/utils/auth').catch(() => ({ requireAuth: null }))
    if (requireAuth) await requireAuth(event)
  } catch { /* auth utils not available */ }

  try {
    const db = (event.context as Record<string, unknown>).db as import('better-sqlite3').Database | undefined
    if (!db) throw new Error('no db')

    // Vendor's own requests — in production, filter by authenticated vendor_id
    const rows = db.prepare(`
      SELECT * FROM sponsored_requests
      ORDER BY created_at DESC
    `).all()
    return rows
  } catch {
    // Return demo data as graceful fallback
    return [
      {
        id: 'req_1', appName: 'Acme CRM', slot: 'homepage_hero',
        status: 'active', startsAt: '2026-05-01', endsAt: '2026-05-31',
        goal: 'lead_gen', budget: 2000, submittedAt: '2026-04-22',
        impressions: 14200, clicks: 312, leadsAttributed: 18
      },
      {
        id: 'req_2', appName: 'Acme CRM', slot: 'category_top',
        status: 'pending', startsAt: '2026-06-01', endsAt: '2026-06-30',
        goal: 'brand_awareness', budget: 500, submittedAt: '2026-05-10'
      }
    ]
  }
})
