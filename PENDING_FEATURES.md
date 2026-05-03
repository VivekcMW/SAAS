# SaaSWorld — Pending Features & Roadmap

> Last updated: 27 April 2026
> Status key: ❌ Missing | ⚠️ Partial/Stubbed | ✅ Done | 🔄 In Progress

---

## Priority Order (Worldwide-Ready MVP)

1. 💳 **Payments (Stripe)** — #50–55
2. 🔐 **Auth Completeness** — #1–3 (password reset, email verify, OAuth)
3. 🛡️ **Security Hardening** — #76, 78–80 (rate limiting, CSRF, CSP, DB)
4. 🌍 **i18n / GDPR** — #56–60
5. 📧 **Transactional Emails** — #62–69
6. 🗃️ **Connect Mock Data to Real DB** — #10, 19, 36
7. 🛠️ **Admin Operational Tools** — #43–49
8. 🧪 **Tests + CI** — #94–97

---

## 🔐 Auth & Identity

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Password reset flow — `/api/auth/forgot-password` + `/api/auth/reset-password` endpoints, token storage, email send | ✅ | Full flow: token table, email send, client wired |
| 2 | Email verification on signup — `email_verified` flag in DB, verify token, verification link email | ✅ | `register.post.ts` sends verification; `verify-email.get.ts` confirms token |
| 3 | OAuth (Google / GitHub) | ✅ | `server/api/auth/oauth/github/` + `google/` — initiate + callback handlers |
| 4 | 2FA / MFA | ❌ | |
| 5 | Account lockout after N failed logins | ✅ | Per-email lockout in `server/utils/auth.ts` — 10 failures/30 min → 15-min lockout |
| 6 | Session invalidation on password change | ❌ | |
| 7 | "Remember me" sliding expiry + revoke-all-sessions | ⚠️ | TTL fixed 14 days, no revoke |
| 8 | Avatar upload | ❌ | Only initials displayed; no `avatar` in DB |
| 9 | Role upgrade flow (buyer → vendor request/approval) | ❌ | |

---

## 🛒 Marketplace

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 10 | Favorites / Saved apps persistence | ✅ | `user_favorites` table; `GET/POST/DELETE /api/user/favorites` wired |
| 11 | Marketplace filters connected to real API | ⚠️ | `MarketplaceFilters` mock-counts client-side |
| 12 | Search suggestions from real index | ⚠️ | `MarketplaceSearchBar` uses static array |
| 13 | Pagination API (`page`/`limit` on `/api/apps`) | ⚠️ | UI exists, API lacks cursor |
| 14 | Category page dynamic SEO meta per category | ⚠️ | |
| 15 | URL-shareable compare state | ⚠️ | `/marketplace/compare` exists |
| 16 | Price alert subscription persistence | ⚠️ | `/api/alerts/subscribe` uses in-memory Map |
| 17 | Sponsored/Ads impression tracking | ⚠️ | Explicit "no-op stub" in `SponsoredSlot.vue` |
| 18 | Verified purchase badge logic | ⚠️ | DB column exists, no verification logic |

---

## 📱 App Detail Page

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 19 | Connect all data to real API (features, pricing, integrations, testimonials, reviews, gallery, certifications, security, similar apps) | ✅ | `pages/app/[id].vue` uses `useFetch` → real DB via `server/api/apps/[id].get.ts` + reviews + similar endpoints |
| 20 | AI Inline Chat | ⚠️ | "Phase 2 stub" in `AIChatInline.vue` |
| 21 | ROI Calculator (real user data) | ⚠️ | Static |
| 22 | Stack Builder persistence | ❌ | No DB storage |
| 23 | Demo booking backend | ❌ | Form exists, no API endpoint |
| 24 | Review helpful votes API | ⚠️ | DB column exists, no POST endpoint |
| 25 | Review moderation UI (admin approve/reject individual) | ❌ | DB status exists, no admin UI |
| 26 | Vendor reply to review | ❌ | |

---

## 🧑‍💼 Vendor Dashboard

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 27 | Listing CRUD (update + delete endpoints) | ✅ | `PUT /api/vendor/listings/[id]` + `DELETE /api/vendor/listings/[id]` both exist |
| 28 | Media / screenshot upload for listings | ❌ | |
| 29 | Analytics data from real DB | ✅ | `GET /api/vendor/analytics?period=` queries real `app_views` + `buyer_intent_events` tables; `VendorAnalytics.vue` wired |
| 30 | Lead capture pipeline from enquiries | ⚠️ | `VendorLeads.vue` exists, no real pipeline |
| 31 | Team management API (`/api/vendor/team`) | ❌ | UI exists, no backend |
| 32 | Promotions / deal publishing API | ❌ | UI exists, no backend |
| 33 | Content Assistant plan-based token limits | ❌ | Unlimited on all plans |
| 34 | Similar vendors (real algorithm) | ⚠️ | Static suggestions |
| 35 | Billing / subscription (Stripe) | ❌ | Shows plans, no payment |

