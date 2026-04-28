/**
 * Lightweight email service with a pluggable transport.
 *
 * Behavior:
 *  - In development (default), emails are logged to the server console with a clear banner.
 *  - If SMTP_* env vars are provided AND `nodemailer` is installed, real SMTP send is used.
 *  - All send failures are caught and logged; callers should treat email as best-effort
 *    and never fail the parent request because of an email error.
 *
 * Env vars (all optional):
 *  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true"/"false")
 *  MAIL_FROM (default: "Moonmart <no-reply@moonmart.local>")
 *  MAIL_ADMIN (recipient for admin notifications, default: "admin@moonmart.local")
 *  MAIL_DRIVER ("console" to force console-only, "smtp" to force SMTP)
 */

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
}

interface SendResult {
  ok: boolean
  driver: 'console' | 'smtp'
  error?: string
}

const DEFAULT_FROM = process.env.MAIL_FROM || 'Moonmart <no-reply@moonmart.local>'

export const ADMIN_EMAIL = process.env.MAIL_ADMIN || 'admin@moonmart.local'

function shouldUseSmtp() {
  if (process.env.MAIL_DRIVER === 'console') return false
  if (process.env.MAIL_DRIVER === 'smtp') return true
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

let smtpTransport: { sendMail: (opts: Record<string, unknown>) => Promise<unknown> } | null = null
let smtpInitPromise: Promise<void> | null = null

async function getSmtpTransport() {
  if (smtpTransport) return smtpTransport
  if (!smtpInitPromise) {
    smtpInitPromise = (async () => {
      try {
        // Dynamic import so the project works without nodemailer installed.
        // Typed as unknown because nodemailer is an optional peer dependency.
        const mod: any = await import('nodemailer' as string).catch(() => null)
        if (!mod) {
          console.warn('[email] SMTP configured but "nodemailer" is not installed. Falling back to console.')
          return
        }
        const nodemailer = mod.default || mod
        smtpTransport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        })
      } catch (error) {
        console.warn('[email] Failed to initialize SMTP transport:', error)
      }
    })()
  }
  await smtpInitPromise
  return smtpTransport
}

function logToConsole(msg: EmailMessage) {
  const divider = '─'.repeat(60)
  const replyToLine = msg.replyTo ? `\nREPLY-TO: ${msg.replyTo}` : ''
  const lines = [
    '',
    divider,
    '[email] (dev) outgoing message',
    `FROM: ${DEFAULT_FROM}`,
    `TO:   ${msg.to}`,
    `SUBJ: ${msg.subject}${replyToLine}`,
    divider,
    msg.text,
    divider,
    ''
  ]
  console.log(lines.join('\n'))
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  if (!shouldUseSmtp()) {
    logToConsole(message)
    return { ok: true, driver: 'console' }
  }

  const transport = await getSmtpTransport()
  if (!transport) {
    logToConsole(message)
    return { ok: true, driver: 'console' }
  }

  try {
    await transport.sendMail({
      from: DEFAULT_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo
    })
    return { ok: true, driver: 'smtp' }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[email] SMTP send failed:', errMsg)
    // Fall back to console so dev flows still see the content.
    logToConsole(message)
    return { ok: false, driver: 'smtp', error: errMsg }
  }
}

// Reusable email builders ------------------------------------------------------

export function buildContactEmail(data: {
  name: string
  email: string
  subject?: string
  message: string
}): EmailMessage {
  const subject = data.subject ? `Contact form: ${data.subject}` : 'New contact form submission'
  const text = `New contact form submission

Name:    ${data.name}
Email:   ${data.email}
Subject: ${data.subject || '(none)'}

Message:
${data.message}
`
  return {
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject,
    text
  }
}

export function buildOnboardingAdminEmail(data: {
  submissionId: string
  productName: string
  companyName: string
  submittedBy?: string
}): EmailMessage {
  const text = `A new product listing has been submitted for review.

Submission ID: ${data.submissionId}
Product:       ${data.productName}
Company:       ${data.companyName}
Submitted by:  ${data.submittedBy || 'unknown'}

Review it from the admin dashboard.
`
  return {
    to: ADMIN_EMAIL,
    subject: `New listing submitted: ${data.productName}`,
    text
  }
}

export function buildOnboardingUserEmail(data: {
  to: string
  productName: string
  submissionId: string
}): EmailMessage {
  const text = `Hi,

Thanks for submitting ${data.productName} to Moonmart.

Your submission reference is: ${data.submissionId}

Our team will review your listing within 24–48 hours and email you once it's approved. You can also track the status from your vendor dashboard.

— The Moonmart Team
`
  return {
    to: data.to,
    subject: `We received your Moonmart listing: ${data.productName}`,
    text
  }
}

export function buildReviewNotificationEmail(data: {
  to: string
  appName: string
  rating: number
  title: string
}): EmailMessage {
  const text = `A new review was submitted for ${data.appName}.

Rating: ${data.rating} / 5
Title:  ${data.title}

The review is pending moderation.
`
  return {
    to: data.to,
    subject: `New review pending for ${data.appName}`,
    text
  }
}

