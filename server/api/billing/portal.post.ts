/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session so the user can manage their subscription,
 * download invoices, or cancel.
 *
 * Returns: { url: string }
 */
import { getOrCreateStripeCustomer, getStripe } from '~/server/utils/stripe'
import { requireUser } from '~/server/utils/auth'
import { logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const customerId = await getOrCreateStripeCustomer(
    user.id,
    user.email,
    user.fullName
  )

  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
  const stripe = getStripe()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/dashboard?section=billing`
  })

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'billing.portal_accessed', entityType: 'user', entityId: user.id })
  return { url: session.url }
})
