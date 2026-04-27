# moonmart.ai — AI-Powered Database Architecture

> **Current state**: Single SQLite file (`better-sqlite3`), no ORM, manual `ALTER TABLE` migrations, JSON stored as raw TEXT, no caching, no vector search, no analytics separation, sessions in DB. This works for 0-100 users. It collapses at 1,000+.

---

## The Core Problem With the Current Setup

| Problem | Impact | Symptom |
|---------|--------|---------|
| SQLite single-writer lock | One write blocks all others | Slow vendor dashboard under load |
| Sessions in SQLite | Can't run 2 server instances | Horizontal scaling impossible |
| JSON stored as TEXT | Can't query inside JSON | No `WHERE tags CONTAINS 'crm'` |
| No FTS (full-text search) | LIKE queries kill performance | Marketplace search degrades at 10K apps |
| Manual ALTER TABLE migrations | Brittle, no rollback | Schema change = fear |
| OLTP + Analytics in one DB | Analytics queries lock the app | Buyer intent reports slow everything |
| No connection pooling | Crashes under concurrent load | 503s in production |
| No vector search | Keyword-only matching | AI match is doing expensive GPT calls instead of cheap vector lookup |
| No caching layer | Every page hits DB | TTFB > 2s |
| `review_synthesis_cache` in SQLite | Single node, lost on restart | Cache miss = OpenAI bill spike |

---

## The Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        moonmart.ai                              │
│                     Nuxt 3 / Nitro                              │
└────────────┬───────────┬──────────────┬───────────┬────────────┘
             │           │              │           │
     ┌───────▼──┐  ┌─────▼──────┐ ┌────▼────┐ ┌───▼──────────┐
     │  Neon    │  │  Upstash   │ │ Qdrant  │ │  Tinybird    │
     │ Postgres │  │   Redis    │ │ Vectors │ │  ClickHouse  │
     │ (+ pgvec)│  │  (Cache +  │ │(Search +│ │  (Analytics) │
     │  [OLTP]  │  │  Sessions) │ │ AI Match│ │   [OLAP]     │
     └──────────┘  └────────────┘ └─────────┘ └──────────────┘
             │           │              │           │
     ┌───────▼───────────▼──────────────▼───────────▼──────────┐
     │              Drizzle ORM (TypeScript-first)              │
     │        Type-safe queries · Auto-migrations · AI-readable │
     └─────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Primary Database: Neon Serverless Postgres

### Why Neon Over Everything Else

| Option | Verdict | Reason |
|--------|---------|--------|
| **Neon** ✅ | **Best choice** | Serverless Postgres, branching, pgvector built-in, scales to 0 |
| Turso | Good alt | SQLite-compatible (zero query change), but no pgvector |
| Supabase | Full platform | Great but opinionated — harder to migrate away from |
| PlanetScale | MySQL only | Schema changes need deploy requests, no vector support |
| Railway Postgres | Simple | No branching, no scale-to-zero |
| CockroachDB | Overkill | Distributed SQL for global apps — too complex for now |

### What Neon Gives moonmart.ai

**1. Branch-Per-Feature-Branch (DB branching)**

Every pull request gets its own database branch — a full copy of production schema + a subset of data. Zero cost (branches are Copy-on-Write at block level).

```bash
# In CI/CD, auto-create branch per PR
neon branches create --name "pr-142-vs-pages" --parent main
# Run migrations on branch
# Test → merge → delete branch automatically
```

This means AI agents can safely test schema changes without touching production.

**2. Scale to Zero**

Neon suspends compute when idle (< 5 minutes of inactivity). moonmart.ai pays $0 at 3 AM.
Wakes in ~500ms on first request. Perfect for a marketplace that has peak hours.

**3. pgvector Built-In**

No separate vector DB needed for core use cases:
```sql
-- Add to app_listings
ALTER TABLE app_listings ADD COLUMN embedding vector(1536);

-- Semantic search (replace your current AI match GPT calls)
SELECT id, name, short_description,
       1 - (embedding <=> $1) AS similarity
FROM app_listings
WHERE status = 'published'
ORDER BY embedding <=> $1
LIMIT 10;
```

**4. JSONB Instead of TEXT JSON**

Your current schema stores `tags`, `key_features`, `integrations`, `screenshots`, `pricing_tiers`, `metadata` all as TEXT. Postgres JSONB makes these queryable:

```sql
-- Current (impossible in SQLite TEXT): find all apps with Salesforce integration
SELECT * FROM app_listings
WHERE integrations @> '["Salesforce"]';

-- Find apps tagged 'crm' AND 'free'
SELECT * FROM app_listings
WHERE tags @> '["crm"]' AND pricing_type = 'free';
```

**5. Full-Text Search Built-In (tsvector)**

```sql
-- Add FTS column
ALTER TABLE app_listings
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', name), 'A') ||
  setweight(to_tsvector('english', short_description), 'B') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'C')
) STORED;

CREATE INDEX idx_apps_fts ON app_listings USING GIN(search_vector);

-- Search query (replaces your current LIKE '%query%')
SELECT *, ts_rank(search_vector, query) AS rank
FROM app_listings, websearch_to_tsquery('english', $1) query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

### Migration From SQLite: 2-Day Job

```typescript
// server/utils/database.ts — BEFORE (current)
import Database from 'better-sqlite3'
const db = new Database('./data/saasworld.db')

// server/utils/database.ts — AFTER
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)
// All queries switch from db.prepare().get() to await sql`...`
```

The query syntax change is the main effort. Drizzle ORM (Layer 3 below) makes this automatic.

**Cost**: Free tier covers moonmart.ai until ~50,000 MAU. Then ~$19/month.

---

## Layer 2 — Caching & Real-Time: Upstash Redis

### Replace 5 Things With One Service

| Current (SQLite) | Upstash Redis Replacement |
|-----------------|--------------------------|
| `sessions` table | Redis session store (TTL built-in) |
| `review_synthesis_cache` table | Redis hash with 7-day TTL |
| `password_reset_tokens` table | Redis key with 1-hour TTL + auto-expiry |
| In-memory rate limiting | Redis counter (works across multiple instances) |
| Hot app listings (no cache) | Redis cache, 5-minute TTL |

### Why Upstash Specifically

- **Serverless**: Per-request pricing, $0 at idle
- **Edge-compatible**: Works inside Cloudflare Workers, Vercel Edge, Nitro edge routes
- **HTTP-based**: No persistent connection needed (SQLite's weakness)
- **Built-in TTL**: No cron job needed to clean expired sessions/tokens

### Implementation

```typescript
// server/utils/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Session storage (replaces sessions table)
export async function createSession(userId: string, sessionId: string) {
  await redis.setex(`session:${sessionId}`, 60 * 60 * 24 * 14, userId) // 14 days
}

