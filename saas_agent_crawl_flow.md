# SaaS Discovery Agent — Complete Crawl Flow & Setup Guide

> **What is already built**: `discovery_queue` DB table, `ai-extractor.ts` (OpenAI extraction),
> `trigger.post.ts` (manual URL trigger), `queue.get.ts` (admin queue viewer).
> **What needs to be built**: Source-specific crawlers, scheduler, outreach mailer, claim flow.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT SCHEDULER (Nitro Task / Cron)         │
│          Runs each source crawler on a defined schedule          │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │     SOURCE CRAWLERS         │
          │  (one module per source)    │
          │  YC · ProductHunt · GitHub  │
          │  SaaSHub · IndieHackers...  │
          └──────────────┬──────────────┘
                         │ raw URLs + metadata
          ┌──────────────▼──────────────┐
          │    DEDUPLICATION LAYER      │
          │  domain-normalized lookup   │
          │  against discovery_queue    │
          └──────────────┬──────────────┘
                         │ new URLs only
          ┌──────────────▼──────────────┐
          │    AI EXTRACTOR             │
          │  fetchPageText → OpenAI     │
          │  → ExtractedListing + score │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    SCORE ROUTER             │
          │  ≥ 80  → auto_approved      │
          │  50–79 → needs_review       │
          │  < 50  → rejected           │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    ADMIN DASHBOARD          │
          │  /admin/discovery/queue     │
          │  Review · Approve · Reject  │
          └──────────────┬──────────────┘
                         │ admin approves
          ┌──────────────▼──────────────┐
          │    OUTREACH MAILER          │
          │  Sends claim email to       │
          │  founder/company email      │
          └──────────────┬──────────────┘
                         │ company clicks magic link
          ┌──────────────▼──────────────┐
          │    CLAIM FLOW               │
          │  Company logs in / signs up │
          │  Verifies ownership         │
          │  Listing goes LIVE          │
          └─────────────────────────────┘
```

---

## Phase 1 — Setup & Prerequisites

### 1.1 Environment Variables Required

Add to `.env`:

```env
# Already present (OpenAI — used by ai-extractor.ts)
OPENAI_API_KEY=sk-...

# New: Source API keys
PRODUCT_HUNT_API_TOKEN=ph_...          # From producthunt.com/v2/oauth/applications
GITHUB_TOKEN=ghp_...                   # From github.com/settings/tokens (public_repo scope)
REDDIT_CLIENT_ID=...                   # From reddit.com/prefs/apps
REDDIT_CLIENT_SECRET=...
PROXYCURL_API_KEY=...                  # From nubela.co/proxycurl (LinkedIn enrichment)
CRUNCHBASE_API_KEY=...                 # From crunchbase.com/api (optional, paid)

# New: Outreach email sender
OUTREACH_FROM_EMAIL=discover@yourdomain.com
OUTREACH_FROM_NAME=SaasWorld Discovery Team

# New: Scheduler toggle
DISCOVERY_AGENT_ENABLED=true
DISCOVERY_BATCH_SIZE=50               # URLs per run per source
```

### 1.2 New DB Tables Required

Add to your database migration / schema file:

```sql
-- Already exists (from trigger.post.ts)
CREATE TABLE IF NOT EXISTS discovery_queue (
  id                TEXT PRIMARY KEY,
  source            TEXT NOT NULL,          -- 'yc' | 'producthunt' | 'github' | ...
  source_url        TEXT,                   -- Original URL on the source platform
  website_url       TEXT NOT NULL,          -- The actual SaaS product URL
  extracted_data    TEXT,                   -- JSON blob: ExtractedListing
  confidence_score  REAL DEFAULT 0,
  status            TEXT DEFAULT 'pending', -- pending | needs_review | auto_approved | approved | rejected | claimed | live
  listing_id        TEXT,                   -- FK → app_listings once live
  reject_reason     TEXT,
  claim_email_sent  INTEGER DEFAULT 0,
  claim_token       TEXT,                   -- Magic link token
  claim_token_exp   TEXT,                   -- Expiry timestamp
  founder_email     TEXT,                   -- Email to send outreach to
  processed_at      TEXT,
  created_at        TEXT NOT NULL
);

-- New: track each agent run
CREATE TABLE IF NOT EXISTS agent_runs (
  id           TEXT PRIMARY KEY,
  source       TEXT NOT NULL,
  started_at   TEXT NOT NULL,
  finished_at  TEXT,
  urls_found   INTEGER DEFAULT 0,
  urls_new     INTEGER DEFAULT 0,
  urls_failed  INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'running'  -- running | done | error
);

