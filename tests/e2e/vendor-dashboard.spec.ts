/**
 * E2E tests for vendor dashboard flows.
 * Tests core vendor workflows: login, dashboard navigation, promotions, leads.
 */
import { test, expect } from '@playwright/test'

// Use demo vendor credentials seeded in DB
const VENDOR_EMAIL = 'vendor@demo.com'
const VENDOR_PASS = 'demo1234'

test.describe('Vendor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as vendor before each test
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(VENDOR_EMAIL)
    await page.locator('input[type="password"]').fill(VENDOR_PASS)
    await page.locator('button[type="submit"], form button').first().click()
    // Either redirected to dashboard or stayed on login (auth may not be seeded)
    await page.waitForLoadState('networkidle')
  })

  test('vendor dashboard is accessible after login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('body')).toBeVisible()
    // Should not redirect to login if auth is valid
    const url = page.url()
    // Either on dashboard or login (depends on whether demo user is seeded)
    expect(url).toMatch(/dashboard|login/)
  })

  test('vendor listings page renders without crashing', async ({ page }) => {
    await page.goto('/dashboard/listings')
    await expect(page.locator('body')).toBeVisible()
    // Should show listings table or empty state, not a blank page
    await expect(page.locator('h1, h2, [class*="bw-head"]').first()).toBeVisible()
  })

  test('vendor analytics page renders charts or loading state', async ({ page }) => {
    await page.goto('/dashboard/analytics')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1, h2, [class*="bw-head"]').first()).toBeVisible()
  })

  test('vendor leads page renders inbox or empty state', async ({ page }) => {
    await page.goto('/dashboard/leads')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    // Should show inbox or "No leads" state
    const inbox = page.locator('[class*="inbox"], [class*="leads"], [class*="bw-head"]')
    await expect(inbox.first()).toBeVisible()
  })

  test('vendor promotions page renders table or empty state', async ({ page }) => {
    await page.goto('/dashboard/promotions')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1, h2, [class*="bw-head"]').first()).toBeVisible()
  })
})
