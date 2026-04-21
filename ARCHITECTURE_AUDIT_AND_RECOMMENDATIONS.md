# SaaSWorld — Architecture Audit & Recommendations

> **Audit date:** 22 April 2026
> **Scope:** Architecture, pages, components, typography, color theme, layout, search, ads, integrations, AI-first UX
> **Status:** Proposal document — review before implementation

---

## 1. Executive Summary

SaaSWorld has a solid Nuxt 3 foundation with broad feature coverage, but the codebase shows signs of rapid iteration: duplicate files (`.backup`, `.new`, `.fixed`), overlapping CSS variable definitions across three files, two parallel top-nav components (`Header.vue` + `Navbar.vue`), and 40+ composables where many are single-purpose SEO wrappers that could be consolidated.

The platform is **feature-broad but depth-shallow** in three critical areas for an AI-era SaaS marketplace:

1. **Search is keyword-based, not AI-native**
2. **Ads are static banners, not contextual/personalized**
3. **Integrations page is a showcase, not a connected app graph**

This document proposes a consolidated architecture, a refined design system, and an AI-first user experience.

---

## 2. Current Architecture Audit

### 2.1 Tech Stack (Confirmed)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Nuxt 3.17.5 + Vue 3 | Current |
| Language | TypeScript | Good |
| Styling | Custom CSS + SCSS + `@nuxt/ui` | **Three overlapping systems** |
| Content | `@nuxt/content` | Markdown-driven blog/docs |
| i18n | `@nuxtjs/i18n` | 5 locales (en, es, fr, de, pt) |
| Icons | `@nuxt/icon` (heroicons, mdi, simple-icons, logos) | Good |
| DB | `better-sqlite3` | File-based, local `.data/saasworld.db` |
| Fonts | Google Fonts — Poppins 300–800 | Single family |

### 2.2 Issues Found

#### Duplicate / Dead Files
- `components/Navbar.vue.backup`, `Navbar.vue.fixed`
- `pages/index_backup.vue`, `pages/index_simple.vue`
- `pages/contact.vue.backup`, `contact.vue.new`
- `server/api/apps/[id].get.ts.backup`, `[id].get.ts.new`
- Test pages in production routes: `auth-test.vue`, `css-test.vue`, `banner-demo.vue`, `debug-blog.vue`, `debug-thumbnails.vue`, `test-card.vue`, `thumbnail-test.vue`

**Risk:** These routes are publicly indexable. Debug/test pages should be behind a dev-only guard or deleted.

#### Conflicting Design Tokens
Three CSS files each redefine `:root` variables with **different values**:

| Token | `main.css` | `global.css` | Conflict |
|---|---|---|---|
| `--color-info` | `#FF8838` (orange) | `#3B82F6` (blue) | Yes |
| Gray-100 | `#F3F4F6` | `#F7FAFC` | Yes |
| Gray-500 | `#6B7280` | `#A0AEC0` | Yes |

**Risk:** Visual inconsistency depending on load order.

#### Two Top-Navigation Components
- `Header.vue` — uses different nav items (Home, Features, Solutions, About, Contact)
- `Navbar.vue` — the actually-rendered one (from `layouts/default.vue`)

`Header.vue` appears dead but still maintained.

#### 40+ SEO Composables
Per-LLM files: `usePerplexityOptimization`, `useChatGPTOptimization`, `useClaudeOptimization`, `useGeminiOptimization`, `useCopilotOptimization`, `useSearchGPTOptimization`, `useYouOptimization`, `usePhindOptimization`, `useKagiOptimization`, `useMetaAIOptimization`, `useCharacterAIOptimization`, `usePoeOptimization`, `useHuggingFaceOptimization`.

**Risk:** 13 composables do ~95% identical work. Should consolidate into one `useLLMOptimization(profile)` with per-engine config.

### 2.3 Architecture Map (Current)

```
┌─────────────────────────────────────────────────┐
│  layouts/default.vue                            │
│  ├── GlobalMarketBanner (currency/region)       │
│  ├── Navbar (+ Categories drawer)               │
│  ├── <slot /> → pages/*                         │
│  ├── Footer                                     │
│  ├── GlobalSearch (Cmd+K, teleport)             │
│  └── GlobalAuthModal                            │
│                                                 │
│  pages/*  ───►  server/api/*  ───►  SQLite      │
│                    (Nitro)       better-sqlite3  │
└─────────────────────────────────────────────────┘
```

