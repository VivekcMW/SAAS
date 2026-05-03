/**
 * Claim Token — generates and validates magic link tokens
 * for the vendor claim flow.
 *
 * Token format: random 32-byte hex string (URL-safe, cryptographically random)
 * Stored as plaintext in discovery_queue.claim_token (single-use, 30-day expiry)
 */
import { randomBytes } from 'node:crypto'
import { getDb } from '~/server/utils/database'

/** Generate a new unique claim token (not stored here — caller stores it). */
export function generateClaimToken(): string {
  return randomBytes(32).toString('hex')
}

/** Returns the claim token expiry: 30 days from now. */
export function claimTokenExpiry(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString()
}

export interface ClaimTokenResult {
  valid: boolean
  reason?: 'not_found' | 'expired' | 'already_claimed'
  item?: {
    id: string
    website_url: string
    extracted_data: string
    status: string
    founder_email: string | null
    founder_name: string | null
  }
}

/** Validate a raw claim token. Returns the queue item if valid. */
export function validateClaimToken(rawToken: string): ClaimTokenResult {
  if (!rawToken || rawToken.length < 32) {
    return { valid: false, reason: 'not_found' }
  }

  const db = getDb()
  const row = db.prepare(`
    SELECT id, website_url, extracted_data, status,
           claim_token_exp, founder_email, founder_name
    FROM discovery_queue
    WHERE claim_token = ?
    LIMIT 1
  `).get(rawToken) as {
    id: string
    website_url: string
    extracted_data: string
    status: string
    claim_token_exp: string
    founder_email: string | null
    founder_name: string | null
  } | undefined

  if (!row) return { valid: false, reason: 'not_found' }

  if (row.status === 'claimed' || row.status === 'live') {
    return { valid: false, reason: 'already_claimed' }
  }

  if (row.claim_token_exp && new Date(row.claim_token_exp) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  return {
    valid: true,
    item: {
      id: row.id,
      website_url: row.website_url,
      extracted_data: row.extracted_data,
      status: row.status,
      founder_email: row.founder_email,
      founder_name: row.founder_name
    }
  }
}
