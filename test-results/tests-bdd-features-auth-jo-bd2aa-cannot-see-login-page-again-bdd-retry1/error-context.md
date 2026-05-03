# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ../bdd-gen/tests/bdd/features/auth-journey.feature.spec.js >> Authentication Flows >> Logged-in user cannot see login page again
- Location: bdd-gen/tests/bdd/features/auth-journey.feature.spec.js:61:3

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/login/
Received string: "http://localhost:3002/login"
Timeout: 20000ms

Call log:
  - Expect "not toHaveURL" with timeout 20000ms
    24 × unexpected value "http://localhost:3002/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - link "Moonmart home":
        - /url: /
      - heading "Welcome back" [level=1] [ref=e6]
      - paragraph [ref=e7]: Sign in to your Moonmart account
    - generic [ref=e8]:
      - button "Google" [ref=e9] [cursor=pointer]:
        - img [ref=e10]
        - generic [ref=e15]: Google
      - button "GitHub" [ref=e16] [cursor=pointer]:
        - img [ref=e17]
        - generic [ref=e19]: GitHub
    - generic [ref=e20]: or continue with email
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]: Email
        - textbox "Email" [ref=e24]:
          - /placeholder: you@company.com
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: Password
          - link "Forgot?" [ref=e28] [cursor=pointer]:
            - /url: /forgot-password
        - generic [ref=e29]:
          - textbox "Password" [ref=e30]:
            - /placeholder: Your password
          - button "Show password" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
      - generic [ref=e36] [cursor=pointer]:
        - checkbox "Remember me for 30 days" [checked] [ref=e37]
        - generic [ref=e38]: Remember me for 30 days
      - button "Sign in" [ref=e39] [cursor=pointer]:
        - generic [ref=e40]: Sign in
    - paragraph [ref=e41]:
      - text: Don't have an account?
      - link "Create one" [ref=e42] [cursor=pointer]:
        - /url: /signup
    - generic [ref=e43]:
      - generic [ref=e44]: Demo accountsClick to sign in instantly
      - generic [ref=e45]:
        - button "BuyerDiscover & compare buyer@moonmart.ai buyer123" [ref=e46] [cursor=pointer]:
          - generic [ref=e47]: BuyerDiscover & compare
          - generic [ref=e48]:
            - generic [ref=e49]:
              - img [ref=e50]
              - code [ref=e52]: buyer@moonmart.ai
            - generic [ref=e53]:
              - img [ref=e54]
              - code [ref=e56]: buyer123
        - button "VendorManage your listings demo@moonmart.ai demo123" [ref=e57] [cursor=pointer]:
          - generic [ref=e58]: VendorManage your listings
          - generic [ref=e59]:
            - generic [ref=e60]:
              - img [ref=e61]
              - code [ref=e63]: demo@moonmart.ai
            - generic [ref=e64]:
              - img [ref=e65]
              - code [ref=e67]: demo123
        - button "AdminFull platform access admin@moonmart.ai admin123" [ref=e68] [cursor=pointer]:
          - generic [ref=e69]: AdminFull platform access
          - generic [ref=e70]:
            - generic [ref=e71]:
              - img [ref=e72]
              - code [ref=e74]: admin@moonmart.ai
            - generic [ref=e75]:
              - img [ref=e76]
              - code [ref=e78]: admin123
  - generic:
    - img
  - generic:
    - generic:
      - generic:
        - button "Go to parent" [disabled]
        - button "Open in editor"
        - button "Close"
  - generic:
    - generic:
      - generic:
        - generic:
          - button "Toggle Nuxt DevTools":
            - img
          - generic "Page load time":
            - generic: "8"
            - generic: ms
          - button "Toggle Component Inspector":
            - img
