/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout session for a vendor or buyer plan.
 *
 * Body: { planId: string, cycle: 'monthly' | 'annual' }
 * Returns: { url: string }  (the Stripe-hosted checkout URL)
 */
import { getOrCreateStripeCustomer, getStripe, PLANS } from '~/server/utils/stripe'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 10 checkout attempts per hour per IP
  if (!checkRateLimit(getClientIp(event), { limit: 10, windowMs: 60 * 60 * 1000, prefix: 'checkout' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const user = requireUser(event)

  const body = await readBody<{ planId?: string; cycle?: string }>(event)

  if (!body?.planId || typeof body.planId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'planId is required' })
  }

  const plan = PLANS[body.planId]
  if (!plan) {
    throw createError({ statusCode: 400, statusMessage: `Unknown plan: ${body.planId}` })
  }

  const cycle = body.cycle === 'annual' ? 'annual' : 'monthly'
  const priceId = cycle === 'annual' ? plan.priceIdAnnual : plan.priceIdMonthly

  if (!priceId) {
    throw createError({
      statusCode: 503,
      statusMessage: `Billing not yet configured for plan "${plan.name}" (${cycle}). ` +
        'Set the STRIPE_PRICE_* environment variable to enable checkout.'
    })
  }

  const customerId = await getOrCreateStripeCustomer(
    user.id,
    user.email,
    user.fullName
  )

  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: plan.mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing?billing=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      moonmart_user_id: user.id,
      moonmart_plan: body.planId,
      moonmart_cycle: cycle
    }
  })

  return { url: session.url }
})
