/**
 * Seed 15 news posts for the "From the Moonmart community" page.
 * 3 posts per type: product-update, feature, case-study, announcement, culture
 * Run: node scripts/seed-news.js
 */
const Database = require('better-sqlite3')
const db = new Database('.data/saasworld.db')

const LABS   = 'vendor_saasworld_labs'
const ADMIN  = 'vendor_saasworld_admin'

// Dates spread over the last 6 months, newest first
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const posts = [
  // ─── PRODUCT UPDATES ───────────────────────────────────────────────────────
  {
    id: 'news-001',
    vendor_id: LABS,
    app_id: 'demo-slack',
    post_type: 'product-update',
    title: 'Slack for Moonmart: Smarter Notifications, Zero Noise',
    slug: 'slack-smarter-notifications-zero-noise',
    excerpt: 'We rebuilt the Slack integration from the ground up — granular channel routing, digest mode, and AI-powered noise filters that only ping your team when it matters.',
    cover_image: null,
    featured: 1,
    view_count: 3840,
    upvote_count: 214,
    published_at: daysAgo(3),
    tags: ['slack', 'notifications', 'product-update', 'integrations'],
    body_markdown: `## What changed

The previous Slack integration sent every platform event to a single channel. If you had a busy marketplace, that meant hundreds of pings per day — most of which nobody read.

We fixed that.

### Granular channel routing

You can now map specific event types to different Slack channels:

- **#revenue** → new purchases, renewals, MRR milestones
- **#support** → buyer messages, refund requests
- **#product** → new reviews, feature requests, app approvals
- **#ops** → system alerts, API errors

### Digest mode

Instead of individual messages, opt into hourly or daily digests. Get a clean summary card at 9am with everything that happened overnight.

### AI noise filter

Our new AI classifier reads each event and scores its urgency (0–100). Set a threshold and only surface the things that actually need attention.

> "We went from 400 Slack pings a day to about 12 meaningful ones. The team actually reads them now." — Priya K., Head of Ops at Streamline Corp

### How to enable

1. Go to **Dashboard → Integrations → Slack**
2. Click **Configure routing**
3. Map your channels and set your digest preferences
4. Toggle AI noise filter on/off per channel

The update is live for all plans. No action required — existing integrations keep working exactly as before until you opt into the new routing.`,
  },
  {
    id: 'news-002',
    vendor_id: LABS,
    app_id: 'demo-hubspot',
    post_type: 'product-update',
    title: 'HubSpot Integration v2.0 — Bi-directional CRM Sync Is Here',
    slug: 'hubspot-integration-v2-bidirectional-crm-sync',
    excerpt: 'HubSpot contacts, deals, and companies now sync both ways in real time. Changes made in either platform reflect everywhere within seconds, with full conflict resolution built in.',
    cover_image: null,
    featured: 0,
    view_count: 2190,
    upvote_count: 167,
    published_at: daysAgo(9),
    tags: ['hubspot', 'crm', 'sync', 'product-update'],
    body_markdown: `## Bi-directional sync, finally

Version 1.0 of the HubSpot integration was read-only — Moonmart pulled data from HubSpot but never pushed back. That created duplicated work: update a deal in Moonmart, then manually update HubSpot.

Version 2.0 closes that loop entirely.

### What syncs, both ways

| Object | Moonmart → HubSpot | HubSpot → Moonmart |
|--------|--------------------|--------------------|
| Contacts | ✅ | ✅ |
| Companies | ✅ | ✅ |
| Deals | ✅ | ✅ |
| Activities | ✅ | read-only |

### Conflict resolution

When both systems update the same record simultaneously, we apply **last-write-wins** with a 30-second merge window. You can also set per-field source-of-truth preferences in settings.

### Real-time vs. batch

- **Real-time** (webhook-driven): contacts, deal stage changes
- **Batch** (every 15 min): companies, historical activities

### Migration from v1.0

Existing connections migrate automatically. Run a one-time backfill from **Settings → HubSpot → Sync history** to pull in any records created in HubSpot before today.`,
  },
  {
    id: 'news-003',
    vendor_id: LABS,
    app_id: 'demo-notion',
    post_type: 'product-update',
    title: 'Notion + Moonmart: Your Team Wiki Now Lives in Your Workflow',
    slug: 'notion-moonmart-team-wiki-workflow',
    excerpt: 'Embed Notion pages directly inside Moonmart workspaces, link docs to app listings, and let your team search across both platforms from one search bar.',
    cover_image: null,
    featured: 0,
    view_count: 1740,
    upvote_count: 129,
    published_at: daysAgo(16),
    tags: ['notion', 'documentation', 'workspace', 'product-update'],
    body_markdown: `## The problem we're solving

Your product docs live in Notion. Your listing lives in Moonmart. Your buyers end up with browser tabs open in both, copying text between them.

That's over now.

### Embedded Notion pages

Attach any Notion page to an app listing. Buyers see a live, read-only embed — always up to date, no manual copy-paste.

### Linked documentation

Map your Notion database to Moonmart's structured fields:

- Changelog entries → Moonmart product updates
- FAQ database → Moonmart Q&A section
- Release notes → version history tab

### Unified search

The global Moonmart search bar now indexes your connected Notion workspace. Type a query, get results from both your listing data and your team docs in one dropdown.

### Access control

Choose what's public and what's vendor-internal. Public pages show to buyers. Internal pages stay visible only to your team inside the Moonmart dashboard.

### Getting started

Connect Notion from **Dashboard → Integrations → Notion** and grant the Moonmart integration access to the workspaces you want to link.`,
  },

  // ─── FEATURES ──────────────────────────────────────────────────────────────
  {
    id: 'news-004',
    vendor_id: LABS,
    app_id: 'app-001',
    post_type: 'feature',
    title: 'AI Deal Scoring in SalesForce CRM — Ship Faster, Close More',
    slug: 'ai-deal-scoring-salesforce-crm',
    excerpt: 'Every deal in SalesForce CRM now gets a live AI score (0–100) based on engagement signals, buyer history, and market benchmarks. Your reps focus on deals that are actually going to close.',
    cover_image: null,
    featured: 0,
    view_count: 2870,
    upvote_count: 198,
    published_at: daysAgo(22),
    tags: ['ai', 'crm', 'sales', 'feature', 'salesforce'],
    body_markdown: `## Why deal scoring matters

Most CRMs tell you what happened. AI deal scoring tells you what's likely to happen next.

We trained our model on anonymised close/loss data from thousands of B2B SaaS deals to surface the signals that actually predict outcomes — not just activity volume.

### How the score works

The AI score (0–100) weighs:

- **Engagement depth** — how many decision-makers have interacted with your listing
- **Recency** — time since last meaningful buyer action
- **Buyer profile match** — how closely the buyer fits your ICP definition
- **Stage velocity** — how fast the deal is moving vs. your historical average
- **Risk flags** — inactivity streaks, competitor page visits, price-sensitivity signals

### Score tiers

| Score | Label | Recommended action |
|-------|-------|-------------------|
| 80–100 | 🟢 Hot | Follow up within 24h |
| 60–79 | 🟡 Warm | Schedule a call this week |
| 40–59 | 🟠 Lukewarm | Send a value-add resource |
| < 40 | 🔴 Cold | Re-evaluate or archive |

### Using it

Scores appear in the deals list, deal detail view, and the new **Pipeline health** dashboard widget. You can also filter and sort your entire pipeline by score with one click.

Available on **Growth** and **Enterprise** plans.`,
  },
  {
    id: 'news-005',
    vendor_id: LABS,
    app_id: 'demo-linear',
    post_type: 'feature',
    title: 'Linear Triage Mode: Crush Your Entire Backlog in One Session',
    slug: 'linear-triage-mode-crush-backlog',
    excerpt: 'The new Triage Mode in the Linear integration surfaces your highest-priority ungroomed issues one at a time. Assign, label, estimate, and move on — all from the keyboard.',
    cover_image: null,
    featured: 0,
    view_count: 1560,
    upvote_count: 143,
    published_at: daysAgo(29),
    tags: ['linear', 'productivity', 'feature', 'backlog', 'engineering'],
    body_markdown: `## The backlog problem

Every team has one: a Linear inbox with 300+ ungroomed issues. Nobody wants to touch it. It grows every sprint. Important bugs get buried.

Triage Mode fixes this by turning an overwhelming list into a focused, one-at-a-time flow.

### How it works

1. Open **Linear → Triage** in your Moonmart workspace
2. The system surfaces the oldest, unlabelled, unassigned issue
3. You make four quick decisions:
   - **Priority** (urgent / high / medium / low)
   - **Assignee**
   - **Estimate** (story points)
   - **Cycle** (current / next / backlog)
4. Hit **Next** — the issue is updated and the next one appears

### Keyboard-first

Everything is keyboard-driven:

- \`1–4\` → set priority
- \`A\` → assign to self
- \`E\` → open estimate picker
- \`Space\` → skip for now
- \`Enter\` → save and advance

### Session stats

At the end of a triage session you see a summary: issues triaged, time taken, average decisions per minute. Share it with your team as a quick win.

### Smart ordering

Issues are surfaced by a composite score that factors in age, number of upvotes from buyers, and whether the issue is blocking a milestone. You always tackle the highest-leverage items first.`,
  },
  {
    id: 'news-006',
    vendor_id: ADMIN,
    app_id: 'app-003',
    post_type: 'feature',
    title: 'Zapier Connect Gets Custom Webhooks — Automate Literally Anything',
    slug: 'zapier-connect-custom-webhooks',
    excerpt: 'Custom inbound and outbound webhooks are now first-class citizens in Zapier Connect. Trigger any Zap from a Moonmart event, or push any external signal into your Moonmart workflow.',
    cover_image: null,
    featured: 0,
    view_count: 2030,
    upvote_count: 176,
    published_at: daysAgo(35),
    tags: ['zapier', 'webhooks', 'automation', 'feature', 'no-code'],
    body_markdown: `## Custom webhooks are live

The original Zapier Connect integration shipped with a fixed list of triggers and actions. Powerful, but finite. You kept asking: *"Can I trigger a Zap when X happens?"* — and X was always something we hadn't anticipated.

Custom webhooks answer that permanently.

### Outbound webhooks (Moonmart → Zapier)

Register any HTTPS endpoint as a webhook destination. Choose which Moonmart events fire it:

- New buyer message
- App review submitted
- Trial started / expired
- Contract signed
- Custom field value changed

The payload is a clean JSON object. You control which fields are included via a simple field picker — no more sending data you don't need.

### Inbound webhooks (External → Moonmart)

Generate a unique webhook URL for your Moonmart workspace. Any POST to that URL can:

- Create a buyer record
- Trigger a workflow step
- Update a custom field
- Fire a notification to your team

### Security

All inbound webhooks are verified with HMAC-SHA256 signatures. You configure the shared secret in the dashboard. We reject any request that doesn't pass signature validation.

### Retry logic

Failed outbound deliveries are retried with exponential back-off (5s, 30s, 5m, 30m). After 4 failures the webhook is paused and you're notified in the dashboard.`,
  },

  // ─── CASE STUDIES ──────────────────────────────────────────────────────────
  {
    id: 'news-007',
    vendor_id: LABS,
    app_id: 'app-002',
    post_type: 'case-study',
    title: 'How a 12-Person Startup Cut Tool Sprawl by 60% with Asana Tasks',
    slug: 'startup-cut-tool-sprawl-asana-tasks',
    excerpt: 'Meridian Studio was juggling seven project tools across three teams. After migrating everything to Asana Tasks on Moonmart, they consolidated to two tools and saved $2,400/year.',
    cover_image: null,
    featured: 0,
    view_count: 3120,
    upvote_count: 241,
    published_at: daysAgo(42),
    tags: ['case-study', 'asana', 'productivity', 'startup', 'cost-saving'],
    body_markdown: `## The client

Meridian Studio is a 12-person product design consultancy. They work across four client streams simultaneously, each with its own deadlines, feedback cycles, and deliverables.

## The problem

By early 2025, Meridian was running:

- Trello (client A)
- Jira (client B — inherited from the client)
- Notion (internal docs + some task tracking)
- Linear (engineering sprints)
- Airtable (resource planning)
- Google Sheets (budget tracking)
- Slack (everything else, chaotically)

Nobody had a full picture of what the company was working on. Project managers were copying tasks between tools. Status meetings existed only to sync information that should have been automatic.

## The solution

Meridian moved everything — client work, internal projects, and resource allocation — onto **Asana Tasks via Moonmart**.

Key decisions:
- One Asana workspace per client engagement
- Cross-workspace reporting via Moonmart's unified dashboard
- Slack integration for async status updates (no more status meetings for routine updates)
- Moonmart's contract module replacing their ad-hoc Google Docs SOWs

## The results (after 90 days)

| Metric | Before | After |
|--------|--------|-------|
| Active tools | 7 | 3 (Asana, Slack, Figma) |
| Weekly status meetings | 4 × 45 min | 1 × 20 min |
| Tool spend/month | $410 | $208 |
| Missed deadlines (Q1) | 6 | 1 |

> "We stopped asking 'where's the task?' and started just doing the work. That's the whole game." — Aiko Nishida, Operations Lead, Meridian Studio

## Lessons learned

The migration took three weeks. The biggest friction was getting client B to accept that their Jira tickets would be mirrored into Asana rather than managed natively. A shared view with a read-only Jira sync solved it.`,
  },
  {
    id: 'news-008',
    vendor_id: LABS,
    app_id: 'demo-intercom',
    post_type: 'case-study',
    title: 'How TechNova Reduced Support Tickets by 40% Using Intercom on Moonmart',
    slug: 'technova-reduced-support-tickets-intercom',
    excerpt: 'TechNova had a 72-hour average first-response time and a growing support queue. Six weeks after deploying Intercom via Moonmart, first-response was under 4 hours and ticket volume dropped 40%.',
    cover_image: null,
    featured: 0,
    view_count: 2450,
    upvote_count: 187,
    published_at: daysAgo(50),
    tags: ['case-study', 'intercom', 'support', 'customer-success'],
    body_markdown: `## The client

TechNova builds a B2B invoicing platform with ~800 active business customers. Their support team of three was drowning.

## The situation before Intercom

- **72-hour average first-response time** — nearly three full business days
- **No in-app chat** — all support came through a generic email alias
- **Zero self-service** — no help centre, no proactive messaging
- **High churn in month 3** — customers who hadn't got value by week 12 were leaving quietly

The team knew the problem but didn't have capacity to build solutions. Every sprint got consumed by feature work.

## What they deployed

TechNova deployed **Intercom via Moonmart** in three phases over six weeks:

### Phase 1 (Week 1–2): Live chat + inbox
Replaced the email alias with Intercom's shared inbox. All messages — email, chat, and in-app — routed to one queue. First-response time dropped from 72h to 18h immediately.

### Phase 2 (Week 3–4): Help centre
Wrote 40 articles covering the top support queries (identified from six months of email threads). Added the help centre widget to the app. Deflection rate: 28% of sessions that opened the widget never sent a message.

### Phase 3 (Week 5–6): Proactive messages
Triggered three automated messages based on user behaviour:
1. **Day 3**: "Have you sent your first invoice?" — sent if no invoice created
2. **Day 14**: "You're almost at 10 invoices — here's how to automate recurring billing"
3. **Day 30**: NPS survey + offer to book a 15-min call with the team

## Results at 90 days

| Metric | Before | After |
|--------|--------|-------|
| Avg. first response | 72h | 3.8h |
| Monthly support tickets | 340 | 204 |
| Month-3 churn rate | 8.2% | 5.1% |
| CSAT score | Not measured | 4.6/5 |

> "Intercom didn't just fix support. It showed us exactly where our product was confusing people." — Dan Park, CEO, TechNova`,
  },
  {
    id: 'news-009',
    vendor_id: LABS,
    app_id: 'demo-slack',
    post_type: 'case-study',
    title: 'From Chaos to Clarity: How Streamline Corp Runs on Slack + Moonmart',
    slug: 'streamline-corp-slack-moonmart-case-study',
    excerpt: 'Streamline Corp unified their 60-person operations team on Slack and Moonmart, replacing five separate communication tools and eliminating the "what app should I use for this?" question forever.',
    cover_image: null,
    featured: 0,
    view_count: 1980,
    upvote_count: 154,
    published_at: daysAgo(58),
    tags: ['case-study', 'slack', 'operations', 'team-communication'],
    body_markdown: `## The client

Streamline Corp is a 60-person logistics software company with teams distributed across New York, London, and Singapore.

## Before: Five tools for one problem

The comms stack was fragmented by accident, not design:

- **Slack** — used by engineering only
- **Microsoft Teams** — used by sales (set up by the CRO who joined from Microsoft)
- **WhatsApp groups** — used by Singapore ops (fastest setup at the time)
- **Email** — everything that didn't fit above
- **Zoom chat** — messages that started during calls and never moved

The result: important decisions got made in five places. New hires spent their first two weeks just figuring out where to look.

## The consolidation

The executive team made a single decision: everything goes through Slack. No exceptions.

Moonmart was the connective tissue — every tool the company used (their CRM, project tracker, invoicing system, support desk) connected to Slack through Moonmart's unified integration layer rather than requiring individual native integrations.

### Key channel architecture

| Channel | Purpose | Integrations piped in |
|---------|---------|----------------------|
| #company-pulse | Daily automated KPI digest | Moonmart analytics |
| #deals-closed | Real-time revenue notifications | CRM via Moonmart |
| #incidents | System alerts | Monitoring via Moonmart |
| #shipping | Logistics status updates | Internal tool via Zapier + Moonmart |

### What they stopped using

Within 30 days: Teams, WhatsApp groups, Zoom chat.
Within 60 days: Email for internal communication (external email still active).

## Impact

- **Onboarding time for new hires**: 2 weeks → 3 days
- **Decision latency** (time from question raised to decision made): avg. 4.2 days → 1.1 days
- **Tool spend**: $1,840/month → $940/month
- **"I missed that message" incidents per sprint**: 12 → 2`,
  },

  // ─── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
  {
    id: 'news-010',
    vendor_id: LABS,
    app_id: null,
    post_type: 'announcement',
    title: 'Moonmart Labs Is Now SOC 2 Type II Certified',
    slug: 'moonmart-labs-soc2-type2-certified',
    excerpt: 'After a 12-month audit period, Moonmart Labs has received SOC 2 Type II certification covering Security, Availability, and Confidentiality trust service criteria. Your data is in safe hands.',
    cover_image: null,
    featured: 0,
    view_count: 4210,
    upvote_count: 312,
    published_at: daysAgo(65),
    tags: ['security', 'soc2', 'compliance', 'announcement', 'trust'],
    body_markdown: `## We are SOC 2 Type II certified

We're proud to announce that Moonmart Labs has completed its SOC 2 Type II audit, conducted by an independent third-party auditor over a 12-month observation period ending March 2026.

### What this means for you

SOC 2 Type II is the gold standard for SaaS security. Unlike Type I (which evaluates controls at a single point in time), Type II evaluates whether those controls operated *effectively over time*. Our audit covered:

- **Security** — system protection against unauthorised access
- **Availability** — system availability per our uptime commitments
- **Confidentiality** — protection of confidential information

### What the auditors reviewed

- Access controls and identity management
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Incident response procedures
- Vendor risk management
- Change management and deployment controls
- Employee security training programme
- Monitoring and alerting systems

### Zero exceptions

The audit report contains zero exceptions. Every control tested operated as designed for the full 12-month period.

### How to access the report

Enterprise customers can request the full SOC 2 Type II report under NDA by emailing security@moonmart.io.

All customers can view our security summary page at moonmart.io/security.

### What's next

We will undergo annual SOC 2 Type II renewals going forward. We are also pursuing ISO 27001 certification, with a target completion date of Q4 2026.`,
  },
  {
    id: 'news-011',
    vendor_id: ADMIN,
    app_id: null,
    post_type: 'announcement',
    title: 'Introducing the Moonmart Partner Program — Build With Us',
    slug: 'moonmart-partner-program-launch',
    excerpt: 'We are opening applications for the Moonmart Partner Program — a structured ecosystem for agencies, consultants, and technology partners who want to build on and sell through Moonmart.',
    cover_image: null,
    featured: 0,
    view_count: 3560,
    upvote_count: 278,
    published_at: daysAgo(72),
    tags: ['partners', 'program', 'announcement', 'ecosystem', 'agency'],
    body_markdown: `## The Moonmart Partner Program is open

We've been working with a group of 20 pilot partners for the past six months. Today we're opening the program to all qualified applicants.

### Why a partner program?

Software buyers increasingly want help, not just software. They want someone who understands their business to recommend the right stack, configure it properly, and stay accountable for outcomes. That's work that agencies and consultants do every day.

Moonmart is the place those buyers come to research and buy. The Partner Program connects them to the experts they need.

### Three partner tiers

#### Registered Partner (free)
- Listed in the Moonmart Partner Directory
- Access to partner portal and resources
- Co-marketing opportunities

#### Silver Partner ($99/month)
- Everything in Registered
- Featured placement in search results
- 15% revenue share on referred subscriptions
- Monthly partner office hours with Moonmart team

#### Gold Partner ($299/month)
- Everything in Silver
- Priority placement and badge
- 25% revenue share
- Dedicated partner success manager
- Early access to new features
- Joint case study and press opportunities

### Who qualifies

- Agencies with at least 3 active client engagements
- Consultants with verifiable SaaS expertise
- Technology vendors building integrations on Moonmart

### Apply

Applications are reviewed on a rolling basis. Apply at moonmart.io/partners.

The first 50 accepted partners receive 3 months of Silver tier at no cost.`,
  },
  {
    id: 'news-012',
    vendor_id: LABS,
    app_id: 'app-001',
    post_type: 'announcement',
    title: 'SalesForce CRM Is Now Enterprise-Ready on Moonmart',
    slug: 'salesforce-crm-enterprise-ready-moonmart',
    excerpt: 'SalesForce CRM on Moonmart now supports SSO, custom roles, audit logs, and dedicated infrastructure. Enterprise teams can deploy with confidence — and their IT teams can actually sleep at night.',
    cover_image: null,
    featured: 0,
    view_count: 2780,
    upvote_count: 201,
    published_at: daysAgo(79),
    tags: ['salesforce', 'enterprise', 'sso', 'announcement', 'security'],
    body_markdown: `## Enterprise tier is live

When enterprise buyers came to Moonmart looking at SalesForce CRM, they had the same list of requirements: SSO, audit logs, custom permissions, data residency, and a dedicated environment. We didn't have all of them. Now we do.

### What's included in Enterprise

#### Single Sign-On (SSO)
Support for SAML 2.0 and OIDC. Connect to Okta, Azure AD, Google Workspace, or any standards-compliant IdP. Users log in once — to your identity provider — and access SalesForce CRM without a separate password.

#### Custom roles and permissions
Define your own permission model. Create roles like "Read-only analyst", "Regional manager", or "SDR" with precise control over which data and actions each role can access.

#### Audit logs
Every action taken in SalesForce CRM — record created, deal updated, user added, export downloaded — is logged with a timestamp, user ID, and IP address. Exportable as CSV or queryable via API.

#### Dedicated infrastructure
Enterprise accounts run on isolated compute. Your data never shares resources with other tenants. 99.9% uptime SLA, backed by contractual penalties.

#### Data residency
Choose US or EU data residency at contract time. Your data — at rest and in transit — never leaves the region you specify.

### Pricing

Enterprise tier is available on annual contracts starting at $2,400/year. Contact sales@moonmart.io or book a demo at moonmart.io/demo.

### Existing growth customers

If you're on the Growth plan and need enterprise features, email your account manager. We'll run a gap analysis and quote a migration path.`,
  },

  // ─── CULTURE ───────────────────────────────────────────────────────────────
  {
    id: 'news-013',
    vendor_id: LABS,
    app_id: null,
    post_type: 'culture',
    title: 'Why We Rebuilt Our Onboarding From Scratch (And What We Learned)',
    slug: 'rebuilt-onboarding-from-scratch-lessons',
    excerpt: 'Our original onboarding had a 34% completion rate. After six months of research, experimentation, and one very honest user interview that made our PM uncomfortable, we shipped v2. Completion is now 81%.',
    cover_image: null,
    featured: 0,
    view_count: 2910,
    upvote_count: 233,
    published_at: daysAgo(86),
    tags: ['culture', 'onboarding', 'product-lessons', 'growth'],
    body_markdown: `## The honest starting point

In Q3 2025, our onboarding completion rate was 34%. Meaning: for every three users who signed up, two of them never reached the moment where Moonmart became useful to them.

We knew it was a problem. We'd been talking about fixing it for a year. Then we ran a user research session that made it impossible to keep talking.

### The interview that changed everything

We recruited 12 churned users for 30-minute calls. We expected to hear complaints about specific features. Instead, almost everyone said a version of the same thing:

> "I didn't know what I was supposed to do next."

The onboarding had seven steps. Users completed step one (create your account). They stalled at step two (set up your vendor profile) because the form had 24 fields and no explanation of why any of them mattered.

### What we changed

**Old onboarding:**
1. Create account
2. Complete vendor profile (24 fields)
3. Add your first app listing
4. Configure pricing
5. Add team members
6. Connect Slack
7. Publish

**New onboarding:**
1. Create account
2. Tell us one thing: what do you want to do first? (ship a listing / connect a tool / invite your team)
3. Personalised path based on answer — 3–5 steps max
4. One "aha moment" checkpoint before moving on

The key insight: the old flow optimised for *our* data completeness. The new flow optimises for the user reaching value as fast as possible. We can collect the extra profile fields later.

### Results after 90 days

- Completion rate: 34% → 81%
- Time to first app listing published: 4.2 days → 18 hours
- 30-day retention: 61% → 74%

### What surprised us

The change that had the biggest impact wasn't the personalisation. It was making the progress bar show *percentage complete* instead of *step X of 7*. Something about "you're 60% done" being more motivating than "step 4 of 7."

We have no rigorous explanation for this. It just works.`,
  },
  {
    id: 'news-014',
    vendor_id: ADMIN,
    app_id: null,
    post_type: 'culture',
    title: 'Remote-First at Year Three: Our Honest Retrospective',
    slug: 'remote-first-year-three-honest-retrospective',
    excerpt: 'Three years into being a fully remote company, here is what actually worked, what we got wrong, and the two decisions we would make differently if we were starting over today.',
    cover_image: null,
    featured: 0,
    view_count: 2340,
    upvote_count: 196,
    published_at: daysAgo(93),
    tags: ['culture', 'remote-work', 'team', 'retrospective', 'leadership'],
    body_markdown: `## Three years remote

We went fully remote in April 2023. Not as a pandemic holdover, but as a deliberate strategic choice. Bigger talent pool, lower burn rate, more focused work.

Three years in, here's what we actually think.

### What worked

**Async-first communication** was the single best decision we made. We documented the rule clearly: anything that doesn't need an answer in the next two hours goes in writing. Meetings are for decisions, not for sharing information. Meeting count dropped 60% in year one. It never went back up.

**Time zones as a feature, not a bug.** With team members in five time zones, something is always being worked on. Critical bugs get fixed overnight. Customers in Asia Pacific get same-day responses. We built a follow-the-sun support rotation that works.

**Generous home office stipends.** We give every team member $2,500 on day one and $500/year ongoing. People with good setups do better work. This seems obvious in retrospect.

### What we got wrong

**We under-invested in social connection for two years.** We assumed adults didn't need company-organised social interaction. We were wrong. Loneliness is real, and it compounds. We now run quarterly in-person gatherings (two days, substantive work + one social day) and have seen measurable improvement in engagement scores.

**Onboarding remote employees is harder than we expected.** New hires in an office absorb culture by osmosis. Remote new hires don't. We lost three good people in their first 90 days before we admitted we needed a structured remote onboarding programme.

**We promoted people who were visible over people who were effective.** The loudest voices in Slack got promoted. The deep, quiet contributors got overlooked. We now have a structured impact review process that looks at outputs, not activity.

### Two decisions we'd make differently

1. **Start the in-person gatherings from day one.** Don't wait until you feel the absence of social cohesion to build it.

2. **Hire a Head of Remote early.** Someone whose entire job is making the remote experience work. We hired one in year two. Should have been year one.

### Year four

We're not going back to an office. But we're also not pretending remote is frictionless. The companies that will win at remote are the ones honest enough to name the hard parts and deliberate enough to fix them.`,
  },
  {
    id: 'news-015',
    vendor_id: LABS,
    app_id: null,
    post_type: 'culture',
    title: 'Building in Public: Six Months of Shipping Fast on Moonmart',
    slug: 'building-in-public-six-months-shipping-fast',
    excerpt: "We committed to building in public for six months — sharing our metrics, our mistakes, and our roadmap decisions openly. Here's everything we learned about transparency as a growth strategy.",
    cover_image: null,
    featured: 0,
    view_count: 3070,
    upvote_count: 258,
    published_at: daysAgo(100),
    tags: ['culture', 'building-in-public', 'transparency', 'growth', 'indie'],
    body_markdown: `## Why we decided to build in public

In October 2025, our MRR was $18,400. Growth was fine — about 8% month-over-month — but we felt like we were building in a vacuum. Features shipped, no one noticed. Blog posts published, no one cared.

A founder we admired suggested building in public. "Share the real numbers. Share the failures. People connect to honesty."

We were skeptical. We did it anyway.

### What "building in public" meant for us

Every two weeks, we published:
- Exact MRR (with graph from day one)
- The feature we shipped and why
- One thing that didn't work and what we learned
- The top metric we were watching

We posted on Twitter/X, LinkedIn, and in a dedicated section of our Moonmart vendor blog. No filtering, no polishing.

### Month by month

**Month 1:** Crickets. Three likes per post. Started to regret this.

**Month 2:** A founder in YC wrote us saying our "failed experiment" post saved them from making the same mistake. Our first piece of real signal.

**Month 3:** A post about a pricing mistake went semi-viral (18k impressions). 40 new trial signups in 48 hours — more than a typical month.

**Month 4:** Two enterprise prospects mentioned our transparency as a reason they trusted us enough to start a trial. Not a tactic we'd have predicted.

**Month 5:** A competitor started publishing in public using almost the same format. We took it as validation.

**Month 6:** MRR hit $31,200. We can't attribute all of this to building in public — we also shipped meaningful product — but the correlation is real.

### What we'd tell teams considering it

**The authenticity has to be real.** Readers can smell sanitised "transparency." Share the number that makes you wince, not just the one that makes you look smart.

**Not everything should be public.** We never published team salary data, specific customer names without consent, or board-level strategic discussions. There's a line.

**The compound effect is slow, then fast.** The first 60 days felt like shouting into a void. Post 90 days, we had an audience that remembered what we'd said three months ago. That's a powerful thing.

We're continuing into year two. Come build with us.`,
  },
]

// ── Insert ─────────────────────────────────────────────────────────────────
const insertPost = db.prepare(`
  INSERT OR REPLACE INTO news_posts
    (id, vendor_id, app_id, post_type, title, slug, excerpt, body_markdown,
     cover_image, status, featured, view_count, upvote_count,
     published_at, admin_note, created_at, updated_at)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, NULL, ?, ?)
`)

const insertTag = db.prepare(
  'INSERT OR IGNORE INTO news_post_tags (post_id, tag) VALUES (?, ?)'
)

const seed = db.transaction(() => {
  for (const p of posts) {
    const now = new Date().toISOString()
    insertPost.run(
      p.id, p.vendor_id, p.app_id, p.post_type,
      p.title, p.slug, p.excerpt, p.body_markdown,
      p.cover_image, p.featured, p.view_count, p.upvote_count,
      p.published_at, now, now
    )
    for (const tag of p.tags) {
      insertTag.run(p.id, tag)
    }
    console.log(`✓ ${p.post_type.padEnd(16)} ${p.title}`)
  }
})

seed()

const count = db.prepare("SELECT COUNT(*) as n FROM news_posts WHERE status='published'").get()
console.log(`\n✅ Done — ${count.n} published news posts in DB`)