export async function getSession(sessionId: string) {
  return redis.get<string>(`session:${sessionId}`)
}

// Review synthesis cache (replaces review_synthesis_cache table)
export async function getCachedSynthesis(appId: string) {
  return redis.get<ReviewSynthesis>(`synthesis:${appId}`)
}

export async function setCachedSynthesis(appId: string, data: ReviewSynthesis) {
  await redis.setex(`synthesis:${appId}`, 60 * 60 * 24 * 7, data) // 7 days
}

// Rate limiting (replaces in-memory Map — doesn't work multi-instance)
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const current = await redis.incr(`rl:${key}`)
  if (current === 1) await redis.expire(`rl:${key}`, windowSeconds)
  return current <= limit
}

// Hot data cache — app listings homepage
export async function getCachedApps(cacheKey: string) {
  return redis.get<AppListing[]>(`apps:${cacheKey}`)
}
```

**Pub/Sub for Real-Time Vendor Notifications:**
```typescript
// When a buyer views an app — notify vendor in real-time
await redis.publish('vendor-signals', JSON.stringify({
  vendorId,
  appId,
  eventType: 'page_view',
  signalStrength: 'warm'
}))

// Vendor dashboard subscribes via SSE endpoint
// GET /api/vendor/signals/stream → Server-Sent Events
```

**Cost**: Free tier = 10,000 req/day. $10/month gets 1M req/day.

---

## Layer 3 — ORM: Drizzle (TypeScript-First, AI-Readable)

### Why Drizzle Is the Most AI-Maintainable ORM

| ORM | AI Maintainability | Why |
|-----|-------------------|-----|
| **Drizzle** ✅ | **Excellent** | Schema = TypeScript, no DSL, AI reads it like code |
| Prisma | Good | Schema is `.prisma` DSL — AI understands but can't refactor like TS |
| TypeORM | Fair | Decorator-heavy, verbose, harder for AI to reason about |
| Raw SQL | Poor | No type safety, AI makes wrong assumptions about column types |
| Sequelize | Poor | Class-based, configuration-heavy |

Drizzle schema IS the migration. No separate migration files to keep in sync:

```typescript
// server/db/schema.ts — Drizzle schema (replaces the 600-line createSchema function)
import { pgTable, text, integer, real, boolean, timestamp, jsonb, vector, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name').notNull(),
  companyName: text('company_name'),
  companySize: text('company_size'),
  jobTitle: text('job_title'),
  role: text('role', { enum: ['buyer', 'vendor', 'admin'] }).notNull().default('buyer'),
  plan: text('plan').notNull().default('free'),
  emailVerified: boolean('email_verified').notNull().default(false),
  stripeCustomerId: text('stripe_customer_id'),
  avatarUrl: text('avatar_url'),
  locale: text('locale').default('en'),
  timezone: text('timezone').default('UTC'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const appListings = pgTable('app_listings', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull().references(() => vendorProfiles.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description').notNull(),
  category: text('category').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),          // JSONB not TEXT
  keyFeatures: jsonb('key_features').$type<string[]>().default([]),
  integrations: jsonb('integrations').$type<string[]>().default([]),
  screenshots: jsonb('screenshots').$type<string[]>().default([]),
  pricingTiers: jsonb('pricing_tiers').$type<PricingTier[]>().default([]),
  pricingType: text('pricing_type', { enum: ['free', 'trial', 'paid', 'contact'] }).notNull(),
  pricingValue: real('pricing_value'),
  rating: real('rating').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  status: text('status', { enum: ['draft', 'submitted', 'published'] }).notNull().default('draft'),
  embedding: vector('embedding', { dimensions: 1536 }),       // pgvector
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('idx_apps_category').on(table.category),
  statusIdx: index('idx_apps_status').on(table.status),
  embeddingIdx: index('idx_apps_embedding').using('hnsw', table.embedding.op('vector_cosine_ops')),
}))