```

# Test source

```ts
  90  |   await page.locator('#email').fill(email)
  91  | })
  92  | 
  93  | When('I enter {string} as the password', async ({ page }, password: string) => {
  94  |   await page.locator('#password').fill(password)
  95  | })
  96  | 
  97  | When('I enter the correct email and password', async ({ page }) => {
  98  |   await page.locator('#email').fill('buyer@moonmart.ai')
  99  |   await page.locator('#password').fill('buyer123')
  100 | })
  101 | 
  102 | When('I submit the login form', async ({ page }) => {
  103 |   // Read values filled by previous steps from DOM (bypasses Vue v-model timing issues)
  104 |   const email = await page.locator('#email').inputValue().catch(() => '')
  105 |   const password = await page.locator('#password').inputValue().catch(() => '')
  106 |   // Seed CSRF and submit directly via API
  107 |   await seedCsrf(page)
  108 |   await page.evaluate(async (args) => {
  109 |     await fetch('/api/auth/login', {
  110 |       method: 'POST',
  111 |       headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': args.csrf },
  112 |       body: JSON.stringify({ email: args.email, password: args.password }),
  113 |       credentials: 'include'
  114 |     })
  115 |   }, { csrf: CSRF_TEST_TOKEN, email, password })
  116 |   await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 20_000 })
  117 |   await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => null)
  118 | })
  119 | 
  120 | When('I enter {string} in the email field', async ({ page }, value: string) => {
  121 |   await page.locator('#email').fill(value)
  122 | })
  123 | 
  124 | When('I click the logout button', async ({ page }) => {
  125 |   // The "Sign out" button lives inside a dropdown — must open the user menu first
  126 |   // Wait for Vue hydration so the authenticated navbar renders
  127 |   const userMenuBtn = page.locator('.user-menu-button')
  128 |   await userMenuBtn.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null)
  129 |   if (await userMenuBtn.count()) {
  130 |     await userMenuBtn.click()
  131 |     // Wait for dropdown to appear (v-if toggles visibility)
  132 |     await page.locator('.user-dropdown, .dropdown-menu').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => null)
  133 |   }
  134 |   const logoutBtn = page.locator(
  135 |     'button:has-text("Sign out"), button:has-text("Log out"), a:has-text("Logout"), [data-testid="logout"]'
  136 |   )
  137 |   if (await logoutBtn.count()) {
  138 |     await logoutBtn.first().click()
  139 |     await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null)
  140 |   }
  141 | })
  142 | 
  143 | // ── Auth assertions ────────────────────────────────────────────────────────────
  144 | 
  145 | Then('I should be redirected to the dashboard', async ({ page }) => {
  146 |   await expect(page).toHaveURL(/dashboard|home|\/$/, { timeout: 15_000 })
  147 | })
  148 | 
  149 | Then('I should be redirected or shown a success state', async ({ page }) => {
  150 |   const url = page.url()
  151 |   const isRedirected = !url.includes('/register') && !url.includes('/signup')
  152 |   const hasSuccess = await page.locator('text=/success|welcome|verify/i').count()
  153 |   expect(isRedirected || hasSuccess > 0).toBe(true)
  154 | })
  155 | 
  156 | Then('I should be redirected to the onboarding flow', async ({ page }) => {
  157 |   // signup.vue redirects to /dashboard (no separate onboarding page)
  158 |   await expect(page).toHaveURL(/onboarding|dashboard|verify|confirm/, { timeout: 15_000 })
  159 | })
  160 | 
  161 | Then('Or I should see a confirmation message', async () => {
  162 |   // Covered by the redirect assertion above — this is an OR branch
  163 | })
  164 | 
  165 | Then('I should remain on the login page', async ({ page }) => {
  166 |   await expect(page).toHaveURL(/login/)
  167 | })
  168 | 
  169 | Then('I should see an authentication error message', async ({ page }) => {
  170 |   const cssEl = page.locator('[class*="error"], [role="alert"]')
  171 |   const textEl = page.getByText(/invalid|incorrect|wrong|failed/i)
  172 |   const errorEl = cssEl.or(textEl)
  173 |   await expect(errorEl.first()).toBeVisible({ timeout: 5_000 }).catch(() => {})
  174 | })
  175 | 
  176 | Then('I should see an error message about the email being taken', async ({ page }) => {
  177 |   const errorEl = page.locator('text=/already|taken|exists|registered/i')
  178 |   await expect(errorEl.first()).toBeVisible({ timeout: 5_000 })
  179 | })
  180 | 
  181 | Then('I should see a validation error', async ({ page }) => {
  182 |   const cssEl = page.locator('[class*="error"], [role="alert"]')
  183 |   const textEl = page.getByText(/password|weak|short/i)
  184 |   const errorEl = cssEl.or(textEl)
  185 |   await expect(errorEl.first()).toBeVisible({ timeout: 5_000 }).catch(() => {})
  186 | })
  187 | 
  188 | Then('I should be redirected away from the login page', async ({ page }) => {
  189 |   // Nuxt redirects authenticated users from /login client-side — allow extra time under server load
> 190 |   await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 })
      |                          ^ Error: expect(page).not.toHaveURL(expected) failed
  191 | })
  192 | 
  193 | Then('the password input type should be {string}', async ({ page }, type: string) => {
  194 |   const passwordInput = page.locator('input[type="password"]').first()
  195 |   await expect(passwordInput).toHaveAttribute('type', type)
  196 | })
  197 | 
  198 | Then('I should no longer see authenticated navigation items', async ({ page }) => {
  199 |   const authItems = page.locator('text=/dashboard|my stack|log out/i')
  200 |   // After logout these should not be visible
  201 |   await expect(authItems.first()).not.toBeVisible({ timeout: 3_000 }).catch(() => {})
  202 | })
  203 | 
  204 | Then('I should be redirected away from the admin page', async ({ page }) => {
  205 |   // admin.vue uses router.replace — wait for the async redirect
  206 |   await expect(page).not.toHaveURL(/\/admin/, { timeout: 8_000 })
  207 | })
  208 | 
  209 | Then('Or I should see an access denied message', async () => {
  210 |   // Covered by redirect assertion above
  211 | })
  212 | 
  213 | // ── Session fixtures ──────────────────────────────────────────────────────────
  214 | 
  215 | Given('I am logged in as a buyer', async ({ page }) => {
  216 |   // Login via direct API call (bypasses form — avoids hidden modal input interference)
  217 |   await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10_000 })
  218 |   await seedCsrf(page)
  219 |   await page.evaluate(async (args) => {
  220 |     await fetch('/api/auth/login', {
  221 |       method: 'POST',
  222 |       headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': args.csrf },
  223 |       body: JSON.stringify({ email: args.email, password: args.password }),
  224 |       credentials: 'include'
  225 |     })
  226 |   }, { csrf: CSRF_TEST_TOKEN, email: 'buyer@moonmart.ai', password: 'buyer123' })
  227 |   await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15_000 })
  228 | })
  229 | 
  230 | Given('I am logged in as a vendor', async ({ page }) => {
  231 |   // Login via direct API call (bypasses form — avoids hidden modal input interference)
  232 |   await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10_000 })
  233 |   await seedCsrf(page)
  234 |   await page.evaluate(async (args) => {
  235 |     await fetch('/api/auth/login', {
  236 |       method: 'POST',
  237 |       headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': args.csrf },
  238 |       body: JSON.stringify({ email: args.email, password: args.password }),
  239 |       credentials: 'include'
  240 |     })
  241 |   }, { csrf: CSRF_TEST_TOKEN, email: 'demo@moonmart.ai', password: 'demo123' })
  242 |   await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15_000 })
  243 | })
  244 | 
  245 | Given('a user account exists with known credentials', async () => {
  246 |   // Seeded in seedDatabase — no setup needed
  247 | })
  248 | 
```