-- New: outreach email log
CREATE TABLE IF NOT EXISTS outreach_emails (
  id           TEXT PRIMARY KEY,
  queue_item_id TEXT NOT NULL,
  to_email     TEXT NOT NULL,
  subject      TEXT,
  sent_at      TEXT,
  opened_at    TEXT,
  clicked_at   TEXT,
  status       TEXT DEFAULT 'sent'    -- sent | opened | clicked | bounced
);
```

### 1.3 New Files to Create

```
server/
  tasks/
    discovery-agent.ts          ← Nitro scheduled task (runs all crawlers)
  utils/
    discovery/
      crawlers/
        yc.ts                   ← Y Combinator crawler
        producthunt.ts          ← Product Hunt API crawler
        github.ts               ← GitHub topics crawler
        saashub.ts              ← SaaSHub API crawler
        indiehackers.ts         ← IndieHackers scraper
        zapier.ts               ← Zapier App Directory
        appsumo.ts              ← AppSumo scraper
        reddit.ts               ← Reddit API crawler
        hackernews.ts           ← HackerNews Show HN crawler
        atlassian.ts            ← Atlassian Marketplace
        shopify.ts              ← Shopify App Store
      deduplicator.ts           ← Domain normalization + DB lookup
      outreach.ts               ← Claim email sender
      claimToken.ts             ← Magic link generator/validator
pages/
  claim/
    [token].vue                 ← Claim page (vendor lands here from email)
server/
  api/
    claim/
      [token].get.ts            ← Validate claim token
      [token].post.ts           ← Complete claim, create listing