---

## 3. Recommended Architecture (Target)

```
┌─────────────────────────────────────────────────────────┐
│  layouts/default.vue                                    │
│  ├── TopBanner (global announcements / region)          │
│  ├── Navbar  (single source of truth)                   │
│  ├── <slot />                                           │
│  ├── Footer                                             │
│  ├── AiSearch         ◄─── NEW (replaces GlobalSearch)  │
│  ├── AuthModal                                          │
│  └── AiAssistantFab   ◄─── NEW (floating chat agent)    │
│                                                         │
│  pages/*  ──►  server/api/*  ──►  SQLite                │
│                   │                                     │
│                   ├─ /api/ai/search   (semantic)        │
│                   ├─ /api/ai/recommend                  │
│                   ├─ /api/ai/compare                    │
│                   └─ /api/ads/contextual ◄── NEW        │
└─────────────────────────────────────────────────────────┘
```

### 3.1 File/Folder Cleanup Plan

| Action | Target |
|---|---|
| Delete | All `*.backup`, `*.new`, `*.fixed` files |
| Delete | `components/Header.vue` (unused duplicate) |
| Delete / gate | Test pages: `auth-test`, `css-test`, `banner-demo`, `debug-*`, `test-card`, `thumbnail-test` |
| Consolidate | 13 per-LLM composables → `useLLMOptimization.ts` with engine profiles |
| Consolidate | `main.css` + `global.css` → single `tokens.css` |
| Rename | `Navbar.vue` → `SiteNavbar.vue` (clarity) |

---

## 4. Design System Refresh

### 4.1 Current Palette (Issue)

Primary is `#FF8838` (warm orange). This is unusual for B2B SaaS marketplaces where trust/enterprise tones dominate (G2 red, Capterra blue, Gartner green). Orange reads as consumer/retail and may undercut enterprise credibility.

### 4.2 Proposed Palette

**Option A — Keep orange identity, tune for enterprise:**

```css
:root {
  /* Brand */
  --sw-primary: #FF6B1A;          /* Tuned orange — more saturated */
  --sw-primary-hover: #E55A10;
  --sw-primary-soft: #FFF1E6;

  /* Intelligence accent (AI features) */
  --sw-ai: #6366F1;               /* Indigo — AI/assistant surfaces */
  --sw-ai-soft: #EEF0FF;

  /* Trust / CTA secondary */
  --sw-accent: #0EA5A4;           /* Teal — calm, enterprise */

  /* Surface */
  --sw-bg: #FFFFFF;
  --sw-bg-muted: #FAFAF9;
  --sw-bg-subtle: #F5F5F4;
  --sw-border: #E7E5E4;

  /* Text */
  --sw-text: #1C1917;             /* Near-black warm */
  --sw-text-muted: #57534E;
  --sw-text-subtle: #78716C;

  /* State */
  --sw-success: #10B981;
  --sw-warning: #F59E0B;
  --sw-danger:  #EF4444;
  --sw-info:    #3B82F6;
}
```

**Rationale:**
- One primary (not two).
- Dedicated `--sw-ai` indigo to visually mark all AI surfaces (search, recommend, chat). Critical in AI-era product.
- Warm-neutral grays (stone) pair better with orange than cool grays (slate).

### 4.3 Typography Scale

Current: 9 font-size tokens, often used inconsistently.

**Proposed modular scale (1.25 ratio):**

| Token | Size | Line-height | Use |
|---|---|---|---|
| `--fs-xs` | 12px | 1.5 | labels, meta |
| `--fs-sm` | 14px | 1.5 | body small, UI |
| `--fs-md` | 16px | 1.6 | body default |
| `--fs-lg` | 18px | 1.5 | lead text |
| `--fs-xl` | 22px | 1.3 | h4 / card title |
| `--fs-2xl` | 28px | 1.25 | h3 / section |
| `--fs-3xl` | 36px | 1.2 | h2 |
| `--fs-4xl` | clamp(40px,5vw,56px) | 1.1 | h1 / hero |

**Weights:** 400 body, 500 UI, 600 headings, 700 hero only. Drop 300 and 800 (unused, bloats font payload).

### 4.4 Spacing / Radius

Standardize on 4px grid: `4, 8, 12, 16, 20, 24, 32, 48, 64, 96`.
Radius: `6px` (inputs/buttons), `10px` (cards), `16px` (modals), `999px` (pills). Drop `--border-radius-sm` (0.25rem) — too small to register.

