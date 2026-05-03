import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3002'

const PAGES = [
  { name: 'Homepage',       url: '/' },
  { name: 'Blog list',      url: '/blog' },
  { name: 'Integrations',   url: '/integrations' },
  { name: 'About',          url: '/about' },
]

// Selectors that previously used Instrument Serif / Syne
const FONT_SELECTORS: Record<string, string[]> = {
  '/':             ['.home-hero__title', 'h1', 'h2', 'h3'],
  '/blog':         ['.blog-hero__title', '.post-card__title', 'h1', 'h2'],
  '/integrations': ['.int-hero__title', 'h1', 'h2'],
  '/about':        ['h1', 'h2'],
}

/**
 * Resolve the *computed* font-family for an element and check it
 * contains "Plus Jakarta Sans" and does NOT contain "Instrument Serif" or "Syne".
 */
async function assertFont(page: import('@playwright/test').Page, selector: string, pageUrl: string) {
  const el = page.locator(selector).first()
  const count = await el.count()
  if (count === 0) return  // element not present on this page — skip gracefully

  const fontFamily = await el.evaluate((node: Element) =>
    window.getComputedStyle(node).fontFamily
  )

  expect(fontFamily, `${pageUrl} › ${selector} font-family`).not.toContain('Instrument Serif')
  expect(fontFamily, `${pageUrl} › ${selector} font-family`).not.toContain('Syne')
}

/**
 * Check the CSS custom property values on :root.
 */
async function assertTokens(page: import('@playwright/test').Page) {
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      fSer:        style.getPropertyValue('--f-ser').trim(),
      fDisplay:    style.getPropertyValue('--f-display').trim(),
      fontHeading: style.getPropertyValue('--font-heading').trim(),
      fontDisplay: style.getPropertyValue('--font-display').trim(),
      fUi:         style.getPropertyValue('--f-ui').trim(),
    }
  })

  // None of the heading/display tokens should resolve to Instrument Serif
  for (const [name, value] of Object.entries(tokens)) {
    expect(value, `CSS token --${name}`).not.toContain('Instrument Serif')
    expect(value, `CSS token --${name}`).not.toContain('Syne')
  }

  // --f-ui must start with Plus Jakarta Sans
  expect(tokens.fUi).toMatch(/Plus Jakarta Sans/)
}

/**
 * Ensure the Google Fonts link tag for Instrument Serif is NOT present.
 */
async function assertNoInstrumentSerifLink(page: import('@playwright/test').Page) {
  const links = await page.$$eval(
    'link[rel="stylesheet"][href*="fonts.googleapis"]',
    (els) => els.map((el) => (el as HTMLLinkElement).href)
  )
  for (const href of links) {
    expect(href, 'Google Fonts link').not.toContain('Instrument+Serif')
    expect(href, 'Google Fonts link').not.toContain('Instrument_Serif')
  }
}

for (const { name, url } of PAGES) {
  test(`Font: ${name} (${url})`, async ({ page }) => {
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded' })

    await assertTokens(page)
    await assertNoInstrumentSerifLink(page)

    const selectors = FONT_SELECTORS[url] ?? ['h1', 'h2']
    for (const sel of selectors) {
      await assertFont(page, sel, url)
    }
  })
}

test('Font: CSS tokens resolve to Plus Jakarta Sans', async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })

  const computed = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    // resolve each heading token all the way to a concrete font name
    const el = document.createElement('div')
    el.style.fontFamily = 'var(--font-heading)'
    document.body.appendChild(el)
    const resolved = getComputedStyle(el).fontFamily
    document.body.removeChild(el)
    return {
      rawToken: style.getPropertyValue('--font-heading').trim(),
      resolvedHeading: resolved,
    }
  })

  expect(computed.rawToken, '--font-heading token').not.toContain('Instrument Serif')
  expect(computed.resolvedHeading, 'Resolved --font-heading').toMatch(/Plus Jakarta Sans|system-ui|-apple-system/)
})
