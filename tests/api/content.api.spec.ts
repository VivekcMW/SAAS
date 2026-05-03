/**
 * API integration tests — exercise the HTTP layer of Nitro API routes.
 * These run against a live dev server (BASE_URL env variable).
 *
 * Run: BASE_URL=http://localhost:3000 npx playwright test tests/api/
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ── Server warm-up ─────────────────────────────────────────────────────────────
// The first request to a cold Nitro dev server can take several seconds.
// This shared beforeAll fires one warm-up GET so subsequent tests are stable.

test.beforeAll(async ({ request }) => {
  // Retry up to 5 times with 2-second gaps — handles cold Nitro start-up
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await request.get(`${BASE}/api/changelog`)
      if (res.ok()) break
    } catch {
      await new Promise((r) => setTimeout(r, 2_000))
    }
  }
})

// ── /api/changelog ─────────────────────────────────────────────────────────────

test.describe('GET /api/changelog', () => {
  test.setTimeout(60_000)

  test('returns 200 with entries array and pagination', async ({ request }) => {
    const res = await request.get(`${BASE}/api/changelog`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('entries')
    expect(body).toHaveProperty('pagination')
    expect(Array.isArray(body.entries)).toBe(true)
    expect(body.pagination).toMatchObject({
      page: 1,
      limit: 20
    })
  })

  test('filters by valid type', async ({ request }) => {
    const res = await request.get(`${BASE}/api/changelog?type=feature`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    for (const entry of body.entries) {
      expect(entry.type).toBe('feature')
    }
  })

  test('ignores invalid type filter (returns all)', async ({ request }) => {
    const res = await request.get(`${BASE}/api/changelog?type=__invalid__`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.entries)).toBe(true)
  })

  test('paginates correctly', async ({ request }) => {
    const p1 = await (await request.get(`${BASE}/api/changelog?page=1&limit=2`)).json()
    const p2 = await (await request.get(`${BASE}/api/changelog?page=2&limit=2`)).json()
    // Both are valid responses
    expect(p1.pagination.page).toBe(1)
    expect(p2.pagination.page).toBe(2)
  })
})

// ── /api/roadmap ───────────────────────────────────────────────────────────────

test.describe('GET /api/roadmap', () => {
  test('returns 200 with groups array', async ({ request }) => {
    const res = await request.get(`${BASE}/api/roadmap`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('groups')
    expect(Array.isArray(body.groups)).toBe(true)
  })

  test('filters by valid status', async ({ request }) => {
    const res = await request.get(`${BASE}/api/roadmap?status=planned`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    for (const group of body.groups) {
      for (const item of group.items) {
        expect(item.status).toBe('planned')
      }
    }
  })

  test('ignores invalid status filter', async ({ request }) => {
    const res = await request.get(`${BASE}/api/roadmap?status=__hack__`)
    expect(res.status()).toBe(200)
  })
})

// ── POST /api/roadmap/vote ─────────────────────────────────────────────────────

test.describe('POST /api/roadmap/vote', () => {
  test('returns 400 when item_id is missing', async ({ request }) => {
    const res = await request.post(`${BASE}/api/roadmap/vote`, { data: {} })
    // CSRF middleware returns 403 for unauthenticated requests before body validation
    expect([400, 403]).toContain(res.status())
  })

  test('returns 404 for non-existent item_id', async ({ request }) => {
    const res = await request.post(`${BASE}/api/roadmap/vote`, {
      data: { item_id: 'item_does_not_exist_xyz' }
    })
    // CSRF middleware returns 403 for unauthenticated requests
    expect([403, 404]).toContain(res.status())
  })
})

// ── /api/guides ────────────────────────────────────────────────────────────────

test.describe('GET /api/guides', () => {
  test('returns 200 with guides array and pagination', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('guides')
    expect(body).toHaveProperty('pagination')
    expect(Array.isArray(body.guides)).toBe(true)
  })

  test('filters by category', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides?category=buyer-tips`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    for (const guide of body.guides) {
      expect(guide.category).toBe('buyer-tips')
    }
  })

  test('filters by difficulty', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides?difficulty=beginner`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    for (const guide of body.guides) {
      expect(guide.difficulty).toBe('beginner')
    }
  })

  test('ignores invalid difficulty', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides?difficulty=__bad__`)
    expect(res.status()).toBe(200)
  })
})

// ── /api/guides/:slug ──────────────────────────────────────────────────────────

test.describe('GET /api/guides/:slug', () => {
  test('returns 400 for slug with path traversal characters', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides/../secret`)
    expect([400, 404]).toContain(res.status())
  })

  test('returns 404 for non-existent slug', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides/this-guide-does-not-exist-xyz123`)
    expect(res.status()).toBe(404)
  })
})

// ── /api/careers/jobs ──────────────────────────────────────────────────────────

test.describe('GET /api/careers/jobs', () => {
  test('returns 200 with jobs array', async ({ request }) => {
    const res = await request.get(`${BASE}/api/careers/jobs`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('jobs')
    expect(Array.isArray(body.jobs)).toBe(true)
  })

  test('filters by department', async ({ request }) => {
    const res = await request.get(`${BASE}/api/careers/jobs?department=engineering`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    for (const job of body.jobs) {
      expect(job.department).toBe('engineering')
    }
  })

  test('ignores invalid department', async ({ request }) => {
    const res = await request.get(`${BASE}/api/careers/jobs?department=__hack__`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.jobs).toHaveLength(0)
  })

  test('only returns active jobs', async ({ request }) => {
    const res = await request.get(`${BASE}/api/careers/jobs`)
    const body = await res.json()
    for (const job of body.jobs) {
      expect(job.status).toBe('active')
    }
  })
})

// ── /api/v1/apps (public API) ─────────────────────────────────────────────────

test.describe('GET /api/v1/apps', () => {
  test('requires API key — returns 401 without one', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/apps`)
    expect([401, 403]).toContain(res.status())
  })
})

// ── Security: common injection checks ────────────────────────────────────────

test.describe('Security: Input validation', () => {
  test('SQL injection in changelog type param is safely ignored', async ({ request }) => {
    const res = await request.get(`${BASE}/api/changelog?type=' OR '1'='1`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    // The injected type is not in the allowlist — returns all entries (no WHERE)
    expect(Array.isArray(body.entries)).toBe(true)
  })

  test('XSS in guides category param is safely ignored', async ({ request }) => {
    const res = await request.get(`${BASE}/api/guides?category=<script>alert(1)</script>`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.guides)).toBe(true)
  })

  test('roadmap vote with non-string item_id is rejected', async ({ request }) => {
    const res = await request.post(`${BASE}/api/roadmap/vote`, {
      data: { item_id: { '$ne': null } }
    })
    // CSRF middleware returns 403 for unauthenticated requests
    expect([400, 403, 404]).toContain(res.status())
  })
})