// Relations (replaces manual JOINs)
export const appListingsRelations = relations(appListings, ({ one, many }) => ({
  vendor: one(vendorProfiles, { fields: [appListings.vendorId], references: [vendorProfiles.id] }),
  reviews: many(reviews),
}))
```

**Auto-Migration — No More Manual ALTER TABLE:**
```bash
# Generate migration from schema diff
npx drizzle-kit generate

# Apply to Neon branch (safe — never touches prod directly)
npx drizzle-kit migrate

# AI agent runs this in CI: zero human needed for schema updates
```

**Type-Safe Queries — AI Can't Get Column Names Wrong:**
```typescript
// server/api/apps/index.get.ts
import { db } from '~/server/db'
import { appListings } from '~/server/db/schema'
import { eq, and, ilike, desc } from 'drizzle-orm'

// TypeScript catches wrong column names at compile time
const apps = await db.query.appListings.findMany({
  where: and(
    eq(appListings.status, 'published'),
    ilike(appListings.name, `%${query}%`)
  ),
  with: { vendor: true },   // auto-JOIN, no manual SQL
  orderBy: desc(appListings.rating),
  limit: 20,
  offset: (page - 1) * 20,
})
```

**Cost**: Free (it's just a library).

---

## Layer 4 — Vector Search: Qdrant Cloud

### When to Use Qdrant vs pgvector

| Use Case | Use pgvector | Use Qdrant |
|----------|-------------|-----------|
| "Find similar apps" (cosine similarity) | ✅ Simple, built-in | Overkill |
| AI match (semantic search + filters) | ✅ Good enough | Better at 100K+ apps |
| Multi-vector search (name + reviews + tags separately) | ❌ Hard | ✅ Native |
| Recommendation engine at scale | ❌ Slow past 50K rows | ✅ Purpose-built |
| Hybrid search (vector + keyword) | Possible but manual | ✅ Native |

**Recommendation**: Start with pgvector (free, already in Neon). Add Qdrant when you hit 50,000 app listings or need hybrid search.

### The AI Match Pipeline (Replace Expensive GPT Calls)

**Current flow** (expensive):
```
User describes need → GPT-4o reads all apps → Returns matches
Cost: ~$0.05 per match session
```

**New flow** (fast + cheap):
```
User describes need
  → embed query with text-embedding-3-small ($0.000002)
  → vector similarity search in pgvector (<50ms)
  → return top 10 matches
