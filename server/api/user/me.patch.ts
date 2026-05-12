/**
 * PATCH /api/user/me
 * Updates the authenticated user's profile fields.
 * Body: { firstName?, lastName?, jobTitle?, company?, companySize?, language?, timezone?, currency?, notifications? }
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

const ALLOWED_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+']
const ALLOWED_LANGS = ['English', 'Deutsch', 'Español', 'Français']
const ALLOWED_TZ = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney']
const ALLOWED_CCY = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY']

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    firstName?: string
    lastName?: string
    jobTitle?: string
    company?: string
    companySize?: string
    language?: string
    timezone?: string
    currency?: string
    notifications?: Record<string, boolean>
  }>(event)

  const db = getDb()

  const firstName  = body.firstName?.trim().slice(0, 80)
  const lastName   = body.lastName?.trim().slice(0, 80)
  const jobTitle   = body.jobTitle?.trim().slice(0, 120)
  const company    = body.company?.trim().slice(0, 120)
  const companySize = body.companySize && ALLOWED_SIZES.includes(body.companySize) ? body.companySize : undefined
  const language   = body.language   && ALLOWED_LANGS.includes(body.language)   ? body.language   : undefined
  const timezone   = body.timezone   && ALLOWED_TZ.includes(body.timezone)     ? body.timezone   : undefined
  const currency   = body.currency   && ALLOWED_CCY.includes(body.currency)     ? body.currency   : undefined

  // Build dynamic SET clause
  const sets: string[] = ['updated_at = datetime(\'now\')']
  const values: unknown[] = []

  if (firstName  !== undefined) { sets.push('first_name = ?');    values.push(firstName) }
  if (lastName   !== undefined) { sets.push('last_name = ?');     values.push(lastName) }
  if (jobTitle   !== undefined) { sets.push('job_title = ?');     values.push(jobTitle) }
  if (company    !== undefined) { sets.push('company = ?');       values.push(company) }
  if (companySize !== undefined) { sets.push('company_size = ?'); values.push(companySize) }
  if (language   !== undefined) { sets.push('language = ?');      values.push(language) }
  if (timezone   !== undefined) { sets.push('timezone = ?');      values.push(timezone) }
  if (currency   !== undefined) { sets.push('currency = ?');      values.push(currency) }

  if (body.notifications && typeof body.notifications === 'object') {
    sets.push('notification_prefs = ?')
    values.push(JSON.stringify(body.notifications))
  }

  if (sets.length === 1) {
    return { success: true, message: 'Nothing to update' }
  }

  values.push(user.id)
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values)

  return { success: true }
})