---

## 🛍️ Buyer Dashboard

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 36 | Saved apps persistence in DB | ✅ | `GET /api/buyer/saved-apps` + metadata PATCH; `useBuyerData.ts` wired |
| 37 | Recommendations engine (user-preference model) | ⚠️ | Static |
| 38 | Enquiries thread API (`/api/enquiries`) | ✅ | `POST /api/enquiries` + `GET/POST /api/enquiries/[id]/messages` fully implemented |
| 39 | Compare state shared with marketplace compare | ❌ | Duplicate independent state |
| 40 | Deals — vendor-side publishing | ❌ | Buyer UI shows static deals |
| 41 | Weekly digest email scheduled job | ✅ | `server/tasks/digest-email.ts` scheduled every Monday 08:00 UTC; dedup via `digest_sends` table |
| 42 | Buyer billing (Stripe for premium tier) | ❌ | |

---

## 🛠️ Admin Dashboard

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 43 | Pending apps approval — notify vendor on approve/reject | ✅ | `admin/listings/[id]/status.put.ts` calls `buildListingStatusEmail` |
| 44 | User role change API | ✅ | `PUT /api/admin/users/[id]/role` + `GET /api/admin/users` list endpoint |
| 45 | Revenue data from real DB | ✅ | `AdminRevenue.vue` loads `loadLiveStats()` → `/api/admin/stats` (real MRR from plan pricing × user counts) |
| 46 | Activity log — write events across app | ⚠️ | DB table exists, logging calls missing |
| 47 | Admin badge management UI | ❌ | API exists, no UI |
| 48 | Support ticket create + reply API | ✅ | `GET/POST /api/support/tickets` + `GET /api/support/tickets/[id]` + reply endpoint all exist |
| 49 | Admin settings persist to DB | ✅ | `GET /api/admin/settings` + `PUT /api/admin/settings` with `admin_settings` KV table |

---

## 💳 Payments & Billing

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 50 | Stripe integration (checkout, subscriptions) | ✅ | `server/utils/stripe.ts` + `/api/billing/checkout`, `/api/billing/webhook`, `/api/billing/subscription`, `/api/billing/portal` |
| 51 | Subscription plan enforcement server-side | ✅ | `requirePlan()` applied across 12 premium endpoints (AI review-reply, briefing, intent signals, intelligence, win-loss, etc.) |
| 52 | Invoice generation / download (PDF) | ❌ | |
| 53 | Self-serve refund request form + API | ✅ | `POST /api/billing/refund` fully implemented with admin + user email notifications |
| 54 | Tax handling — VAT/GST (EU, AU, IN) | ❌ | |
| 55 | Multi-currency pricing display | ❌ | All USD only |

---

## 🌍 Internationalisation & Localisation

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 56 | More locales — ZH, JA, AR, HI, KO | ✅ | All 10 locales registered in `nuxt.config.ts`; `locales/*.json` files present |
| 57 | RTL support (`dir="rtl"`) for AR, HE | ✅ | `ar` has `dir: 'rtl'` in config; `RTL_LOCALES` set applied via `<html :dir>` in layout |
| 58 | Locale-aware number/date formatting | ❌ | US-formatted everywhere |
| 59 | Regional pricing / PPP for emerging markets | ❌ | |
| 60 | GDPR consent banner / CMP wired up | ✅ | `GdprConsentBanner` in default layout; `POST /api/consent` persists to `consent_log` table |
| 61 | CCPA opt-out mechanism | ❌ | `/privacy-choices` is static |

---

## 📧 Transactional Email

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 62 | Welcome email on signup | ✅ | `register.post.ts` + `login.post.ts` call `buildWelcomeEmail` |
| 63 | Password reset token email | ✅ | `forgot-password.post.ts` calls `buildPasswordResetEmail` |
| 64 | Vendor listing approved / rejected notification | ✅ | `admin/listings/[id]/status.put.ts` calls `buildListingStatusEmail` |
| 65 | New enquiry notification to vendor | ✅ | `enquiries/index.post.ts` calls `buildEnquiryNotificationEmail` |
| 66 | New lead notification to vendor | ✅ | `buyer/intent-event.post.ts` calls `buildNewLeadAlertEmail` |
| 67 | Review published notification | ✅ | `apps/[id]/reviews/index.post.ts` calls `buildReviewNotificationEmail` |
| 68 | Weekly digest email job | ✅ | `server/tasks/digest-email.ts` scheduled Nitro task |
| 69 | Deployment / SMTP env-var docs | ⚠️ | Dev logs to console |

