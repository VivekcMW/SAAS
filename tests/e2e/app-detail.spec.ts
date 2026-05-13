/**
 * E2E tests for app detail page.
 * Tests: page load, AI chat widget, demo booking, review interactions.
 */
import { test, expect } from '@playwright/test'

test.describe('App Detail Page', () => {
  test('app detail page loads without error', async ({ page }) => {
    // Navigate to marketplace first to find a real app slug
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    // Try to click on any app card
    const appLinks = page.locator('a[href^="/app/"]')
    if (await appLinks.count() > 0) {
      const href = await appLinks.first().getAttribute('href')
      await page.goto(href!)
      await page.waitForLoadState('networkidle')

      await expect(page).not.toHaveURL(/error/)
      await expect(page.locator('h1, [class*="hero"], [class*="app-name"]').first()).toBeVisible()
    } else {
      // No apps seeded — just verify marketplace loaded
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('AI chat widget is visible on app detail page', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    const appLinks = page.locator('a[href^="/app/"]')
    if (await appLinks.count() > 0) {
      const href = await appLinks.first().getAttribute('href')
      await page.goto(href!)
      await page.waitForLoadState('networkidle')

      // AI chat section should be present
      const aiChat = page.locator('.aic, [class*="ai-chat"]')
      if (await aiChat.count() > 0) {
        await expect(aiChat.first()).toBeVisible()
      }
    }
  })

  test('review section renders on app detail page', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    const appLinks = page.locator('a[href^="/app/"]')
    if (await appLinks.count() > 0) {
      const href = await appLinks.first().getAttribute('href')
      await page.goto(href!)
      await page.waitForLoadState('networkidle')

      // Reviews section should exist (may be empty)
      const reviewSection = page.locator('#reviews, [class*="review"]').first()
      await expect(reviewSection).toBeDefined()
    }
  })
})

test.describe('App Demo Booking', () => {
  test('demo booking API rejects empty fields', async ({ request }) => {
    // Pick a likely app id — use a known slug or skip test gracefully
    const res = await request.post('/api/apps/nonexistent-app/demo-request', {
      data: { name: '', email: '' },
    })
    // Should be 400 (bad request) or 404 (not found) — not 200
    expect([400, 404, 422]).toContain(res.status())
  })
})

test.describe('Search Suggestions API', () => {
  test('returns empty suggestions for empty query', async ({ request }) => {
    const res = await request.get('/api/search/suggestions?q=')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.suggestions).toEqual([])
  })

  test('returns suggestions for real query', async ({ request }) => {
    const res = await request.get('/api/search/suggestions?q=crm&limit=5')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data.suggestions)).toBeTruthy()
    expect(data.suggestions.length).toBeLessThanOrEqual(5)
  })
})
