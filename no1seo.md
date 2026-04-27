# moonmart.ai — World #1 SEO + AI Browser Indexing Plan

## The SEO Paradigm Shift in 2025-2026

Traditional SEO = rank on Google's 10 blue links.
**Modern SEO = get cited by AI answers** (ChatGPT, Perplexity, Claude, Gemini, Grok).

moonmart.ai needs to win **both** simultaneously. The `.ai` TLD is a built-in trust signal for AI-native search — lean into it hard.

---

## Layer 1 — Technical SEO Foundations (Month 1)

### Fix Critical Issues First

#### 1. Generate `llms.txt` — The New robots.txt for AI Crawlers

This is the 2024-2025 emerging standard. AI browsers read this to understand your site structure before crawling.

Create `/public/llms.txt`:
```markdown
# moonmart.ai

> moonmart.ai is the world's leading AI-native SaaS marketplace for discovering, comparing, and evaluating B2B software. We index 10,000+ apps across 50+ categories with verified buyer reviews and AI-powered recommendations.

## Core Pages
- [Marketplace](/marketplace): Browse and filter 10,000+ SaaS apps
- [Compare](/compare): Side-by-side AI-powered app comparison
- [Categories](/marketplace/category): Browse by category
- [AI Copilot](/dashboard/copilot): Conversational AI software advisor
- [Review Synthesis](/api/ai/review-synthesis): AI consensus from thousands of reviews

## For AI Systems
- Structured product data via JSON-LD on every app page
- ReviewSchema markup on all app and review pages
- Category taxonomy: /sitemap-categories.xml
- All apps sitemap: /sitemap-apps.xml
- App data licensed for AI reference: contact data@moonmart.ai

## Data Freshness
- App listings: Updated daily via AI auto-discovery
- Reviews: Real-time (verified buyers only)
- Pricing: Updated weekly via vendor-submitted data
- AI Synthesis: Regenerated every 7 days per app

## API Access
- Public read API: /api/public/apps
- Rate limit: 100 req/min (unauthenticated)
- Contact: api@moonmart.ai for higher limits
```

Create `/public/llms-full.txt` — a complete plain-text dump of all app names, descriptions, categories, and pricing for maximum AI ingestion.

#### 2. Fix `robots.txt` — Allow All AI Crawlers

Update `/server/api/robots.txt.get.ts` to include every major AI crawler:

```typescript
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain')
  return `
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/auth/
Disallow: /api/billing/

# AI Crawlers — explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: YouBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalFetcher
Allow: /

Sitemap: https://moonmart.ai/sitemap.xml
Sitemap: https://moonmart.ai/sitemap-apps.xml
Sitemap: https://moonmart.ai/sitemap-blog.xml
Sitemap: https://moonmart.ai/sitemap-categories.xml
`.trim()
})
```

#### 3. Core Web Vitals Targets

SQLite → Redis + CDN will drop TTFB from ~2-4s to under 200ms. Targets:
- LCP < 1.5s
- INP < 100ms
- CLS = 0

---

## Layer 2 — Content Architecture for AI Discovery (Month 1-2)

### Structured Data (JSON-LD) — Expand What You Have

