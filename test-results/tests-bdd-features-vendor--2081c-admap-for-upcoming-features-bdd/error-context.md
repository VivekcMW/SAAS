# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ../bdd-gen/tests/bdd/features/vendor-journey.feature.spec.js >> Vendor Onboarding and Management Journey >> Vendor checks the roadmap for upcoming features
- Location: bdd-gen/tests/bdd/features/vendor-journey.feature.spec.js:45:3

# Error details

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3002/", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { createBdd } from 'playwright-bdd'
  2  | import { expect } from '@playwright/test'
  3  | 
  4  | const { Given, When, Then } = createBdd()
  5  | 
  6  | // ── Navigation ────────────────────────────────────────────────────────────────
  7  | 
  8  | Given('the Moonmart application is running', async ({ page }) => {
> 9  |   await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
     |              ^ TimeoutError: page.goto: Timeout 30000ms exceeded.
  10 |   await expect(page.locator('body')).toBeVisible()
  11 | })
  12 | 
  13 | Given('I am on the Moonmart homepage', async ({ page }) => {
  14 |   await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  15 | })
  16 | 
  17 | When('I navigate to {string}', async ({ page }, path: string) => {
  18 |   await page.goto(path, { timeout: 30_000, waitUntil: 'domcontentloaded' })
  19 |   await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null)
  20 | })
  21 | 
  22 | When('I navigate to the marketplace', async ({ page }) => {
  23 |   await page.goto('/marketplace', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  24 |   await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null)
  25 | })
  26 | 
  27 | // ── Common assertions ─────────────────────────────────────────────────────────
  28 | 
  29 | Then('the page should load without errors', async ({ page }) => {
  30 |   const title = await page.title()
  31 |   expect(title).not.toBe('')
  32 |   // No unhandled error boundary visible
  33 |   const errorBoundary = page.locator('text=/500|internal server error/i')
  34 |   await expect(errorBoundary).not.toBeVisible()
  35 | })
  36 | 
  37 | Then('I should see the heading {string}', async ({ page }, heading: string) => {
  38 |   await expect(page.locator(`h1, h2`).filter({ hasText: heading })).toBeVisible()
  39 | })
  40 | 
  41 | Then('I should see the heading containing {string}', async ({ page }, text: string) => {
  42 |   // Use filter to avoid picking up hidden modal headings before visible page headings
  43 |   const heading = page.locator('h1, h2').filter({ hasText: text }).first()
  44 |   await expect(heading).toBeVisible({ timeout: 8_000 })
  45 | })
  46 | 
  47 | Then('the page should not crash', async ({ page }) => {
  48 |   await expect(page.locator('body')).toBeVisible()
  49 |   const cssErr = page.locator('[class*="error"]')
  50 |   const count = await cssErr.count()
  51 |   // A visible 500 error should not exist
  52 |   if (count > 0) {
  53 |     await expect(cssErr.first()).not.toContainText('500')
  54 |   }
  55 | })
  56 | 
  57 | Then('I should not see a raw server error', async ({ page }) => {
  58 |   const body = await page.textContent('body') ?? ''
  59 |   expect(body).not.toMatch(/stack trace|at Object\.|TypeError:|ReferenceError:/i)
  60 | })
  61 | 
  62 | // ── Mobile viewport ───────────────────────────────────────────────────────────
  63 | 
  64 | Given('I am viewing the marketplace on a mobile viewport', async ({ page }) => {
  65 |   await page.setViewportSize({ width: 390, height: 844 })
  66 |   await page.goto('/marketplace')
  67 | })
  68 | 
  69 | // ── Alert / XSS guard ─────────────────────────────────────────────────────────
  70 | 
  71 | Then('no alert dialog should appear', async ({ page }) => {
  72 |   // If a dialog fires, the test should have heard it — we assert none was triggered
  73 |   let alertFired = false
  74 |   page.on('dialog', () => { alertFired = true })
  75 |   await page.waitForTimeout(300)
  76 |   expect(alertFired).toBe(false)
  77 | })
  78 | 
  79 | Then('the page should remain functional', async ({ page }) => {
  80 |   await expect(page.locator('body')).toBeVisible()
  81 | })
  82 | 
```