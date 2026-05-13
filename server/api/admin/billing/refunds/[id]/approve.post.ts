// Admin: approve refund request (updates status + attempts Stripe refund)
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const db = getDb()
  const row = db.prepare(`SELECT value FROM admin_settings WHERE key = 'refund_requests'`).get() as { value: string } | undefined
  const requests: any[] = row ? JSON.parse(row.value) : []

  const idx = requests.findIndex((r: any) => r.id === id)
  if (idx === -1) throw createError({ statusCode: 404, message: 'Refund request not found' })

  if (requests[idx].status !== 'pending') {
    throw createError({ statusCode: 409, message: `Request is already ${requests[idx].status}` })
  }

  const now = new Date().toISOString()
  let stripeRefundId: string | null = null

  // Attempt Stripe refund if there is a subscription ID
  if (requests[idx].orderId) {
    try {
      const { default: Stripe } = await import('stripe')
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2023-10-16' as any })

      // Retrieve the latest invoice charge for the subscription
      const sub = await stripe.subscriptions.retrieve(requests[idx].orderId).catch(() => null)
      if (sub) {
        const latestInvoice = await stripe.invoices.retrieve(sub.latest_invoice as string).catch(() => null)
        if (latestInvoice?.charge) {
          const refund = await stripe.refunds.create({ charge: latestInvoice.charge as string })
          stripeRefundId = refund.id
        }
      }
    } catch (_err) {
      console.error('[refund approve] stripe error:', err)
      // Non-fatal — we still mark as approved and note no stripe refund
    }
  }

  requests[idx] = {
    ...requests[idx],
    status: 'approved',
    approvedAt: now,
    approvedBy: (admin as any).email,
    stripeRefundId
  }

  db.prepare(`
    INSERT INTO admin_settings (key, value, updated_by, updated_at) VALUES ('refund_requests', ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
  `).run(JSON.stringify(requests), (admin as any).email, now)

  logActivity({
    actorId: (admin as any).id,
    actorEmail: (admin as any).email,
    action: 'refund.approved',
    entityType: 'refund_request',
    entityId: id,
    meta: { stripeRefundId }
  })

  return { success: true, stripeRefundId }
})
