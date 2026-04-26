/**
 * Stripe utility — single initialised Stripe client + helpers.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY      — sk_live_... or sk_test_...
 *   STRIPE_WEBHOOK_SECRET  — whsec_...  (from `stripe listen --print-secret`)
 *
 * Optional env vars (Stripe Price IDs):
 *   STRIPE_PRICE_VENDOR_GROWTH_MONTHLY  — price_...
 *   STRIPE_PRICE_VENDOR_GROWTH_ANNUAL   — price_...
 *   STRIPE_PRICE_BUYER_PRO_MONTHLY      — price_...
 *   STRIPE_PRICE_BUYER_PRO_ANNUAL       — price_...
 *
 * SITE_URL — used to build success/cancel redirect URLs (default: http://localhost:3000)
 */
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      '[stripe] STRIPE_SECRET_KEY is not set. ' +
      'Add it to your .env file to enable billing.'
    )
  }
  _stripe = new Stripe(key, { apiVersion: '2025-03-31.basil' })
  return _stripe
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

// ─── Plan → Price ID map ─────────────────────────────────────────────────────

export interface PlanConfig {
  name: string
  priceIdMonthly: string | undefined
  priceIdAnnual: string | undefined
  mode: Stripe.Checkout.SessionCreateParams['mode']
}

export const PLANS: Record<string, PlanConfig> = {
  'vendor-growth': {
    name: 'Vendor Growth',
    priceIdMonthly: process.env.STRIPE_PRICE_VENDOR_GROWTH_MONTHLY,
    priceIdAnnual: process.env.STRIPE_PRICE_VENDOR_GROWTH_ANNUAL,
    mode: 'subscription'
  },
  'buyer-pro': {
    name: 'Buyer Pro',
    priceIdMonthly: process.env.STRIPE_PRICE_BUYER_PRO_MONTHLY,
    priceIdAnnual: process.env.STRIPE_PRICE_BUYER_PRO_ANNUAL,
    mode: 'subscription'
  }
}

// ─── Customer helpers ────────────────────────────────────────────────────────

/**
 * Get or create a Stripe customer for this user.
 * Persists the `stripe_customer_id` back to the DB.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const { getDb } = await import('./database')
  const db = getDb()

  const row = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(userId) as
    | { stripe_customer_id: string | null }
    | undefined

  if (row?.stripe_customer_id) return row.stripe_customer_id

  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { moonmart_user_id: userId }
  })

  db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?')
    .run(customer.id, userId)

  return customer.id
}

// ─── Subscription status ─────────────────────────────────────────────────────

export interface SubscriptionStatus {
  active: boolean
  plan: string | null
  status: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string | null
  stripeCustomerId: string | null
}

export function getUserSubscription(userId: string): SubscriptionStatus {
  const { getDb } = require('./database')
  const db = getDb()

  const row = db.prepare(`
    SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(userId) as {
    plan: string
    stripe_status: string
    current_period_end: string
    cancel_at_period_end: number
    stripe_subscription_id: string
    stripe_customer_id: string
  } | undefined

  if (!row) {
    return {
      active: false,
      plan: null,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
      stripeCustomerId: null
    }
  }

  const activeStatuses = new Set(['active', 'trialing'])
  return {
    active: activeStatuses.has(row.stripe_status),
    plan: row.plan,
    status: row.stripe_status,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeCustomerId: row.stripe_customer_id
  }
}
