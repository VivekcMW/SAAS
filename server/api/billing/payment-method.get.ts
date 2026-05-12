/**
 * GET /api/billing/payment-method
 * Returns the default payment method card details for the current user.
 */
import { requireUser } from '~/server/utils/auth'
import { getUserSubscription, getStripe } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sub = getUserSubscription(user.id)

  if (!sub.stripeCustomerId) {
    return { card: null }
  }

  try {
    const stripe = getStripe()
    const customer = await stripe.customers.retrieve(sub.stripeCustomerId, {
      expand: ['invoice_settings.default_payment_method'],
    }) as any

    const pm = customer?.invoice_settings?.default_payment_method
    if (!pm?.card) return { card: null }

    return {
      card: {
        brand: pm.card.brand ?? 'card',
        last4: pm.card.last4 ?? '****',
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      }
    }
  } catch {
    return { card: null }
  }
})
