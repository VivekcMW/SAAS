/**
 * GET /api/geo
 * Returns the visitor's detected country code and the matching region key
 * (from nuxt.config regions) to be used for currency/locale selection.
 *
 * Detection order:
 *  1. Cloudflare CF-IPCountry header (production CDN — no external call needed)
 *  2. Vercel x-vercel-ip-country header
 *  3. ip-api.com lookup (free, no key, 45 req/min — cached per IP for 24 h)
 *  4. Fallback: 'US'
 */
import { getClientIp } from '~/server/utils/rateLimit'

// ── Country → region-key mapping ─────────────────────────────────────────────
// Keys must match those in nuxt.config.ts `runtimeConfig.public.regions`
const COUNTRY_TO_REGION: Record<string, string> = {
  // United States & Canada default to USD
  US: 'US', CA: 'US',
  // European Union + EEA
  AT: 'EU', BE: 'EU', BG: 'EU', HR: 'EU', CY: 'EU', CZ: 'EU', DK: 'EU',
  EE: 'EU', FI: 'EU', FR: 'EU', DE: 'EU', GR: 'EU', HU: 'EU', IE: 'EU',
  IT: 'EU', LV: 'EU', LT: 'EU', LU: 'EU', MT: 'EU', NL: 'EU', PL: 'EU',
  PT: 'EU', RO: 'EU', SK: 'EU', SI: 'EU', ES: 'EU', SE: 'EU',
  // EEA non-EU (use EUR / en-GB locale group)
  GB: 'EU', NO: 'EU', IS: 'EU', LI: 'EU', CH: 'EU',
  // Brazil
  BR: 'BR',
  // India
  IN: 'IN',
  // Japan
  JP: 'JP',
  // China
  CN: 'CN',
  // Gulf / Middle East
  SA: 'SA', AE: 'SA', KW: 'SA', QA: 'SA', BH: 'SA', OM: 'SA',
}

// ── IP → geo cache (24 h TTL, in-process) ────────────────────────────────────
interface GeoEntry { countryCode: string; regionKey: string; cachedAt: number }
const _geoCache = new Map<string, GeoEntry>()
const GEO_TTL = 24 * 60 * 60 * 1000

// Prune stale entries every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - GEO_TTL
    for (const [k, v] of _geoCache) {
      if (v.cachedAt < cutoff) _geoCache.delete(k)
    }
  }, 60 * 60 * 1000)
}

function mapCountry(code: string): string {
  return COUNTRY_TO_REGION[code?.toUpperCase()] ?? 'US'
}

async function lookupIp(ip: string): Promise<string> {
  // Skip loopback / private IPs (dev environment)
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'US'
  }

  const cached = _geoCache.get(ip)
  if (cached && Date.now() - cached.cachedAt < GEO_TTL) return cached.countryCode

  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=countryCode,status`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { status?: string; countryCode?: string }
    if (data.status === 'success' && data.countryCode) {
      _geoCache.set(ip, { countryCode: data.countryCode, regionKey: mapCountry(data.countryCode), cachedAt: Date.now() })
      return data.countryCode
    }
  } catch {
    // fall through to default
  }
  return 'US'
}

export default defineEventHandler(async (event) => {
  const headers = getRequestHeaders(event)

  // 1. Cloudflare
  const cfCountry = headers['cf-ipcountry']
  if (cfCountry && cfCountry !== 'XX') {
    const regionKey = mapCountry(cfCountry)
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    return { countryCode: cfCountry.toUpperCase(), regionKey, source: 'cloudflare' }
  }

  // 2. Vercel
  const vercelCountry = headers['x-vercel-ip-country']
  if (vercelCountry) {
    const regionKey = mapCountry(vercelCountry)
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    return { countryCode: vercelCountry.toUpperCase(), regionKey, source: 'vercel' }
  }

  // 3. ip-api.com lookup
  const ip = getClientIp(event)
  const countryCode = await lookupIp(ip)
  const regionKey = mapCountry(countryCode)

  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return { countryCode: countryCode.toUpperCase(), regionKey, source: 'ip-api' }
})
