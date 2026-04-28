/**
 * Cache-Control middleware
 *
 * Applies response headers at the Nitro edge layer. Works in combination with
 * the routeRules in nuxt.config.ts — this handler covers dynamic logic (e.g.
 * auth-cookie presence) that cannot be expressed as static route rules.
 *
 * Priority (highest → lowest):
 *  1. This middleware sets the baseline.
 *  2. Individual route handlers may override with setResponseHeader().
 *  3. routeRules in nuxt.config.ts override for matched patterns.
 */

const PRIVATE_PREFIXES = [
  '/api/auth/',
  '/api/user/',
  '/api/vendor/',
  '/api/admin/',
  '/api/billing/',
  '/api/stack/',
  '/api/affiliate/',
  '/api/buying-rooms/',
  '/api/ai/',
  '/api/onboarding/',
  '/api/analytics/',
]

const PUBLIC_CACHEABLE_PREFIXES: Array<{ prefix: string; maxAge: number; sMaxAge: number; swr?: number }> = [
  { prefix: '/api/news',           maxAge: 60,   sMaxAge: 60,   swr: 300 },
  { prefix: '/api/apps',           maxAge: 120,  sMaxAge: 300,  swr: 600 },
  { prefix: '/api/public/',        maxAge: 300,  sMaxAge: 600 },
  { prefix: '/api/categories/',    maxAge: 3600, sMaxAge: 3600 },
  { prefix: '/api/stats/',         maxAge: 3600, sMaxAge: 3600 },
  { prefix: '/api/prices/',        maxAge: 300,  sMaxAge: 600 },
  { prefix: '/api/qa/tags',        maxAge: 3600, sMaxAge: 3600 },
  { prefix: '/api/qa/',            maxAge: 60,   sMaxAge: 120,  swr: 300 },
  { prefix: '/api/rfp',            maxAge: 60,   sMaxAge: 120,  swr: 300 },
  { prefix: '/api/sitemap',        maxAge: 3600, sMaxAge: 3600 },
  { prefix: '/api/robots.txt',     maxAge: 86400, sMaxAge: 86400 },
]

export default defineEventHandler((event) => {
  const path = event.path?.split('?')[0] ?? ''
  const method = event.method?.toUpperCase() ?? 'GET'

  // Only set headers on GET/HEAD — mutations must never be cached
  if (method !== 'GET' && method !== 'HEAD') {
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return
  }

  // Private API routes — hard no-store
  const isPrivate = PRIVATE_PREFIXES.some(p => path.startsWith(p))
  if (isPrivate) {
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
    return
  }

  // Private page routes
  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/onboarding') ||
    path.startsWith('/settings')
  ) {
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return
  }

  // Public cacheable API routes
  const cacheRule = PUBLIC_CACHEABLE_PREFIXES.find(r => path.startsWith(r.prefix))
  if (cacheRule) {
    const parts = [`public, max-age=${cacheRule.maxAge}, s-maxage=${cacheRule.sMaxAge}`]
    if (cacheRule.swr) parts.push(`stale-while-revalidate=${cacheRule.swr}`)
    setResponseHeader(event, 'Cache-Control', parts.join(', '))
    // Vary on Accept so JSON vs HTML get separate cache entries
    setResponseHeader(event, 'Vary', 'Accept, Accept-Encoding')
    return
  }

  // Public content pages — short browser cache, longer CDN cache
  if (
    path.startsWith('/news') ||
    path.startsWith('/integrations') ||
    path.startsWith('/marketplace') ||
    path.startsWith('/categories') ||
    path.startsWith('/alternatives') ||
    path.startsWith('/about') ||
    path === '/'
  ) {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return
  }

  // Default: revalidate but allow browser to cache briefly
  setResponseHeader(event, 'Cache-Control', 'public, max-age=0, must-revalidate')
})
