import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('homepage loads and has hero content', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/moonmart/i)
    // Navbar should be visible
    await expect(page.locator('nav')).toBeVisible()
  })

  test('marketplace page loads with product cards or empty state', async ({ page }) => {
    await page.goto('/marketplace')
    await expect(page).toHaveURL(/marketplace/)
    // Either product cards or an empty-state message should be visible
    const cards = page.locator('[class*="product-card"], [class*="ProductCard"]')
    const empty = page.locator('text=/no applications|no results/i')
    const hasCards = await cards.count()
    const hasEmpty = await empty.count()
    expect(hasCards + hasEmpty).toBeGreaterThan(0)
  })

  test('blog listing page loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveURL(/blog/)
    // Title or heading should be present
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('about page loads', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL(/about/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact')
    await expect(page).toHaveURL(/contact/)
  })
})
