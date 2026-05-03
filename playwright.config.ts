import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

// Generate Playwright test files from Gherkin features
const bddTestDir = defineBddConfig({
  features: 'tests/bdd/features/**/*.feature',
  steps: 'tests/bdd/steps/**/*.ts',
  outputDir: 'bdd-gen'
})

export default defineConfig({
  // Default test directory for all non-BDD specs
  testDir: './tests',
  timeout: 45_000,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['html', { outputFolder: 'test-results/html' }], ['github']]
    : [['html', { open: 'never', outputFolder: 'test-results/html' }], ['dot']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry'
  },
  projects: [
    // ── Standard E2E (desktop Chrome) ──────────────────────────────────────
    {
      name: 'e2e:chrome',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] }
    },

    // ── API integration tests ──────────────────────────────────────────────
    {
      name: 'api',
      testDir: './tests/api',
      use: { ...devices['Desktop Chrome'] }
    },

    // ── Accessibility ──────────────────────────────────────────────────────
    {
      name: 'a11y',
      testDir: './tests/a11y',
      use: { ...devices['Desktop Chrome'] }
    },

    // ── Mobile viewport ────────────────────────────────────────────────────
    {
      name: 'e2e:mobile',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 7'] }
    },

    // ── BDD (Gherkin feature files via playwright-bdd) ─────────────────────
    {
      name: 'bdd',
      testDir: bddTestDir,
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
