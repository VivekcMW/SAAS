/**
 * GET /api/billing/subscription
 * Returns the current user's subscription status and invoice history.
 */
import { getUserSubscription, getStripe } from '~/server/utils/stripe'
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

// Friendly display names and prices for each plan key
const PLAN_DISPLAY: Record<string, { name: string; price: string }> = {
  'vendor-growth': { name: 'Vendor Growth', price: '$49' },
  'buyer-pro': { name: 'Buyer Pro', price: '$19' },
  'starter': { name: 'Starter', price: '$49' },
  'professional': { name: 'Professional', price: '$149' },
  'enterprise': { name: 'Enterprise', price: 'Contact' },
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sub = getUserSubscription(user.id)

  const display = PLAN_DISPLAY[sub.plan?.toLowerCase() ?? ''] ?? { name: 'Buyer Free', price: '$0' }

  // Fetch invoices from Stripe if subscription exists
  let invoices: Array<{ id: string; date: string; description: string; amount: number; invoiceUrl: string | null }> = []
  if (sub.stripeCustomerId) {
    try {
      const stripe = getStripe()
      const stripeInvoices = await stripe.invoices.list({ customer: sub.stripeCustomerId, limit: 12 })
      invoices = stripeInvoices.data.map(inv => ({
        id: inv.id,
        date: new Date(inv.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: inv.lines.data[0]?.description ?? display.name,
        amount: (inv.amount_paid ?? inv.total) / 100,
        invoiceUrl: inv.invoice_pdf ?? null,
      }))
    } catch {
      // Stripe not configured — return empty invoices
    }
  }

  // Fallback: pull from local DB if no Stripe invoices
  if (invoices.length === 0) {
    const db = getDb()
    const dbInvoices = db.prepare(`
      SELECT id, created_at, plan, stripe_status
      FROM user_subscriptions WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 12
    `).all(user.id) as Array<{ id: string; created_at: string; plan: string; stripe_status: string }>
    invoices = dbInvoices.map(r => ({
      id: r.id,
      date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `${PLAN_DISPLAY[r.plan]?.name ?? r.plan} — monthly`,
      amount: parseFloat(PLAN_DISPLAY[r.plan]?.price?.replace('$', '') ?? '0') || 0,
      invoiceUrl: null,
    }))
  }

  return {
    planName: display.name,
    planPrice: display.price,
    status: sub.status ?? 'inactive',
    active: sub.active,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    invoices,
  }
})

