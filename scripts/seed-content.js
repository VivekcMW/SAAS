#!/usr/bin/env node
/**
 * scripts/seed-content.js
 * Seeds demo content for blog posts, job listings, guide articles, and forum threads.
 * Usage: node scripts/seed-content.js
 */
const Database = require('better-sqlite3')
const path = require('path')
const crypto = require('crypto')

const DB_PATH = process.env.SAASWORLD_DB_PATH || path.join(__dirname, '..', '.data', 'saasworld.db')
const db = new Database(DB_PATH)

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}${Date.now().toString(36)}`
}

function slugify(s) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

function ago(days) {
  return new Date(Date.now() - days * 86400000).toISOString()
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

const blogPosts = [
  {
    title: 'The 10 Best CRM Tools for Small Businesses in 2025',
    excerpt: 'We compared 40 CRM platforms on pricing, ease of use, and integrations to find the best options for teams under 50.',
    category: 'comparisons',
    tags: ['crm', 'small-business', 'comparison'],
    content: `## Why Your Small Business Needs a CRM\n\nManaging customer relationships in spreadsheets gets messy fast. A good CRM centralises contacts, tracks deals, and automates follow-ups so nothing falls through the cracks.\n\n## Our Top Picks\n\n1. **HubSpot CRM** – Best free tier\n2. **Pipedrive** – Best for sales teams\n3. **Zoho CRM** – Best value for money\n\n## How We Evaluated\n\nWe used each CRM for at least two weeks, importing real data and running live sales pipelines.`,
    read_minutes: 9,
    published_at: ago(12),
  },
  {
    title: 'How to Evaluate SaaS Security Before You Buy',
    excerpt: 'A practical checklist for assessing SOC 2, penetration testing, data residency, and incident response before signing a contract.',
    category: 'guides',
    tags: ['security', 'compliance', 'procurement'],
    content: `## The Security Questions Every Buyer Should Ask\n\nBefore handing sensitive data to any SaaS vendor, you need answers to a core set of security questions. This guide walks you through the process.\n\n### 1. Do they have a SOC 2 Type II report?\n\nSOC 2 Type II means an auditor has verified their controls over at least 6 months. Ask for the full report, not just the summary.\n\n### 2. When was their last pen test?\n\nAnnual third-party penetration testing is the baseline expectation for any B2B SaaS product.\n\n### 3. Where is your data stored?\n\nEU-based companies need GDPR-compliant data residency. Ask for a data processing agreement (DPA).`,
    read_minutes: 7,
    published_at: ago(5),
  },
  {
    title: 'SaaS Pricing Models Explained: Seat-Based vs Usage-Based',
    excerpt: 'Understanding the trade-offs between per-seat and consumption-based pricing — and which works better for your team size.',
    category: 'product-news',
    tags: ['pricing', 'strategy', 'saas'],
    content: `## Per-Seat Pricing\n\nPer-seat pricing is predictable. You know exactly what you'll pay each month. This works well when usage is uniform across your team.\n\n**Downside:** You often end up paying for seats that barely get used.\n\n## Usage-Based Pricing\n\nUsage-based pricing (also called consumption pricing) aligns cost with value. You pay for what you use.\n\n**Downside:** Budgeting is harder. A spike in usage can mean a surprise bill.\n\n## Which Should You Choose?\n\nFor tools used daily by everyone (communication, project management), seat-based is simpler. For tools used variably (AI, analytics, email sending), usage-based usually saves money.`,
    read_minutes: 6,
    published_at: ago(3),
  },
]

const stmtBlog = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (id, slug, title, excerpt, category, author, read_minutes, image, tags, toc, content, status, is_auto_generated, published_at, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, ?)
`)
let blogCount = 0
for (const p of blogPosts) {
  const id = makeId('blog')
  const slug = slugify(p.title)
  const now = new Date().toISOString()
  try {
    stmtBlog.run(id, slug, p.title, p.excerpt, p.category, 'Moonmart Editorial', p.read_minutes, null, JSON.stringify(p.tags), '[]', p.content, p.published_at, now, now)
    blogCount++
  } catch (e) {
    if (!e.message.includes('UNIQUE')) throw e
  }
}
console.log(`✓ ${blogCount} blog posts seeded`)

// ─── Job Listings ─────────────────────────────────────────────────────────────

const jobsTableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='job_listings'`).get()
if (jobsTableExists) {
  const jobs = [
    { title: 'Senior Full-Stack Engineer', company: 'Moonmart', location: 'Remote', type: 'full-time', salary_min: 130000, salary_max: 160000, description: 'Build the features that help thousands of buyers find the right software. Nuxt 3, TypeScript, SQLite.' },
    { title: 'Product Designer', company: 'Moonmart', location: 'Remote', type: 'full-time', salary_min: 100000, salary_max: 130000, description: 'Own the design system and craft experiences that reduce buyer decision anxiety.' },
    { title: 'Growth Marketing Manager', company: 'Moonmart', location: 'Remote', type: 'full-time', salary_min: 90000, salary_max: 120000, description: 'Drive acquisition, activation, and retention across SEO, content, and paid channels.' },
  ]
  const stmtJob = db.prepare(`INSERT OR IGNORE INTO job_listings (id, title, company, location, type, salary_min, salary_max, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`)
  let jobCount = 0
  for (const j of jobs) {
    const now = new Date().toISOString()
    try {
      stmtJob.run(makeId('job'), j.title, j.company, j.location, j.type, j.salary_min, j.salary_max, j.description, now, now)
      jobCount++
    } catch (e) {
      if (!e.message.includes('UNIQUE')) throw e
    }
  }
  console.log(`✓ ${jobCount} job listings seeded`)
} else {
  console.log('⚠ job_listings table not found — skipped')
}

