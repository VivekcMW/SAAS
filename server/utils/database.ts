import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface DbUser {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  full_name: string
  company_name: string | null
  company_size: string | null
  job_title: string | null
  phone_number: string | null
  role: 'buyer' | 'vendor' | 'admin'
  plan: string
  email_verified: number
  created_at: string
  updated_at: string
}

export interface DbVendorProfile {
  id: string
  user_id: string
  company_name: string
  company_slug: string
  status: 'active' | 'pending'
  created_at: string
  updated_at: string
}

export interface DbAppListing {
  id: string
  vendor_id: string
  slug: string
  name: string
  provider: string
  logo: string
  short_description: string
  long_description: string
  category: string
  tags: string
  pricing_type: 'free' | 'trial' | 'paid' | 'contact'
  pricing_value: number | null
  pricing_period: string | null
  rating: number
  review_count: number
  featured: number
  trending: number
  sponsored: number
  status: 'draft' | 'submitted' | 'published'
  created_at: string
  updated_at: string
}

export interface DbReview {
  id: string
  app_id: string
  user_id: string | null
  user_name: string
  user_email: string | null
  rating: number
  title: string
  content: string
  verified: number
  helpful_votes: number
  status: 'pending' | 'approved' | 'rejected'
  platform: string | null
  version: string | null
  created_at: string
  updated_at: string
}

