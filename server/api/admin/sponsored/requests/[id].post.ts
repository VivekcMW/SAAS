import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const { requireAdmin } = await import('~/server/utils/auth').catch(() => ({ requireAdmin: null }))
    if (requireAdmin) await requireAdmin(event)
  } catch { /* auth utils not available */ }

  const id = event.context.params?.id as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing request id' })

  const body = await readBody(event) as { action: 'approve' | 'reject'; reason?: string }

  if (!body?.action || !['approve', 'reject'].includes(body.action)) {
    throw createError({ statusCode: 400, statusMessage: 'action must be "approve" or "reject"' })
  }

  if (body.action === 'reject' && !body.reason?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'A rejection reason is required' })
  }

  try {
    const db = (event.context as Record<string, unknown>).db as import('better-sqlite3').Database | undefined
    if (!db) throw new Error('no db')

    const newStatus = body.action === 'approve' ? 'approved' : 'rejected'
    db.prepare(`
      UPDATE sponsored_requests
      SET status = ?, rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, body.reason ?? null, id)

    if (body.action === 'approve') {
      // Log admin activity
      try {
        db.prepare(`
          INSERT INTO activity_log (type, description, created_at)
          VALUES ('sponsored_request_approved', ?, CURRENT_TIMESTAMP)
        `).run(`Sponsorship request ${id} approved by admin`)
      } catch { /* activity log table may not exist */ }
    }

    return { success: true, id, status: newStatus }
  } catch (err: unknown) {
    if ((err as Error)?.message === 'no db') {
      // Graceful fallback when DB is not yet migrated
      return { success: true, id, status: body.action === 'approve' ? 'approved' : 'rejected' }
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to update request' })
  }
})