### 4.5 Elevation

Current: 3 shadows, all grayscale.

Proposed:
```css
--shadow-xs: 0 1px 2px rgba(28,25,23,.04);
--shadow-sm: 0 2px 4px rgba(28,25,23,.06), 0 1px 2px rgba(28,25,23,.04);
--shadow-md: 0 8px 16px rgba(28,25,23,.08), 0 2px 4px rgba(28,25,23,.04);
--shadow-lg: 0 20px 40px rgba(28,25,23,.12);
--shadow-ai: 0 8px 24px rgba(99,102,241,.18); /* for AI surfaces */
```

### 4.6 Dark Mode

Currently not implemented. Recommended:
- Add `data-theme="dark"` on `<html>` with full token mirror.
- Auto-detect `prefers-color-scheme`, user-toggleable via icon in navbar.
- Storage in cookie (SSR-safe), read via `useColorMode()`.

---

## 5. Layout Recommendations

### 5.1 Landing Page (`pages/index.vue`)

**Current hero:**
- Dual search (main hero search + Global search teleport) = confusing.
- Stats inside hero feel generic ("10,000+ Happy Customers").

**Proposed hero:**
```
┌──────────────────────────────────────────────────────┐
│  ⚡ AI-powered SaaS discovery                       │
│                                                      │
│  Find the right software in seconds,                │
│  not weeks.                                          │
│                                                      │
│  [🔍 Ask anything: "CRM for 20-person team under…"] │
│                                                      │
│  Try:  [CRM]  [Project Mgmt]  [AI Tools]  [HR]      │
│                                                      │
│  ✓ 10,000+ tools   ✓ Unbiased reviews   ✓ Free       │
└──────────────────────────────────────────────────────┘
```

Single AI-first search box (not two). Example queries as tappable chips prove the interaction model instantly.

### 5.2 Marketplace Grid

- Keep card density at **3 columns desktop / 2 tablet / 1 mobile**.
- Add persistent left **filter rail** (collapsible) to avoid the current "filters above grid" layout that pushes content down on mobile.
- Sort bar sticky at top of grid.

### 5.3 App Detail Page

Proposed layout (two-column):
```
┌─────────────────────────────────┬──────────────────┐
│ Hero: logo, name, rating, CTA   │  Sticky aside:   │
│ Tabs: Overview | Features |     │  - Pricing       │
│       Pricing | Integrations |  │  - Get a demo    │
│       Reviews | Alternatives    │  - Compare       │
│                                 │  - Similar tools │
│ Content                         │  - Ad slot       │
└─────────────────────────────────┴──────────────────┘
```

### 5.4 Dashboard

Already well-structured (`DashboardSubnav` pattern). Recommend:
- Add `AiAssistantPanel` drawer (right side) for in-context help.
- Budget page should pull actual vendor pricing from DB, not mock.

---

## 6. AI-First Search (Core Feature)

### 6.1 Current State

`GlobalSearch.vue` + `useGlobalSearch.ts`: client-side string matching over hardcoded categories. No semantic understanding, no ranking, no personalization.

### 6.2 Proposed AI Search

**UX:**
- Single input, natural language, Cmd/Ctrl+K.
- Input hints rotate: *"CRM for 20-person team under $50/seat"*, *"Slack alternatives with e2e encryption"*, *"Tools that integrate with HubSpot and QuickBooks"*.
- Results in three grouped sections:
  1. **AI Answer** (summarized recommendation with 3 picks and "why")
  2. **Matching tools** (ranked cards)
  3. **Explore categories** (fallback)
- Follow-up chip: *"Refine: cheaper • simpler • more integrations"*.

**Architecture:**

```
User query
  │
  ▼
/api/ai/search
  │
  ├─► Intent classifier (LLM) → { category, budget, constraints, integrations }
  │
  ├─► Vector search (app embeddings)        ─┐
  ├─► SQL filter (price, category, rating)   │──► Rerank (LLM or cross-encoder)
  ├─► Integration graph lookup              ─┘
  │
  └─► Generate grounded answer with citations to tool IDs
```

**Implementation stack (recommended):**

| Concern | Choice | Rationale |
|---|---|---|
| Embeddings | OpenAI `text-embedding-3-small` OR local `bge-small-en-v1.5` | Cheap; ~$0.02 per 1M tokens |
| Vector store | `sqlite-vec` extension on existing SQLite | No new infra |
| LLM | Claude Haiku / GPT-4o-mini for intent + answer | Sub-second latency |
| Rerank | Cohere Rerank or LLM pass-2 | Better precision |
| Caching | Nitro KV / Redis; key = normalized query | 70%+ hit rate expected |

