import { getDb, makeId, logActivity } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'ai-listing', limit: 5, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Try again later.' })
  }

  const body = await readBody(event)

  // Validate required fields for AI listing
  const requiredFields = ['websiteUrl', 'contactEmail', 'companyName']
  const missingFields = requiredFields.filter(field => !body[field])
  if (missingFields.length > 0) {
    throw createError({ statusCode: 400, statusMessage: `Missing required fields: ${missingFields.join(', ')}` })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.contactEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email format' })
  }

  // Validate URL format
  const urlRegex = /^https?:\/\/.+/
  if (!urlRegex.test(body.websiteUrl)) {
    throw createError({ statusCode: 400, statusMessage: 'Website URL must start with http:// or https://' })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const submissionId = makeId('ais')

  const productName = body.generatedData?.productName || body.companyName

  db.prepare(`
    INSERT INTO onboarding_submissions (id, user_id, product_name, company_name, contact_email, payload, status, created_at, updated_at)
    VALUES (?, NULL, ?, ?, ?, ?, 'submitted', ?, ?)
  `).run(
    submissionId,
    productName,
    body.companyName,
    body.contactEmail,
    JSON.stringify({ ...body, source: 'ai-listing' }),
    now,
    now
  )

  logActivity({
    actorEmail: body.contactEmail,
    action: 'ai_listing_submitted',
    entityType: 'onboarding_submission',
    entityId: submissionId,
    meta: { websiteUrl: body.websiteUrl, confidenceScore: body.confidenceScore }
  })

  return {
    success: true,
    submissionId,
    message: 'Your AI-powered listing has been submitted and is pending review.',
    data: {
      productName,
      status: 'pending_review',
      reviewStatus: 'ai-review-pending',
      submittedAt: now,
      aiMetadata: {
        confidenceScore: body.confidenceScore || null,
        analysisMethod: 'website-content-analysis',
        requiresHumanReview: true
      }
    }
  }
})
