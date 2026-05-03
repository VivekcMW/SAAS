/**
 * E2E tests for new content pages — changelog, roadmap, guides, careers.
 * Runs against a live dev server.
 */
import { test, expect } from '@playwright/test'

test.describe('Changelog page', () => {
  test('loads with correct title and heading', async ({ page }) => {
    await page.goto('/changelog')
    await expect(page).toHaveTitle(/changelog|moonmart/i)
    await expect(page.locator('h1')).toContainText(/changelog/i)
  })

  test('shows type filter buttons', async ({ page }) => {
    await page.goto('/changelog')
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.locator('button:has-text("Feature")')).toBeVisible()
    await expect(page.locator('button:has-text("Fix")')).toBeVisible()
  })

  test('clicking a type filter does not crash the page', async ({ page }) => {
    await page.goto('/changelog')
    await page.locator('button:has-text("Feature")').click()
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('has no visible 500 errors', async ({ page }) => {
    await page.goto('/changelog')
    const errors = page.locator('text=/500|internal server error/i')
    await expect(errors).not.toBeVisible()
  })
})

test.describe('Roadmap page', () => {
  test('loads with correct heading', async ({ page }) => {
    await page.goto('/roadmap')
    await expect(page.locator('h1')).toContainText(/roadmap/i)
  })

  test('shows status and category filter pills', async ({ page }) => {
    await page.goto('/roadmap')
    await expect(page.locator('.filter-btn').first()).toBeVisible()
  })

  test('vote button is present when items exist', async ({ page }) => {
    await page.goto('/roadmap')
    await page.waitForLoadState('networkidle')
    const voteBtn = page.locator('[class*="vote-btn"]').first()
    const emptyState = page.locator('[class*="empty-state"]')
    // Either vote buttons or empty state
    const hasBtns = await voteBtn.count()
    const hasEmpty = await emptyState.count()
    expect(hasBtns + hasEmpty).toBeGreaterThan(0)
  })
})

test.describe('Guides page', () => {
  test('loads with heading containing "Guides"', async ({ page }) => {
    await page.goto('/guides')
    await expect(page.locator('h1')).toContainText(/guides/i)
  })

  test('shows category sidebar', async ({ page }) => {
    await page.goto('/guides')
    await expect(page.locator('.sidebar, aside').first()).toBeVisible()
  })

  test('guide detail 404 redirects gracefully', async ({ page }) => {
    await page.goto('/guides/no-such-guide-xyz')
    await page.waitForLoadState('networkidle')
    // Should show error state, not a white screen
    const body = await page.textContent('body') ?? ''
    expect(body.trim().length).toBeGreaterThan(20)
  })

  test('guide detail shows back link when guide exists', async ({ page }) => {
    // Navigate to guides list and try to open first guide if any
    await page.goto('/guides')
    const firstLink = page.locator('[class*="guide-title"] a').first()
    if (await firstLink.count()) {
      await firstLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page.locator('a:has-text("Back")')).toBeVisible()
    }
  })
})

test.describe('Careers page', () => {
  test('loads with correct heading', async ({ page }) => {
    await page.goto('/careers')
    await expect(page.locator('h1')).toContainText(/join/i)
  })

  test('shows department filter buttons', async ({ page }) => {
    await page.goto('/careers')
    await expect(page.locator('.filter-btn').first()).toBeVisible()
  })

  test('shows footer CTA with contact email', async ({ page }) => {
    await page.goto('/careers')
    await expect(page.locator('[class*="footer-cta"]')).toBeVisible()
    await expect(page.locator('a[href*="mailto"]')).toBeVisible()
  })

  test('hero stats are visible', async ({ page }) => {
    await page.goto('/careers')
    await expect(page.locator('[class*="hero-stats"]')).toBeVisible()
  })
})

test.describe('Developer portal', () => {
  test('loads developer page', async ({ page }) => {
    await page.goto('/developer')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('shows API tier table', async ({ page }) => {
    await page.goto('/developer')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('section#tiers table.dev-table')).toBeVisible()
  })
})
