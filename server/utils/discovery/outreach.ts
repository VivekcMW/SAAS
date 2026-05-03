/**
 * Outreach — sends claim emails to discovered SaaS founders.
 *
 * Uses the existing email.ts transport (SMTP or console dev fallback).
 * Generates a magic link claim token, saves it to discovery_queue,
 * and logs the send in outreach_emails.
 */
import { sendEmail } from '~/server/utils/email'
import { getDb, makeId } from '~/server/utils/database'
import { generateClaimToken, claimTokenExpiry } from '~/server/utils/discovery/claimToken'

const SITE_NAME = process.env.SITE_NAME || 'SaasWorld'
const SITE_URL  = process.env.SITE_URL  || 'https://saasworld.com'
const FROM_NAME = process.env.OUTREACH_FROM_NAME || `${SITE_NAME} Discovery Team`

export interface OutreachResult {
  ok: boolean
  queueItemId: string
  toEmail: string
  claimUrl: string
  error?: string
}

export async function sendClaimOutreach(
  queueItemId: string,
  toEmail: string,
  appName: string,
  founderName?: string | null
): Promise<OutreachResult> {
  const db = getDb()

  // Check it hasn't already been outreached recently (prevent spam)
  const existing = db.prepare(
    `SELECT outreach_count FROM discovery_queue WHERE id = ?`
  ).get(queueItemId) as { outreach_count: number } | undefined

  if (!existing) {
    return { ok: false, queueItemId, toEmail, claimUrl: '', error: 'Queue item not found' }
  }

  if (existing.outreach_count >= 2) {
    return { ok: false, queueItemId, toEmail, claimUrl: '', error: 'Max outreach attempts reached' }
  }

  // Generate magic link token
  const token  = generateClaimToken()
  const expiry = claimTokenExpiry()
  const claimUrl = `${SITE_URL}/claim/${token}`

  // Save token to discovery_queue
  db.prepare(`
    UPDATE discovery_queue
    SET claim_token = ?, claim_token_exp = ?, status = 'outreached',
        founder_email = ?, outreach_count = outreach_count + 1, claim_email_sent = 1
    WHERE id = ?
  `).run(token, expiry, toEmail, queueItemId)

  const greeting = founderName ? `Hi ${founderName.split(' ')[0]},` : 'Hello,'
  const subject  = `We found ${appName} — claim your free listing on ${SITE_NAME}`

  const text = `${greeting}

We discovered ${appName} and think it's a perfect fit for ${SITE_NAME} — the marketplace where thousands of buyers find SaaS tools every month.

We've already generated a draft listing for ${appName}. Click the link below to claim it, review the auto-generated details, and go live for free:

${claimUrl}

This link expires in 30 days.

What happens next:
1. Log in or create a free account (takes 30 seconds)
2. Review and edit your auto-generated listing
3. Publish — start reaching buyers actively searching for tools like yours

No credit card required. No obligation. Takes less than 5 minutes.

If you have any questions, reply to this email.

— The ${SITE_NAME} Team
${SITE_URL}

---
You're receiving this because we discovered ${appName} while building our SaaS directory.
If you'd prefer not to be listed, simply ignore this email or reply "remove".`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;line-height:1.6">
  <div style="border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:24px">
    <strong style="font-size:18px;color:#2563eb">${SITE_NAME}</strong>
  </div>
  <p>${greeting}</p>
  <p>We discovered <strong>${appName}</strong> and think it's a perfect fit for <strong>${SITE_NAME}</strong> — the marketplace where thousands of buyers find SaaS tools every month.</p>
  <p>We've already generated a draft listing for <strong>${appName}</strong>. Claim it, review the details, and go live for free:</p>
  <div style="text-align:center;margin:32px 0">
    <a href="${claimUrl}"
       style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;display:inline-block">
      Claim Your Free Listing →
    </a>
  </div>
  <p style="color:#666;font-size:14px">This link expires in 30 days.</p>
  <p><strong>What happens next:</strong></p>
  <ol>
    <li>Log in or create a free account (30 seconds)</li>
    <li>Review and edit your auto-generated listing</li>
    <li>Publish — reach buyers actively searching for tools like yours</li>
  </ol>
  <p>No credit card required. No obligation. Takes &lt; 5 minutes.</p>
  <p>If you have questions, just reply to this email.</p>
  <p style="margin-top:32px">— The ${SITE_NAME} Team<br>
  <a href="${SITE_URL}" style="color:#2563eb">${SITE_URL}</a></p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="font-size:12px;color:#9ca3af">
    You're receiving this because we discovered ${appName} while building our SaaS directory.
    If you'd prefer not to be listed, ignore this email or reply "remove".
  </p>
</body>
</html>`

  let sendError: string | undefined
  try {
    await sendEmail({
      to: toEmail,
      subject,
      text,
      html
    })
  }
  catch (err) {
    sendError = String(err)
    console.error('[outreach] Email send failed for', toEmail, err)
  }

  // Log in outreach_emails regardless of send success (for tracking)
  const emailId = makeId('oe')
  db.prepare(`
    INSERT INTO outreach_emails (id, queue_item_id, to_email, subject, sent_at, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    emailId,
    queueItemId,
    toEmail,
    subject,
    new Date().toISOString(),
    sendError ? 'failed' : 'sent'
  )

  return {
    ok: !sendError,
    queueItemId,
    toEmail,
    claimUrl,
    error: sendError
  }
}
