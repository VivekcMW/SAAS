/**
 * Geo event tracking utility.
 *
 * Calls ip-api.com with extended fields (lat, lon, city, country) and stores
 * events in the `geo_events` table. The call is designed to be fire-and-forget
 * so it never blocks login/auth responses.
 *
 * ip-api.com free tier: 45 req/min, no API key required.
 * In-process cache per IP (24 h) prevents duplicate lookups.
 */

import { getDb, makeId } from '~/server/utils/database'
import { getClientIp } from '~/server/utils/rateLimit'

export type GeoEventType = 'login' | 'oauth_login' | 'magic_link_login' | 'passkey_login' | 'pageview'

interface IpApiResponse {
  status: string
  countryCode: string
  country: string
  regionName: string
  city: string
  lat: number
  lon: number
}

interface GeoLookupResult {
  countryCode: string
  countryName: string
  regionName: string
  city: string
  lat: number
  lon: number
}

// ── Per-IP cache (24 h) ─────────────────────────────────────────────────────
const _cache = new Map<string, { data: GeoLookupResult; cachedAt: number }>()
const TTL = 24 * 60 * 60 * 1000

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - TTL
    for (const [k, v] of _cache) {
      if (v.cachedAt < cutoff) _cache.delete(k)
    }
  }, 60 * 60 * 1000)
}

const PRIVATE_IP = /^(::1|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/

function isPrivateIp(ip: string) {
  return !ip || PRIVATE_IP.test(ip) || ip === '::1'
}

async function lookupGeo(ip: string): Promise<GeoLookupResult> {
  // Dev / loopback — return a representative location so the map isn't empty
  if (isPrivateIp(ip)) {
    return { countryCode: 'US', countryName: 'United States', regionName: 'California', city: 'San Francisco', lat: 37.7749, lon: -122.4194 }
  }

  const cached = _cache.get(ip)
  if (cached && Date.now() - cached.cachedAt < TTL) return cached.data

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,country,regionName,city,lat,lon`,
      { signal: AbortSignal.timeout(4000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as IpApiResponse
    if (data.status === 'success') {
      const result: GeoLookupResult = {
        countryCode: data.countryCode,
        countryName: data.country,
        regionName: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
      }
      _cache.set(ip, { data: result, cachedAt: Date.now() })
      return result
    }
  } catch {
    // fall through
  }
  return { countryCode: 'XX', countryName: 'Unknown', regionName: '', city: '', lat: 0, lon: 0 }
}

function ensureGeoTable() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS geo_events (
      id           TEXT PRIMARY KEY,
      user_id      TEXT,
      country_code TEXT NOT NULL DEFAULT 'XX',
      country_name TEXT NOT NULL DEFAULT '',
      region_name  TEXT NOT NULL DEFAULT '',
      city         TEXT NOT NULL DEFAULT '',
      lat          REAL NOT NULL DEFAULT 0,
      lon          REAL NOT NULL DEFAULT 0,
      event_type   TEXT NOT NULL DEFAULT 'login',
      created_at   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ge_country ON geo_events(country_code);
    CREATE INDEX IF NOT EXISTS idx_ge_created ON geo_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_ge_user    ON geo_events(user_id);
  `)
  return db
}

/**
 * Log a geo event. This is intentionally async and non-blocking — callers
 * should NOT await it so the auth response is never delayed.
 *
 * @param event  H3 event (to extract client IP)
 * @param opts   userId (nullable for anonymous) and eventType
 */
export function logGeoEvent(
  event: Parameters<typeof getClientIp>[0],
  opts: { userId?: string | null; eventType?: GeoEventType }
): void {
  const ip = getClientIp(event)
  const eventType = opts.eventType ?? 'login'
  const userId = opts.userId ?? null

  // Fire and forget — intentionally not awaited
  ;(async () => {
    try {
      const geo = await lookupGeo(ip)
      const db = ensureGeoTable()
      db.prepare(`
        INSERT INTO geo_events (id, user_id, country_code, country_name, region_name, city, lat, lon, event_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        makeId('geo'),
        userId,
        geo.countryCode,
        geo.countryName,
        geo.regionName,
        geo.city,
        geo.lat,
        geo.lon,
        eventType,
        new Date().toISOString()
      )
    } catch {
      // Never let geo tracking errors surface to callers
    }
  })()
}
