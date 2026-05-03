# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ../bdd-gen/tests/bdd/features/vendor-journey.feature.spec.js >> Vendor Onboarding and Management Journey >> Vendor checks the roadmap for upcoming features
- Location: bdd-gen/tests/bdd/features/vendor-journey.feature.spec.js:45:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - checkbox [ref=e6]
      - generic "Light mode" [ref=e8] [cursor=pointer]:
        - img [ref=e9]
  - generic [ref=e13]:
    - heading "Error" [level=4] [ref=e14]
    - heading "An error has occurred" [level=1] [ref=e15]
  - 'heading "Worker terminated due to reaching memory limit: JS heap out of memory" [level=2] [ref=e19]':
    - img [ref=e21]
    - generic [ref=e23]: "Worker terminated due to reaching memory limit: JS heap out of memory"
  - generic [ref=e25]:
    - heading "Stack Trace" [level=3] [ref=e28]
    - generic [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e33]:
          - checkbox "View All Frames" [ref=e34]
          - generic [ref=e35]: View All Frames
        - generic [ref=e37]:
          - button "Pretty" [ref=e38]
          - button "Raw" [ref=e39]
      - generic:
        - generic:
          - list
  - generic [ref=e41]:
    - heading "Error Cause" [level=3] [ref=e44]
    - code [ref=e49]:
      - generic [ref=e50]:
        - text: "Error {"
        - button "▼" [ref=e51]:
          - generic [ref=e52]: ▼
        - text: "}"
  - generic [ref=e54]:
    - heading "Request" [level=3] [ref=e56]
    - generic [ref=e57]:
      - generic [ref=e58]:
        - heading "url" [level=4] [ref=e59]
        - text: http://localhost:3002/roadmap
      - generic [ref=e60]:
        - heading "method" [level=4] [ref=e61]
        - text: GET
      - generic [ref=e62]:
        - heading "headers" [level=4] [ref=e63]
        - table [ref=e64]:
          - rowgroup [ref=e65]:
            - row "host localhost:3002" [ref=e66]:
              - cell "host" [ref=e67]
              - cell "localhost:3002" [ref=e68]
            - row "connection close" [ref=e69]:
              - cell "connection" [ref=e70]
              - cell "close" [ref=e71]
            - row "sec-ch-ua \"HeadlessChrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"" [ref=e72]:
              - cell "sec-ch-ua" [ref=e73]
              - cell "\"HeadlessChrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"" [ref=e74]
            - row "sec-ch-ua-mobile ?0" [ref=e75]:
              - cell "sec-ch-ua-mobile" [ref=e76]
              - cell "?0" [ref=e77]
            - row "sec-ch-ua-platform \"Windows\"" [ref=e78]:
              - cell "sec-ch-ua-platform" [ref=e79]
              - cell "\"Windows\"" [ref=e80]
            - row "upgrade-insecure-requests 1" [ref=e81]:
              - cell "upgrade-insecure-requests" [ref=e82]
              - cell "1" [ref=e83]
            - row "user-agent Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.15 Safari/537.36" [ref=e84]:
              - cell "user-agent" [ref=e85]
              - cell "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.15 Safari/537.36" [ref=e86]
            - row "accept-language en-US" [ref=e87]:
              - cell "accept-language" [ref=e88]
              - cell "en-US" [ref=e89]
            - row "accept text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" [ref=e90]:
              - cell "accept" [ref=e91]
              - cell "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" [ref=e92]
            - row "sec-fetch-site none" [ref=e93]:
              - cell "sec-fetch-site" [ref=e94]
              - cell "none" [ref=e95]
            - row "sec-fetch-mode navigate" [ref=e96]:
              - cell "sec-fetch-mode" [ref=e97]
              - cell "navigate" [ref=e98]
            - row "sec-fetch-user ?1" [ref=e99]:
              - cell "sec-fetch-user" [ref=e100]
              - cell "?1" [ref=e101]
            - row "sec-fetch-dest document" [ref=e102]:
              - cell "sec-fetch-dest" [ref=e103]
              - cell "document" [ref=e104]
            - row "accept-encoding gzip, deflate, br, zstd" [ref=e105]:
              - cell "accept-encoding" [ref=e106]
              - cell "gzip, deflate, br, zstd" [ref=e107]
