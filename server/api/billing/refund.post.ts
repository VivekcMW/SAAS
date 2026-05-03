/**
 * POST /api/billing/refund
 * Self-serve refund request. Records the request and notifies the billing team.
 * Body: { reason: string; orderId?: string; message?: string }
 */
import { requireUser } from '~/server/utils/auth'
import { getDb, makeId, logActivity } from '~/server/utils/database'
import { ADMIN_EMAIL, sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 3 requests per hour per IP
  if (!checkRateLimit(getClientIp(event), { limit: 3, windowMs: 60 * 60 * 1000, prefix: 'refund' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const user = await requireUser(event)
  const body = await readBody<{ reason?: string; orderId?: string; message?: string }>(event)

  if (!body?.reason || typeof body.reason !== 'string' || body.reason.trim().length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Please provide a refund reason (at least 5 characters).' })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const requestId = makeId('rfnd')

  // Fetch latest subscription for context
  const sub = db.prepare(`
    SELECT stripe_subscription_id, plan, stripe_status, current_period_end
    FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(user.id) as any

  const reason = body.reason.trim().slice(0, 500)
  const message = (body.message ?? '').trim().slice(0, 2000)
  const orderId = (body.orderId ?? sub?.stripe_subscription_id ?? '').trim().slice(0, 200)

  // Log the refund request in the DB (stored in admin_settings as a lightweight approach
  // until a dedicated refund_requests table exists)
  try {
    const existingLog = db.prepare(`SELECT value FROM admin_settings WHERE key = 'refund_requests'`).get() as { value: string } | undefined
    const requests: any[] = existingLog ? JSON.parse(existingLog.value) : []
    requests.unshift({ id: requestId, userId: user.id, email: user.email, reason, message, orderId, plan: sub?.plan, status: 'pending', createdAt: now })
    // Keep last 500 entries
    const trimmed = requests.slice(0, 500)
    db.prepare(`
      INSERT INTO admin_settings (key, value, updated_by, updated_at)
      VALUES ('refund_requests', ?, 'system', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(JSON.stringify(trimmed), now)
  } catch (err) {
    console.error('[refund] failed to log request:', err)
  }

  // Email the billing team
  const emailText = `New refund request from ${user.fullName} <${user.email}>

Request ID: ${requestId}
User ID:    ${user.id}
Plan:       ${sub?.plan ?? 'unknown'}
Order/Sub:  ${orderId || 'not provided'}
Reason:     ${reason}
${message ? `\nAdditional message:\n${message}` : ''}

Submitted: ${now}
`

  sendEmail({
    to: ADMIN_EMAIL,
    replyTo: user.email,
    subject: `Refund request [${requestId}] from ${user.email}`,
    text: emailText
  }).catch(err => console.error('[refund] email failed:', err))

  // Confirmation email to user
  sendEmail({
    to: user.email,
    subject: `We received your refund request [${requestId}]`,
    text: `Hi ${user.firstName},

We've received your refund request (reference: ${requestId}).

Our billing team reviews requests within 1–2 business days and will email you at ${user.email} with an update.

If you have questions, reply to this email or contact billing@moonmart.ai.

— The Moonmart Billing Team
`
  }).catch(err => console.error('[refund] user confirmation email failed:', err))

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'billing.refund_requested', entityType: 'refund', entityId: requestId })
  return {
    success: true,
    requestId,
    message: 'Your refund request has been received. We\'ll email you within 1–2 business days.'
  }
})
