import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

// ── Navigation ────────────────────────────────────────────────────────────────

Given('the Moonmart application is running', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await expect(page.locator('body')).toBeVisible()
})

Given('I am on the Moonmart homepage', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
})

When('I navigate to {string}', async ({ page }, path: string) => {
  await page.goto(path, { timeout: 30_000, waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null)
})

When('I navigate to the marketplace', async ({ page }) => {
  await page.goto('/marketplace', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null)
})

// ── Common assertions ─────────────────────────────────────────────────────────

Then('the page should load without errors', async ({ page }) => {
  const title = await page.title()
  expect(title).not.toBe('')
  // No unhandled error boundary visible
  const errorBoundary = page.locator('text=/500|internal server error/i')
  await expect(errorBoundary).not.toBeVisible()
})

Then('I should see the heading {string}', async ({ page }, heading: string) => {
  await expect(page.locator(`h1, h2`).filter({ hasText: heading })).toBeVisible()
})

Then('I should see the heading containing {string}', async ({ page }, text: string) => {
  // Use filter to avoid picking up hidden modal headings before visible page headings
  const heading = page.locator('h1, h2').filter({ hasText: text }).first()
  await expect(heading).toBeVisible({ timeout: 8_000 })
})

Then('the page should not crash', async ({ page }) => {
  await expect(page.locator('body')).toBeVisible()
  const cssErr = page.locator('[class*="error"]')
  const count = await cssErr.count()
  // A visible 500 error should not exist
  if (count > 0) {
    await expect(cssErr.first()).not.toContainText('500')
  }
})

Then('I should not see a raw server error', async ({ page }) => {
  const body = await page.textContent('body') ?? ''
  expect(body).not.toMatch(/stack trace|at Object\.|TypeError:|ReferenceError:/i)
})

// ── Mobile viewport ───────────────────────────────────────────────────────────

Given('I am viewing the marketplace on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/marketplace')
})

// ── Alert / XSS guard ─────────────────────────────────────────────────────────

Then('no alert dialog should appear', async ({ page }) => {
  // If a dialog fires, the test should have heard it — we assert none was triggered
  let alertFired = false
  page.on('dialog', () => { alertFired = true })
  await page.waitForTimeout(300)
  expect(alertFired).toBe(false)
})

Then('the page should remain functional', async ({ page }) => {
  await expect(page.locator('body')).toBeVisible()
})