**New files:**
```
server/api/ai/search.post.ts
server/api/ai/recommend.post.ts
server/api/ai/compare.post.ts
server/utils/embeddings.ts
server/utils/llm-client.ts
composables/useAiSearch.ts
components/ai/AiSearch.vue
components/ai/AiAnswerCard.vue
components/ai/AiAssistantFab.vue
```

### 6.3 Graceful Degradation

If LLM API is down or user is rate-limited:
- Fall back to current keyword search.
- Show a subtle "Basic search mode" chip.
- Never break the flow.

---

## 7. Ads System

### 7.1 Current State

`MarketplaceAdBanner.vue` — static banner, hardcoded slots (top/middle/sidebar). No targeting, no rotation, no reporting.

### 7.2 Proposed Ads System

**Ad types:**
1. **Sponsored listing** — promoted cards within marketplace grid (clearly labeled "Sponsored").
2. **Category sponsor** — 1 vendor per category header.
3. **Comparison ad** — on `alternatives-to-X` pages.
4. **AI answer sponsor** — sponsored recommendation slot in AI search result (labeled, 1 max, never deceptive).
5. **Newsletter/inline** — blog and guides.

**Targeting signals (privacy-respecting):**
- Page category
- Search query intent (not stored long-term)
- Current filters (price range, team size)
- Vendor's opt-in campaign targeting (no user-level tracking required to start)

**Data model (new tables):**
```sql
CREATE TABLE ad_campaigns (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  type TEXT NOT NULL,           -- sponsored_listing|category|comparison|ai_answer|newsletter
  budget_cents INTEGER NOT NULL,
  bid_cents INTEGER NOT NULL,   -- CPC
  targeting_json TEXT,          -- {categories, keywords, regions}
  status TEXT NOT NULL,         -- draft|active|paused|exhausted
  starts_at TEXT, ends_at TEXT
);

CREATE TABLE ad_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  event_type TEXT NOT NULL,     -- impression|click|conversion
  placement TEXT,
  query_hash TEXT,              -- hashed, not raw
  user_session TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**New endpoints:**
```
GET  /api/ads/contextual?placement=marketplace_grid&category=crm
POST /api/ads/impression
POST /api/ads/click
```

**Frontend components:**
```
components/ads/AdSlot.vue           <!-- generic slot, fetches contextual ad -->
components/ads/SponsoredCard.vue    <!-- marketplace grid card variant -->
components/ads/CategorySponsor.vue
components/ads/AiAnswerSponsor.vue
```

**Principles (non-negotiable):**
- All ads visibly labeled "Sponsored" with icon + tooltip.
- Max 1 sponsored card per 6 organic cards.
- AI search never shows more than 1 sponsor, always after organic picks, and the sponsor cannot misrepresent facts (LLM must cite real data).
- Vendors cannot pay to remove negative reviews — this is the G2 credibility trap; avoid it from day one.

---

## 8. Integrations

### 8.1 Current State

`pages/integrations.vue` — static list of logos with filter chips. `IntegrationCard` shows a modal with marketing copy. **No actual OAuth/webhook infrastructure is wired up.**

### 8.2 Proposed Integrations Strategy

Split into **two distinct surfaces**:

#### A. Public Integration Directory (marketing)
- `/integrations` — SEO-optimized list of *what tools in the marketplace integrate with what*.
- Each integration page: `/integrations/[slug]` — "Tools that integrate with Slack", with SEO metadata.
- Builds integration graph: `(app_a)-[:INTEGRATES_WITH]->(app_b)`.

#### B. User Integration Hub (product)
- `/dashboard/integrations` — user's connected accounts (OAuth).
- Minimum launch integrations:
  - **Slack** — alerts when new tools in watched category
  - **Google Workspace / Microsoft 365** — SSO
  - **HubSpot / Salesforce** — sync tool evaluations
  - **Zapier / Make** — catch-all
  - **Stripe** — billing
- OAuth handled via server-side token storage (encrypted `integration_connections` table).

**New data model:**
```sql
CREATE TABLE app_integrations (
  source_app_id TEXT NOT NULL,
  target_app_id TEXT NOT NULL,
  integration_type TEXT,       -- native|zapier|api|webhook
  verified BOOLEAN DEFAULT 0,
  PRIMARY KEY (source_app_id, target_app_id)
);

