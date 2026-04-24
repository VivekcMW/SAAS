# SaaSWorld — Pending Features & Roadmap

> Last updated: 25 April 2026
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
| 1 | Password reset flow — `/api/auth/forgot-password` + `/api/auth/reset-password` endpoints, token storage, email send | ❌ | `forgot-password.vue` uses `setTimeout` stub |
| 2 | Email verification on signup — `email_verified` flag in DB, verify token, verification link email | ❌ | Users created without email confirmation |
| 3 | OAuth (Google / GitHub) | ❌ | Buttons show "coming soon" toast |
| 4 | 2FA / MFA | ❌ | |
| 5 | Account lockout after N failed logins | ❌ | Brute-force protection |
| 6 | Session invalidation on password change | ❌ | |
| 7 | "Remember me" sliding expiry + revoke-all-sessions | ⚠️ | TTL fixed 14 days, no revoke |
| 8 | Avatar upload | ❌ | Only initials displayed; no `avatar` in DB |
| 9 | Role upgrade flow (buyer → vendor request/approval) | ❌ | |

---

## 🛒 Marketplace

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 10 | Favorites / Saved apps persistence | ❌ | `isFavorited` is in-memory only |
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
| 19 | Connect all data to real API (features, pricing, integrations, testimonials, reviews, gallery, certifications, security, similar apps) | ❌ | All are hardcoded `// Mock` blocks in `pages/app/[id].vue` |
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
| 27 | Listing CRUD (update + delete endpoints) | ⚠️ | Create exists; update/delete missing |
| 28 | Media / screenshot upload for listings | ❌ | |
| 29 | Analytics data from real DB | ❌ | `VendorAnalytics.vue` hardcoded |
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
| 36 | Saved apps persistence in DB | ❌ | `BuyerSavedApps.vue` not wired |
| 37 | Recommendations engine (user-preference model) | ⚠️ | Static |
| 38 | Enquiries thread API (`/api/enquiries`) | ❌ | UI exists, no backend |
| 39 | Compare state shared with marketplace compare | ❌ | Duplicate independent state |
| 40 | Deals — vendor-side publishing | ❌ | Buyer UI shows static deals |
| 41 | Weekly digest email scheduled job | ❌ | Preview UI only |
| 42 | Buyer billing (Stripe for premium tier) | ❌ | |

---

## 🛠️ Admin Dashboard

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 43 | Pending apps approval — notify vendor on approve/reject | ⚠️ | Button exists, no notification |
| 44 | User role change API | ❌ | Table UI exists, no endpoint |
| 45 | Revenue data from real DB | ❌ | Static charts |
| 46 | Activity log — write events across app | ⚠️ | DB table exists, logging calls missing |
| 47 | Admin badge management UI | ❌ | API exists, no UI |
| 48 | Support ticket create + reply API | ❌ | UI exists, no backend |
| 49 | Admin settings persist to DB | ❌ | Form exists, no `/api/admin/settings` |

---

## 💳 Payments & Billing

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 50 | Stripe integration (checkout, subscriptions) | ❌ | Zero Stripe code |
| 51 | Subscription plan enforcement server-side | ❌ | Limits not checked |
| 52 | Invoice generation / download (PDF) | ❌ | |
| 53 | Self-serve refund request form + API | ❌ | `/refund` page is static |
| 54 | Tax handling — VAT/GST (EU, AU, IN) | ❌ | |
| 55 | Multi-currency pricing display | ❌ | All USD only |

---

## 🌍 Internationalisation & Localisation

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 56 | More locales — ZH, JA, AR, HI, KO | ❌ | Only EN/DE/ES/FR/PT |
| 57 | RTL support (`dir="rtl"`) for AR, HE | ❌ | |
| 58 | Locale-aware number/date formatting | ❌ | US-formatted everywhere |
| 59 | Regional pricing / PPP for emerging markets | ❌ | |
| 60 | GDPR consent banner / CMP wired up | ❌ | `/cookies` page is static |
| 61 | CCPA opt-out mechanism | ❌ | `/privacy-choices` is static |

---

## 📧 Transactional Email

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 62 | Welcome email on signup | ❌ | `sendEmail` infra exists, not called |
| 63 | Password reset token email | ❌ | No endpoint |
| 64 | Vendor listing approved / rejected notification | ❌ | |
| 65 | New enquiry notification to vendor | ❌ | |
| 66 | New lead notification to vendor | ❌ | |
| 67 | Review published notification | ❌ | |
| 68 | Weekly digest email job | ❌ | |
| 69 | Deployment / SMTP env-var docs | ⚠️ | Dev logs to console |

---

## 🔍 SEO & Discovery

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 70 | Dynamic OG images called from app detail pages | ⚠️ | `/api/og.ts` exists, not wired |
| 71 | JSON-LD structured data injected on all app pages | ⚠️ | Composable exists, not applied everywhere |
| 72 | `robots.txt` blocks `/dashboard/**` | ⚠️ | Endpoint exists, rules incomplete |
| 73 | Canonical URLs for paginated category pages | ❌ | |
| 74 | `hreflang` tags for i18n routes | ❌ | i18n configured, tags not injected |
| 75 | LLM-optimised meta injected consistently | ⚠️ | Many composables, inconsistent use |

---

## ⚡ Performance & Infrastructure

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 76 | SQLite → production-grade DB (PostgreSQL / PlanetScale) | ⚠️ | SQLite fine for single-instance only |
| 77 | File uploads / CDN (S3 or similar) | ❌ | Logos are external URLs |
| 78 | Rate limiting on auth / contact / AI endpoints | ❌ | No throttling |
| 79 | CSRF protection (token on state-changing POSTs) | ❌ | Cookie sessions, no CSRF token |
| 80 | Content Security Policy (CSP) headers | ❌ | `routeRules` only has embed iframe exception |
| 81 | Error boundary (`error.vue` global handler) | ❌ | |
| 82 | Custom 404 page | ❌ | |
| 83 | Server-side caching for marketplace / category pages | ❌ | |
| 84 | Background jobs (digest emails, session cleanup) | ❌ | |
| 85 | `/api/health` health-check endpoint | ❌ | |

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
| 94 | Unit / integration test runner configured | ⚠️ | Test files exist, no `test` script in `package.json` |
| 95 | E2E tests (Playwright / Cypress) | ❌ | |
| 96 | CI/CD pipeline (GitHub Actions) | ❌ | |
| 97 | `.env.example` + deployment docs | ❌ | |

---

## Progress Tracker

| Priority | Area | Tasks | Done | Remaining |
|----------|------|-------|------|-----------|
| 1 | Payments | #50–55 | 0 | 6 |
| 2 | Auth completeness | #1–3 | 0 | 3 |
| 3 | Security hardening | #76, 78–80 | 0 | 4 |
| 4 | i18n / GDPR | #56–60 | 0 | 5 |
| 5 | Transactional emails | #62–69 | 0 | 8 |
| 6 | Connect mock data | #10, 19, 36 | 0 | 3 |
| 7 | Admin tools | #43–49 | 0 | 7 |
| 8 | Tests + CI | #94–97 | 0 | 4 |
