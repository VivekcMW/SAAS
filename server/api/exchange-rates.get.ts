/**
 * GET /api/exchange-rates
 * Returns USD-base exchange rates. Fetches from open.er-api.com (free, no key) and
 * caches in-memory for 1 hour to stay within the free-tier request limit.
 */
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

// ── In-memory cache ──────────────────────────────────────────────────────────
interface RateCache {
  rates: Record<string, number>
  fetchedAt: number
}
let _cache: RateCache | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Fallback static rates if external API is unavailable
const STATIC_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, BRL: 5.05, JPY: 149,
  CNY: 7.24, INR: 83.5, SAR: 3.75, AUD: 1.52, CAD: 1.36,
  AED: 3.67, SGD: 1.34, MXN: 17.2, CHF: 0.9, KRW: 1340,
}

async function fetchRates(): Promise<Record<string, number>> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.rates
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { rates?: Record<string, number>; result?: string }
    if (data.result === 'success' && data.rates) {
      _cache = { rates: data.rates, fetchedAt: Date.now() }
      return data.rates
    }
    throw new Error('Unexpected response shape')
  } catch (e) {
    console.warn('[exchange-rates] fetch failed, using static fallback:', (e as Error).message)
    // Use stale cache if available
    if (_cache) return _cache.rates
    return STATIC_RATES
  }
}

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 30, windowMs: 60 * 1000, prefix: 'ex-rates' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const rates = await fetchRates()

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200')

  return {
    base: 'USD',
    rates,
    fetchedAt: _cache?.fetchedAt ?? null,
  }
})