// ─── Guide Articles ───────────────────────────────────────────────────────────

const guidesTableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='guide_articles'`).get()
if (guidesTableExists) {
  const guides = [
    { title: 'How to Run a SaaS Evaluation in 30 Days', slug: 'saas-evaluation-30-days', category: 'buying', content: '## Week 1: Define Requirements\n\nStart with stakeholder interviews. List must-haves vs nice-to-haves.\n\n## Week 2: Shortlist\n\nUse comparison tools to narrow to 3–5 vendors.\n\n## Week 3: Demos and POC\n\nRun structured demos. Assign scoring rubrics.\n\n## Week 4: Decision\n\nScore each vendor, check references, negotiate pricing.' },
    { title: 'SaaS Contract Negotiation: 7 Clauses to Never Skip', slug: 'saas-contract-negotiation', category: 'procurement', content: '1. **Data ownership** — You own your data, always.\n2. **Exit rights** — How do you get your data back if you cancel?\n3. **SLA penalties** — What happens when uptime falls below the threshold?\n4. **Price lock** — Prevent surprise price increases mid-contract.\n5. **Security audit rights** — Can you audit their infrastructure?\n6. **Sub-processors** — Who else has access to your data?\n7. **Termination for cause** — Can you leave if they get acquired?' },
  ]
  const stmtGuide = db.prepare(`INSERT OR IGNORE INTO guide_articles (id, slug, title, category, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'published', ?, ?)`)
  let guideCount = 0
  for (const g of guides) {
    const now = new Date().toISOString()
    try {
      stmtGuide.run(makeId('guide'), g.slug, g.title, g.category, g.content, now, now)
      guideCount++
    } catch (e) {
      if (!e.message.includes('UNIQUE')) throw e
    }
  }
  console.log(`✓ ${guideCount} guide articles seeded`)
} else {
  console.log('⚠ guide_articles table not found — skipped')
}

// ─── Changelog Entries ────────────────────────────────────────────────────────

const changelogTableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='changelog_entries'`).get()
if (changelogTableExists) {
  const existing = db.prepare('SELECT COUNT(*) as c FROM changelog_entries').get()
  if (existing.c === 0) {
    const entries = [
      { version: '2.4.0', type: 'feature', title: 'Multi-model AI Router', summary: 'AI features now route intelligently across Claude, GPT-4o, and Gemini with automatic fallback and circuit-breaker protection.', published_at: ago(7) },
      { version: '2.3.5', type: 'fix', title: 'Fixed invoice download for Enterprise plans', summary: 'Enterprise customers were getting a 404 on invoice download. This is now resolved.', published_at: ago(21) },
      { version: '2.3.0', type: 'feature', title: 'Vendor Promotions', summary: 'Vendors can now create time-limited promo codes and featured placements visible to relevant buyers.', published_at: ago(35) },
      { version: '2.2.0', type: 'improvement', title: 'Buyer Compare View', summary: 'Side-by-side comparison now includes TCO calculator and feature matrix export.', published_at: ago(60) },
    ]
    const stmtCl = db.prepare(`INSERT OR IGNORE INTO changelog_entries (id, version, type, title, summary, body_markdown, status, published_at, created_at) VALUES (?, ?, ?, ?, ?, '', 'published', ?, datetime('now'))`)
    let clCount = 0
    for (const e of entries) {
      try { stmtCl.run(makeId('cl'), e.version, e.type, e.title, e.summary, e.published_at); clCount++ }
      catch (err) { if (!err.message.includes('UNIQUE')) throw err }
    }
    console.log(`✓ ${clCount} changelog entries seeded`)
  } else {
    console.log(`⚠ changelog_entries already has ${existing.c} rows — skipped`)
  }
} else {
  console.log('⚠ changelog_entries table not found — skipped')
}

// ─── Roadmap Items ────────────────────────────────────────────────────────────

const roadmapTableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='roadmap_items'`).get()
if (roadmapTableExists) {
  const existingRm = db.prepare('SELECT COUNT(*) as c FROM roadmap_items').get()
  if (existingRm.c === 0) {
    const items = [
      { title: 'Buyer Team Collaboration', description: 'Share saved stacks and evaluation notes with colleagues. Vote on shortlisted tools as a team.', status: 'planned', category: 'buyer', votes: 47 },
      { title: 'Vendor API Access', description: 'Programmatic access to listing management, analytics, and lead data via REST API.', status: 'in-progress', category: 'vendor', votes: 89 },
      { title: 'AI-Powered RFP Assistant', description: 'Upload your requirements document and get an instant shortlist with a structured comparison matrix.', status: 'planned', category: 'ai', votes: 134 },
      { title: 'White-Label Marketplace', description: 'Allow enterprise buyers to create private procurement portals with their approved vendor catalog.', status: 'considering', category: 'enterprise', votes: 31 },
    ]
    const stmtRm = db.prepare(`INSERT OR IGNORE INTO roadmap_items (id, title, description, status, category, vote_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
    let rmCount = 0
    for (const item of items) {
      try { stmtRm.run(makeId('rm'), item.title, item.description, item.status, item.category, item.votes); rmCount++ }
      catch (err) { if (!err.message.includes('UNIQUE')) throw err }
    }
    console.log(`✓ ${rmCount} roadmap items seeded`)
  } else {
    console.log(`⚠ roadmap_items already has ${existingRm.c} rows — skipped`)
  }
} else {
  console.log('⚠ roadmap_items table not found — skipped')
}

console.log('\nSeed complete.')
db.close()