```

---

## Phase 2 — Crawler Implementation (per source)

### Source 1: Y Combinator (FREE — Highest Priority)

**How it works**: Public JSON API at `ycombinator.com/companies`

```
Schedule: Weekly (Sunday 2am)
Endpoint: https://ycombinator.com/companies?batch=&tags=saas&page=1
Auth: None required
Rate limit: ~1 req/sec (be polite)
Data returned: name, website, description, batch, tags, team_size, country
Est. apps: 4,000+
```

**Flow**:
1. Fetch paginated JSON from YC API
2. Extract `website_url`, `name`, `description`, `batch`, `country`
3. Deduplicator: skip if domain already in `discovery_queue`
4. For new URLs → AI Extractor → score → insert into queue with `source='yc'`
5. Pre-populate `founder_email` from YC data if available

**File**: `server/utils/discovery/crawlers/yc.ts`

---

### Source 2: Product Hunt (FREE API)

**How it works**: Official GraphQL API

```
Schedule: Daily (3am)
Endpoint: https://api.producthunt.com/v2/api/graphql
Auth: Bearer token (PRODUCT_HUNT_API_TOKEN)
Rate limit: 120 req/min
Query: { posts(first: 50, topic: "saas") { nodes { name, tagline, website, thumbnail } } }
Est. apps: 80,000+ (paginate through all)
```

**Flow**:
1. Query Product Hunt GraphQL with `topic: "saas"` filter
2. Extract `website`, `name`, `tagline`, `thumbnail { url }`
3. Deduplicator → new only → AI Extractor
4. Use Product Hunt `maker.profileUrl` to find founder email via Proxycurl

**File**: `server/utils/discovery/crawlers/producthunt.ts`

---

### Source 3: GitHub Topics (FREE API)

**How it works**: GitHub REST API v3

```
Schedule: Weekly (Monday 3am)
Endpoint: https://api.github.com/search/repositories?q=topic:saas&sort=stars&per_page=100
Auth: GitHub Token (GITHUB_TOKEN) — higher rate limit
Rate limit: 30 req/min authenticated
Also query: topic:micro-saas, topic:saas-boilerplate, topic:saas-starter
Est. apps: 50,000+
```

**Flow**:
1. Search repos with `topic:saas` — get `homepage` field (the actual product URL)
2. Filter: `homepage` must not be null and not be a GitHub URL itself
3. Deduplicator → new only → AI Extractor on `homepage` URL
4. Use repo `owner.login` to look up GitHub profile email

**File**: `server/utils/discovery/crawlers/github.ts`

---

### Source 4: SaaSHub (FREE API)

**How it works**: Public REST API

```
Schedule: Weekly (Tuesday 3am)
Endpoint: https://api.saashub.com/v1/products?page=1&per_page=50
Auth: None (or optional API key for higher limits)
Rate limit: ~1 req/2sec
Data: name, website, category, description, logo_url, pricing_type
Est. apps: 8,000+
```

**Flow**:
1. Paginate through all SaaSHub products
2. Extract structured data directly (no AI needed — high quality source)
3. Confidence score = 85 (structured source, skip AI extraction if data complete)
4. Deduplicator → insert with `status='auto_approved'` if score ≥ 80

**File**: `server/utils/discovery/crawlers/saashub.ts`

---

### Source 5: Hacker News Show HN (FREE API)

**How it works**: Algolia HN Search API

```
Schedule: Daily (4am)
Endpoint: https://hn.algolia.com/api/v1/search?query=Show+HN&tags=story&hitsPerPage=100
Auth: None
Rate limit: generous
Filter: title starts with "Show HN:" and contains SaaS keywords
Est. apps: 10,000+ (historical), ~5-10 new per day
```

**Flow**:
1. Query Algolia for "Show HN:" posts from past 7 days
2. Extract `url` field from each story
3. Filter: skip GitHub repos, HN posts — keep external product sites
4. Deduplicator → new only → AI Extractor
5. Note: `author` field = HN username → can find email via GitHub linked profile

**File**: `server/utils/discovery/crawlers/hackernews.ts`

---

### Source 6: IndieHackers (SCRAPE)

**How it works**: HTML scraping of product listings

```
Schedule: Weekly (Wednesday 3am)
URL: https://www.indiehackers.com/products?sortBy=revenue&revenueVerified=true
Method: fetch HTML → parse product cards
Rate limit: 1 req/3sec (polite scraping)
Est. apps: 20,000+
```

**Flow**:
1. Fetch paginated HTML from IndieHackers `/products`
2. Parse: product name, URL, founder username, revenue range
3. Deduplicator → new → AI Extractor
4. IH products often have founder email on their profile page — scrape optionally

**File**: `server/utils/discovery/crawlers/indiehackers.ts`

---

### Source 7: Reddit r/SaaS + r/microsaas (FREE API)

**How it works**: Reddit OAuth API

```
Schedule: Daily (5am)
Subreddits: r/SaaS, r/microsaas, r/startups, r/indiebusiness
Endpoint: https://oauth.reddit.com/r/SaaS/new.json?limit=100
Auth: client_credentials (REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET)
Rate limit: 60 req/min
Filter: posts with external URL (not self-posts), flair = "Launch"
```

**Flow**:
1. Authenticate with Reddit OAuth (`grant_type=client_credentials`)
2. Fetch `/new` and `/hot` from target subreddits
3. Extract `url` from posts where `is_self=false`
4. Filter: URL must look like a SaaS product (not news/article links)
5. Deduplicator → new → AI Extractor

**File**: `server/utils/discovery/crawlers/reddit.ts`

---

### Source 8: Zapier App Directory (SCRAPE)

**How it works**: Zapier's public app listing

```
Schedule: Monthly (1st of month, 3am)
URL: https://zapier.com/apps
Method: fetch + parse app cards
Est. apps: 5,000+
Data quality: Very high (Zapier vets all integrations)
```

**Flow**:
1. Fetch Zapier apps listing HTML or use their public JSON API
2. Each app has `website`, `name`, `category`, `logo`
3. Score = 90 (Zapier-vetted = very high quality) → `auto_approved`
4. Deduplicator → insert directly as `auto_approved`

**File**: `server/utils/discovery/crawlers/zapier.ts`

---

### Source 9: Atlassian Marketplace (FREE API)

**How it works**: Official REST API

```
Schedule: Monthly
Endpoint: https://marketplace.atlassian.com/rest/2/addons?offset=0&limit=50
Auth: None required
Data: name, summary, website, logo, category, vendorName
Est. apps: 4,000+
```

**Flow**:
1. Paginate through all marketplace listings
2. Extract `distributionStatus=PUBLIC` apps only
3. Use `links.homepage.href` as the `website_url`
4. Score = 88 (Atlassian-vetted) → `auto_approved`

**File**: `server/utils/discovery/crawlers/atlassian.ts`

---

### Source 10: AppSumo (SCRAPE)

**How it works**: HTML scraping

```
Schedule: Weekly (Thursday 3am)
URL: https://appsumo.com/browse/
Method: fetch HTML → parse deal cards
Est. apps: 3,000+ (lifetime deals = active SaaS)
Data: name, URL, short description, deal price, category
```

**Flow**:
1. Scrape AppSumo browse page (paginated)
2. Extract deal URL → follow redirect to actual product site
3. Deduplicator → new → AI Extractor on product site
4. AppSumo apps have owner contact via their deal page — extract if available

**File**: `server/utils/discovery/crawlers/appsumo.ts`

---

### Source 11: Crunchbase (PAID API — Optional Tier 2)

**How it works**: Crunchbase Basic API

```
Schedule: Monthly
Endpoint: https://api.crunchbase.com/api/v4/searches/organizations
Auth: user_key (CRUNCHBASE_API_KEY)
Cost: $29-99/month
Filter: category_groups=[saas], founded_on >= 2015
Est. apps: 80,000+
```

**Flow**:
1. POST search with filter `{"field_id":"category_groups","operator_id":"includes","values":["saas"]}`
2. Extract `website_url`, `short_description`, `founded_on`, `num_employees_enum`
3. High data quality → score = 75 → `needs_review`
4. Also get `contact_email` if available from Crunchbase

**File**: `server/utils/discovery/crawlers/crunchbase.ts`

---

### Source 12: LinkedIn via Proxycurl (PAID — Enrichment Only)

**How it works**: Proxycurl API enriches existing queue items

```
When to run: After admin approves a discovery_queue item
Endpoint: https://nubela.co/proxycurl/api/linkedin/company
Auth: PROXYCURL_API_KEY
Cost: ~$0.005/lookup
Use case: Find founder email, company size, LinkedIn URL
```

**Flow** (runs AFTER approval, not during crawl):
1. Admin approves item in queue
2. Enrichment job fires: take `website_url` → look up LinkedIn company
3. Extract `hq_location`, `company_size`, `founded_year`, `linkedin_url`
4. Look up CEO/Founder from company employees list
5. Get founder's `personal_emails[]` from Proxycurl person endpoint
6. Save `founder_email` to `discovery_queue` row
7. Trigger outreach mailer

**File**: `server/utils/discovery/enrichment/proxycurl.ts`

---

## Phase 3 — Deduplication Layer

**File**: `server/utils/discovery/deduplicator.ts`

**Logic**:
```
Input URL: https://www.notion.so/product/ai
↓
Normalize domain: notion.so
↓
SELECT id FROM discovery_queue WHERE website_url LIKE '%notion.so%'
↓
If found → skip (return 'duplicate')
If not  → proceed to AI Extractor
```

Also deduplicate against existing `app_listings` table (don't re-discover already listed apps).

---

## Phase 4 — AI Extractor (Already Built)

**File**: `server/utils/ai-extractor.ts` ✅

**What it does**:
1. `fetchPageText(url)` — fetches HTML, strips to readable text (meta, OG tags, body text, JSON-LD)
2. `extractWithAI(text, url)` — calls OpenAI GPT-4o with structured prompt → returns `ExtractedListing`
3. `computeScore(confidence)` — averages field confidence scores → 0-100
4. `routeByScore(score)` → `auto_approved` (≥80) | `needs_review` (50-79) | `rejected` (<50)

**Cost estimate**: ~$0.002 per URL (GPT-4o mini) or ~$0.01 per URL (GPT-4o)

---

## Phase 5 — Admin Review Dashboard

**Already partially built**: `/admin/discovery` route exists.

**Queue item statuses**:

| Status | Meaning | Next action |
|--------|---------|-------------|
| `pending` | Crawled, not yet extracted | Run AI extractor |
| `needs_review` | Score 50-79, needs human eye | Admin approve/reject |
| `auto_approved` | Score ≥80, safe to proceed | Auto-send outreach |
| `approved` | Admin manually approved | Send outreach email |
| `rejected` | Admin rejected | Done |
| `outreached` | Claim email sent | Wait for response |
| `claimed` | Company clicked magic link | Listing in draft |
| `live` | Listing published | Done |

**Admin actions needed**:
- View queue filtered by status
- Preview extracted data + link to actual site
- One-click Approve → triggers outreach email
- One-click Reject → with reason
- Bulk approve high-confidence items

---

## Phase 6 — Outreach Email (Claim Flow)

**File**: `server/utils/discovery/outreach.ts`

### Step 6.1 — Generate Magic Link

```
1. Generate claim_token = crypto.randomUUID()
2. Set claim_token_exp = now + 30 days
3. Save to discovery_queue row
4. Magic link = https://yourdomain.com/claim/{claim_token}
```

### Step 6.2 — Send Outreach Email

**Email template** (sent to founder_email):

```
Subject: We found [AppName] — claim your free listing on SaasWorld

