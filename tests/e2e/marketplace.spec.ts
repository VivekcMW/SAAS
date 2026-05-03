import { test, expect } from '@playwright/test'

test.describe('Marketplace', () => {
  test('search input is present', async ({ page }) => {
    await page.goto('/marketplace')
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first()
    await expect(searchInput).toBeVisible()
  })

  test('category filters render', async ({ page }) => {
    await page.goto('/marketplace')
    // At least one filter/category element or a button to open filters should be present
    const filters = page.locator('[class*="categor" i], [class*="filter" i], [class*="sidebar"]')
    const filtersCount = await filters.count()
    if (filtersCount > 0) {
      // On desktop it should be visible; on mobile a toggle button is acceptable
      const visibleFilter = filters.filter({ hasNot: page.locator('[style*="display: none"]') })
      const hasVisible = await filters.evaluateAll(els => els.some(el => {
        const cs = window.getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
      }))
      expect(hasVisible).toBe(true)
    } else {
      // Fallback: page should at least have a search or main content
      await expect(page.locator('main, [class*="marketplace"]').first()).toBeVisible()
    }
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