---

## 🔍 SEO & Discovery

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 70 | Dynamic OG images called from app detail pages | ⚠️ | `/api/og.ts` exists, not wired |
| 71 | JSON-LD structured data injected on all app pages | ⚠️ | Composable exists, not applied everywhere |
| 72 | `robots.txt` blocks `/dashboard/**` | ⚠️ | Endpoint exists, rules incomplete |
| 73 | Canonical URLs for paginated category pages | ❌ | |
| 74 | `hreflang` tags for i18n routes | ✅ | `useHreflang()` called in `layouts/default.vue` injects alternate link tags for all locales |
| 75 | LLM-optimised meta injected consistently | ⚠️ | Many composables, inconsistent use |

---

## ⚡ Performance & Infrastructure

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 76 | SQLite → production-grade DB (PostgreSQL / PlanetScale) | ⚠️ | SQLite fine for single-instance only |
| 77 | File uploads / CDN (S3 or similar) | ❌ | Logos are external URLs |
| 78 | Rate limiting on auth / contact / AI endpoints | ✅ | `server/utils/rateLimit.ts` applied to login, register, forgot-password, checkout |
| 79 | CSRF protection (token on state-changing POSTs) | ✅ | Double-submit cookie pattern in `server/middleware/csrf.ts` + `plugins/csrf.client.ts` |
| 80 | Content Security Policy (CSP) headers | ✅ | Full CSP + security headers in `nuxt.config.ts` routeRules |
| 81 | Error boundary (`error.vue` global handler) | ✅ | `error.vue` in root handles all error codes with proper UI |
| 82 | Custom 404 page | ✅ | `error.vue` handles `statusCode === 404` |
| 83 | Server-side caching for marketplace / category pages | ❌ | |
| 84 | Background jobs (digest emails, session cleanup) | ✅ | `session-cleanup.ts` (hourly) + `digest-email.ts` (weekly) + `renewal-reminders.ts` all scheduled |
| 85 | `/api/health` health-check endpoint | ✅ | `server/api/health.get.ts` — checks DB, returns status/version |

---

## 📄 Content / Static Pages

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 86 | Blog CMS / real content | ❌ | Routes exist, no content |
| 87 | Careers page | ❌ | "Coming soon" |
| 88 | Guides page | ❌ | "Coming soon" |
| 89 | Changelog — dynamic from DB | ⚠️ | Static text |
| 90 | Roadmap — dynamic | ⚠️ | Static text |
| 91 | Community / forum backend | ❌ | Static |
| 92 | Events public listing page | ❌ | DB schema exists, no page |
| 93 | Partner / affiliate portal | ❌ | |

---

## 🧪 Testing & Quality

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 94 | Unit / integration test runner configured | ✅ | `"test": "vitest run"` + `"test:watch": "vitest"` added to `package.json` |
| 95 | E2E tests (Playwright / Cypress) | ⚠️ | `playwright.config.ts` + `test:e2e` script exist; test files need writing |
| 96 | CI/CD pipeline (GitHub Actions) | ✅ | `.github/workflows/ci.yml` — lint → typecheck → unit tests → build → E2E on main |
| 97 | `.env.example` + deployment docs | ✅ | `.env.example` updated with all vars: SMTP, Stripe, AI, DB |

---

## Progress Tracker

| Priority | Area | Tasks | Done | Remaining |
|----------|------|-------|------|-----------|
| 1 | Payments | #50–55 | 4 | 2 (#52 invoice PDF, #54 VAT/GST) |
| 2 | Auth completeness | #1–3 | 3 | 0 ✅ |
| 3 | Security hardening | #76, 78–80 | 3 | 1 (#76 SQLite→Postgres) |
| 4 | i18n / GDPR | #56–60 | 4 | 1 (#58 locale-aware formatting) |
| 5 | Transactional emails | #62–69 | 7 | 1 (#69 SMTP docs only) |
| 6 | Connect mock data | #10, 19, 36 | 3 | 0 ✅ |
| 7 | Admin tools | #43–49 | 5 | 2 (#46 activity log writes, #47 badge UI) |
| 8 | Tests + CI | #94–97 | 3 | 1 (#95 E2E test cases) |