CREATE TABLE user_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,      -- slack|google|hubspot|...
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  scopes TEXT,
  expires_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 8.3 AI-Powered Integration Discovery
New feature: *"Upload your current SaaS stack and we'll find gaps and consolidation opportunities."*
- User connects billing provider (Stripe, Ramp, Brex) OR uploads CSV of invoices.
- AI reads tool list → matches to marketplace → identifies:
  - Redundant tools (e.g., 3 project managers)
  - Missing categories (e.g., no analytics tool)
  - Cheaper alternatives in each category
- Output: personalized report with one-click actions.

This is the **killer feature** that differentiates SaaSWorld from G2/Capterra.

---

## 9. Prioritized Implementation Roadmap

### Phase 0 — Cleanup (low risk, high clarity win)
- [ ] Delete all `.backup`, `.new`, `.fixed` files
- [ ] Delete unused `Header.vue`
- [ ] Gate test/debug pages behind `dev`-only middleware
- [ ] Merge `main.css` + `global.css` → `assets/css/tokens.css`
- [ ] Consolidate 13 per-LLM composables → 1

### Phase 1 — Design System
- [ ] Apply new token file (palette, typography, spacing, radius, shadow)
- [ ] Add `--sw-ai` indigo theming for AI surfaces
- [ ] Dark mode toggle + token mirror
- [ ] Refine Poppins weights (drop 300, 800)

### Phase 2 — AI-First Search
- [ ] Add `sqlite-vec` + embedding pipeline
- [ ] Build `/api/ai/search` with intent → retrieve → rerank → answer
- [ ] Replace `GlobalSearch.vue` with new `AiSearch.vue`
- [ ] Rework landing hero to AI search as primary CTA
- [ ] Add `AiAssistantFab` (floating chat) on all pages

### Phase 3 — Ads Platform
- [ ] Schema + admin CRUD for campaigns
- [ ] `AdSlot.vue` generic component with placement contract
- [ ] Impression/click tracking
- [ ] Sponsored card variant in marketplace grid
- [ ] AI answer sponsor slot (with guardrails)

### Phase 4 — Integrations
- [ ] Integration graph data model
- [ ] `/integrations/[slug]` SEO pages
- [ ] OAuth for Slack + Google (SSO first)
- [ ] Dashboard integration hub
- [ ] AI stack audit feature (upload/connect billing → gap analysis)

### Phase 5 — Trust & Moat
- [ ] Review verification (LinkedIn, work email)
- [ ] Vendor cannot remove reviews; structured response allowed
- [ ] Public changelog for platform integrity ("why we showed this ad")

---

## 10. Risks & Considerations

| Risk | Mitigation |
|---|---|
| LLM latency hurts search UX | Stream responses; cache aggressively; always-available fallback |
| LLM cost at scale | Use Haiku/mini models for intent; only escalate for answers |
| Ad credibility erosion | Hard labels; separate organic ranking; never pay-to-remove reviews |
| Cold start on ads | Seed with free promotion trials for top 50 vendors |
| GDPR / privacy | Hash queries; user-level tracking opt-in only; EU data residency option |
| Design refresh regressions | Ship behind `v2` flag via `useColorMode` alternative, progressive rollout |

---

## 11. Open Questions Before Implementation

1. **Brand direction** — keep orange or pivot to blue/teal for enterprise credibility?
2. **LLM provider** — OpenAI, Anthropic, or both with fallback? Budget ceiling?
3. **Ads model** — CPC auction or flat-fee placements for launch?
4. **Integration depth for V1** — SSO-only (fast) or full OAuth hub (slower, more valuable)?
5. **Dark mode priority** — launch essential or phase-2?
6. **Monorepo / workspace structure** — current flat Nuxt is fine, but an `apps/web` + `packages/ui` split may pay off if you add mobile or partner portals later.

---

## 12. Next Steps

Please confirm:

- [ ] Approve cleanup (Phase 0) — safe to implement immediately
- [ ] Approve design token refresh (Phase 1) — which color direction?
- [ ] Approve AI search architecture (Phase 2) — which LLM provider?
- [ ] Approve ads scope (Phase 3) — launch placements?
- [ ] Approve integrations scope (Phase 4) — V1 providers?

Once approved, implementation can proceed phase by phase, each shippable independently.
