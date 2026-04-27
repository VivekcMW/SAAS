/**
 * POST /api/partner/apply
 * Submit a partner application.
 */
import { getDb, makeId } from '~/server/utils/database'

const VALID_TYPES = ['reseller', 'integration', 'technology', 'referral', 'agency']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { company_name, contact_name, email, website, partnership_type, description } = body || {}

  if (!company_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'company_name is required' })
  if (!contact_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'contact_name is required' })
  if (!email?.trim()) throw createError({ statusCode: 400, statusMessage: 'email is required' })
  if (!VALID_TYPES.includes(partnership_type)) {
    throw createError({ statusCode: 400, statusMessage: `partnership_type must be one of: ${VALID_TYPES.join(', ')}` })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const id = makeId('prt')

  db.prepare(`
    INSERT INTO partner_applications
      (id, company_name, contact_name, email, website, partnership_type, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, company_name.trim(), contact_name.trim(), email.trim().toLowerCase(),
    website?.trim() || null, partnership_type, description?.trim() || null, now, now)

  return { id, message: 'Application submitted. We will be in touch within 5 business days.' }
})
