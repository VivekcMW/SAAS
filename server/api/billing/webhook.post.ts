/**
 * POST /api/billing/webhook
 * Stripe webhook handler — verifies signature and updates the DB.
 *
 * Configure in Stripe Dashboard:
 *   Endpoint URL: https://your-domain.com/api/billing/webhook
 *   Events to listen for:
 *     customer.subscription.created
 *     customer.subscription.updated
 *     customer.subscription.deleted
 *     checkout.session.completed
 *     invoice.payment_failed
 *
 * Set STRIPE_WEBHOOK_SECRET to the signing secret shown in the Stripe dashboard
 * (or output of `stripe listen --print-secret` in development).
 */
import { getStripe, STRIPE_WEBHOOK_SECRET } from '~/server/utils/stripe'
import { getDb, makeId } from '~/server/utils/database'
import type Stripe from 'stripe'

/** Map a Stripe subscription onto the user_subscriptions table. */
function upsertSubscription(sub: Stripe.Subscription, customerId: string) {
  const db = getDb()

  // Resolve user from stripe_customer_id
  const userRow = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?').get(customerId) as
    | { id: string } | undefined

  if (!userRow) {
    console.warn('[webhook] No user found for Stripe customer', customerId)
    return
  }

  const planMetadata = (sub.metadata?.moonmart_plan as string | undefined) || 'unknown'
  const item = sub.items.data[0]
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000).toISOString()
    : null
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null
  const canceledAt = sub.canceled_at
    ? new Date(sub.canceled_at * 1000).toISOString()
    : null
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO user_subscriptions (
      id, user_id, stripe_customer_id, stripe_subscription_id,
      plan, stripe_status, current_period_start, current_period_end,
      cancel_at_period_end, canceled_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(stripe_subscription_id) DO UPDATE SET
      plan = excluded.plan,
      stripe_status = excluded.stripe_status,
      current_period_start = excluded.current_period_start,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      canceled_at = excluded.canceled_at,
      updated_at = excluded.updated_at
  `).run(
    makeId('sub'),
    userRow.id,
    customerId,
    sub.id,
    planMetadata,
    sub.status,
    periodStart,
    periodEnd,
    sub.cancel_at_period_end ? 1 : 0,
    canceledAt,
    now,
    now
  )

  // Sync the plan field on the users table
  const activePlan = ['active', 'trialing'].includes(sub.status) ? planMetadata : 'Free'
  db.prepare('UPDATE users SET plan = ?, updated_at = ? WHERE id = ?')
    .run(activePlan, now, userRow.id)
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event)
  const signature = getRequestHeader(event, 'stripe-signature')

  if (!rawBody || !signature) {
    throw createError({ statusCode: 400, statusMessage: 'Missing body or signature' })
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set. Webhook processing disabled.')
    throw createError({ statusCode: 503, statusMessage: 'Webhook not configured' })
  }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = getStripe().webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    throw createError({ statusCode: 400, statusMessage: 'Invalid Stripe signature' })
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        // Subscription checkout — the subscription.created event follows and handles DB sync.
        // Store the customer ID on the user if not already set.
        if (session.customer && session.metadata?.moonmart_user_id) {
          const db = getDb()
          db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ? AND stripe_customer_id IS NULL')
            .run(session.customer as string, session.metadata.moonmart_user_id)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = stripeEvent.data.object as Stripe.Subscription
        upsertSubscription(sub, sub.customer as string)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object as Stripe.Subscription
        upsertSubscription(sub, sub.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        console.warn('[webhook] Payment failed for customer', invoice.customer)
        // Stripe will automatically retry; status update will arrive via subscription.updated
        break
      }

      default:
        // Unhandled event — log and return 200 so Stripe doesn't retry
        // Unhandled event type — return 200 so Stripe doesn't retry
    }
  } catch (err) {
    console.error('[webhook] Error processing event', stripeEvent.type, err)
    // Still return 200 to prevent Stripe from retrying
  }

  return { received: true }
})
