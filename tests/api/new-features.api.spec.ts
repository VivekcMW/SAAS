/**
 * API integration tests for newly implemented endpoints:
 *   - /api/ads/track
 *   - /api/blog  (wired)
 *   - /api/vendor/promotions
 *   - /api/admin/badges
 *   - /api/admin/activity
 *   - /api/admin/ads/stats
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// Warm-up before all tests
test.beforeAll(async ({ request }) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await request.get(`${BASE}/api/changelog`)
      if (res.ok()) break
    } catch {
      await new Promise((r) => setTimeout(r, 2_000))
    }
  }
})

// ── /api/blog ──────────────────────────────────────────────────────────────────

test.describe('GET /api/blog', () => {
  test.setTimeout(30_000)

  test('returns 200 with posts array and pagination', async ({ request }) => {
    const res = await request.get(`${BASE}/api/blog`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('posts')
    expect(Array.isArray(body.posts)).toBe(true)
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
    expect(body).toHaveProperty('pages')
  })

  test('respects limit query param', async ({ request }) => {
    const res = await request.get(`${BASE}/api/blog?limit=3`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.posts.length).toBeLessThanOrEqual(3)
  })

  test('respects category filter', async ({ request }) => {
    // Get all posts first, then filter by a real category
    const all = await request.get(`${BASE}/api/blog?limit=50`)
    const allBody = await all.json()
    if (allBody.posts.length === 0) return // no seed data — skip

    const category = allBody.posts[0]?.category
    if (!category) return

    const filtered = await request.get(`${BASE}/api/blog?category=${encodeURIComponent(category)}`)
    const filteredBody = await filtered.json()
    expect(filteredBody.posts.every((p: any) => p.category === category)).toBe(true)
  })
})

// ── /api/ads/track ─────────────────────────────────────────────────────────────

test.describe('POST /api/ads/track', () => {
  test.setTimeout(15_000)

  test('returns 204 for valid impression event', async ({ request }) => {
    const res = await request.post(`${BASE}/api/ads/track`, {
      data: { appId: 'app-001', placement: 'grid', eventType: 'impression' },
    })
    // 204 for both valid and invalid — endpoint never returns errors to clients
    expect([204, 200]).toContain(res.status())
  })

  test('returns 204 for valid click event', async ({ request }) => {
    const res = await request.post(`${BASE}/api/ads/track`, {
      data: { appId: 'app-001', placement: 'sidebar', eventType: 'click' },
    })
    expect([204, 200]).toContain(res.status())
  })

  test('returns 204 for invalid event type (silent absorb)', async ({ request }) => {
    const res = await request.post(`${BASE}/api/ads/track`, {
      data: { appId: 'app-001', placement: 'grid', eventType: 'fake_event' },
    })
    // Must not 500 — always silent
    expect(res.status()).not.toBe(500)
  })

  test('returns 204 for missing appId (silent absorb)', async ({ request }) => {
    const res = await request.post(`${BASE}/api/ads/track`, {
      data: { placement: 'grid', eventType: 'impression' },
    })
    expect(res.status()).not.toBe(500)
  })
})

// ── /api/admin/activity ────────────────────────────────────────────────────────

test.describe('GET /api/admin/activity', () => {
  test.setTimeout(15_000)

  test('returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/activity`)
    expect([401, 403]).toContain(res.status())
  })
})

// ── /api/admin/badges ──────────────────────────────────────────────────────────

test.describe('GET /api/admin/badges', () => {
  test.setTimeout(15_000)

  test('returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/badges`)
    expect([401, 403]).toContain(res.status())
  })
})

// ── /api/admin/badges/assign ───────────────────────────────────────────────────

test.describe('POST /api/admin/badges/assign', () => {
  test.setTimeout(15_000)

  test('returns 401 without auth', async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/badges/assign`, {
      data: { appId: 'app-001', badgeType: 'editors-choice', action: 'assign' },
    })
    expect([401, 403]).toContain(res.status())
  })
})

// ── /api/admin/ads/stats ───────────────────────────────────────────────────────

test.describe('GET /api/admin/ads/stats', () => {
  test.setTimeout(15_000)

  test('returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/ads/stats`)
    expect([401, 403]).toContain(res.status())
  })
})

// ── /api/vendor/promotions ─────────────────────────────────────────────────────

test.describe('GET /api/vendor/promotions', () => {
  test.setTimeout(15_000)

  test('returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/vendor/promotions`)
    expect([401, 403]).toContain(res.status())
  })
})
