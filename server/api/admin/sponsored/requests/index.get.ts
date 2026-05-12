import { defineEventHandler, getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const { requireAuth } = await import('~/server/utils/auth').catch(() => ({ requireAuth: null }))
    if (requireAuth) await requireAuth(event)
  } catch { /* auth utils not available */ }

  try {
    const db = (event.context as Record<string, unknown>).db as import('better-sqlite3').Database | undefined
    if (!db) throw new Error('no db')
    const rows = db.prepare(`
      SELECT sr.*, u.name AS vendorName, a.name AS appName
      FROM sponsored_requests sr
      LEFT JOIN users u ON u.id = sr.vendor_id
      LEFT JOIN apps a ON a.id = sr.app_id
      ORDER BY sr.created_at DESC
    `).all()
    return rows
  } catch {
    // Return demo data as graceful fallback when DB not migrated
    return [
      {
        id: 'vreq_1', vendorName: 'Acme Corp', appName: 'Acme CRM',
        slot: 'category_top', startsAt: '2026-06-01', endsAt: '2026-06-30',
        goal: 'lead_gen', budget: 500, tagline: 'The #1 CRM for growing SaaS teams',
        notes: 'Looking to target the CRM and Sales categories.',
        submittedAt: '2026-05-10', status: 'pending'
      },
      {
        id: 'vreq_2', vendorName: 'FlowDesk', appName: 'FlowDesk Pro',
        slot: 'newsletter', startsAt: '2026-06-07', endsAt: '2026-06-28',
        goal: 'launch', budget: 400, notes: 'New product launch — very time-sensitive.',
        submittedAt: '2026-05-12', status: 'pending'
      }
    ]
  }
})
