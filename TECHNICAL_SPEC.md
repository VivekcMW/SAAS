# Moonmart — Complete Technical Specification

> Version: 1.0 | Date: April 27, 2026
> Classification: Internal Engineering & Product Document

---

## Table of Contents

1. [Vision & Market Context](#1-vision--market-context)
2. [System Architecture](#2-system-architecture)
3. [User Roles & Actors](#3-user-roles--actors)
4. [Core User Workflows](#4-core-user-workflows)
5. [Complete Database Schema](#5-complete-database-schema)
6. [Complete API Reference](#6-complete-api-reference)
7. [AI Features — Technical Specs](#7-ai-features--technical-specs)
8. [Auto-Discovery Engine](#8-auto-discovery-engine)
9. [Revenue Model — Technical Implementation](#9-revenue-model--technical-implementation)
10. [Infrastructure & Deployment](#10-infrastructure--deployment)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Vision & Market Context

### The Platform in One Sentence

> Moonmart is the AI-powered SaaS intelligence platform where 10 million software buyers discover, evaluate, and optimize their stack — and where 500,000 vendors get the buyer intent data they need to grow.

### Why This Window Exists Now

G2 acquired Capterra, Software Advice, and GetApp from Gartner in 2026, consolidating the top 4 review platforms into one monopoly. When incumbents merge, they slow down. Moonmart is built in 2026 with 2026-era AI — natively, not bolted on.

| Market Signal | Data |
|---------------|------|
| Global SaaS market (2026) | $492B → $1.58T by 2031 (26% CAGR) |
| Average enterprise SaaS apps | 275 tools |
| Average enterprise SaaS spend/year | $55.7M |
| Shadow IT share | 42% |
| Buyers increasing budgets in 2026 | 77% |
| AI-native app spend growth YoY | +108% |

### Positioning

| Competitor | What It Is | What Moonmart Does Instead |
|------------|-----------|---------------------------|
| G2 | Review aggregator (2012 architecture) | AI-first intelligence platform |
| Capterra | Paid listing directory | Outcome-verified trust system |
| Zylo | Enterprise spend management ($50K/yr) | Free for buyers, funded by vendor leads |
| Gartner Magic Quadrant | Analyst reports ($15K) | Democratised, AI-generated briefings |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          MOONMART PLATFORM                               │
│                                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │
│  │   Buyer     │   │   Vendor    │   │   Admin     │   │   Public    │ │
│  │  Dashboard  │   │  Dashboard  │   │   Console   │   │  Marketplace│ │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘ │
│         │                 │                 │                 │         │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴──────┐  │
│  │                      Nuxt 3 / Vue 3 Frontend                      │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │ HTTP / SSR                            │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │                      Nitro Server (API Layer)                     │  │
│  │                                                                   │  │
│  │  /api/auth    /api/apps    /api/billing    /api/admin             │  │
│  │  /api/ai      /api/vendor  /api/buyer      /api/discovery         │  │
│  └──────┬───────────────────────────────────────────────────────────┘  │
│         │                                                               │
│  ┌──────┴──────────────────────────────────────────────────────────┐   │
│  │                    Server Utilities Layer                        │   │
│  │  database.ts  auth.ts  email.ts  ai-extractor.ts  stripe.ts     │   │
│  └──────┬───────────────────────────────────────────────────────────┘  │
│         │                                                               │
│  ┌──────┴───────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  SQLite (dev)    │  │  Stripe API  │  │  OpenAI API              │  │
│  │  PostgreSQL (prod)│  │  Billing     │  │  GPT-4o-mini/Sonnet      │  │
│  └──────────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │               Auto-Discovery Engine (Background)                 │   │
│  │  GitHub Awesome → Product Hunt → Crunchbase → Direct Crawl       │   │
│  │  → AI Extractor → Confidence Scorer → Route → Queue / Publish    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Nuxt 3 + Vue 3 | 3.17.5 |
| UI System | @nuxt/ui | 3.1.3 |
| Styling | SCSS + Tailwind tokens | Custom design system |
| Server Runtime | Nitro (SSR) | Built into Nuxt 3 |
| Database (dev) | SQLite (better-sqlite3) | WAL mode |
| Database (prod) | PostgreSQL | Neon / Supabase |
| Payments | Stripe | v2025-03-31 |
| Email | SMTP / Mailgun | Nodemailer |
| AI | OpenAI GPT-4o / GPT-4o-mini | Latest |
| i18n | @nuxtjs/i18n | 9.5.6 |
| Auth | Session cookie (scrypt) | Custom |
| Background Jobs | tsx scripts | Node 18+ |

---

## 3. User Roles & Actors

### 3.1 Role Definitions

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| `buyer` | Company evaluating/buying SaaS | Search, compare, save, review, AI copilot, stack management |
| `vendor` | SaaS company listing their product | Create listings, view leads, access intent data, respond to reviews |
| `admin` | Moonmart team | Moderate all content, manage discovery queue, view all analytics |
| `public` | Unauthenticated visitor | Browse marketplace, read reviews, see pricing, use AI match (limited) |

### 3.2 Permissions Matrix

| Action | Public | Buyer | Vendor | Admin |
|--------|--------|-------|--------|-------|
| Browse marketplace | ✓ | ✓ | ✓ | ✓ |
| View listing detail | ✓ | ✓ | ✓ | ✓ |
| Use AI Match (3 queries) | ✓ | ✓ | ✓ | ✓ |
| Use AI Match (unlimited) | — | ✓ | ✓ | ✓ |
| Save favourites | — | ✓ | — | ✓ |
| Submit review | — | ✓ | — | ✓ |
| Use AI Copilot | — | ✓ | — | ✓ |
| Generate briefing | — | ✓ (Pro) | — | ✓ |
| Stack Intelligence | — | ✓ (Pro) | — | ✓ |
| Create/edit listing | — | — | ✓ | ✓ |
| View buyer intent data | — | — | ✓ (paid) | ✓ |
| View vendor intelligence | — | — | ✓ (paid) | ✓ |
| Approve/reject listings | — | — | — | ✓ |
| Manage discovery queue | — | — | — | ✓ |
| View platform analytics | — | — | — | ✓ |

---

## 4. Core User Workflows

### 4.1 Buyer — Discovery to Decision

```
[BUYER JOURNEY]

Step 1: ARRIVE
  ├── Organic search (SEO) → Category page
  ├── Direct referral → Listing page
  └── AI Match prompt → Homepage chat

Step 2: DISCOVER
  ├── Keyword search → Results list
  ├── AI Match Engine → "Answer 5 questions" → Ranked shortlist (with reasoning)
  └── AI Copilot chat → Guided conversation → Recommended tools

Step 3: EVALUATE (per tool)
  ├── Read AI Review Synthesis (consensus, deal-breakers, sentiment trend)
  ├── Compare 2–3 tools side-by-side
  ├── View pricing (with regional conversion)
  ├── Check compliance/security certs
  ├── Read full review list (with verified badges)
  └── Use ROI Calculator

Step 4: SHORTLIST
  ├── Save to favourites (auth required)
  ├── Add to "My Stack" comparison
  └── Generate AI Evaluation Brief (PDF/Google Doc)

Step 5: DECIDE
  ├── Book a demo (routes to vendor)
  ├── Click "Visit Site" → tracked as intent signal
  ├── Read Negotiation Intelligence tips
  └── Contact vendor via enquiry form

Step 6: POST-DECISION
  ├── Submit a review (verified if OAuth-linked to tool)
  ├── Add tool to Stack Intelligence
  └── Get renewal alert at contract end date
```

**API calls in this flow:**
- `GET /api/apps` — search and filter
- `POST /api/ai/match` — AI match engine
- `POST /api/ai/copilot` — conversational discovery
- `GET /api/apps/[id]` — listing detail
- `POST /api/ai/review-synthesis` — AI review summary
- `GET /api/apps/[id]/reviews` — full review list
- `POST /api/buyer/favourites` — save to list
- `POST /api/ai/briefing` — generate evaluation doc
- `POST /api/buyer/intent-event` — record buyer intent signal
- `POST /api/apps/[id]/reviews` — submit review
- `POST /api/buyer/stack` — add to stack

---

### 4.2 Vendor — Listing to Leads

```
[VENDOR JOURNEY]

Step 1: ONBOARD
  ├── Sign up (email/password or OAuth)
  ├── Verify email
  ├── Complete vendor profile (company, slug, logo)
  └── Choose billing plan (Starter / Growth / Scale)

Step 2: CREATE LISTING
  ├── Fill listing form (or use AI Content Assistant to auto-fill)
  ├── Upload logo + screenshots
  ├── Set pricing tiers
  ├── Add integrations + features
  ├── Submit for admin review
  └── Receive approval email → listing goes live

Step 3: GROW VISIBILITY
  ├── Get reviews (invite customers via email link)
  ├── Respond to reviews (AI draft mode)
  ├── Publish news/updates (via news portal)
  ├── Run promotions/deals
  └── Upgrade to featured/sponsored listing

Step 4: CAPTURE LEADS (paid plans)
  ├── View Buyer Intent Dashboard:
  │   ├── Who viewed your profile (company, role, location)
  │   ├── Who compared you to a competitor
  │   ├── Who bookmarked / shortlisted you
  │   └── Real-time alert: "new high-intent buyer"
  ├── Download qualified lead list (Growth/Scale plan)
  └── CRM export (Salesforce, HubSpot integration)

Step 5: OPTIMISE (Intelligence Dashboard)
  ├── Competitive Sentiment Map
  ├── Content Gap Detector ("buyers ask X, you haven't answered")
  ├── Win/Loss Analysis
  ├── Pricing Intelligence (anonymised benchmark)
  └── Review Response AI
```

**API calls in this flow:**
- `POST /api/auth/register` + `POST /api/auth/verify-email`
- `POST /api/vendor/profile`
- `POST /api/listings` — create listing
- `GET /api/vendor/listings` — manage listings
- `GET /api/vendor/intent-signals` — buyer intent feed
- `GET /api/vendor/intelligence` — competitive dashboard
- `POST /api/vendor/reviews/[id]/response` — respond to review
- `POST /api/news` — publish update
- `GET /api/billing/checkout` — upgrade plan

---

### 4.3 Admin — Moderation & Operations

```
[ADMIN JOURNEY]

Daily Operations:
  ├── Review discovery queue (AI-discovered listings awaiting approval)
  │   ├── 1-click approve (confidence ≥ 0.92 auto-submitted)
  │   ├── Edit + approve (confidence 0.70–0.91 flagged for review)
  │   └── Reject with reason
  ├── Review user-submitted listings (vendor onboarding flow)
  ├── Moderate reviews (approve / reject pending reviews)
  └── Moderate news posts (approve / reject vendor updates)

Analytics:
  ├── Platform stats (listings, users, reviews, revenue)
  ├── Discovery stats (processed, approved, rejected per day)
  ├── Top buyers by intent score
  └── Vendor performance leaderboard

Settings:
  ├── Platform settings (key-value store)
  ├── Featured listings management
  └── Category / taxonomy management
```

**API calls in this flow:**
- `GET /api/admin/discovery/queue`
- `POST /api/admin/discovery/[id]/approve`
- `POST /api/admin/discovery/[id]/reject`
- `PUT /api/admin/news/[id]/status`
- `GET /api/admin/users`
- `GET /api/admin/stats`

---

### 4.4 Auto-Discovery Pipeline Workflow

```
[PIPELINE — runs daily at 02:00 UTC]

Phase 1: SOURCE INGESTION
  ├── GitHub Awesome lists (fetch raw markdown from GitHub API, free)
  ├── Product Hunt scraper (Apify, ~50–200 new tools/week)
  ├── Manual "Suggest a Tool" submissions (public button on every page)
  └── → All URLs deduplicated and loaded into discovery_queue (status: pending)

Phase 2: FETCH & EXTRACT (per URL, rate-limited to 10 concurrent)
  ├── Fetch page HTML (Node fetch, 15s timeout)
  ├── Strip HTML → readable content (title, meta, OG, body text, JSON-LD)
  ├── Call OpenAI GPT-4o-mini with JSON response format
  └── → Returns ExtractedListing with per-field confidence scores

Phase 3: VALIDATE
  ├── Is it actually a SaaS tool? (not a blog, news site, person)
  ├── Does the domain already exist in app_listings?
  ├── Is the name > 2 characters and description > 50 characters?
  └── Is the logo URL reachable (HTTP HEAD check)?

Phase 4: ROUTE BY SCORE
  ├── Score ≥ 0.92 → status: auto_submitted (admin 1-click approve)
  ├── Score 0.70–0.91 → status: review (admin reviews pre-filled form)
  └── Score < 0.70 → status: discarded

Phase 5: VENDOR CLAIM EMAIL (for auto_submitted and review items)
  └── Email sent to contact@ or info@ at the product domain:
      "Your product is on Moonmart. Claim your free listing."
      → Claim link → Vendor signs up → Auto-linked to listing
```

---

## 5. Complete Database Schema

All tables use TEXT for primary keys (prefixed IDs like `usr_abc123`), ISO 8601 strings for timestamps, and INTEGER 0/1 for booleans.

### 5.1 users

```sql
CREATE TABLE users (
  id              TEXT PRIMARY KEY,           -- usr_xxxxxxxx
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,              -- scrypt + salt
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  company_name    TEXT,
  company_size    TEXT,                       -- '1-10','11-50','51-200','201-500','500+'
  job_title       TEXT,
  phone_number    TEXT,
  role            TEXT NOT NULL DEFAULT 'buyer',  -- buyer | vendor | admin
  plan            TEXT NOT NULL DEFAULT 'free',   -- free | starter | growth | scale | pro
  email_verified  INTEGER NOT NULL DEFAULT 0,
  avatar_url      TEXT,
  locale          TEXT DEFAULT 'en',          -- user's preferred locale
  timezone        TEXT DEFAULT 'UTC',
  stripe_customer_id TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
```

### 5.2 vendor_profiles

```sql
CREATE TABLE vendor_profiles (
  id            TEXT PRIMARY KEY,             -- vnd_xxxxxxxx
  user_id       TEXT NOT NULL UNIQUE,
  company_name  TEXT NOT NULL,
  company_slug  TEXT NOT NULL UNIQUE,         -- URL-safe, e.g. "linear-app"
  website_url   TEXT,
  logo_url      TEXT,
  tagline       TEXT,
  description   TEXT,
  founded_year  INTEGER,
  company_size  TEXT,
  funding_stage TEXT,                         -- seed | series-a | series-b | public | bootstrapped
  funding_total REAL,                         -- USD
  headquarters  TEXT,
  social_links  TEXT DEFAULT '{}',            -- JSON: {twitter, linkedin, github}
  status        TEXT NOT NULL DEFAULT 'active',  -- active | pending | suspended
  verified      INTEGER NOT NULL DEFAULT 0,  -- vendor has claimed & verified
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vp_slug   ON vendor_profiles(company_slug);
CREATE INDEX idx_vp_status ON vendor_profiles(status);
```

### 5.3 app_listings

```sql
CREATE TABLE app_listings (
  id                TEXT PRIMARY KEY,          -- app_xxxxxxxx
  vendor_id         TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  provider          TEXT NOT NULL,             -- vendor company name
  logo              TEXT NOT NULL,
  short_description TEXT NOT NULL,             -- max 300 chars
  long_description  TEXT NOT NULL,
  category          TEXT NOT NULL,
  tags              TEXT NOT NULL DEFAULT '[]',  -- JSON array
  key_features      TEXT DEFAULT '[]',           -- JSON array of feature strings
  integrations      TEXT DEFAULT '[]',           -- JSON array of integration names
  screenshots       TEXT DEFAULT '[]',           -- JSON array of image URLs
  pricing_type      TEXT NOT NULL DEFAULT 'contact',  -- free|freemium|paid|contact
  pricing_value     REAL,                       -- starting price in USD/month
  pricing_period    TEXT,                       -- month | year | user | seat
  pricing_tiers     TEXT DEFAULT '[]',          -- JSON array of {name, price, features[]}
  target_audience   TEXT,
  website_url       TEXT,
  demo_url          TEXT,
  support_email     TEXT,
  founded_year      INTEGER,
  headquarters      TEXT,
  security_certs    TEXT DEFAULT '[]',          -- JSON: ['SOC2','ISO27001','GDPR']
  compliance_score  REAL DEFAULT 0,             -- 0–100, auto-computed
  rating            REAL NOT NULL DEFAULT 0,
  review_count      INTEGER NOT NULL DEFAULT 0,
  featured          INTEGER NOT NULL DEFAULT 0,
  trending          INTEGER NOT NULL DEFAULT 0,
  sponsored         INTEGER NOT NULL DEFAULT 0,
  verified          INTEGER NOT NULL DEFAULT 0,  -- vendor has verified this listing
  auto_discovered   INTEGER NOT NULL DEFAULT 0,  -- created by discovery pipeline
  status            TEXT NOT NULL DEFAULT 'draft',  -- draft|submitted|published|archived
  published_at      TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_al_status   ON app_listings(status);
CREATE INDEX idx_al_category ON app_listings(category);
CREATE INDEX idx_al_featured ON app_listings(featured);
CREATE INDEX idx_al_trending ON app_listings(trending);
CREATE INDEX idx_al_slug     ON app_listings(slug);
CREATE INDEX idx_al_rating   ON app_listings(rating DESC);
```

### 5.4 reviews

```sql
CREATE TABLE reviews (
  id            TEXT PRIMARY KEY,             -- rev_xxxxxxxx
  app_id        TEXT NOT NULL,
  user_id       TEXT,
  user_name     TEXT NOT NULL,
  user_email    TEXT,
  user_role     TEXT,                         -- reviewer's job title
  company_size  TEXT,                         -- reviewer's company size
  rating        INTEGER NOT NULL,             -- 1–5
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  pros          TEXT DEFAULT '[]',            -- JSON array
  cons          TEXT DEFAULT '[]',            -- JSON array
  verified      INTEGER NOT NULL DEFAULT 0,   -- verified usage (OAuth-linked)
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending|approved|rejected
  authenticity_score  REAL DEFAULT NULL,      -- AI authenticity score 0–1
  outcome_metric      TEXT,                   -- "reduced onboarding time by 40%"
  platform      TEXT,                         -- web|mobile|api
  version       TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_rev_app_id ON reviews(app_id);
CREATE INDEX idx_rev_status ON reviews(status);
CREATE INDEX idx_rev_rating ON reviews(rating);
CREATE INDEX idx_rev_created ON reviews(created_at DESC);
```

### 5.5 review_synthesis_cache

```sql
CREATE TABLE review_synthesis_cache (
  id            TEXT PRIMARY KEY,             -- rsc_xxxxxxxx
  app_id        TEXT NOT NULL UNIQUE,
  consensus     TEXT NOT NULL,                -- AI-generated consensus summary
  power_user_view TEXT NOT NULL,
  deal_breakers TEXT NOT NULL,                -- JSON array of strings
  best_for      TEXT NOT NULL DEFAULT '[]',   -- JSON array
  worst_for     TEXT NOT NULL DEFAULT '[]',   -- JSON array
  sentiment_trend TEXT NOT NULL DEFAULT '{}', -- JSON: {last_30d, last_90d, direction}
  review_count_at_synthesis INTEGER NOT NULL,
  generated_at  TEXT NOT NULL,
  expires_at    TEXT NOT NULL,                -- re-generate after 48 hours or 50 new reviews
  FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
);
```

### 5.6 buyer_intent_events

```sql
CREATE TABLE buyer_intent_events (
  id            TEXT PRIMARY KEY,             -- int_xxxxxxxx
  app_id        TEXT NOT NULL,
  vendor_id     TEXT NOT NULL,
  user_id       TEXT,
  session_id    TEXT,
  event_type    TEXT NOT NULL,                -- view|compare|pricing_view|bookmark|demo_request|copilot_mention
  signal_strength TEXT NOT NULL DEFAULT 'warm',  -- warm|hot|purchase_proximate
  metadata      TEXT DEFAULT '{}',            -- JSON: {compared_to, time_spent_seconds, source_page}
  user_company  TEXT,
  user_role     TEXT,
  user_location TEXT,
  notified_vendor INTEGER NOT NULL DEFAULT 0, -- has this been sent to vendor?
  created_at    TEXT NOT NULL,
  FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_bie_vendor_id ON buyer_intent_events(vendor_id);
CREATE INDEX idx_bie_app_id    ON buyer_intent_events(app_id);
CREATE INDEX idx_bie_created   ON buyer_intent_events(created_at DESC);
CREATE INDEX idx_bie_notified  ON buyer_intent_events(notified_vendor);
```

### 5.7 ai_match_sessions

```sql
CREATE TABLE ai_match_sessions (
  id            TEXT PRIMARY KEY,             -- ams_xxxxxxxx
  user_id       TEXT,
  session_key   TEXT NOT NULL,                -- anonymous session identifier
  messages      TEXT NOT NULL DEFAULT '[]',   -- JSON array of {role, content} messages
  matched_apps  TEXT DEFAULT '[]',            -- JSON array of app_ids returned
  context       TEXT DEFAULT '{}',            -- JSON: {company_size, industry, budget, pain_point}
  lead_score    REAL DEFAULT 0,               -- 0–1, likelihood of purchase
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ams_user_id ON ai_match_sessions(user_id);
CREATE INDEX idx_ams_created ON ai_match_sessions(created_at DESC);
```

### 5.8 buyer_stacks

```sql
CREATE TABLE buyer_stacks (
  id            TEXT PRIMARY KEY,             -- stk_xxxxxxxx
  user_id       TEXT NOT NULL UNIQUE,
  tools         TEXT NOT NULL DEFAULT '[]',   -- JSON: [{app_id, name, category, monthly_cost, renewal_date, notes}]
  total_spend   REAL DEFAULT 0,               -- computed monthly USD
  overlap_alerts TEXT DEFAULT '[]',           -- JSON: AI-detected overlapping tool pairs
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5.9 negotiation_briefs

```sql
CREATE TABLE negotiation_briefs (
  id            TEXT PRIMARY KEY,             -- ngb_xxxxxxxx
  user_id       TEXT,
  app_id        TEXT NOT NULL,
  brief_content TEXT NOT NULL,                -- AI-generated markdown
  list_price    REAL,
  typical_discount_pct REAL,
  best_quarter  TEXT,                         -- Q1|Q2|Q3|Q4 for discounts
  tips          TEXT DEFAULT '[]',            -- JSON array of negotiation tips
  created_at    TEXT NOT NULL,
  FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
);
```

### 5.10 evaluation_briefs

```sql
CREATE TABLE evaluation_briefs (
  id            TEXT PRIMARY KEY,             -- evb_xxxxxxxx
  user_id       TEXT,
  app_ids       TEXT NOT NULL,                -- JSON array of compared app IDs
  title         TEXT NOT NULL,
  content_md    TEXT NOT NULL,                -- full AI-generated markdown
  share_token   TEXT UNIQUE,                  -- public share token (viral)
  views         INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_evb_share_token ON evaluation_briefs(share_token);
```

### 5.11 discovery_queue

```sql
CREATE TABLE discovery_queue (
  id              TEXT PRIMARY KEY,           -- dsc_xxxxxxxx
  source          TEXT NOT NULL,              -- github_awesome|product_hunt|manual|suggest
  source_url      TEXT,                       -- original source page URL
  website_url     TEXT NOT NULL UNIQUE,       -- deduplicated on domain
  extracted_data  TEXT NOT NULL DEFAULT '{}', -- JSON: full ExtractedListing object
  confidence_score REAL NOT NULL DEFAULT 0,   -- 0.0–1.0 weighted score
  status          TEXT NOT NULL DEFAULT 'pending',
                                              -- pending|auto_submitted|review|approved|rejected|discarded
  listing_id      TEXT,                       -- FK once listing is created
  reject_reason   TEXT,
  claim_email_sent INTEGER NOT NULL DEFAULT 0,
  processed_at    TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES app_listings(id) ON DELETE SET NULL
);

CREATE INDEX idx_dq_status   ON discovery_queue(status);
CREATE INDEX idx_dq_website  ON discovery_queue(website_url);
CREATE INDEX idx_dq_score    ON discovery_queue(confidence_score DESC);
CREATE INDEX idx_dq_created  ON discovery_queue(created_at DESC);
```

### 5.12 vendor_claim_tokens

```sql
CREATE TABLE vendor_claim_tokens (
  id            TEXT PRIMARY KEY,             -- vct_xxxxxxxx
  listing_id    TEXT NOT NULL,
  token_hash    TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL,                -- email the claim was sent to
  expires_at    TEXT NOT NULL,
  used_at       TEXT,
  created_at    TEXT NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES app_listings(id) ON DELETE CASCADE
);

CREATE INDEX idx_vct_token    ON vendor_claim_tokens(token_hash);
CREATE INDEX idx_vct_listing  ON vendor_claim_tokens(listing_id);
```

### 5.13 user_subscriptions (Stripe)

```sql
CREATE TABLE user_subscriptions (
  id                     TEXT PRIMARY KEY,    -- sub_xxxxxxxx
  user_id                TEXT NOT NULL,
  stripe_customer_id     TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan                   TEXT NOT NULL,       -- starter|growth|scale|buyer_pro
  stripe_status          TEXT NOT NULL,       -- active|trialing|past_due|canceled|incomplete
  current_period_start   TEXT,
  current_period_end     TEXT,
  cancel_at_period_end   INTEGER DEFAULT 0,
  canceled_at            TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5.14 sessions / auth tables

```sql
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,               -- ses_xxxxxxxx
  user_id     TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  used        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE email_verifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  verified_at TEXT,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5.15 Existing Supporting Tables (already built)

```
events           — webinars, conferences, meetups
news_posts       — vendor updates, product news
news_post_tags   — M2M tags for news
news_post_reactions — upvotes, reactions
user_favorites   — buyer saved apps
review_votes     — helpful vote tracking
demo_bookings    — demo request form submissions
onboarding_submissions — vendor listing form submissions
admin_settings   — key-value config store
```

---

## 6. Complete API Reference

Base URL: `https://moonmart.ai/api`
Auth: Session cookie (`saasworld_session`, HTTP-only, 14-day TTL)
All responses: `Content-Type: application/json`
Error shape: `{ error: true, statusCode: number, message: string }`

### 6.1 Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login, returns session cookie |
| POST | `/auth/logout` | User | Delete session |
| GET | `/auth/me` | User | Current user info |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Reset with token |
| GET | `/auth/verify-email` | Public | Verify email token |

**POST /auth/register — Request**
```json
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "buyer",
  "companyName": "Acme Corp"
}
```

**POST /auth/register — Response 201**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "email": "user@company.com",
    "role": "buyer",
    "emailVerified": false
  }
}
```

---

### 6.2 Marketplace / Apps

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/apps` | Public | List/search apps with filters |
| GET | `/apps/[id]` | Public | Single app detail |
| GET | `/apps/[id]/reviews` | Public | Reviews for an app |
| POST | `/apps/[id]/reviews` | Buyer | Submit review |
| POST | `/apps/[id]/reviews/[reviewId]/vote` | Buyer | Vote helpful |
| GET | `/apps/[id]/similar` | Public | AI-similar apps |
| POST | `/apps/suggest` | Public | Suggest a URL for auto-discovery |

**GET /apps — Query Parameters**
```
search        string    Full-text search query
category      string    Filter by category
pricing_type  string    free | freemium | paid | contact
sort          string    rating | trending | newest | reviews
featured      boolean
trending      boolean
page          integer   default: 1
per_page      integer   default: 20, max: 100
region        string    US | EU | IN | JP | etc (for currency conversion)
```

**GET /apps — Response**
```json
{
  "success": true,
  "total": 4821,
  "page": 1,
  "perPage": 20,
  "totalPages": 242,
  "apps": [
    {
      "id": "app_xyz",
      "slug": "linear",
      "name": "Linear",
      "provider": "Linear B.V.",
      "logo": "https://...",
      "shortDescription": "The issue tracker built for modern development teams.",
      "category": "Project Management",
      "tags": ["engineering", "agile", "developer-tools"],
      "pricingType": "freemium",
      "pricingValue": 8,
      "pricingPeriod": "user/month",
      "rating": 4.8,
      "reviewCount": 1247,
      "featured": true,
      "trending": true,
      "verified": true,
      "status": "published"
    }
  ]
}
```

---

### 6.3 AI Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai/match` | Public (limited) | AI Match Engine — ranked recommendations |
| POST | `/ai/copilot` | Buyer | Conversational discovery chat |
| POST | `/ai/review-synthesis` | Public | AI review summary for an app |
| POST | `/ai/briefing` | Buyer Pro | Generate evaluation brief (PDF/MD) |
| POST | `/ai/negotiation` | Buyer Pro | Negotiation intelligence for an app |
| POST | `/ai/app-summary` | Public | AI pitch summary for an app |
| POST | `/ai/vendor/response` | Vendor | Draft AI response to a review |
| POST | `/ai/vendor/content-gap` | Vendor | Detect content gaps in listing |

**POST /ai/match — Request**
```json
{
  "companySize": "51-200",
  "industry": "fintech",
  "budget": 500,
  "currentStack": ["Salesforce", "Slack"],
  "painPoint": "We spend 4 hours/week on manual reporting",
  "techLevel": "medium",
  "category": "Analytics"
}
```

**POST /ai/match — Response**
```json
{
  "sessionId": "ams_abc123",
  "matches": [
    {
      "app": { "id": "app_xyz", "name": "Metabase", "logo": "...", "rating": 4.6 },
      "score": 0.94,
      "reasoning": "Metabase is perfect for your fintech context — strong SQL layer, native Salesforce connector, and the self-service BI reduces reporting time by ~80% at your scale. Free open-source tier means zero upfront cost.",
      "rank": 1
    }
  ],
  "generatedAt": "2026-04-27T10:00:00Z"
}
```

**POST /ai/copilot — Request**
```json
{
  "sessionId": "ams_abc123",
  "message": "Actually we also need it to work on mobile for field teams",
  "context": { "previousMatches": ["app_xyz", "app_abc"] }
}
```

**POST /ai/copilot — Response**
```json
{
  "reply": "Great context — field teams change the calculus. For mobile-first analytics your top pick shifts to Looker Studio (free, excellent mobile) or Domo ($300/mo, best-in-class mobile app). Want me to compare those two specifically?",
  "suggestedApps": ["app_looker", "app_domo"],
  "intentSignals": ["mobile_requirement", "field_team", "budget_sensitive"]
}
```

**POST /ai/review-synthesis — Request**
```json
{ "appId": "app_xyz" }
```

**POST /ai/review-synthesis — Response**
```json
{
  "appId": "app_xyz",
  "cachedAt": "2026-04-26T08:00:00Z",
  "reviewCount": 1247,
  "consensus": "Linear is praised almost universally for its speed and clean UX. The keyboard-first design is a frequent standout.",
  "powerUserView": "Power users love the API depth, cycles feature, and GitHub integration. At scale (200+ issues), triage views become essential.",
  "dealBreakers": [
    "No native time tracking (requires integration)",
    "Onboarding for non-technical stakeholders is steep",
    "Reporting/analytics are limited compared to Jira"
  ],
  "bestFor": ["Engineering teams 10–200", "Startups that ship fast", "Teams migrating from Jira"],
  "worstFor": ["Non-technical project managers", "Companies needing Gantt charts"],
  "sentimentTrend": {
    "direction": "improving",
    "last30d": 4.9,
    "last90d": 4.7,
    "note": "Significant uptick after the AI Triage feature launch"
  }
}
```

**POST /ai/briefing — Request**
```json
{
  "appIds": ["app_linear", "app_shortcut", "app_height"],
  "context": {
    "companyName": "Acme Corp",
    "teamSize": 45,
    "decisionDate": "2026-05-15",
    "budget": 2000
  }
}
```

**POST /ai/briefing — Response**
```json
{
  "briefId": "evb_abc123",
  "shareUrl": "https://moonmart.ai/brief/tok_xyz",
  "title": "Software Evaluation: Project Management for Acme Corp",
  "contentMd": "# Executive Summary\n...",
  "sections": ["executive_summary", "feature_matrix", "pricing_tco", "risk_assessment", "recommendation", "review_appendix"]
}
```

---

### 6.4 Buyer Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/buyer/favourites` | Buyer | List saved apps |
| POST | `/buyer/favourites` | Buyer | Add app to favourites |
| DELETE | `/buyer/favourites/[appId]` | Buyer | Remove from favourites |
| GET | `/buyer/stack` | Buyer | Get software stack |
| PUT | `/buyer/stack` | Buyer | Update stack entries |
| POST | `/buyer/intent-event` | Buyer | Record buyer intent action |
| GET | `/buyer/briefs` | Buyer | List generated evaluation briefs |

**POST /buyer/intent-event — Request**
```json
{
  "appId": "app_xyz",
  "eventType": "compare",
  "metadata": {
    "comparedTo": "app_abc",
    "timeSpentSeconds": 480,
    "sourcePage": "/marketplace/compare"
  }
}
```

---

### 6.5 Vendor Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/vendor/profile` | Vendor | Get vendor profile |
| PUT | `/vendor/profile` | Vendor | Update vendor profile |
| GET | `/vendor/listings` | Vendor | List own app listings |
| POST | `/listings` | Vendor | Create new listing |
| PUT | `/listings/[id]` | Vendor | Update listing |
| DELETE | `/listings/[id]` | Vendor | Delete/archive listing |
| GET | `/vendor/intent-signals` | Vendor (paid) | Buyer intent feed |
| GET | `/vendor/intelligence` | Vendor (paid) | Competitive dashboard data |
| POST | `/vendor/reviews/[id]/response` | Vendor | Respond to review |
| GET | `/vendor/leads` | Vendor | Qualified lead list |
| POST | `/vendor/claim/[token]` | Public | Claim auto-discovered listing |

**GET /vendor/intent-signals — Response**
```json
{
  "signals": [
    {
      "id": "int_abc",
      "eventType": "compare",
      "signalStrength": "hot",
      "userCompany": "Stripe",
      "userRole": "Director of Engineering",
      "userLocation": "San Francisco, US",
      "comparedTo": "Notion",
      "timeSpentSeconds": 480,
      "createdAt": "2026-04-27T09:45:00Z"
    }
  ],
  "totalSignals": 47,
  "hotSignals": 8,
  "plan": "growth"
}
```

**GET /vendor/intelligence — Response**
```json
{
  "competitiveSentimentMap": {
    "yourScore": 4.8,
    "categoryAvg": 4.2,
    "topCompetitor": { "name": "Shortcut", "score": 4.5 },
    "winningTopics": ["speed", "UX", "API"],
    "losingTopics": ["mobile", "reporting", "enterprise features"]
  },
  "contentGaps": [
    "Buyers frequently ask about GDPR compliance — not addressed on your profile",
    "No pricing comparison vs. Jira — top search query in your category"
  ],
  "buyerPersonas": {
    "topRole": "Engineering Manager",
    "topCompanySize": "51-200",
    "topIndustry": "Software & Technology",
    "topLocation": "United States"
  }
}
```

---

### 6.6 Admin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List users with filters |
| PUT | `/admin/users/[id]` | Admin | Update user role/status |
| GET | `/admin/listings` | Admin | All listings with status filter |
| PUT | `/admin/listings/[id]/status` | Admin | Approve / reject listing |
| GET | `/admin/news` | Admin | All news posts |
| PUT | `/admin/news/[id]/status` | Admin | Approve / reject news post |
| GET | `/admin/reviews` | Admin | All reviews pending moderation |
| PUT | `/admin/reviews/[id]/status` | Admin | Approve / reject review |
| GET | `/admin/discovery/queue` | Admin | Auto-discovery review queue |
| POST | `/admin/discovery/[id]/approve` | Admin | Approve discovered listing |
| POST | `/admin/discovery/[id]/reject` | Admin | Reject with reason |
| POST | `/admin/discovery/trigger` | Admin | Manually run discovery |
| GET | `/admin/stats` | Admin | Platform-wide analytics |
| GET | `/admin/settings` | Admin | Key-value settings store |
| PUT | `/admin/settings` | Admin | Update settings |

**GET /admin/discovery/queue — Response**
```json
{
  "items": [
    {
      "id": "dsc_abc",
      "source": "github_awesome",
      "websiteUrl": "https://cal.com",
      "confidenceScore": 0.96,
      "status": "auto_submitted",
      "extracted": {
        "name": "Cal.com",
        "tagline": "The open-source Calendly alternative",
        "shortDescription": "Scheduling infrastructure for everyone.",
        "category": "Productivity",
        "pricingType": "freemium",
        "pricingStartsAt": 12,
        "keyFeatures": ["Custom booking links", "Team scheduling", "API access"],
        "logoUrl": "https://cal.com/logo.png",
        "confidence": {
          "name": 0.99,
          "description": 0.97,
          "category": 0.91,
          "pricing": 0.88,
          "features": 0.85,
          "overall": 0.96
        }
      },
      "createdAt": "2026-04-27T02:15:00Z"
    }
  ],
  "counts": {
    "pending": 23,
    "auto_submitted": 145,
    "review": 67,
    "approved": 3421,
    "rejected": 89,
    "discarded": 234
  }
}
```

**POST /admin/discovery/[id]/approve — Request**
```json
{
  "overrides": {
    "name": "Cal.com",
    "category": "Productivity",
    "pricingType": "freemium",
    "pricingValue": 12
  }
}
```

---

### 6.7 Billing Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/billing/subscription` | User | Current subscription details |
| POST | `/billing/checkout` | User | Create Stripe checkout session |
| POST | `/billing/portal` | User | Stripe billing portal redirect |
| POST | `/billing/webhook` | Internal | Stripe webhook receiver |

**POST /billing/checkout — Request**
```json
{
  "plan": "growth",
  "interval": "monthly",
  "currency": "usd",
  "successUrl": "https://moonmart.ai/dashboard?upgraded=true",
  "cancelUrl": "https://moonmart.ai/pricing"
}
```

---

### 6.8 Discovery — Public Suggestion

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/apps/suggest` | Public | Suggest a URL to auto-discover |

**POST /apps/suggest — Request**
```json
{
  "url": "https://someapp.io",
  "submittedBy": "user@company.com"
}
```

**POST /apps/suggest — Response**
```json
{
  "success": true,
  "message": "Thanks! We'll review this tool and list it within 24 hours.",
  "queueId": "dsc_xyz"
}
```

---

## 7. AI Features — Technical Specs

### 7.1 AI Match Engine

**Model:** GPT-4o (for reasoning quality)
**Trigger:** User submits match questionnaire
**Flow:**

```typescript
// POST /api/ai/match
1. Receive: { companySize, industry, budget, currentStack, painPoint, techLevel, category }
2. Fetch top 50 apps in requested category from DB (by rating + review count)
3. Build context: app names, descriptions, ratings, pricing, features
4. Prompt OpenAI with buyer context + app catalogue
5. Receive ranked list with scores (0–1) and reasoning per app
6. Store session in ai_match_sessions table
7. Record buyer_intent_event for each app mentioned
8. Return top 5 ranked matches with reasoning
```

**System Prompt (abbreviated):**
```
You are a SaaS procurement advisor. Given a buyer's context and a list of
software tools, return the top 5 ranked matches as JSON.

Rank by: fit to pain point (40%) + stack compatibility (25%) + 
         budget alignment (20%) + company size fit (15%)

For each match provide:
- score: 0.0–1.0
- reasoning: 2–3 sentences explaining the fit specifically for THIS buyer
- tradeoffs: one honest drawback to mention
```

---

### 7.2 Review Synthesis Engine

**Model:** GPT-4o-mini (cost-efficient at scale)
**Trigger:** First request for an app's synthesis, then cached for 48h or 50+ new reviews
**Flow:**

```typescript
// POST /api/ai/review-synthesis
1. Check review_synthesis_cache — if fresh, return cached result
2. Fetch all approved reviews for app_id (last 12 months, max 500)
3. Build review corpus: "Rating X/5 — [title] — [content]" per review
4. Chunk if > 80K tokens (use map-reduce synthesis)
5. Prompt: extract consensus, power user view, deal-breakers, best/worst for
6. Compute sentiment trend: compare avg rating last-30d vs last-90d
7. Store in review_synthesis_cache with 48h TTL
8. Return synthesis object
```

---

### 7.3 AI Copilot (Conversational Discovery)

**Model:** GPT-4o (needs reasoning for multi-turn context)
**Session Management:** `ai_match_sessions` table, keyed by session_id cookie
**Max turns per session:** 20
**Flow:**

```typescript
// POST /api/ai/copilot
1. Load conversation history from ai_match_sessions (session_id from cookie or body)
2. Append new user message
3. Maintain system context: current app catalogue summary, buyer profile if auth'd
4. Stream response from OpenAI (or batch if client doesn't support streaming)
5. Parse AI response for: tool mentions, requirements, intent signals
6. Record intent events for any tools mentioned by AI
7. Update session with new messages + any extracted context
8. Return AI reply + suggested apps (if any)
```

**System Prompt:**
```
You are Mira, Moonmart's AI buying advisor. You help buyers find the right
SaaS tools through conversation.

Rules:
- Ask at most ONE clarifying question per turn
- Always give a concrete recommendation within 3 turns
- Be specific about WHY a tool fits THEIR situation
- Acknowledge tradeoffs honestly — don't oversell
- When recommending, always mention pricing clearly
- You have access to [CATALOGUE_SUMMARY]
```

---

### 7.4 AI Verification Engine

**Model:** GPT-4o-mini
**Trigger:** Each review submission → async background scoring
**Flow:**

```typescript
// Background job: score-review.ts
1. Triggered after review INSERT with status='pending'
2. Fetch: review content, reviewer history (past reviews), app review stats
3. Checks:
   a. Language naturalness score (LLM: "Is this a genuine experience or marketing copy?")
   b. Cluster detection: Did 5+ reviews appear in 48h from similar IPs/emails?
   c. Reviewer history: Is this their first review? Only positive reviews?
   d. Content coherence: Does the review match the product's actual features?
4. Output: authenticity_score (0–1) + flag reason if < 0.6
5. UPDATE reviews SET authenticity_score = ? WHERE id = ?
6. If score < 0.4: flag for admin review immediately
```

---

### 7.5 AI Briefing Generator

**Model:** GPT-4o (quality output, document generation)
**Trigger:** Buyer selects 2–4 tools and clicks "Generate Brief"
**Cost:** ~$0.05 per brief (reserved for Pro buyers)

```typescript
// POST /api/ai/briefing
1. Fetch full detail for each app_id: reviews, pricing, features, synthesis cache
2. Build comparison context (features matrix, pricing comparison, sentiment)
3. Fetch buyer context if authenticated (company, stack, requirements)
4. Prompt: generate structured evaluation brief in Markdown
5. Sections: executive_summary → feature_matrix → pricing_tco → risks → recommendation → appendix
6. Store in evaluation_briefs table with share_token
7. Return brief content + shareable URL
```

---

## 8. Auto-Discovery Engine

### 8.1 Pipeline Overview

```
[SOURCES] → [QUEUE] → [FETCH] → [EXTRACT] → [VALIDATE] → [ROUTE] → [PUBLISH/REVIEW]
```

### 8.2 Source Adapters

**GitHub Awesome Lists (`scripts/discovery/sources/github-awesome.ts`)**
```typescript
// Fetches markdown from GitHub API, parses URLs
// Target repos: awesome-selfhosted, awesome-saas-services
// Rate: ~2,000 tools per run, free, refresh monthly
const RAW_URL = 'https://raw.githubusercontent.com/ripienaar/free-for-dev/master/README.md'
const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
// Parse → extract name + URL pairs → load into discovery_queue
```

**Product Hunt (`scripts/discovery/sources/product-hunt.ts`)**
```typescript
// Uses Apify Product Hunt Scraper (~$10/month)
// Fetches last 7 days of launches, filters by topic = 'SaaS' or upvotes > 100
// Returns: { name, tagline, website, topics, thumbnail, upvotes }
// Rate: 50–200 new tools/week
```

**Direct Crawl (`scripts/discovery/sources/direct-crawl.ts`)**
```typescript
// For any URL in the queue, fetch the landing page
// Uses built-in Node fetch (no external library needed)
// Extracts: title, meta description, OG tags, JSON-LD, body text (first 3000 chars)
// Timeout: 15 seconds per page
// Concurrent: max 10 parallel requests
```

### 8.3 AI Extraction Module (`server/utils/ai-extractor.ts`)

Already implemented. Key function signatures:

```typescript
fetchPageText(url: string): Promise<string>
extractWithAI(pageText: string, websiteUrl: string): Promise<ExtractedListing>
computeScore(confidence: FieldConfidence): number          // returns 0.0–1.0
routeByScore(score: number): 'auto_submit' | 'review' | 'discard'
```

**Cost per call:** ~$0.0002 (GPT-4o-mini, ~1000 tokens per page)
**Accuracy:** 97–99% on core fields (name, description, category) with ≥0.92 score threshold

### 8.4 Confidence Scoring Weights

```
name        × 0.25   (most important — wrong name = wrong listing)
description × 0.25   (most important — describes the product)
category    × 0.20   (navigation, discovery)
pricing     × 0.15   (buyer decision factor)
features    × 0.15   (differentiation)
───────────────────
Total         1.00
```

**Routing thresholds:**
- `≥ 0.92` → `auto_submitted` — admin one-click approve (~65% of items)
- `0.70–0.91` → `review` — admin reviews pre-filled form (~30% of items)
- `< 0.70` → `discarded` — not shown (~5% of items)

### 8.5 Vendor Claim Email

When a listing is auto-created, the pipeline sends a claim email:

```
TO:      info@{product-domain}.com (or found from contact page)
SUBJECT: [Your product name] is listed on Moonmart — claim it free

Hi,

We found [Product Name] and added it to Moonmart, the AI-powered
SaaS intelligence platform.

Your listing: https://moonmart.ai/app/[slug]

Claim your free listing to:
✓ Add official pricing, screenshots, and videos
✓ Respond to buyer reviews
✓ See who's viewing your profile (buyer intent data)
✓ Get qualified leads from active buyers

[Claim Your Listing →] https://moonmart.ai/claim/[token]

This takes 2 minutes. No credit card required.
— The Moonmart Team
```

**Business impact:** Every auto-discovered listing is a vendor acquisition opportunity at $0 CAC.

### 8.6 Running the Discovery Pipeline

```bash
# One-off run (development)
npm run discovery:run

# Production: add to cron (run daily at 02:00 UTC)
0 2 * * * cd /app && node --loader tsx/esm scripts/discovery/runner.ts >> /var/log/discovery.log 2>&1

# Benchmark test (run before go-live)
npm run discovery:benchmark  # tests against 200 known SaaS tools, reports accuracy
```

### 8.7 Monthly Operating Cost

| Service | Plan | Cost | Volume |
|---------|------|------|--------|
| Firecrawl | Hobby | $16/mo | 3,000 page fetches |
| Apify (Product Hunt) | Pay-as-you-go | $10/mo | Weekly scrape |
| OpenAI GPT-4o-mini | API | ~$5/mo | 10,000 extraction calls |
| Crunchbase | Basic | $29/mo | Company enrichment |
| Google Custom Search | API | ~$5/mo | Discovery triggering |
| **Total** | | **~$65/mo** | **~3,000 new listings/month** |

Cost per verified listing: **$0.02**

---

## 9. Revenue Model — Technical Implementation

### 9.1 Stripe Plan Configuration

```typescript
// server/utils/stripe.ts — Plan definitions
export const PLANS = {
  vendor_starter: {
    name: 'Vendor Starter',
    price_monthly: 99,
    price_annual: 79,   // per month, billed annually
    features: ['1 listing', '50 buyer intent signals/mo', 'Basic analytics'],
    stripe_price_id_monthly: process.env.STRIPE_PRICE_VENDOR_STARTER_MONTHLY,
    stripe_price_id_annual:  process.env.STRIPE_PRICE_VENDOR_STARTER_ANNUAL,
  },
  vendor_growth: {
    name: 'Vendor Growth',
    price_monthly: 299,
    price_annual: 239,
    features: ['3 listings', 'Unlimited intent signals', 'Buyer contacts', 'Intelligence dashboard'],
    stripe_price_id_monthly: process.env.STRIPE_PRICE_VENDOR_GROWTH_MONTHLY,
    stripe_price_id_annual:  process.env.STRIPE_PRICE_VENDOR_GROWTH_ANNUAL,
  },
  vendor_scale: {
    name: 'Vendor Scale',
    price_monthly: null,  // custom
    features: ['Unlimited listings', 'CRM export', 'API access', 'Custom MSA/SLA'],
  },
  buyer_pro: {
    name: 'Buyer Pro',
    price_monthly: 49,
    price_annual: 39,
    features: ['Unlimited AI Copilot', 'Evaluation briefs', 'Stack Intelligence', 'Negotiation Intel'],
    stripe_price_id_monthly: process.env.STRIPE_PRICE_BUYER_PRO_MONTHLY,
    stripe_price_id_annual:  process.env.STRIPE_PRICE_BUYER_PRO_ANNUAL,
  }
}
```

### 9.2 Pay-Per-Lead Implementation

```typescript
// When a buyer intent event crosses threshold → charge vendor

// Qualification criteria for a "lead":
const LEAD_QUALIFIES = (event: BuyerIntentEvent) =>
  event.signalStrength === 'hot' &&            // compared or pricing_view
  event.userCompany !== null &&                 // company identified
  event.timeSpentSeconds > 120                  // 2+ minutes of engagement

// Lead pricing (configurable via admin_settings):
// - Starter plan: pre-paid 50 lead credits at $150 ($3/lead)
// - Growth plan:  real-time leads at $100/lead, capped at $2K/mo
// - Scale plan:   custom pricing, unlimited

// Webhook handling: charge on lead delivery via Stripe metered billing
```

### 9.3 Buyer Intent Data Feed (API)

```typescript
// GET /api/vendor/intent-signals
// Requires: plan in ['growth', 'scale']
// Rate limit: 1000 req/day on growth, unlimited on scale

// Response includes:
// - Real-time signals (last 7 days)
// - Enriched with: company domain, company size inferred from email domain
// - Signal score: warm (1pt) | hot (3pt) | purchase_proximate (5pt)
// - Weekly report: total signals, top intent categories, competitor comparison data
```

### 9.4 Marketplace Commission (Future Phase)

```typescript
// When vendor offers a trial/subscription via Moonmart:
// - Platform captures 10% of first-year subscription value
// - Implemented via Stripe Connect (vendor sub-accounts)
// - Commission tracked in: marketplace_transactions table (Phase 3)
```

---

## 10. Infrastructure & Deployment

### 10.1 Environment Variables (Complete List)

```bash
# App
SITE_URL=https://moonmart.ai
NODE_ENV=production

# Database
SAASWORLD_DB_PATH=.data/saasworld.db       # dev (SQLite)
DATABASE_URL=postgresql://...              # prod (PostgreSQL)

# Auth
SESSION_SECRET=...                         # 32+ char random string

# Email / SMTP
MAIL_DRIVER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@moonmart.ai
SMTP_PASS=...
MAIL_FROM=Moonmart <hello@moonmart.ai>
MAIL_ADMIN=admin@moonmart.ai

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_VENDOR_STARTER_MONTHLY=price_...
STRIPE_PRICE_VENDOR_STARTER_ANNUAL=price_...
STRIPE_PRICE_VENDOR_GROWTH_MONTHLY=price_...
STRIPE_PRICE_VENDOR_GROWTH_ANNUAL=price_...
STRIPE_PRICE_BUYER_PRO_MONTHLY=price_...
STRIPE_PRICE_BUYER_PRO_ANNUAL=price_...

# AI / OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Auto-Discovery
APIFY_API_KEY=apify_...                    # Product Hunt scraper
FIRECRAWL_API_KEY=fc-...                   # Page rendering (optional)
CRUNCHBASE_API_KEY=...                     # Company enrichment (optional)
GOOGLE_SEARCH_API_KEY=...                  # Discovery triggering (optional)
GOOGLE_SEARCH_CX=...                       # Custom Search Engine ID

# Image / CDN
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Analytics
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_AI_MATCH=true
ENABLE_AI_COPILOT=true
ENABLE_AUTO_DISCOVERY=true
ENABLE_BUYER_INTENT=true
```

### 10.2 Database Migration Plan (SQLite → PostgreSQL)

```
Phase 1 (now):     SQLite — fine for dev and < 10K users
Phase 2 (launch):  PostgreSQL via Neon (serverless, free tier)
                   Connection pooling via PgBouncer
                   Read replica for analytics queries
Phase 3 (scale):   Neon multi-region (EU + US + APAC)
                   Redis (Upstash) for:
                     - Session store (replace in-memory Map)
                     - Rate limiting (replace in-memory store)
                     - AI synthesis cache (replace DB table)
                     - Intent event queue (replace synchronous writes)
```

### 10.3 Recommended Deployment Stack

| Component | Service | Cost (at launch) |
|-----------|---------|-----------------|
| App hosting | Railway or Render | $20–50/mo |
| Database | Neon PostgreSQL | Free → $19/mo |
| Static assets | Cloudflare CDN | Free |
| Email | Mailgun | $35/mo |
| Monitoring | Betterstack | $24/mo |
| CI/CD | GitHub Actions | Free |

### 10.4 Security Headers (already configured in nuxt.config.ts)

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: [strict policy]
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 10.5 Recommended Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.output ./output
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "output/server/index.mjs"]
```

---

## 11. Implementation Roadmap

### Phase 0 — Launch Blockers (Week 1–2)

| Task | File(s) | Why Critical |
|------|---------|-------------|
| Add `requireAdmin` to auth.ts | `server/utils/auth.ts` | All admin routes broken without it |
| Wire GDPR consent banner | `plugins/gdpr.ts` + layout | EU legal requirement |
| Fix email delivery (SMTP) | `server/utils/email.ts` + `.env` | Password reset, welcome emails broken |
| Enforce email verification | `server/api/auth/register.ts` | Basic trust requirement |
| Migrate SQLite → PostgreSQL | `server/utils/database.ts` | Cannot scale or deploy multi-region |
| Multi-currency Stripe checkout | `server/api/billing/checkout.ts` | IN, EU, JP buyers blocked |

---

### Phase 1 — Core AI Moat (Week 3–6)

| Feature | New Files | Revenue Impact |
|---------|-----------|---------------|
| AI Match Engine | `server/api/ai/match.post.ts` | 3× conversion on first visit |
| AI Review Synthesis | `server/api/ai/review-synthesis.post.ts` + `review_synthesis_cache` table | Reduces bounce 40% |
| Buyer Intent Tracking | `server/api/buyer/intent-event.post.ts` + `buyer_intent_events` table | Unlocks pay-per-lead |
| Vendor Intent Dashboard | `server/api/vendor/intent-signals.get.ts` | $299/mo vendor upsell |
| Auto-Discovery Engine | `scripts/discovery/` + `server/utils/ai-extractor.ts` + `discovery_queue` table | 3,000 new listings/month at $0.02 each |
| Admin Discovery Queue | `server/api/admin/discovery/` + `pages/admin/discovery.vue` | Ops efficiency |

---

### Phase 2 — Differentiation (Week 7–12)

| Feature | New Files | Revenue Impact |
|---------|-----------|---------------|
| AI Copilot (conversational) | `server/api/ai/copilot.post.ts` + `ai_match_sessions` table | Retention + virality |
| Vendor Intelligence Dashboard | `server/api/vendor/intelligence.get.ts` | $500/mo upsell |
| Stack Intelligence | `server/api/buyer/stack.*` + `buyer_stacks` table | $49/mo buyer Pro |
| AI Briefing Generator | `server/api/ai/briefing.post.ts` + `evaluation_briefs` table | Viral procurement loop |
| Negotiation Intelligence | `server/api/ai/negotiation.post.ts` + `negotiation_briefs` table | Trust + retention |
| AI Verification Engine | Background job: `scripts/score-reviews.ts` | Trust moat vs G2 |
| OAuth (Google/GitHub) | `server/api/auth/oauth.*` | Reduces signup friction 60% |

---

### Phase 3 — Global Scale (Week 13–20)

| Feature | New Files | Revenue Impact |
|---------|-----------|---------------|
| RTL support (Arabic, Hebrew) | CSS + i18n + `dir` attribute | MENA market unlock |
| ZH, JA, AR, HI locales | `locales/*.json` (4 new files) | 3B new addressable users |
| Regional compliance scores | `server/utils/compliance-scorer.ts` | Differentiator in EU/IN/MENA |
| 2FA / MFA | `server/api/auth/2fa.*` | Enterprise buyer requirement |
| Vendor CRM export | `server/api/vendor/leads/export.get.ts` | Scale plan feature |
| API access tier | `server/api/v1/` + API key management | Developer ecosystem |
| PostgreSQL multi-region | Infrastructure | EU data residency (GDPR) |

---

## The Flywheel

```
More Buyers
    │
    ├─→ More Behavioral Data
    │         │
    │         └─→ Better AI Recommendations ──→ Higher Buyer Trust
    │                                                    │
    │                                                    ▼
    └────────────────────────────── More Vendors ←── More Qualified Leads
                                          │
                                          └─→ More Listings → Better Search Results
```

The moat is **data compounding over time.** G2 has 100M users but 2012-era AI. Moonmart is built natively for 2026.

---

## The One-Line Pitch

> *"Moonmart is the AI-powered SaaS intelligence platform where 10 million software buyers discover, evaluate, and optimize their stack — and where 500,000 vendors get the buyer intent data they need to grow."*

---

*Document maintained by the Moonmart engineering team. For questions: engineering@moonmart.ai*
