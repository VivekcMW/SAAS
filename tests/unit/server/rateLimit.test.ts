import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '~/server/utils/rateLimit'

// Each test gets a fresh module state so the in-memory store is clean
beforeEach(() => {
  vi.resetModules()
})

describe('checkRateLimit', () => {
  it('allows the first request for a new IP', () => {
    const allowed = checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000, prefix: 'test' })
    expect(allowed).toBe(true)
  })

  it('allows requests up to the limit', () => {
    const ip = '10.0.0.1'
    const opts = { limit: 3, windowMs: 60_000, prefix: 'burst' }
    expect(checkRateLimit(ip, opts)).toBe(true)  // 1
    expect(checkRateLimit(ip, opts)).toBe(true)  // 2
    expect(checkRateLimit(ip, opts)).toBe(true)  // 3
  })

  it('blocks the request that exceeds the limit', () => {
    const ip = '10.0.0.2'
    const opts = { limit: 2, windowMs: 60_000, prefix: 'block' }
    checkRateLimit(ip, opts) // 1
    checkRateLimit(ip, opts) // 2
    const blocked = checkRateLimit(ip, opts) // 3 — over limit
    expect(blocked).toBe(false)
  })

  it('namespaces correctly — different prefixes do not share counters', () => {
    const ip = '10.0.0.3'
    checkRateLimit(ip, { limit: 1, windowMs: 60_000, prefix: 'ns-a' }) // hits limit for ns-a
    checkRateLimit(ip, { limit: 1, windowMs: 60_000, prefix: 'ns-a' }) // over limit
    // ns-b is still fresh
    const allowed = checkRateLimit(ip, { limit: 1, windowMs: 60_000, prefix: 'ns-b' })
    expect(allowed).toBe(true)
  })

  it('resets after the window expires', async () => {
    const ip = '10.0.0.4'
    const opts = { limit: 1, windowMs: 50, prefix: 'window' } // 50ms window
    checkRateLimit(ip, opts) // 1
    checkRateLimit(ip, opts) // over limit
    // Wait for window to expire
    await new Promise(r => setTimeout(r, 60))
    const allowed = checkRateLimit(ip, opts)
    expect(allowed).toBe(true)
  })

  it('treats different IPs independently', () => {
    const opts = { limit: 1, windowMs: 60_000, prefix: 'ip-isolation' }
    checkRateLimit('192.168.1.1', opts) // uses up the limit for 192.168.1.1
    checkRateLimit('192.168.1.1', opts) // over limit
    // A different IP should still be allowed
    expect(checkRateLimit('192.168.1.2', opts)).toBe(true)
  })
})