Cost: ~$0.0001 per match session (500x cheaper)
```

```typescript
// server/api/ai/match.post.ts — new implementation
export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)

  // Step 1: Embed the user's query
  const { data } = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = data[0].embedding

  // Step 2: Vector similarity search (no GPT needed for matching)
  const matches = await db.execute(sql`
    SELECT id, name, short_description, category, rating, pricing_type,
           1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS score
    FROM app_listings
    WHERE status = 'published'
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT 10
  `)

  // Step 3: Only use GPT for the explanation (not the matching)
  const explanation = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Explain in 2 sentences why these apps match the user need.' },
      { role: 'user', content: `Need: ${query}\nApps: ${matches.rows.map(a => a.name).join(', ')}` }
    ],
    max_tokens: 150,
  })

  return { matches: matches.rows, explanation: explanation.choices[0].message.content }
})
```

### Embedding Pipeline — Auto-Update on Listing Change

```typescript
// server/utils/embeddings.ts
export async function generateAppEmbedding(app: AppListing) {
  const text = [
    app.name,
    app.shortDescription,
    app.category,
    app.tags?.join(' '),
    app.keyFeatures?.join(' '),
    app.targetAudience,
  ].filter(Boolean).join('\n')

  const { data } = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  await db.update(appListings)
    .set({ embedding: data[0].embedding })
    .where(eq(appListings.id, app.id))
}

// Trigger on create/update
// server/api/vendor/apps/index.post.ts — after saving:
await generateAppEmbedding(newApp)
```

---

## Layer 5 — Analytics: Tinybird (ClickHouse-as-a-Service)

### Separate OLAP From OLTP

Your `buyer_intent_events` table is an analytics workload living in an OLTP database. At scale:
- `SELECT COUNT(*) FROM buyer_intent_events WHERE vendor_id = ?` scans millions of rows
- Locks the main app DB during vendor dashboard loads
- Can't do windowed aggregations efficiently

**Tinybird = ClickHouse behind an API**. Events go in via streaming, SQL analytics come out as HTTP endpoints.

```typescript
// server/utils/analytics.ts
export async function trackEvent(event: BuyerIntentEvent) {
  // Write to Tinybird (async, non-blocking — never slows down main request)
  fetch('https://api.tinybird.co/v0/events?name=buyer_intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}` },
    body: JSON.stringify(event),
  }).catch(() => {}) // fire-and-forget, never blocks

  // Also write to Neon for relational queries (vendor notification lookup)
  await db.insert(buyerIntentEvents).values(event)
}
```

**Pre-built Tinybird Pipes (analytics endpoints moonmart.ai needs):**

```sql
-- Pipe 1: vendor_intent_summary
-- "Show me my top interested companies this week"
SELECT
  user_company,
  countIf(event_type = 'pricing_view') AS pricing_views,
  countIf(event_type = 'demo_request') AS demo_requests,
  max(created_at) AS last_seen
FROM buyer_intent
WHERE vendor_id = {{ String(vendor_id) }}
  AND created_at > now() - interval {{ Int32(days, 7) }} day
GROUP BY user_company
ORDER BY pricing_views DESC