export function buildWelcomeEmail(data: {
  to: string
  firstName: string
  role: 'buyer' | 'vendor' | 'admin'
  verifyUrl: string
}): EmailMessage {
  const dashboardPath = data.role === 'vendor' ? '/dashboard/listings' : '/dashboard/overview'
  const roleDesc = data.role === 'vendor' ? 'vendor' : 'buyer'
  const text = `Hi ${data.firstName},

Welcome to Moonmart! We're excited to have you on board.

Before you get started, please verify your email address by clicking the link below:

${data.verifyUrl}

This link expires in 24 hours.

${data.role === 'vendor'
  ? `As a ${roleDesc} you can list and manage your products, track leads, and grow your pipeline from your dashboard.`
  : `As a ${roleDesc} you can discover, compare, and save SaaS tools tailored to your team's needs.`}

Get started: https://moonmart.ai${dashboardPath}

— The Moonmart Team
`
  return {
    to: data.to,
    subject: 'Welcome to Moonmart — please verify your email',
    text,
    html: `<p>Hi ${data.firstName},</p>
<p>Welcome to Moonmart! Please verify your email address:</p>
<p><a href="${data.verifyUrl}" style="background:#FF8838;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Verify my email</a></p>
<p>This link expires in 24 hours.</p>
<p>— The Moonmart Team</p>`
  }
}

export function buildPasswordResetEmail(data: {
  to: string
  firstName: string
  resetUrl: string
}): EmailMessage {
  const text = `Hi ${data.firstName},

We received a request to reset the password for your Moonmart account.

Click the link below to choose a new password:

${data.resetUrl}

This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.

— The Moonmart Team
`
  return {
    to: data.to,
    subject: 'Reset your Moonmart password',
    text,
    html: `<p>Hi ${data.firstName},</p>
<p>We received a request to reset your Moonmart password.</p>
<p><a href="${data.resetUrl}" style="background:#FF8838;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Reset my password</a></p>
<p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
<p>— The Moonmart Team</p>`
  }
}

export function buildListingStatusEmail(data: {
  to: string
  vendorName: string
  productName: string
  status: 'approved' | 'rejected'
  adminNotes?: string
}): EmailMessage {
  const approved = data.status === 'approved'
  const text = approved
    ? `Hi ${data.vendorName},

Great news! Your listing for "${data.productName}" has been approved and is now live on Moonmart.

View your listing: https://moonmart.ai/marketplace

— The Moonmart Team`
    : `Hi ${data.vendorName},

We've reviewed your listing for "${data.productName}" and unfortunately it doesn't meet our listing guidelines at this time.

${data.adminNotes ? `Reason: ${data.adminNotes}\n\n` : ''}Please update your listing and resubmit from your vendor dashboard.

— The Moonmart Team`

  return {
    to: data.to,
    subject: approved
      ? `Your Moonmart listing "${data.productName}" is live!`
      : `Your Moonmart listing "${data.productName}" needs updates`,
    text
  }
}

export function buildEnquiryNotificationEmail(data: {
  to: string
  vendorName: string
  appName: string
  buyerName: string
  buyerEmail: string
  message: string
}): EmailMessage {
  const text = `Hi ${data.vendorName},

You have a new enquiry for ${data.appName} from ${data.buyerName} (${data.buyerEmail}).

Message:
${data.message}

Respond from your vendor dashboard: https://moonmart.ai/dashboard/leads

— The Moonmart Team`
  return {
    to: data.to,
    subject: `New enquiry for ${data.appName} from ${data.buyerName}`,
    text
  }
}

export function buildWeeklyDigestEmail(data: {
  to: string
  firstName: string
  newApps: Array<{ name: string; tagline: string; slug: string }>
  topCategories: string[]
  weekNumber: number
}): EmailMessage {
  const appLines = data.newApps
    .slice(0, 5)
    .map(a => `• ${a.name} — ${a.tagline}\n  https://moonmart.ai/marketplace/${a.slug}`)
    .join('\n\n')

  const text = `Hi ${data.firstName},

Here's your Moonmart weekly digest (Week ${data.weekNumber}):

NEW TOOLS THIS WEEK
${appLines || 'No new tools this week — check back soon!'}

TRENDING CATEGORIES
${data.topCategories.slice(0, 3).join(', ')}

Browse everything: https://moonmart.ai/marketplace

Manage your preferences: https://moonmart.ai/dashboard/overview

— The Moonmart Team

To unsubscribe, visit https://moonmart.ai/dashboard/overview and turn off Weekly Digest.
`
  return {
    to: data.to,
    subject: `Your Moonmart Weekly Digest — Week ${data.weekNumber}`,
    text
  }
}

export function buildNewLeadAlertEmail(data: {
  to: string
  vendorName: string
  appName: string
  eventType: string
  companyName?: string
  jobTitle?: string
  dashboardUrl?: string
}): EmailMessage {
  const url = data.dashboardUrl ?? 'https://moonmart.ai/dashboard/leads'
  const signal = data.eventType === 'demo_request'
    ? 'requested a demo'
    : data.eventType === 'pricing_view'
    ? 'viewed your pricing page'
    : `viewed ${data.appName}`

  const text = `Hi ${data.vendorName},

A potential buyer just ${signal} for ${data.appName} on Moonmart.

${data.companyName ? `Company: ${data.companyName}\n` : ''}${data.jobTitle ? `Role: ${data.jobTitle}\n` : ''}
View in your dashboard: ${url}

— The Moonmart Team`

  return {
    to: data.to,
    subject: `New lead signal for ${data.appName} on Moonmart`,
    text,
    html: `<p>Hi ${data.vendorName},</p>
<p>A potential buyer just <strong>${signal}</strong> for <strong>${data.appName}</strong>.</p>
${data.companyName ? `<p>Company: ${data.companyName}</p>` : ''}
${data.jobTitle ? `<p>Role: ${data.jobTitle}</p>` : ''}
<p><a href="${url}" style="background:#FF8838;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;display:inline-block">View Lead</a></p>
<p>— The Moonmart Team</p>`
  }
}