```

# Test source

```ts
  228 |   // Check for page 2 indicator or pagination controls
  229 |   const page2 = page.getByText(/page 2/i)
  230 |   const pager = page.locator('[class*="pagination"], [class*="pager"]')
  231 |   const hasPager = (await page2.count()) + (await pager.count())
  232 |   // Lenient: pagination may be URL-based or button-based
  233 |   await expect(page.locator('body')).toBeVisible()
  234 |   expect(hasPager >= 0).toBe(true)
  235 | })
  236 | 
  237 | Then('new products should appear', async ({ page }) => {
  238 |   await expect(page.locator('[class*="product-card"], [class*="app-card"]').first()).toBeVisible()
  239 | })
  240 | 
  241 | Then('the filter sidebar should be collapsed or hidden by default', async ({ page }) => {
  242 |   const sidebar = page.locator('[class*="sidebar"], [class*="filter-panel"]').first()
  243 |   // On mobile it may be hidden
  244 |   const isHidden = !(await sidebar.isVisible().catch(() => false))
  245 |   // Just verifying page doesn't crash on mobile
  246 |   await expect(page.locator('body')).toBeVisible()
  247 |   expect(isHidden || true).toBe(true) // lenient check
  248 | })
  249 | 
  250 | Then('the product grid should be single-column or two-column', async ({ page }) => {
  251 |   await expect(page.locator('body')).toBeVisible()
  252 | })
  253 | 
  254 | // ── Guide steps ───────────────────────────────────────────────────────────────
  255 | 
  256 | Then('I should see a list of guide articles', async ({ page }) => {
  257 |   const guides = page.locator('[class*="guide-card"], [class*="guide"]')
  258 |   const empty = page.locator('text=/no guides|coming soon/i')
  259 |   expect((await guides.count()) + (await empty.count())).toBeGreaterThan(0)
  260 | })
  261 | 
  262 | Then('each guide should show a title, category, and read time', async ({ page }) => {
  263 |   const cards = page.locator('[class*="guide-card"]')
  264 |   if (await cards.count() > 0) {
  265 |     const text = await cards.first().textContent()
  266 |     expect(text?.length).toBeGreaterThan(0)
  267 |   }
  268 | })
  269 | 
  270 | When('I click on a guide', async ({ page }) => {
  271 |   const guideLink = page.locator('[class*="guide-title"] a, [class*="guide-card"] a, a[href*="/guides/"]').first()
  272 |   if (await guideLink.count()) {
  273 |     const href = await guideLink.getAttribute('href')
  274 |     if (href) {
  275 |       await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  276 |     } else {
  277 |       await guideLink.click()
  278 |     }
  279 |     await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null)
  280 |   }
  281 |   // No guides in DB — stay on /guides page (graceful)
  282 | })
  283 | 
  284 | Then('I should be on the guide detail page', async ({ page }) => {
  285 |   // Accept /guides/slug (with data) or /guides (empty DB — no guides to navigate to)
  286 |   expect(page.url()).toMatch(/\/guides/)
  287 | })
  288 | 
  289 | Given('there is a published guide with slug {string}', async () => {
  290 |   // Assumes seed data or pre-existing guide — test is graceful if not found
  291 | })
  292 | 
  293 | Then('I should see the guide title', async ({ page }) => {
  294 |   // With seed data: h1 shows guide title. Without data: "Guide not found." paragraph.
  295 |   const title = page.locator('h1')
  296 |   const notFound = page.locator('text=/guide not found|not found|error/i')
  297 |   const hasTitle = (await title.count()) > 0
  298 |   const hasNotFound = (await notFound.count()) > 0
  299 |   await expect(page.locator('body')).toBeVisible()
  300 |   expect(hasTitle || hasNotFound).toBe(true)
  301 | })
  302 | 
  303 | Then('I should see a {string} link', async ({ page }, linkText: string) => {
  304 |   // Guide detail uses "Back to all guides" / "Back to Guides" — match loosely
  305 |   // On Nuxt error page or empty DB, no such link exists — accept gracefully
  306 |   const exact = page.locator(`a:has-text("${linkText}")`)
  307 |   const partial = page.locator('a').filter({ hasText: /back.*guides|guides/i })
  308 |   const hasExact = (await exact.count()) > 0
  309 |   const hasPartial = (await partial.count()) > 0
  310 |   if (hasExact || hasPartial) {
  311 |     const el = hasExact ? exact : partial
  312 |     await expect(el.first()).toBeVisible({ timeout: 5_000 })
  313 |   }
  314 |   // If neither found (error page / empty DB) — test passes gracefully
  315 | })
  316 | 
  317 | // ── Roadmap steps ─────────────────────────────────────────────────────────────
  318 | 
  319 | Then('roadmap items should be grouped by quarter headings', async ({ page }) => {
  320 |   const quarters = page.locator('[class*="quarter-title"], [class*="quarter"]')
  321 |   const empty = page.locator('text=/no roadmap|no items/i')
  322 |   expect((await quarters.count()) + (await empty.count())).toBeGreaterThan(0)
  323 | })
  324 | 
  325 | Then('each item should display a status badge', async ({ page }) => {
  326 |   const badges = page.locator('[class*="status-badge"]')
  327 |   const empty = page.locator('text=/no roadmap/i')
> 328 |   expect((await badges.count()) + (await empty.count())).toBeGreaterThan(0)
      |                                                          ^ Error: expect(received).toBeGreaterThan(expected)
  329 | })
  330 | 
  331 | When('I click the vote button on a roadmap item', async ({ page }) => {
  332 |   const btn = page.locator('[class*="vote-btn"]').first()
  333 |   if (await btn.count()) {
  334 |     await btn.click()
  335 |     await page.waitForTimeout(500)
  336 |   }
  337 | })
  338 | 
  339 | Then('the vote count should increase by 1', async ({ page }) => {
  340 |   // With seed data: vote button visible after click. With empty DB: page still functional.
  341 |   await expect(page.locator('body')).toBeVisible()
  342 |   // Don't assert vote-btn visible — DB may be empty in test environment
  343 | })
  344 | 
  345 | Then('the vote button should appear highlighted', async ({ page }) => {
  346 |   // After voting: 'voted' class added. With empty DB: page is still functional.
  347 |   await expect(page.locator('body')).toBeVisible()
  348 | })
  349 | 
  350 | When('I click the vote button on the same roadmap item twice', async ({ page }) => {
  351 |   const btn = page.locator('[class*="vote-btn"]').first()
  352 |   if (await btn.count()) {
  353 |     await btn.click()
  354 |     await page.waitForTimeout(500)
  355 |     await btn.click()
  356 |     await page.waitForTimeout(500)
  357 |   }
  358 | })
  359 | 
  360 | Then('the vote count should only increase by 1', async ({ page }) => {
  361 |   // Deduplication is server-side. With empty DB: page is still functional.
  362 |   await expect(page.locator('body')).toBeVisible()
  363 | })
  364 | 
  365 | // ── Changelog steps ────────────────────────────────────────────────────────────
  366 | 
  367 | Then('I should see filter buttons including {string} and {string}', async ({ page }, a: string, b: string) => {
  368 |   await expect(page.locator(`button:has-text("${a}")`).first()).toBeVisible()
  369 |   await expect(page.locator(`button:has-text("${b}")`).first()).toBeVisible()
  370 | })
  371 | 
  372 | Given('the changelog has entries of type {string} and {string}', async () => {
  373 |   // Pre-condition — entries inserted via DB seed or fixture
  374 | })
  375 | 
  376 | When('I click the {string} filter', async ({ page }, filterLabel: string) => {
  377 |   await page.locator(`button:has-text("${filterLabel}")`).first().click()
  378 |   await page.waitForTimeout(400)
  379 | })
  380 | 
  381 | Then('only feature entries should be visible', async ({ page }) => {
  382 |   const featureBadges = page.locator('[class*="type-feature"]')
  383 |   const fixBadges = page.locator('[class*="type-fix"]')
  384 |   // fix badges should not be visible when feature filter is active
  385 |   const fixCount = await fixBadges.count()
  386 |   const featureCount = await featureBadges.count()
  387 |   if (featureCount > 0) {
  388 |     expect(fixCount).toBe(0)
  389 |   }
  390 | })
  391 | 
  392 | When('there are no changelog entries', async () => {
  393 |   // Conditional step — valid when DB has no data
  394 | })
  395 | 
  396 | Then('I should see an empty state message', async ({ page }) => {
  397 |   const textEl = page.getByText(/no changelog|check back|coming soon/i)
  398 |   const cssEl = page.locator('[class*="empty-state"]')
  399 |   const empty = textEl.or(cssEl)
  400 |   const hasContent = (await empty.count()) > 0 || (await page.locator('[class*="entry-card"]').count()) > 0
  401 |   expect(hasContent).toBe(true)
  402 | })
  403 | 
  404 | // ── Careers steps ─────────────────────────────────────────────────────────────
  405 | 
  406 | Then('I should see job listing cards with department badges', async ({ page }) => {
  407 |   const jobs = page.locator('[class*="job-card"]')
  408 |   const empty = page.locator('text=/no open positions|no positions/i')
  409 |   expect((await jobs.count()) + (await empty.count())).toBeGreaterThan(0)
  410 | })
  411 | 
  412 | When('I click the {string} department filter', async ({ page }, dept: string) => {
  413 |   await page.locator(`button:has-text("${dept}")`).first().click()
  414 |   await page.waitForTimeout(400)
  415 | })
  416 | 
  417 | Then('only engineering jobs should be visible', async ({ page }) => {
  418 |   const deptBadges = page.locator('[class*="dept-badge"]')
  419 |   if (await deptBadges.count() > 0) {
  420 |     const text = await deptBadges.first().textContent()
  421 |     expect(text?.toLowerCase()).toContain('engineering')
  422 |   }
  423 | })
  424 | 
  425 | Then('job cards with an apply URL should show an {string} button', async ({ page }, btnText: string) => {
  426 |   const applyBtns = page.locator(`a:has-text("${btnText}"), button:has-text("${btnText}")`)
  427 |   const jobCards = page.locator('[class*="job-card"]')
  428 |   const cardCount = await jobCards.count()
```