export interface DbOnboardingSubmission {
  id: string
  user_id: string | null
  product_name: string
  company_name: string
  contact_email: string | null
  payload: string
  status: 'submitted' | 'in_review' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface DbEvent {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  category: string
  event_type: 'webinar' | 'conference' | 'meetup' | 'launch' | 'workshop' | 'other'
  location: string
  is_online: number
  starts_at: string
  ends_at: string | null
  timezone: string
  cover_image: string | null
  register_url: string | null
  host_name: string | null
  host_email: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  featured: number
  created_by: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface DbNewsPost {
  id: string
  vendor_id: string
  app_id: string | null
  post_type: 'product-update' | 'feature' | 'culture' | 'announcement' | 'case-study'
  title: string
  slug: string
  excerpt: string
  body_markdown: string
  cover_image: string | null
  status: 'draft' | 'submitted' | 'published' | 'rejected'
  featured: number
  view_count: number
  upvote_count: number
  published_at: string | null
  admin_note: string | null
  created_at: string
  updated_at: string
}

export interface DbDiscoveryItem {
  id: string
  source: 'github_awesome' | 'product_hunt' | 'manual' | 'suggest'
  source_url: string | null
  website_url: string
  extracted_data: string  // JSON string of ExtractedListing
  confidence_score: number
  status: 'pending' | 'auto_submitted' | 'review' | 'approved' | 'rejected' | 'discarded'
  listing_id: string | null
  reject_reason: string | null
  processed_at: string | null
  created_at: string
}

let database: Database.Database | null = null

function getDatabasePath() {
  const dbPath = process.env.SAASWORLD_DB_PATH || join(process.cwd(), '.data', 'saasworld.db')
  const dbDir = dirname(dbPath)

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  return dbPath
}

function createSchema(db: Database.Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      company_name TEXT,
      company_size TEXT,
      job_title TEXT,
      phone_number TEXT,
      role TEXT NOT NULL DEFAULT 'vendor',
      plan TEXT NOT NULL DEFAULT 'Professional',
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vendor_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      company_slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_listings (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      logo TEXT NOT NULL,
      short_description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      pricing_type TEXT NOT NULL DEFAULT 'contact',
      pricing_value REAL,
      pricing_period TEXT,
      rating REAL NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      trending INTEGER NOT NULL DEFAULT 0,
      sponsored INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens(user_id);

    CREATE TABLE IF NOT EXISTS email_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      verified_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_ev_token_hash ON email_verifications(token_hash);

    CREATE TABLE IF NOT EXISTS user_favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, app_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_uf_user ON user_favorites(user_id);

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_email TEXT,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      helpful_votes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      platform TEXT,
      version TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_app_id ON reviews(app_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

    CREATE TABLE IF NOT EXISTS onboarding_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      product_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      contact_email TEXT,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_onboarding_created ON onboarding_submissions(created_at);

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'General',
      event_type TEXT NOT NULL DEFAULT 'webinar',
      location TEXT NOT NULL DEFAULT 'Online',
      is_online INTEGER NOT NULL DEFAULT 1,
      starts_at TEXT NOT NULL,
      ends_at TEXT,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      cover_image TEXT,
      register_url TEXT,
      host_name TEXT,
      host_email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      featured INTEGER NOT NULL DEFAULT 0,
      created_by TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
    CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

    -- Billing: one row per active subscription per user
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stripe_customer_id TEXT NOT NULL,
      stripe_subscription_id TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL,
      stripe_status TEXT NOT NULL DEFAULT 'active',
      current_period_start TEXT,
      current_period_end TEXT,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      canceled_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_subs_user ON user_subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subs_stripe_sub ON user_subscriptions(stripe_subscription_id);

    -- Flexible key-value store for platform settings managed by admin
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL
    );
  `)

  // Idempotent column migrations for existing databases
  const alterations = [
    // users
    `ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN stripe_customer_id TEXT`,
    `ALTER TABLE users ADD COLUMN avatar_url TEXT`,
    `ALTER TABLE users ADD COLUMN locale TEXT DEFAULT 'en'`,
    `ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC'`,
    // vendor_profiles
    `ALTER TABLE vendor_profiles ADD COLUMN website_url TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN logo_url TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN tagline TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN description TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN founded_year INTEGER`,
    `ALTER TABLE vendor_profiles ADD COLUMN company_size TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN funding_stage TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN funding_total REAL`,
    `ALTER TABLE vendor_profiles ADD COLUMN headquarters TEXT`,
    `ALTER TABLE vendor_profiles ADD COLUMN social_links TEXT DEFAULT '{}'`,
    `ALTER TABLE vendor_profiles ADD COLUMN verified INTEGER NOT NULL DEFAULT 0`,
    // app_listings
    `ALTER TABLE app_listings ADD COLUMN key_features TEXT DEFAULT '[]'`,
    `ALTER TABLE app_listings ADD COLUMN integrations TEXT DEFAULT '[]'`,
    `ALTER TABLE app_listings ADD COLUMN screenshots TEXT DEFAULT '[]'`,
    `ALTER TABLE app_listings ADD COLUMN pricing_tiers TEXT DEFAULT '[]'`,
    `ALTER TABLE app_listings ADD COLUMN target_audience TEXT`,
    `ALTER TABLE app_listings ADD COLUMN website_url TEXT`,
    `ALTER TABLE app_listings ADD COLUMN demo_url TEXT`,
    `ALTER TABLE app_listings ADD COLUMN support_email TEXT`,
    `ALTER TABLE app_listings ADD COLUMN founded_year INTEGER`,
    `ALTER TABLE app_listings ADD COLUMN headquarters TEXT`,
    `ALTER TABLE app_listings ADD COLUMN security_certs TEXT DEFAULT '[]'`,
    `ALTER TABLE app_listings ADD COLUMN compliance_score REAL DEFAULT 0`,
    `ALTER TABLE app_listings ADD COLUMN verified INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE app_listings ADD COLUMN auto_discovered INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE app_listings ADD COLUMN published_at TEXT`,
    `ALTER TABLE app_listings ADD COLUMN short_description TEXT`,
    // reviews
    `ALTER TABLE reviews ADD COLUMN user_role TEXT`,
    `ALTER TABLE reviews ADD COLUMN company_size TEXT`,
    `ALTER TABLE reviews ADD COLUMN pros TEXT DEFAULT '[]'`,
    `ALTER TABLE reviews ADD COLUMN cons TEXT DEFAULT '[]'`,
    `ALTER TABLE reviews ADD COLUMN authenticity_score REAL`,
    `ALTER TABLE reviews ADD COLUMN outcome_metric TEXT`,
    // discovery_queue
    `ALTER TABLE discovery_queue ADD COLUMN claim_email_sent INTEGER NOT NULL DEFAULT 0`
  ]
  for (const sql of alterations) {
    try { db.exec(sql) } catch { /* column already exists */ }
  }

  // New tables added after initial schema — idempotent
  db.exec(`
    CREATE TABLE IF NOT EXISTS review_votes (
      review_id TEXT NOT NULL,
      voter_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (review_id, voter_key)
    );

    CREATE TABLE IF NOT EXISTS demo_bookings (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      team_size TEXT NOT NULL,
      goal TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_demo_created ON demo_bookings(created_at);
    CREATE INDEX IF NOT EXISTS idx_demo_status ON demo_bookings(status);

    -- News Portal tables
    CREATE TABLE IF NOT EXISTS news_posts (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      app_id TEXT,
      post_type TEXT NOT NULL DEFAULT 'announcement',
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      body_markdown TEXT NOT NULL,
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      featured INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      upvote_count INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      admin_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_news_slug ON news_posts(slug);
    CREATE INDEX IF NOT EXISTS idx_news_status ON news_posts(status);
    CREATE INDEX IF NOT EXISTS idx_news_vendor ON news_posts(vendor_id);
    CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(published_at);
    CREATE INDEX IF NOT EXISTS idx_news_type ON news_posts(post_type);

    CREATE TABLE IF NOT EXISTS news_post_tags (
      post_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (post_id, tag),
      FOREIGN KEY (post_id) REFERENCES news_posts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_news_tags_tag ON news_post_tags(tag);

    CREATE TABLE IF NOT EXISTS news_post_reactions (
      post_id TEXT NOT NULL,
      voter_key TEXT NOT NULL,
      reaction TEXT NOT NULL DEFAULT 'upvote',
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, voter_key, reaction),
      FOREIGN KEY (post_id) REFERENCES news_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS discovery_queue (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      source_url TEXT,
      website_url TEXT NOT NULL UNIQUE,
      extracted_data TEXT NOT NULL DEFAULT '{}',
      confidence_score REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      listing_id TEXT,
      reject_reason TEXT,
      claim_email_sent INTEGER NOT NULL DEFAULT 0,
      processed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (listing_id) REFERENCES app_listings(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dq_status ON discovery_queue(status);
    CREATE INDEX IF NOT EXISTS idx_dq_website ON discovery_queue(website_url);
    CREATE INDEX IF NOT EXISTS idx_dq_created ON discovery_queue(created_at);
    CREATE INDEX IF NOT EXISTS idx_dq_score ON discovery_queue(confidence_score DESC);

    -- ── Phase 1 tables ────────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS buyer_intent_events (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      user_id TEXT,
      session_id TEXT,
      event_type TEXT NOT NULL,
      signal_strength TEXT NOT NULL DEFAULT 'warm',
      metadata TEXT NOT NULL DEFAULT '{}',
      user_company TEXT,
      user_role TEXT,
      user_location TEXT,
      notified_vendor INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bie_vendor_id ON buyer_intent_events(vendor_id);
    CREATE INDEX IF NOT EXISTS idx_bie_app_id    ON buyer_intent_events(app_id);
    CREATE INDEX IF NOT EXISTS idx_bie_created   ON buyer_intent_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bie_notified  ON buyer_intent_events(notified_vendor);

    CREATE TABLE IF NOT EXISTS ai_match_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_key TEXT NOT NULL,
      messages TEXT NOT NULL DEFAULT '[]',
      matched_apps TEXT NOT NULL DEFAULT '[]',
      context TEXT NOT NULL DEFAULT '{}',
      lead_score REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ams_user_id ON ai_match_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_ams_session_key ON ai_match_sessions(session_key);
    CREATE INDEX IF NOT EXISTS idx_ams_created ON ai_match_sessions(created_at DESC);

    CREATE TABLE IF NOT EXISTS buyer_stacks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      tools TEXT NOT NULL DEFAULT '[]',
      total_spend REAL NOT NULL DEFAULT 0,
      overlap_alerts TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS review_synthesis_cache (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL UNIQUE,
      consensus TEXT NOT NULL,
      power_user_view TEXT NOT NULL,
      deal_breakers TEXT NOT NULL DEFAULT '[]',
      best_for TEXT NOT NULL DEFAULT '[]',
      worst_for TEXT NOT NULL DEFAULT '[]',
      sentiment_trend TEXT NOT NULL DEFAULT '{}',
      review_count_at_synthesis INTEGER NOT NULL,
      generated_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS negotiation_briefs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      app_id TEXT NOT NULL,
      brief_content TEXT NOT NULL,
      list_price REAL,
      typical_discount_pct REAL,
      best_quarter TEXT,
      tips TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_ngb_app_id ON negotiation_briefs(app_id);
    CREATE INDEX IF NOT EXISTS idx_ngb_user_id ON negotiation_briefs(user_id);

    CREATE TABLE IF NOT EXISTS evaluation_briefs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      app_ids TEXT NOT NULL,
      title TEXT NOT NULL,
      content_md TEXT NOT NULL,
      share_token TEXT UNIQUE,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_evb_share_token ON evaluation_briefs(share_token);
    CREATE INDEX IF NOT EXISTS idx_evb_user_id ON evaluation_briefs(user_id);

    CREATE TABLE IF NOT EXISTS vendor_claim_tokens (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (listing_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_vct_token   ON vendor_claim_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_vct_listing ON vendor_claim_tokens(listing_id);
  `)
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function seedDatabase(db: Database.Database) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (userCount.count > 0) {
    return
  }

  const now = new Date().toISOString()
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, email, password_hash, first_name, last_name, full_name,
      company_name, company_size, job_title, phone_number, role, plan,
      created_at, updated_at
    ) VALUES (
      @id, @email, @password_hash, @first_name, @last_name, @full_name,
      @company_name, @company_size, @job_title, @phone_number, @role, @plan,
      @created_at, @updated_at
    )
  `)

  const insertVendor = db.prepare(`
    INSERT INTO vendor_profiles (
      id, user_id, company_name, company_slug, status, created_at, updated_at
    ) VALUES (
      @id, @user_id, @company_name, @company_slug, @status, @created_at, @updated_at
    )
  `)

  const insertApp = db.prepare(`
    INSERT INTO app_listings (
      id, vendor_id, slug, name, provider, logo, short_description, long_description,
      category, tags, pricing_type, pricing_value, pricing_period, rating, review_count,
      featured, trending, sponsored, status, created_at, updated_at
    ) VALUES (
      @id, @vendor_id, @slug, @name, @provider, @logo, @short_description, @long_description,
      @category, @tags, @pricing_type, @pricing_value, @pricing_period, @rating, @review_count,
      @featured, @trending, @sponsored, @status, @created_at, @updated_at
    )
  `)

  const vendorUsers = [
    {
      id: 'user_vendor_demo',
      email: 'demo@moonmart.ai',
      password_hash: 'scrypt:placeholder',
      first_name: 'Demo',
      last_name: 'Vendor',
      full_name: 'Demo Vendor',
      company_name: 'Moonmart Labs',
      company_size: '11-50',
      job_title: 'Founder',
      phone_number: '+1-555-0100',
      role: 'vendor',
      plan: 'Professional',
      created_at: now,
      updated_at: now
    },
    {
      id: 'user_admin_demo',
      email: 'admin@moonmart.ai',
      password_hash: 'scrypt:placeholder-admin',
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
      company_name: 'Moonmart',
      company_size: '51-200',
      job_title: 'Platform Admin',
      phone_number: '+1-555-0101',
      role: 'admin',
      plan: 'Enterprise',
      created_at: now,
      updated_at: now
    }
  ] satisfies DbUser[]

  vendorUsers.forEach(user => insertUser.run(user))

  const vendors = [
    {
      id: 'vendor_saasworld_labs',
      user_id: 'user_vendor_demo',
      company_name: 'Moonmart Labs',
      company_slug: 'saasworld-labs',
      status: 'active',
      created_at: now,
      updated_at: now
    },
    {
      id: 'vendor_saasworld_admin',
      user_id: 'user_admin_demo',
      company_name: 'Moonmart',
      company_slug: 'saasworld',
      status: 'active',
      created_at: now,
      updated_at: now
    }
  ] satisfies DbVendorProfile[]

  vendors.forEach(vendor => insertVendor.run(vendor))

  const apps: DbAppListing[] = [
    {
      id: 'app-001',
      vendor_id: 'vendor_saasworld_labs',
      slug: 'salesforce-crm',
      name: 'SalesForce CRM',
      provider: 'Salesforce Inc.',
      logo: '/assets/images/integrations/salesforce.svg',
      short_description: 'Complete customer relationship management platform with analytics, automation, and integrations.',
      long_description: 'Enterprise CRM solution for pipeline management, automation, reporting, and partner integrations.',
      category: 'crm',
      tags: JSON.stringify(['CRM', 'Sales', 'Marketing']),
      pricing_type: 'paid',
      pricing_value: 29,
      pricing_period: 'month',
      rating: 4.7,
      review_count: 256,
      featured: 1,
      trending: 0,
      sponsored: 0,
      status: 'published',
      created_at: now,
      updated_at: now
    },
    {
      id: 'app-002',
      vendor_id: 'vendor_saasworld_labs',
      slug: 'asana-tasks',
      name: 'Asana Tasks',
      provider: 'Asana Inc.',
      logo: '/assets/images/integrations/asana.svg',
      short_description: 'Advanced project management tool with team collaboration features, timeline tracking, and resource allocation.',
      long_description: 'Work management for product, marketing, and operations teams with timeline and portfolio reporting.',
      category: 'productivity',
      tags: JSON.stringify(['Project Management', 'Collaboration']),
      pricing_type: 'trial',
      pricing_value: 19,
      pricing_period: 'month',
      rating: 4.5,
      review_count: 189,
      featured: 0,
      trending: 1,
      sponsored: 0,
      status: 'published',
      created_at: now,
      updated_at: now
    },
    {
      id: 'app-003',
      vendor_id: 'vendor_saasworld_admin',
      slug: 'zapier-connect',
      name: 'Zapier Connect',
      provider: 'Zapier Inc.',
      logo: '/assets/images/integrations/zapier.svg',
      short_description: 'Real-time data synchronization platform for businesses with multi-source integration capabilities.',
      long_description: 'Automation and integration platform connecting SaaS tools, workflow triggers, and operational syncs.',
      category: 'integration',
      tags: JSON.stringify(['Data', 'Integration', 'Sync']),
      pricing_type: 'paid',
      pricing_value: 49,
      pricing_period: 'month',
      rating: 4.2,
      review_count: 127,
      featured: 0,
      trending: 1,
      sponsored: 1,
      status: 'published',
      created_at: now,
      updated_at: now
    }
  ]

  apps.forEach(app => insertApp.run(app))
}

export function getDb() {
  if (database) {
    return database
  }

  database = new Database(getDatabasePath())
  createSchema(database)
  seedDatabase(database)
  return database
}

export function makeSlug(value: string) {
  return slugify(value)
}

export function makeId(prefix: string) {
  return createId(prefix)
}