-- Pipe 2: app_trend_score
-- "Is this app trending this week vs last week?"
SELECT
  app_id,
  countIf(toStartOfWeek(created_at) = toStartOfWeek(now())) AS this_week,
  countIf(toStartOfWeek(created_at) = toStartOfWeek(now() - interval 1 week)) AS last_week,
  this_week / (last_week + 1) AS trend_ratio
FROM buyer_intent
GROUP BY app_id
ORDER BY trend_ratio DESC
```

Each Pipe becomes a REST endpoint: `GET https://api.tinybird.co/v0/pipes/vendor_intent_summary.json?vendor_id=xyz`

The AI agent (or admin dashboard) queries these directly — no DB load on Neon.

**Cost**: Free tier = 1,000 req/day, 1GB storage. $0 to start.

---

## Layer 6 — Full-Text Search: Meilisearch

### Why a Dedicated Search Engine

Postgres FTS (Layer 1) is good. Meilisearch is **instant** and **typo-tolerant**.

| Feature | Postgres tsvector | Meilisearch |
|---------|------------------|-------------|
| Typo tolerance | ❌ None | ✅ Built-in (fuzziness) |
| Faceted search | Complex | ✅ Native (filter by category, price) |
| Search-as-you-type | Slow (~200ms) | Fast (~5ms) |
| Ranking tuning | SQL only | Config file |
| Highlighting | Manual | ✅ Built-in |
| Synonyms | Manual | ✅ Config |

**Meilisearch Cloud** (managed, EU/US hosted) or **self-hosted on a $6/mo VPS**.

```typescript
// server/utils/search.ts
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({ host: process.env.MEILISEARCH_URL!, apiKey: process.env.MEILISEARCH_KEY! })
const index = client.index('apps')

// Configure once
await index.updateSettings({
  searchableAttributes: ['name', 'short_description', 'category', 'tags'],
  filterableAttributes: ['category', 'pricing_type', 'rating', 'featured', 'status'],
  sortableAttributes: ['rating', 'review_count', 'created_at'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  synonyms: {
    'crm': ['customer relationship management', 'sales tool'],
    'pm': ['project management'],
  }
})

// Search endpoint
export async function searchApps(query: string, filters: SearchFilters) {
  return index.search(query, {
    filter: [
      `status = 'published'`,
      filters.category ? `category = '${filters.category}'` : null,
      filters.pricing ? `pricing_type = '${filters.pricing}'` : null,
      filters.minRating ? `rating >= ${filters.minRating}` : null,
    ].filter(Boolean),
    sort: filters.sort ? [`${filters.sort}:desc`] : undefined,
    attributesToHighlight: ['name', 'short_description'],
    limit: 20,
    offset: (filters.page - 1) * 20,
  })
}
```

**Sync on listing update (keep Meilisearch in sync with Neon):**
```typescript
// After saving/updating an app listing
await index.addDocuments([{
  id: app.id,
  name: app.name,
  short_description: app.shortDescription,
  category: app.category,
  tags: app.tags,
  pricing_type: app.pricingType,
  rating: app.rating,
  status: app.status,
}])
```

**Cost**: Meilisearch Cloud free tier = 100K docs, 10K req/month. Self-host on $6 VPS for unlimited.

---

## Layer 7 — AI-Maintainable Schema Design

### The 5 Rules That Make the DB Maintainable by AI

**Rule 1: Soft Deletes on Every Table**

Never `DELETE` a row. AI agents make mistakes — recovery must be possible.

```sql
-- Add to every table
ALTER TABLE app_listings ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE reviews ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- Drizzle: filter deleted in all queries automatically
const activeApps = db.select().from(appListings)
  .where(isNull(appListings.deletedAt))
```

**Rule 2: Audit Trail — Every Change Logged**

```sql
CREATE TABLE audit_log (
  id          TEXT PRIMARY KEY,
  table_name  TEXT NOT NULL,
  row_id      TEXT NOT NULL,
  operation   TEXT NOT NULL,    -- INSERT | UPDATE | DELETE
  old_data    JSONB,
  new_data    JSONB,
  changed_by  TEXT,             -- user_id or 'system' or 'ai-agent'
  changed_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_table_row ON audit_log(table_name, row_id);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at DESC);
```

