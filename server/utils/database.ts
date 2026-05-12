/**
 * database.ts — SQLite persistence layer (better-sqlite3)
 *
 * Database location:
 *   Set SAASWORLD_DB_PATH env var to an absolute path for the SQLite file.
 *   Default: <project-root>/data/saasworld.db
 *
 * PRODUCTION NOTE:
 *   SQLite works great for single-instance deployments (VPS, Fly.io single machine, etc.).
 *   For multi-instance / horizontally-scaled deployments you should migrate to a
 *   network-accessible database.  Drop-in replacement options:
 *
 *   • PostgreSQL  — install `pg` and swap `better-sqlite3` calls for `pg` queries.
 *   • PlanetScale / Turso — install `@libsql/client` for edge-compatible SQLite-as-a-service.
 *   • Neon / Supabase — managed Postgres with Prisma or Drizzle ORM.
 *
 *   For Turso specifically, change the db initialisation to:
 *     import { createClient } from '@libsql/client'
 *     const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_TOKEN })
 *
 *   The rest of this file's API surface (getDb, makeId, logActivity, …) remains the same
 *   as long as you provide an adapter with synchronous `.prepare().run()` semantics.
 */
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
  source: string
  source_url: string | null
  website_url: string
  extracted_data: string  // JSON string of ExtractedListing
  confidence_score: number
  status: 'pending' | 'needs_review' | 'auto_approved' | 'approved' | 'rejected' | 'outreached' | 'claimed' | 'live'
  listing_id: string | null
  reject_reason: string | null
  claim_email_sent: number
  founder_email: string | null
  founder_name: string | null
  claim_token: string | null
  claim_token_exp: string | null
  outreach_count: number
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
    `ALTER TABLE reviews ADD COLUMN use_case TEXT`,
    `ALTER TABLE reviews ADD COLUMN purchase_verified INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE reviews ADD COLUMN verified_purchase_id TEXT`,
    `ALTER TABLE reviews ADD COLUMN flag_count INTEGER NOT NULL DEFAULT 0`,
    // reviews — verification detail columns (Pillar 1.1)
    `ALTER TABLE reviews ADD COLUMN verification_method TEXT`,
    `ALTER TABLE reviews ADD COLUMN verified_at TEXT`,
    `ALTER TABLE reviews ADD COLUMN verification_source TEXT`,
    // discovery_queue
    `ALTER TABLE discovery_queue ADD COLUMN claim_email_sent INTEGER NOT NULL DEFAULT 0`,
    // users — 2FA (TOTP)
    `ALTER TABLE users ADD COLUMN totp_secret TEXT`,
    `ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN totp_backup_codes TEXT`,
    // vendor_promotions — buyer-facing fields
    `ALTER TABLE vendor_promotions ADD COLUMN promo_code TEXT`,
    `ALTER TABLE vendor_promotions ADD COLUMN percent_off INTEGER`,
    // review_replies — visibility
    `ALTER TABLE review_replies ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0`
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

    -- Review replies (vendor reply to review)
    CREATE TABLE IF NOT EXISTS review_replies (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL UNIQUE,
      vendor_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_rr_review_id ON review_replies(review_id);
    CREATE INDEX IF NOT EXISTS idx_rr_vendor_id ON review_replies(vendor_id);

    -- App page view events (for vendor analytics)
    CREATE TABLE IF NOT EXISTS app_views (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      viewer_key TEXT NOT NULL,
      ref TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_av_app_id    ON app_views(app_id);
    CREATE INDEX IF NOT EXISTS idx_av_vendor_id ON app_views(vendor_id);
    CREATE INDEX IF NOT EXISTS idx_av_created   ON app_views(created_at DESC);

    -- Team members (per vendor)
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      user_id TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'invited',
      invited_at TEXT NOT NULL,
      accepted_at TEXT,
      FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tm_vendor_id ON team_members(vendor_id);
    CREATE INDEX IF NOT EXISTS idx_tm_email     ON team_members(email);

    -- Enquiries / buyer-vendor messaging threads
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      buyer_id TEXT,
      buyer_email TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_enq_vendor_id ON enquiries(vendor_id);
    CREATE INDEX IF NOT EXISTS idx_enq_buyer_id  ON enquiries(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_enq_app_id    ON enquiries(app_id);

    CREATE TABLE IF NOT EXISTS enquiry_messages (
      id TEXT PRIMARY KEY,
      enquiry_id TEXT NOT NULL,
      sender_id TEXT,
      sender_email TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_em_enquiry_id ON enquiry_messages(enquiry_id);

    -- GDPR consent log
    CREATE TABLE IF NOT EXISTS consent_log (
      id TEXT PRIMARY KEY,
      visitor_key TEXT NOT NULL,
      analytics INTEGER NOT NULL DEFAULT 0,
      marketing INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cl_visitor ON consent_log(visitor_key);

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Moonmart Editorial',
      author_title TEXT,
      read_minutes INTEGER NOT NULL DEFAULT 8,
      image TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      toc TEXT NOT NULL DEFAULT '[]',
      content TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'published',
      is_auto_generated INTEGER NOT NULL DEFAULT 0,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
    CREATE INDEX IF NOT EXISTS idx_blog_cat ON blog_posts(category);
    CREATE INDEX IF NOT EXISTS idx_blog_pub ON blog_posts(published_at DESC);

    CREATE TABLE IF NOT EXISTS forum_threads (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      author_name TEXT NOT NULL,
      author_email TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      pinned INTEGER NOT NULL DEFAULT 0,
      locked INTEGER NOT NULL DEFAULT 0,
      reply_count INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      last_reply_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_forum_cat ON forum_threads(category);
    CREATE INDEX IF NOT EXISTS idx_forum_created ON forum_threads(created_at DESC);

    CREATE TABLE IF NOT EXISTS forum_replies (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      user_id TEXT,
      author_name TEXT NOT NULL,
      author_email TEXT,
      body TEXT NOT NULL,
      is_accepted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_forum_reply_thread ON forum_replies(thread_id);

    CREATE TABLE IF NOT EXISTS partner_applications (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      website TEXT,
      partnership_type TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_partner_email ON partner_applications(email);
    CREATE INDEX IF NOT EXISTS idx_partner_status ON partner_applications(status);

    CREATE TABLE IF NOT EXISTS affiliate_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      referral_code TEXT NOT NULL UNIQUE,
      commission_rate REAL NOT NULL DEFAULT 0.20,
      status TEXT NOT NULL DEFAULT 'active',
      total_clicks INTEGER NOT NULL DEFAULT 0,
      total_conversions INTEGER NOT NULL DEFAULT 0,
      total_earned REAL NOT NULL DEFAULT 0.0,
      pending_payout REAL NOT NULL DEFAULT 0.0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_affiliate_code ON affiliate_accounts(referral_code);
    CREATE INDEX IF NOT EXISTS idx_affiliate_user ON affiliate_accounts(user_id);

    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      visitor_key TEXT,
      ref_url TEXT,
      converted INTEGER NOT NULL DEFAULT 0,
      converted_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (affiliate_id) REFERENCES affiliate_accounts(id)
    );

    -- ── Buyer Saved App Metadata ──────────────────────────────────────────────
    -- Stores per-user evaluation state (status, notes) for favorited apps.
    -- No FK constraint on app_id so it works with both DB-seeded and external apps.
    CREATE TABLE IF NOT EXISTS buyer_saved_app_metadata (
      user_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'shortlisted',
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, app_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bsam_user ON buyer_saved_app_metadata(user_id);

    -- ── Trust Engine ─────────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS verified_purchases (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      user_id TEXT,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      used INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vp_token ON verified_purchases(token);
    CREATE INDEX IF NOT EXISTS idx_vp_app_email ON verified_purchases(app_id, email);

    CREATE TABLE IF NOT EXISTS vendor_health_scores (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      response_rate REAL NOT NULL DEFAULT 0,
      avg_rating REAL NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      review_velocity REAL NOT NULL DEFAULT 0,
      flagged_count INTEGER NOT NULL DEFAULT 0,
      verified_pct REAL NOT NULL DEFAULT 0,
      score REAL NOT NULL DEFAULT 0,
      computed_at TEXT NOT NULL,
      FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_vhs_vendor ON vendor_health_scores(vendor_id);

    CREATE TABLE IF NOT EXISTS review_flags (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL,
      reporter_key TEXT NOT NULL,
      flag_reason TEXT NOT NULL,
      details TEXT,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_rf_review ON review_flags(review_id);
    CREATE INDEX IF NOT EXISTS idx_rf_resolved ON review_flags(resolved);

    -- ── Community Q&A ────────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      author_name TEXT NOT NULL DEFAULT 'Anonymous',
      author_email TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      app_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      view_count INTEGER NOT NULL DEFAULT 0,
      answer_count INTEGER NOT NULL DEFAULT 0,
      vote_score INTEGER NOT NULL DEFAULT 0,
      solved INTEGER NOT NULL DEFAULT 0,
      accepted_answer_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_q_slug ON questions(slug);
    CREATE INDEX IF NOT EXISTS idx_q_app ON questions(app_id);
    CREATE INDEX IF NOT EXISTS idx_q_created ON questions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_q_solved ON questions(solved);

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      user_id TEXT,
      author_name TEXT NOT NULL DEFAULT 'Anonymous',
      author_email TEXT,
      body TEXT NOT NULL,
      is_accepted INTEGER NOT NULL DEFAULT 0,
      vote_score INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ans_question ON answers(question_id);

    CREATE TABLE IF NOT EXISTS qa_votes (
      id TEXT PRIMARY KEY,
      voter_key TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      UNIQUE (voter_key, target_type, target_id)
    );
    CREATE INDEX IF NOT EXISTS idx_qav_target ON qa_votes(target_type, target_id);

    CREATE TABLE IF NOT EXISTS question_tags (
      tag TEXT PRIMARY KEY,
      question_count INTEGER NOT NULL DEFAULT 0
    );

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 2: Price Intelligence
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS price_reports (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      reporter_key TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      price_usd REAL NOT NULL,
      billing_period TEXT NOT NULL DEFAULT 'month',
      seats INTEGER,
      currency TEXT NOT NULL DEFAULT 'USD',
      source TEXT NOT NULL DEFAULT 'community',
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_price_reports_app ON price_reports(app_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS price_aggregates (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL UNIQUE REFERENCES app_listings(id) ON DELETE CASCADE,
      plan_name TEXT NOT NULL,
      min_price REAL,
      max_price REAL,
      avg_price REAL,
      median_price REAL,
      sample_count INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_price_agg_app ON price_aggregates(app_id);

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 2: Integration Graph
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      partner_app_id TEXT REFERENCES app_listings(id) ON DELETE SET NULL,
      partner_name TEXT NOT NULL,
      partner_logo TEXT,
      description TEXT,
      integration_type TEXT NOT NULL DEFAULT 'native',
      direction TEXT NOT NULL DEFAULT 'bidirectional',
      vote_score INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_integrations_app ON integrations(app_id, status);
    CREATE INDEX IF NOT EXISTS idx_integrations_partner ON integrations(partner_app_id);

    CREATE TABLE IF NOT EXISTS integration_votes (
      id TEXT PRIMARY KEY,
      integration_id TEXT NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
      voter_key TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      UNIQUE (integration_id, voter_key)
    );
    CREATE INDEX IF NOT EXISTS idx_int_votes_integration ON integration_votes(integration_id);

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 3: Stack Intelligence
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS user_stacks (
      id TEXT PRIMARY KEY,
      user_key TEXT NOT NULL,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      app_name TEXT NOT NULL,
      app_logo TEXT,
      category TEXT,
      price_usd REAL,
      billing_period TEXT DEFAULT 'month',
      seats INTEGER DEFAULT 1,
      renewal_date TEXT,
      notes TEXT,
      added_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_key, app_id)
    );
    CREATE INDEX IF NOT EXISTS idx_stacks_user ON user_stacks(user_key);
    CREATE INDEX IF NOT EXISTS idx_stacks_app  ON user_stacks(app_id);

    CREATE TABLE IF NOT EXISTS stack_overlaps (
      id TEXT PRIMARY KEY,
      app_id_a TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      app_id_b TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      co_occurrence INTEGER NOT NULL DEFAULT 1,
      last_updated TEXT NOT NULL,
      UNIQUE (app_id_a, app_id_b)
    );
    CREATE INDEX IF NOT EXISTS idx_overlaps_a ON stack_overlaps(app_id_a, co_occurrence DESC);
    CREATE INDEX IF NOT EXISTS idx_overlaps_b ON stack_overlaps(app_id_b, co_occurrence DESC);

    CREATE TABLE IF NOT EXISTS price_alerts (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      threshold TEXT NOT NULL DEFAULT 'any',
      created_at TEXT NOT NULL,
      UNIQUE (app_id, email)
    );
    CREATE INDEX IF NOT EXISTS idx_price_alerts_app ON price_alerts(app_id);
    CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(email);

    CREATE TABLE IF NOT EXISTS renewal_reminders (
      id TEXT PRIMARY KEY,
      user_key TEXT NOT NULL,
      stack_item_id TEXT NOT NULL REFERENCES user_stacks(id) ON DELETE CASCADE,
      remind_at TEXT NOT NULL,
      sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reminders_user ON renewal_reminders(user_key, remind_at);

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 4: Enterprise Procurement
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS rfps (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT,
      budget_min REAL,
      budget_max REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      seats INTEGER,
      requirements TEXT,
      deadline TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      response_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rfps_user   ON rfps(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status, created_at DESC);

    CREATE TABLE IF NOT EXISTS rfp_responses (
      id TEXT PRIMARY KEY,
      rfp_id TEXT NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
      vendor_id TEXT REFERENCES vendor_profiles(id) ON DELETE SET NULL,
      app_id TEXT REFERENCES app_listings(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      price_usd REAL,
      billing_period TEXT,
      attachment_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rfp_resp_rfp ON rfp_responses(rfp_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS buying_rooms (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_brooms_owner ON buying_rooms(owner_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS buying_room_members (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES buying_rooms(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      invited_at TEXT NOT NULL,
      UNIQUE (room_id, email)
    );
    CREATE INDEX IF NOT EXISTS idx_broom_members ON buying_room_members(room_id);

    CREATE TABLE IF NOT EXISTS buying_room_apps (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES buying_rooms(id) ON DELETE CASCADE,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      added_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      vote_score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'considering',
      notes TEXT,
      added_at TEXT NOT NULL,
      UNIQUE (room_id, app_id)
    );
    CREATE INDEX IF NOT EXISTS idx_broom_apps ON buying_room_apps(room_id);

    CREATE TABLE IF NOT EXISTS buying_room_comments (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES buying_rooms(id) ON DELETE CASCADE,
      app_id TEXT REFERENCES app_listings(id) ON DELETE SET NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_broom_comments ON buying_room_comments(room_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      app_id TEXT REFERENCES app_listings(id) ON DELETE SET NULL,
      app_name TEXT NOT NULL,
      vendor_name TEXT,
      price_usd REAL,
      billing_period TEXT,
      seats INTEGER,
      start_date TEXT,
      end_date TEXT,
      auto_renews INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id, end_date);

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 5: Trust Engine — Vendor Customer Lists
    -- ─────────────────────────────────────────────────────────────────
    -- Vendors upload their customer email list (hashed) so that review
    -- submissions from matching emails receive the "Verified Buyer" badge.
    CREATE TABLE IF NOT EXISTS vendor_customer_lists (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      email_hash TEXT NOT NULL,   -- SHA-256 of lowercase(email) — never store raw
      created_at TEXT NOT NULL,
      UNIQUE (app_id, email_hash)
    );
    CREATE INDEX IF NOT EXISTS idx_vcl_app ON vendor_customer_lists(app_id);
    CREATE INDEX IF NOT EXISTS idx_vcl_vendor ON vendor_customer_lists(vendor_id);

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 5: Developer API Keys
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key_hash TEXT NOT NULL UNIQUE,   -- SHA-256 of the raw key
      key_prefix TEXT NOT NULL,         -- first 8 chars — shown in UI
      name TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free',   -- free | developer | business
      requests_today INTEGER NOT NULL DEFAULT 0,
      requests_total INTEGER NOT NULL DEFAULT 0,
      window_reset_at TEXT NOT NULL,
      last_used_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_apikeys_user ON api_keys(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_apikeys_hash ON api_keys(key_hash);

    CREATE TABLE IF NOT EXISTS vendor_compliance_badges (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL REFERENCES app_listings(id) ON DELETE CASCADE,
      badge_type TEXT NOT NULL,
      region TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'verified',
      verified_at TEXT,
      source_url TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vcb_app ON vendor_compliance_badges(app_id);
    CREATE INDEX IF NOT EXISTS idx_vcb_region ON vendor_compliance_badges(region);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_vcb_app_badge ON vendor_compliance_badges(app_id, badge_type, region);

    -- Support tickets (user-submitted; admin replies)
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_st_user ON support_tickets(user_id);
    CREATE INDEX IF NOT EXISTS idx_st_status ON support_tickets(status, created_at DESC);

    CREATE TABLE IF NOT EXISTS support_ticket_replies (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      sender_email TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      is_staff INTEGER NOT NULL DEFAULT 0,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_str_ticket ON support_ticket_replies(ticket_id, created_at);

    -- ─────────────────────────────────────────────────────────────────
    -- PHASE 5: Content — Changelog, Roadmap, Guides, Job Listings
    -- ─────────────────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS changelog_entries (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      body_markdown TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'feature',   -- feature | fix | improvement | security | breaking
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_changelog_pub ON changelog_entries(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_changelog_type ON changelog_entries(type);

    CREATE TABLE IF NOT EXISTS roadmap_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'product',   -- product | infrastructure | community | api
      status TEXT NOT NULL DEFAULT 'planned',      -- planned | in-progress | done | cancelled
      quarter TEXT NOT NULL,                        -- e.g. 'Q2 2026'
      votes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_roadmap_status ON roadmap_items(status, quarter);
    CREATE INDEX IF NOT EXISTS idx_roadmap_votes ON roadmap_items(votes DESC);

    CREATE TABLE IF NOT EXISTS roadmap_votes (
      item_id TEXT NOT NULL REFERENCES roadmap_items(id) ON DELETE CASCADE,
      voter_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (item_id, voter_key)
    );

    CREATE TABLE IF NOT EXISTS guide_articles (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'buyer-tips',  -- buyer-tips | vendor-guide | api-docs | getting-started | negotiation
      difficulty TEXT NOT NULL DEFAULT 'beginner',  -- beginner | intermediate | advanced
      read_minutes INTEGER NOT NULL DEFAULT 5,
      author TEXT NOT NULL DEFAULT 'Moonmart Editorial',
      tags TEXT NOT NULL DEFAULT '[]',
      body_markdown TEXT NOT NULL DEFAULT '',
      related_app_ids TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'published',
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_guides_slug ON guide_articles(slug);
    CREATE INDEX IF NOT EXISTS idx_guides_cat ON guide_articles(category, status);
    CREATE INDEX IF NOT EXISTS idx_guides_pub ON guide_articles(published_at DESC);

    CREATE TABLE IF NOT EXISTS job_listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,    -- engineering | product | marketing | sales | operations | design
      location TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'full-time',   -- full-time | part-time | contract | internship
      remote TEXT NOT NULL DEFAULT 'remote',    -- remote | hybrid | on-site
      description TEXT NOT NULL,
      requirements TEXT NOT NULL DEFAULT '[]',  -- JSON array of bullet points
      nice_to_have TEXT NOT NULL DEFAULT '[]',
      salary_min INTEGER,
      salary_max INTEGER,
      salary_currency TEXT NOT NULL DEFAULT 'USD',
      apply_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',    -- active | filled | paused
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_dept ON job_listings(department, status);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_listings(status, created_at DESC);

    -- ─────────────────────────────────────────────────────────────────
    -- DISCOVERY AGENT: Agent runs log
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      urls_found INTEGER NOT NULL DEFAULT 0,
      urls_new INTEGER NOT NULL DEFAULT 0,
      urls_failed INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'running'   -- running | done | error
    );
    CREATE INDEX IF NOT EXISTS idx_ar_source  ON agent_runs(source, started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ar_status  ON agent_runs(status);

    -- ─────────────────────────────────────────────────────────────────
    -- DISCOVERY AGENT: Outreach email log
    -- ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS outreach_emails (
      id TEXT PRIMARY KEY,
      queue_item_id TEXT NOT NULL REFERENCES discovery_queue(id) ON DELETE CASCADE,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      sent_at TEXT,
      opened_at TEXT,
      clicked_at TEXT,
      status TEXT NOT NULL DEFAULT 'sent'   -- sent | opened | clicked | bounced | failed
    );
    CREATE INDEX IF NOT EXISTS idx_oe_queue ON outreach_emails(queue_item_id);
    CREATE INDEX IF NOT EXISTS idx_oe_email ON outreach_emails(to_email);
  `)

  // Discovery-agent column migrations (idempotent)
  const discoveryAlterations = [
    `ALTER TABLE discovery_queue ADD COLUMN founder_email TEXT`,
    `ALTER TABLE discovery_queue ADD COLUMN founder_name TEXT`,
    `ALTER TABLE discovery_queue ADD COLUMN claim_token TEXT`,
    `ALTER TABLE discovery_queue ADD COLUMN claim_token_exp TEXT`,
    `ALTER TABLE discovery_queue ADD COLUMN outreach_count INTEGER NOT NULL DEFAULT 0`
  ]
  for (const sql of discoveryAlterations) {
    try { db.exec(sql) } catch { /* column already exists */ }
  }

  // Digest opt-out column (idempotent)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN digest_opt_out INTEGER NOT NULL DEFAULT 0`)
  } catch { /* column already exists */ }

  // Weekly digest deduplication table (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS digest_sends (
      user_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      sent_at TEXT NOT NULL,
      PRIMARY KEY (user_id, week_number),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_digest_user ON digest_sends(user_id);
  `)

  // Activity log table (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      actor_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      meta TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor_id);
  `)

  // App badges table (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_badges (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      reason TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE,
      UNIQUE(app_id, badge_type)
    );
    CREATE INDEX IF NOT EXISTS idx_app_badges_app ON app_badges(app_id);
  `)

  // Vendor promotions table (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_promotions (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('discount', 'featured', 'trial-extend')),
      label TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('active', 'scheduled', 'ended')),
      budget REAL NOT NULL DEFAULT 0,
      spend REAL NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      leads INTEGER NOT NULL DEFAULT 0,
      starts_at TEXT,
      ends_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (app_id) REFERENCES app_listings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_promo_vendor ON vendor_promotions(vendor_id);
  `)

  // Ad events (impressions + clicks) — lightweight append-only table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ad_events (
      id         TEXT PRIMARY KEY,
      app_id     TEXT NOT NULL,
      placement  TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('impression','click')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_adev_app ON ad_events(app_id);
    CREATE INDEX IF NOT EXISTS idx_adev_created ON ad_events(created_at);
  `)

  // Vendor role upgrade requests (buyer → vendor)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_role_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      website_url TEXT,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      admin_note TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vrr_status ON vendor_role_requests(status);
    CREATE INDEX IF NOT EXISTS idx_vrr_user ON vendor_role_requests(user_id);
  `)

  // Sponsored slots — admin-managed active campaigns
  db.exec(`
    CREATE TABLE IF NOT EXISTS sponsored_slots (
      id          TEXT PRIMARY KEY,
      vendor_name TEXT NOT NULL,
      app_name    TEXT NOT NULL,
      app_id      TEXT,
      slot        TEXT NOT NULL,
      category    TEXT,
      status      TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK(status IN ('active','scheduled','paused','expired')),
      starts_at   TEXT NOT NULL,
      ends_at     TEXT NOT NULL,
      recurrence  TEXT NOT NULL DEFAULT 'once'
                  CHECK(recurrence IN ('once','weekly','monthly')),
      budget      REAL NOT NULL,
      budget_used REAL NOT NULL DEFAULT 0,
      notes       TEXT,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ss_status ON sponsored_slots(status);
    CREATE INDEX IF NOT EXISTS idx_ss_slot   ON sponsored_slots(slot);
  `)

  // Sponsored requests — vendor-submitted sponsorship requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS sponsored_requests (
      id               TEXT PRIMARY KEY,
      vendor_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
      app_name         TEXT NOT NULL,
      slot             TEXT NOT NULL,
      starts_at        TEXT NOT NULL,
      ends_at          TEXT NOT NULL,
      goal             TEXT NOT NULL,
      budget           REAL NOT NULL,
      tagline          TEXT,
      notes            TEXT,
      status           TEXT NOT NULL DEFAULT 'pending'
                       CHECK(status IN ('pending','approved','rejected')),
      rejection_reason TEXT,
      reviewed_at      TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sreq_status ON sponsored_requests(status);
    CREATE INDEX IF NOT EXISTS idx_sreq_vendor ON sponsored_requests(vendor_id);
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
      email_verified: 1,
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
      email_verified: 1,
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

export function logActivity(opts: {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  entityType?: string
  entityId?: string
  meta?: Record<string, unknown>
}) {
  try {
    const db = getDb()
    db.prepare(`
      INSERT INTO activity_log (id, actor_id, actor_email, action, entity_type, entity_id, meta, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      createId('alog'),
      opts.actorId ?? null,
      opts.actorEmail ?? null,
      opts.action,
      opts.entityType ?? null,
      opts.entityId ?? null,
      opts.meta ? JSON.stringify(opts.meta) : null
    )
  } catch (err) {
    console.error('[logActivity] failed:', err)
  }
}