Hi [Founder Name],

We discovered [AppName] and think it's a great fit for SaasWorld —
the marketplace where 50,000+ buyers find SaaS tools.

We've already created a draft listing for you. Click below to claim it,
review the details, and go live for free:

[Claim Your Listing →]  (magic link, expires in 30 days)

What happens next:
✓ Log in or create a free account
✓ Review & edit your auto-generated listing
✓ Publish — reach buyers actively searching for tools like yours

No credit card. No obligation. Takes < 5 minutes.

— The SaasWorld Team
```

### Step 6.3 — Claim Page

**Page**: `pages/claim/[token].vue`

Flow when company clicks magic link:
1. Page loads → `GET /api/claim/{token}` → validate token exists + not expired
2. If valid: show preview of the listing + login/signup form
3. On submit → `POST /api/claim/{token}` with auth credentials
4. Server: create vendor account (or attach to existing), create `app_listings` row from `extracted_data`
5. Set `discovery_queue.status = 'claimed'`, `listing_id = new listing id`
6. Redirect to vendor dashboard to complete/publish listing
7. Admin gets notified → final review → mark `status = 'live'`

---

## Phase 7 — Scheduler (Nitro Task)

**File**: `server/tasks/discovery-agent.ts`

```
Cron schedule:
- Daily   (3am UTC): Product Hunt, Hacker News, Reddit
- Weekly  (Sunday):  YC, GitHub, IndieHackers, SaaSHub
- Monthly (1st):     Zapier, Atlassian, Shopify, AppSumo, Crunchbase
```

Nitro scheduled tasks are configured in `nuxt.config.ts`:

```ts
// nuxt.config.ts — add inside nitro config
nitro: {
  scheduledTasks: {
    '0 3 * * *':   ['discovery:daily'],   // daily sources
    '0 3 * * 0':   ['discovery:weekly'],  // weekly sources
    '0 3 1 * *':   ['discovery:monthly'], // monthly sources
  }
}
```

---

## Phase 8 — End-to-End Data Flow Summary

```
Day 1 (Setup)
├── Add env vars (API keys)
├── Run DB migration (agent_runs, outreach_emails tables)
└── Deploy crawler files