AI agents and background jobs write `changed_by: 'ai-agent:discovery'`. When something breaks, you query: `SELECT * FROM audit_log WHERE changed_by LIKE 'ai-agent%' ORDER BY changed_at DESC LIMIT 50`.

**Rule 3: Schema Comments = AI Instructions**

```sql
-- Postgres supports COMMENT ON COLUMN — AI tools read these
COMMENT ON COLUMN app_listings.embedding IS
  'OpenAI text-embedding-3-small (1536 dims). Regenerate when name/description/category changes. Use cosine similarity for semantic search.';

COMMENT ON COLUMN app_listings.confidence_score IS
  'AI extraction confidence 0-1. Above 0.85 = auto-approve to discovery_queue. Below 0.5 = discard.';

COMMENT ON COLUMN reviews.authenticity_score IS
  'AI-assigned spam probability 0-1. Above 0.7 = flag for manual review. Never auto-reject.';
```

When an AI agent is asked "why does the discovery queue auto-approve some items?", it reads the column comment and knows the answer without human explanation.

**Rule 4: Enum Tables Over String Enums**

```sql
-- Instead of CHECK (status IN ('draft', 'published', 'rejected'))
-- Use a reference table — AI can discover valid values by querying
CREATE TABLE listing_statuses (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  allows_transition_to TEXT[] -- valid next states
);

INSERT INTO listing_statuses VALUES
  ('draft', 'Draft', 'Vendor is still editing', ARRAY['submitted']),
  ('submitted', 'Submitted', 'Awaiting admin review', ARRAY['published', 'rejected']),
  ('published', 'Published', 'Live on marketplace', ARRAY['draft']),
  ('rejected', 'Rejected', 'Admin rejected with reason', ARRAY['submitted']);
```

**Rule 5: Materialized Views for Expensive Queries**

```sql
-- The "trending apps" query runs on every homepage load
-- Make it a materialized view, refresh every 30 minutes
CREATE MATERIALIZED VIEW trending_apps AS
SELECT
  a.id, a.name, a.slug, a.category, a.rating, a.review_count,
  COUNT(b.id) AS intent_count_7d,
  COUNT(b.id)::float / NULLIF(a.review_count, 0) AS trend_score
FROM app_listings a
LEFT JOIN buyer_intent_events b ON b.app_id = a.id
  AND b.created_at > NOW() - INTERVAL '7 days'
WHERE a.status = 'published'
GROUP BY a.id
ORDER BY trend_score DESC
LIMIT 50;

-- Refresh on a schedule (or via pg_cron extension in Neon)
SELECT cron.schedule('refresh-trending', '*/30 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY trending_apps');
```

---

## Layer 8 — AI Agent Database Maintenance

### What AI Can Autonomously Maintain

| Task | Tool | How |
|------|------|-----|
| Schema migrations | Drizzle Kit + Neon Branching | AI edits schema.ts → `drizzle-kit generate` → apply to branch → test → merge |
| Slow query detection | `pg_stat_statements` | Neon console + Claude queries the view weekly |
| Dead index removal | `pg_stat_user_indexes` | AI removes indexes with 0 scans |
| Embedding regeneration | Cron job | Nightly: re-embed any listing updated in last 24h |
| Cache warming | Redis pipeline | On deploy: pre-cache top 100 apps |
| Synthesis expiry | Neon pg_cron | Auto-delete expired synthesis cache |
| Audit log cleanup | pg_cron | Archive audit_log rows older than 90 days to cold storage |
| Discovery queue processing | Cron + AI | Every hour: process pending items, auto-approve score > 0.85 |

### The AI Schema Agent Workflow

```
1. Claude Code reads server/db/schema.ts
2. User: "Add a waitlist table for new features"
3. Claude: edits schema.ts, runs `drizzle-kit generate`
4. Migration file created automatically (no hand-written SQL)
5. `neon branches create --name ai-schema-change-001`
6. Migration applied to branch, tested
7. PR created, branch merged
8. Neon branch auto-deleted
```

This is the loop. Schema changes become a TypeScript code review, not a SQL review. AI handles TypeScript far better than raw SQL migrations.

