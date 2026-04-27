/**
 * GET /api/billing/subscription
 * Returns the current user's subscription status.
 */
import { getUserSubscription } from '~/server/utils/stripe'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = await requireUser(event)
  return getUserSubscription(user.id)
})
