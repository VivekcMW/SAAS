/**
 * GET /api/billing/tax-estimate
 * Returns the estimated VAT/GST for a given country and net amount.
 *
 * Query params:
 *   country  — ISO 3166-1 alpha-2 country code, e.g. "DE"
 *   amount   — net amount in USD (numeric string), e.g. "149"
 *
 * Response: VatResult JSON
 */
import { calculateVat } from '~/server/utils/vatRates'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const country = typeof query.country === 'string' ? query.country.trim() : ''
  if (!country?.length || country.length !== 2) {
    throw createError({ statusCode: 400, statusMessage: 'country must be a 2-letter ISO 3166-1 alpha-2 code' })
  }

  const rawAmount = typeof query.amount === 'string' ? Number.parseFloat(query.amount) : Number.NaN
  if (!Number.isFinite(rawAmount) || rawAmount < 0) {
    throw createError({ statusCode: 400, statusMessage: 'amount must be a non-negative number' })
  }

  return calculateVat(rawAmount, country)
})