### Atlas for AI-Driven Schema Management (Advanced)

[Atlas](https://atlasgo.io/) is a schema-as-code tool that:
- Lints migrations for safety before applying (`atlas migrate lint`)
- Detects destructive changes (dropping columns, changing NOT NULL)
- Generates HCL/SQL from your schema
- Has a CI integration that blocks unsafe migrations in PRs

```yaml
# .github/workflows/db-check.yml
- name: Atlas Lint
  uses: ariga/atlas-action/migrate/lint@v1
  with:
    dir: 'file://server/db/migrations'
    dev-url: ${{ secrets.NEON_BRANCH_URL }}   # uses PR branch
```

An AI agent that generates migrations will have its output reviewed by Atlas before it touches any real database.

---

## Complete Migration Plan

### Week 1: Zero-Downtime SQLite → Neon

```
Day 1: Set up Neon project, get DATABASE_URL
Day 1: Install drizzle-orm, @neondatabase/serverless
Day 2: Convert database.ts schema to drizzle/schema.ts
Day 2: Run drizzle-kit push to create tables in Neon
Day 3: Write one-time migration script (SQLite → Neon data transfer)
Day 3: Switch DATABASE_URL in .env, test all API routes
Day 4: Deploy to production with feature flag (SQLite fallback)
Day 5: Remove SQLite dependency
```

### Week 2: Caching + Search

```
Day 1: Upstash Redis — migrate sessions table, rate limiters
Day 2: Replace review_synthesis_cache table with Redis
Day 3: Meilisearch — sync all published app listings
Day 4: Switch /api/apps search to Meilisearch
Day 5: Load test, verify cache hit rates
```

### Week 3: Vectors + Analytics

```
Day 1: Enable pgvector on Neon, add embedding column
Day 2: Backfill embeddings for all published apps (batch job)
Day 3: Replace /api/ai/match GPT-matching with vector search
Day 4: Tinybird — stream buyer_intent_events there
Day 5: Switch vendor dashboard analytics to Tinybird pipes
```

### Week 4: AI-Maintenance Architecture

```
Day 1: Add soft deletes to all tables
Day 2: Add audit_log table + triggers
Day 3: Add schema COMMENTs to all tables
Day 4: Set up Neon pg_cron jobs (trending refresh, synthesis expiry)
Day 5: Atlas CI integration for migration safety
```

---

## Cost Summary at Scale

| Service | Free Tier | Paid (at 10K MAU) |
|---------|-----------|-------------------|
| **Neon** (Postgres + pgvector) | 512MB, scale-to-zero | $19/mo (10GB) |
| **Upstash Redis** | 10K req/day | $10/mo (1M req/day) |
| **Meilisearch Cloud** | 100K docs | $30/mo (unlimited) |
| **Tinybird** | 1K req/day | $0 (free tier is enough early) |
| **Drizzle ORM** | Free | Free (library) |
| **Qdrant Cloud** | 1GB free | $25/mo (if needed at scale) |
| **Total** | **$0** | **~$84/mo** |

Compare to: AWS RDS Postgres = $180/mo minimum, no scale-to-zero, no branching.

---

## What This Architecture Unlocks

| Capability | Before | After |
|-----------|--------|-------|
| Concurrent write capacity | ~5 req/s (SQLite lock) | Unlimited (Neon + connection pooling) |
| Search speed | 200ms+ (LIKE queries) | 5ms (Meilisearch) |
| AI match cost | $0.05/session (GPT) | $0.0001/session (vector) |
| Schema change safety | "Hope it works" | Branched, linted, rollback-able |
| Horizontal scaling | ❌ Impossible (SQLite file) | ✅ Stateless (sessions in Redis) |
| Real-time vendor alerts | ❌ Polling | ✅ Redis Pub/Sub + SSE |
| Analytics performance | Locks OLTP DB | Isolated ClickHouse (Tinybird) |
| AI agent maintenance | Risky (raw SQL) | Safe (typed schema + branching) |
| Recovery from AI mistake | ❌ No audit trail | ✅ Full audit_log |
| Cache warm on deploy | ❌ None | ✅ Redis pipeline pre-warm |