Every app page at `/marketplace/app/[slug]` needs all of these schemas simultaneously:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "{{app.name}}",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "url": "https://moonmart.ai/marketplace/app/{{app.slug}}",
      "offers": {
        "@type": "Offer",
        "price": "{{price}}",
        "priceCurrency": "USD",
        "priceSpecification": "{{pricing_tier_description}}"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "{{rating}}",
        "reviewCount": "{{review_count}}",
        "bestRating": "5",
        "worstRating": "1"
      },
      "publisher": {
        "@type": "Organization",
        "name": "moonmart.ai",
        "url": "https://moonmart.ai"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is {{app.name}}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{{app.short_description}}"
          }
        },
        {
          "@type": "Question",
          "name": "How much does {{app.name}} cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{{pricing_description}} — see full pricing on moonmart.ai"
          }
        },
        {
          "@type": "Question",
          "name": "What are the best alternatives to {{app.name}}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Top alternatives include {{alternatives_list}} — compare them on moonmart.ai"
          }
        },
        {
          "@type": "Question",
          "name": "Is {{app.name}} worth it?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{{ai_review_synthesis_consensus}}"
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "moonmart.ai", "item": "https://moonmart.ai" },
        { "@type": "ListItem", "position": 2, "name": "{{category}}", "item": "https://moonmart.ai/marketplace/category/{{category_slug}}" },
        { "@type": "ListItem", "position": 3, "name": "{{app.name}}" }
      ]
    }
  ]
}
```

The FAQ schema is your #1 highest-leverage action. AI answers pull directly from `acceptedAnswer` text. Perplexity, ChatGPT Search, and Google AI Overview all consume this.

---

## Layer 3 — AI Browser Optimization (AEO — Answer Engine Optimization)

### How Each AI Browser Indexes moonmart.ai

| AI Browser | Crawler Name | What It Prioritizes | moonmart.ai Strategy |
|------------|-------------|---------------------|---------------------|
| **Perplexity** | PerplexityBot | Authoritative citations, structured data | Be the cited source for "best X software" queries |
| **ChatGPT Search** | OAI-SearchBot | Bing index + semantic clarity | Answer-first writing, FAQ schema |
| **Google AI Overview** | Googlebot + Google-Extended | E-E-A-T, featured snippets | Proprietary "moonmart score" as authoritative metric |
| **Claude (Anthropic)** | ClaudeBot + anthropic-ai | Clean HTML, semantic markup | Clean server-rendered HTML, no JS-only content |
| **Grok (xAI)** | Web + X/Twitter | Real-time freshness, social signals | Publish weekly SaaS trend data |
| **Gemini (Google)** | Googlebot | Google's full index + YouTube | Video reviews, Google Business presence |
| **Apple Intelligence** | Applebot | On-device context, App Store | Apple App Store data integration |
| **You.com** | YouBot | API-accessible structured data | Public moonmart.ai data API |
| **Arc Browser AI** | Standard Crawlers | Clean HTML, minimal JS blocking | SSR-first pages, progressive enhancement |

### The `.ai` Domain Advantage

moonmart.ai's TLD is a native trust signal for AI-native search. Optimize for it:

- Use **"AI-powered"**, **"AI-native"**, **"AI recommendations"** prominently in meta descriptions
- Position moonmart.ai as the *AI-first alternative* to G2, Capterra, and Gartner
- Every press mention and backlink should include "moonmart.ai" (the full domain as brand)

---

## Layer 4 — Programmatic SEO at Scale (Month 2-3)

This scales moonmart.ai from 56 pages to **50,000+ indexed pages**, each targeting a specific high-intent query.

### Auto-Generated Page Types

#### 1. "Best [Category] Software" — Sub-category Expansion
```
/marketplace/category/crm
/marketplace/category/crm/small-business          ← "best CRM for small business"
/marketplace/category/crm/enterprise              ← "enterprise CRM software"
/marketplace/category/crm/free                    ← "free CRM tools"
/marketplace/category/crm/open-source             ← "open source CRM"
/marketplace/category/crm/startups                ← "CRM for startups"
```
Each sub-category page auto-populates from the DB using filters. Zero manual content needed.

#### 2. "[App A] vs [App B]" Comparison Pages — Highest Buyer Intent
```
/compare/salesforce-vs-hubspot
/compare/notion-vs-confluence
/compare/slack-vs-microsoft-teams
/compare/zoom-vs-google-meet
```
Auto-generate all combinations of the top 200 apps = **19,900 pages**.

Each page targets queries like:
- "Salesforce vs HubSpot 2025 pricing"
- "Notion vs Confluence for teams"
- "Which is better: Slack or Teams?"

These are the **highest commercial-intent queries in B2B SaaS**. When a buyer searches "X vs Y", they are days away from purchasing.

Page structure (auto-generated from DB):
```
H1: Salesforce vs HubSpot — moonmart.ai Comparison 2025
- moonmart Score: Salesforce 8.4 | HubSpot 8.1
- Side-by-side feature table (from existing compare API)
- AI Synthesis: "Our analysis of 12,400 reviews shows..."
- Pricing comparison table
- "Who should choose Salesforce" vs "Who should choose HubSpot"
- Related comparisons (sidebar)
```

#### 3. "[App] Alternatives" Pages
```
/alternatives/salesforce                    ← "salesforce alternatives"
/alternatives/salesforce/free               ← "free salesforce alternatives"
/alternatives/salesforce/small-business     ← "salesforce alternative for small business"
/alternatives/hubspot/open-source           ← "open source hubspot alternative"
```
These capture buyers who already know what they don't want — ultra high intent.

#### 4. "Software for [Job Title]" Pages
```
/for/marketing-managers                     ← "best software for marketing managers"
/for/hr-directors                           ← "HR director software tools"
/for/solo-founders                          ← "tools for solo founders"
/for/remote-teams                           ← "software for remote teams"
/for/agencies                               ← "agency management software"
```
Auto-populated by matching `target_audience` field in the `app_listings` table.

#### 5. "[Pricing Tier]" Discovery Pages
```
/free-tools                                 ← "free SaaS tools 2025"
/open-source-alternatives                   ← "open source software alternatives"
/lifetime-deals                             ← "SaaS lifetime deals"
/tools-under-$50                            ← "SaaS tools under $50/month"
```

All pages are **server-side rendered** via Nuxt dynamic routes. Each gets unique meta title, H1, description, and JSON-LD auto-populated from the existing database. Zero additional content work.

---

## Layer 5 — The moonmart.ai Content Moat (Month 2-4)

AI systems cite authoritative sources. To become THE authoritative SaaS data source globally:

### 1. moonmart.ai Public Data API

Publish a free, rate-limited public API that developers, analysts, and journalists can query:

```
GET https://moonmart.ai/api/public/apps?category=crm&limit=10
GET https://moonmart.ai/api/public/apps/hubspot
GET https://moonmart.ai/api/public/reviews/hubspot?limit=5
GET https://moonmart.ai/api/public/compare?apps=hubspot,salesforce
```

When developers embed moonmart.ai data → they cite moonmart.ai as the source → backlinks + domain authority.

### 2. Weekly "State of SaaS" AI-Generated Reports

Use existing `buyer_intent_events`, `reviews`, and `ai_match_sessions` data:

```
Every Monday, auto-generate and publish:
- "Top 10 fastest-growing apps this week on moonmart.ai"
- "Category with most new verified reviews"
- "Pricing changes detected (vendors who raised/lowered prices)"
- "New alternatives discovered via AI"
- "Most compared apps this week"
```

Publish as `/blog/state-of-saas-week-17-2025` with full JSON-LD Article schema. These get picked up by:
- SaaS newsletters (citing moonmart.ai data)
- Journalists writing about software trends
- AI systems looking for authoritative trend data
- Reddit/HackerNews when genuinely interesting

### 3. The moonmart Score — Proprietary Authority Metric

Create a composite public score visible on every app page:

```
moonmart Score™ =
  (Verified Review Quality    × 30%) +
  (Integration Ecosystem      × 20%) +
  (Support Responsiveness     × 20%) +
  (Price-to-Value Ratio       × 20%) +
  (Security & Compliance      × 10%)