Day 2+ (Running)
├── [3am UTC Daily]
│   ├── ProductHunt crawler → 50 new URLs
│   ├── HackerNews crawler → 10 new URLs
│   └── Reddit crawler → 20 new URLs
│       └── Each URL → Deduplicator → AI Extractor → Queue
│
├── [3am UTC Sunday]
│   ├── YC crawler → 200 new URLs
│   ├── GitHub crawler → 100 new URLs
│   └── IndieHackers crawler → 50 new URLs
│
├── [Admin Dashboard — ongoing]
│   ├── auto_approved items → outreach email auto-sent
│   ├── needs_review items → admin reviews manually
│   └── rejected items → logged with reason
│
├── [Outreach emails]
│   ├── Sent to founder_email with magic link
│   └── Tracked in outreach_emails table
│
└── [Company clicks magic link]
    ├── Claim page → login/signup
    ├── Review extracted listing
    └── Listing goes live after admin final review
```

---

## Build Order (Recommended)

| Step | What to build | Files | Est. effort |
|------|--------------|-------|-------------|
| 1 | DB migration (new tables) | `server/utils/database.ts` | 1 hour |
| 2 | YC crawler | `crawlers/yc.ts` | 2 hours |
| 3 | Product Hunt crawler | `crawlers/producthunt.ts` | 2 hours |
| 4 | GitHub crawler | `crawlers/github.ts` | 2 hours |
| 5 | Deduplicator utility | `deduplicator.ts` | 1 hour |
| 6 | Nitro scheduler task | `tasks/discovery-agent.ts` | 2 hours |
| 7 | Admin UI improvements | `pages/admin/discovery/` | 3 hours |
| 8 | Outreach email + magic link | `outreach.ts`, `claimToken.ts` | 3 hours |
| 9 | Claim page (vendor side) | `pages/claim/[token].vue` | 3 hours |
| 10 | Proxycurl enrichment | `enrichment/proxycurl.ts` | 2 hours |
| 11 | Remaining crawlers (8 more) | `crawlers/*.ts` | 1-2hr each |

**Total estimated effort**: ~25-35 hours of development

---

## Quick Start Commands

```bash
# Test YC crawler manually (once built)
curl -X POST http://localhost:3002/api/admin/discovery/trigger \
  -H "Content-Type: application/json" \
  -d '{"source": "yc", "limit": 10}'

# Check discovery queue
curl http://localhost:3002/api/admin/discovery/queue?status=needs_review

# Manually trigger outreach for approved item
curl -X POST http://localhost:3002/api/admin/discovery/outreach \
  -H "Content-Type: application/json" \
  -d '{"queue_item_id": "dsc_xyz123"}'
```
