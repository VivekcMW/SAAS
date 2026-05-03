/**
 * In-process sliding-window rate limiter.
 * Good for single-instance deployments (SQLite / dev).
 * For multi-instance production, swap the store for Redis.
 */

interface Entry {
  count: number
  windowStart: number
}

const store = new Map<string, Entry>()

// Prune stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - 60_000 * 15
    for (const [key, entry] of store) {
      if (entry.windowStart < cutoff) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitOptions {
  /** Number of requests allowed per window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
  /** Key prefix to namespace different limiters */
  prefix?: string
}

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * Mutates the store — call only once per request.
 */
export function checkRateLimit(ip: string, opts: RateLimitOptions): { allowed: boolean; resetAt: number; remaining: number } {
  const key = `${opts.prefix || 'rl'}:${ip}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart > opts.windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { allowed: true, resetAt: now + opts.windowMs, remaining: opts.limit - 1 }
  }

  entry.count++
  const remaining = Math.max(0, opts.limit - entry.count)
  const resetAt = entry.windowStart + opts.windowMs
  if (entry.count > opts.limit) return { allowed: false, resetAt, remaining: 0 }
  return { allowed: true, resetAt, remaining }
}

/** Extract the real client IP from the H3 event, respecting common proxy headers. */
export function getClientIp(event: { node: { req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string } } } }): string {
  const headers = event.node.req.headers
  const xff = headers['x-forwarded-for']
  if (xff) {
    const first = Array.isArray(xff) ? xff[0] : xff.split(',')[0]
    return first.trim()
  }
  return event.node.req.socket.remoteAddress || 'unknown'
}