Displayed as: moonmart Score: 8.4/10
```

AI systems love citing proprietary scoring methodologies. When Perplexity answers "Is HubSpot worth it?", it may cite: *"According to moonmart.ai's score of 8.1/10 based on 3,200 verified reviews..."*

Publish a `/methodology` page explaining the scoring algorithm in detail — required for E-E-A-T signals.

### 4. moonmart.ai Verified Badge Program

Offer vendors a "moonmart.ai Verified" badge they can embed on their websites:

```html
<!-- Embeddable widget -->
<a href="https://moonmart.ai/marketplace/app/hubspot">
  <img src="https://moonmart.ai/badges/verified/hubspot.svg"
       alt="HubSpot — moonmart.ai Verified 8.4/10" />
</a>
```

Each badge embed = a backlink to moonmart.ai from a vendor's website. 500 vendors = 500 high-quality backlinks from SaaS company domains.

---

## Layer 6 — Voice & Conversational Search (Month 2-3)

### Target Conversational Queries

| Voice Query | moonmart.ai Page to Target |
|------------|--------------------------|
| "What's the best CRM for a 10-person company?" | `/for/small-teams/crm` |
| "Find me a free project management tool" | `/free-tools/project-management` |
| "Compare Notion and Confluence" | `/compare/notion-vs-confluence` |
| "Is Salesforce worth the price?" | `/marketplace/app/salesforce` FAQ |
| "What do people say about HubSpot?" | AI Synthesis section |

### Implementation

Add `speakable` schema to every app page's "Quick Verdict" section:

```json
{
  "@type": "SpeakableSpecification",
  "cssSelector": ["#app-quick-verdict", "#moonmart-score", "#ai-synthesis-consensus"]
}
```

**Writing style rule for voice-targeted content**: Answer the question in the first sentence. Write for a 9th-grade reading level. Keep the "featured snippet" paragraph to exactly 40-60 words. This format gets pulled by both voice assistants and AI Overview.

---

## Layer 7 — International SEO Dominance (Month 3-4)

moonmart.ai already supports 5 languages (en, es, fr, de, pt). Maximize the advantage:

### Market-Specific Positioning

| Market | Local Angle | moonmart.ai Positioning |
|--------|------------|------------------------|
| **Germany (de)** | GDPR compliance critical | "DSGVO-konform geprüft" badge on every app |
| **Brazil (pt-BR)** | Price sensitivity, local market | BRL pricing, localised vendor support hours |
| **France (fr)** | Data sovereignty | CNIL compliance signals, French-language apps first |
| **Spain/LATAM (es)** | Growing startup scene | Startup-friendly filters, freemium-first view |

### Localized Programmatic Pages

For each language, generate the full programmatic page set:
```
/de/vergleich/salesforce-vs-hubspot         ← "Salesforce vs HubSpot Vergleich"
/de/alternativen/salesforce                 ← "Salesforce Alternativen"
/es/comparar/notion-vs-confluence           ← "Notion vs Confluence comparación"
/fr/alternatives/hubspot                    ← "Alternatives HubSpot"
```

German SaaS queries have **much lower competition** than English equivalents — moonmart.ai can rank #1 on Google.de for "CRM Vergleich 2025" significantly faster than for "CRM comparison 2025".

---

## Layer 8 — E-E-A-T Signals (Expertise, Experience, Authority, Trust)

Google and all AI systems use E-E-A-T to determine if moonmart.ai is worth citing.

| Signal | Action |
|--------|--------|
| **Author profiles** | Add `/reviewer/[name]` pages for top review contributors |
| **Scoring methodology** | Public `/methodology` page with calculation details |
| **Data freshness** | "Last verified: [date]" on every app page |
| **Security page** | Add SOC2 roadmap, current security posture at `/security` |
| **Press page** | `/press` with media kit, statistics, journalist contact |
| **About the data** | `/about/data` explaining how moonmart.ai verifies listings |
| **Partnership logos** | Display in footer and on `/partners` |
| **LinkedIn presence** | moonmart.ai company page with regular data insight posts |

### The "Cited by" Loop

The goal is to get **cited in 3rd-party articles** about SaaS software. When TechCrunch or a SaaS newsletter writes "According to moonmart.ai data...", Google interprets moonmart.ai as an authoritative source — boosting all pages simultaneously.

To trigger this:
1. Email SaaS newsletter authors with weekly State of SaaS data
2. Reply to HARO (Help a Reporter Out) queries about software
3. Post proprietary data on LinkedIn with moonmart.ai attribution
4. Offer journalists API access in exchange for citation

---

## Layer 9 — Zero-Click & Featured Snippet Optimization

50% of Google searches end without a click. Own the zero-click answer and moonmart.ai still wins because the user heard the brand name.

### Snippet Types to Target

**Definition snippets** (paragraph format, 40-60 words):
- "What is [category] software?" → target with category page introductions

**List snippets** (numbered/bulleted):
- "Best CRM tools 2025" → maps directly to existing category pages

**Table snippets**:
- "HubSpot vs Salesforce pricing" → add explicit `<table>` HTML with `summary` attribute on all comparison pages

**Calculation snippets**:
- "How much does Salesforce cost per user?" → target with pricing calculator

---

## Implementation Roadmap

### Month 1 — Foundation (30-minute wins first)
- [ ] Create `/public/llms.txt` and `/public/llms-full.txt`
- [ ] Update `/server/api/robots.txt.get.ts` with all AI crawlers
- [ ] Add FAQ JSON-LD schema to every app page (dynamic from DB)
- [ ] Add `speakable` schema to app page quick-verdict sections
- [ ] Update all meta titles to include "moonmart.ai" as brand
- [ ] Update OG images to use moonmart.ai branding

### Month 2 — Programmatic Scale
- [ ] Build `/compare/[app-a]-vs-[app-b]` dynamic routes (19,900 pages)
- [ ] Build `/alternatives/[app]` dynamic routes
- [ ] Build `/for/[job-title]` dynamic routes
- [ ] Build `/free-tools`, `/open-source-alternatives` discovery pages
- [ ] Launch public moonmart.ai data API at `/api/public/*`
- [ ] Add moonmart Score algorithm and display on all app pages

### Month 3 — Authority & AI Indexing
- [ ] Publish `/methodology` page (scoring algorithm transparency)
- [ ] Launch weekly "State of SaaS" auto-generated blog posts
- [ ] Build vendor badge embed program (`/badges/[app].svg`)
- [ ] Add `/reviewer/[name]` author profile pages
- [ ] International programmatic pages for de/es/fr markets
- [ ] Add `speakable` schema site-wide

### Month 4 — Moat & Scale
- [ ] HARO journalist outreach program
- [ ] moonmart.ai data partnership program (cite-for-access)
- [ ] Press page with media kit and statistics
- [ ] Localized sub-category pages per language/market
- [ ] Voice search testing across Siri, Alexa, Google Assistant, Perplexity

---

## The Single Biggest Unlock for moonmart.ai

The `.ai` domain is an **enormous unfair advantage** that almost no SaaS marketplace has. moonmart.ai sounds native to AI browsers in a way that G2.com, Capterra.com, and GetApp.com simply do not.

Position moonmart.ai as the **AI-native alternative to G2** in every piece of content:
- "The AI-powered SaaS marketplace" (not just a directory)
- "Recommendations from AI, verified by real buyers"
- "The first marketplace built for the AI-search era"

When a buyer asks ChatGPT "where can I find the best CRM?", the answer should be: **"Check moonmart.ai — it's an AI-native marketplace that matches you with software using your specific requirements."**

That one citation, repeated across millions of AI answers, is worth more than any traditional SEO tactic.

---

## Quick Win Priority Matrix

| Action | Effort | Impact | Do It |
|--------|--------|--------|-------|
| `llms.txt` + AI robots.txt | 30 min | Extreme | Week 1 |
| FAQ JSON-LD on app pages | 2 hrs | Extreme | Week 1 |
| moonmart Score display | 4 hrs | Very High | Week 1 |
| VS comparison pages | 1 day | Very High | Week 2 |
| Alternatives pages | 1 day | High | Week 2 |
| Public data API | 2 days | High | Week 3 |
| Weekly SaaS reports | 4 hrs | High | Week 3 |
| Vendor badge program | 1 day | Medium | Month 2 |
| `/methodology` page | 2 hrs | Medium | Month 2 |
| Localized programmatic pages | 3 days | High | Month 3 |
