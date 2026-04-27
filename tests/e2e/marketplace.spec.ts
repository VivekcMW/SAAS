import { test, expect } from '@playwright/test'

test.describe('Marketplace', () => {
  test('search input is present', async ({ page }) => {
    await page.goto('/marketplace')
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first()
    await expect(searchInput).toBeVisible()
  })

  test('category filters render', async ({ page }) => {
    await page.goto('/marketplace')
    // At least one filter or category element should be present
    const filters = page.locator('[class*="categor" i], [class*="filter" i], [class*="sidebar"]')
    await expect(filters.first()).toBeVisible()
  })

  test('typing in search does not crash the page', async ({ page }) => {
    await page.goto('/marketplace')
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first()
    if (await searchInput.count()) {
      await searchInput.fill('crm')
      await page.waitForTimeout(500) // allow debounce
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible()
    }
  })
})
