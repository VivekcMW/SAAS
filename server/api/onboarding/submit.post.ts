/**
 * API Endpoint: Submit Product Onboarding
 * Persists the submission and dispatches notification emails.
 */

import { createError, defineEventHandler, readBody } from 'h3'
import {
  transformOnboardingToApp,
  validateOnboardingData
} from '~/utils/productTransformation'
import {
  getDb,
  makeId,
  type DbOnboardingSubmission
} from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import {
  buildOnboardingAdminEmail,
  buildOnboardingUserEmail,
  sendEmail
} from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
  }

  const { formData } = body
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Form data is required' })
  }

  if (!validateOnboardingData(formData)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product name, company name, and description are required'
    })
  }

  let appData: ReturnType<typeof transformOnboardingToApp>
  try {
    appData = transformOnboardingToApp(formData)
  } catch (transformError) {
    console.error('Error transforming onboarding data:', transformError)
    throw createError({ statusCode: 400, statusMessage: 'Invalid form data structure' })
  }

  const sessionUser = await getSessionUser(event)
  const submissionId = makeId('sub')
  const now = new Date().toISOString()

  const contactEmail: string | null =
    (typeof formData.contactEmail === 'string' && formData.contactEmail) ||
    (typeof formData.email === 'string' && formData.email) ||
    sessionUser?.email ||
    null

  const submission: DbOnboardingSubmission = {
    id: submissionId,
    user_id: sessionUser?.id || null,
    product_name: appData.name,
    company_name: appData.provider,
    contact_email: contactEmail,
    payload: JSON.stringify({ formData, appData }),
    status: 'submitted',
    admin_notes: null,
    created_at: now,
    updated_at: now
  }

  try {
    const db = getDb()
    db.prepare(
      `INSERT INTO onboarding_submissions (
        id, user_id, product_name, company_name, contact_email, payload,
        status, admin_notes, created_at, updated_at
      ) VALUES (
        @id, @user_id, @product_name, @company_name, @contact_email, @payload,
        @status, @admin_notes, @created_at, @updated_at
      )`
    ).run(submission)
  } catch (dbError) {
    console.error('[onboarding] DB insert failed:', dbError)
    throw createError({ statusCode: 500, statusMessage: 'Failed to save submission' })
  }

  sendEmail(
    buildOnboardingAdminEmail({
      submissionId,
      productName: submission.product_name,
      companyName: submission.company_name,
      submittedBy: contactEmail || sessionUser?.email
    })
  ).catch(() => { /* ignore */ })

  if (contactEmail) {
    sendEmail(
      buildOnboardingUserEmail({
        to: contactEmail,
        productName: submission.product_name,
        submissionId
      })
    ).catch(() => { /* ignore */ })
  }

  return {
    success: true,
    data: {
      submissionId,
      status: submission.status,
      message:
        'Your application has been submitted successfully. Our team will review it within 24-48 hours.',
      nextSteps: [
        'Our team will review your submission',
        'You will receive an email notification about the review status',
        'If approved, your app will be published on the marketplace',
        'You can track the status in your dashboard'
      ]
    }
  }
})
