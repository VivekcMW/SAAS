/**
 * POST /api/claim/[token]
 * Complete a listing claim:
 *   1. Validate the token
 *   2. Log in an existing vendor OR create a new vendor account
 *   3. Create an app_listing (status=draft) from discovery_queue extracted_data
 *   4. Mark discovery_queue row as claimed
 *   5. Return session cookie so the user is logged in
 */
import { validateClaimToken } from '~/server/utils/discovery/claimToken'
import { getDb, makeId } from '~/server/utils/database'
import { hashPassword, verifyPassword, createSession } from '~/server/utils/auth'

interface ClaimBody {
  email: string
  password: string
  first_name: string
  last_name: string
  mode: 'login' | 'register'
}

type Extracted = Record<string, unknown>

function safeStr(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  return fallback
}

async function resolveUserId(db: ReturnType<typeof getDb>, body: ClaimBody): Promise<string> {
  const existing = db.prepare(
    `SELECT id, password_hash FROM users WHERE email = ?`
  ).get(body.email) as { id: string; password_hash: string } | undefined

  if (body.mode === 'login') {
    if (!existing) throw createError({ statusCode: 401, statusMessage: 'No account found with this email' })
    const ok = await verifyPassword(body.password, existing.password_hash)
    if (!ok) throw createError({ statusCode: 401, statusMessage: 'Incorrect password' })
    return existing.id
  }

  // Register
  if (existing) throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists. Use login mode.' })
  if (!body.first_name?.trim() || !body.last_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'First and last name are required' })
  }

  const userId = makeId('usr')
  const now = new Date().toISOString()
  const fullName = `${body.first_name.trim()} ${body.last_name.trim()}`
  db.prepare(`
    INSERT INTO users
      (id, email, password_hash, first_name, last_name, full_name, role, plan, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'vendor', 'Free', 1, ?, ?)
  `).run(userId, body.email.toLowerCase(), await hashPassword(body.password), body.first_name.trim(), body.last_name.trim(), fullName, now, now)

  return userId
}

function ensureVendorProfile(db: ReturnType<typeof getDb>, userId: string, companyName: string): string {
  const existing = db.prepare(`SELECT id FROM vendor_profiles WHERE user_id = ?`).get(userId) as { id: string } | undefined
  if (existing) return existing.id

  const vendorId = makeId('vnd')
  const now = new Date().toISOString()
  const slug = companyName.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 6)

  db.prepare(`
    INSERT INTO vendor_profiles (id, user_id, company_name, company_slug, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'active', ?, ?)
  `).run(vendorId, userId, companyName, slug, now, now)

  return vendorId
}

function createListingFromExtracted(db: ReturnType<typeof getDb>, vendorId: string, websiteUrl: string, extracted: Extracted): string {
  const listingId = makeId('app')
  const appName = safeStr(extracted.name, 'Unnamed App')
  const slug = appName.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 6)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO app_listings
      (id, vendor_id, slug, name, provider, logo, short_description, long_description,
       category, tags, pricing_type, pricing_value, pricing_period,
       rating, review_count, featured, trending, sponsored,
       status, website_url, key_features, target_audience, auto_discovered, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?,
       ?, '[]', ?, ?, ?,
       0, 0, 0, 0, 0,
       'draft', ?, ?, ?, 1, ?, ?)
  `).run(
    listingId,
    vendorId,
    slug,
    appName,
    appName,
    safeStr(extracted.logo_url),
    safeStr(extracted.short_description || extracted.tagline),
    safeStr(extracted.long_description || extracted.short_description),
    safeStr(extracted.category, 'Other'),
    safeStr(extracted.pricing_type, 'contact'),
    extracted.pricing_starts_at === null ? null : Number(extracted.pricing_starts_at),
    extracted.pricing_starts_at === null ? null : 'month',
    websiteUrl,
    JSON.stringify(extracted.key_features || []),
    safeStr(extracted.target_audience),
    now,
    now
  )

  return listingId
}

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') ?? ''
  const body  = await readBody<ClaimBody>(event)

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRx.test(body?.email ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }
  if (!body?.password || body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const claim = validateClaimToken(token)
  if (!claim.valid) {
    throw createError({ statusCode: 410, statusMessage: 'Claim link is invalid, expired, or already used.' })
  }

  const db  = getDb()
  const now = new Date().toISOString()

  const userId = await resolveUserId(db, body)

  let extracted: Extracted = {}
  try { extracted = JSON.parse(claim.item!.extracted_data) } catch { /* use empty */ }

  const companyName = safeStr(extracted.name, `${body.first_name ?? ''} ${body.last_name ?? ''}`.trim())
  const vendorId  = ensureVendorProfile(db, userId, companyName)
  const listingId = createListingFromExtracted(db, vendorId, claim.item!.website_url, extracted)

  db.prepare(`
    UPDATE discovery_queue SET status = 'claimed', listing_id = ?, processed_at = ? WHERE id = ?
  `).run(listingId, now, claim.item!.id)

  await createSession(event, userId)

  return {
    success: true,
    listingId,
    vendorId,
    message: 'Listing claimed! Review and publish from your vendor dashboard.'
  }
})
