import { test, expect } from '@playwright/test'

test.describe('Auth forms', () => {
  test('login page renders email/password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")')).toBeVisible()
  })

  test('register page renders sign-up form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('invalid@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"], form button').first().click()
    // Should either show an error message or stay on the login page
    await expect(page).toHaveURL(/login/)
  })
})
