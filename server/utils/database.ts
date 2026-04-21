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
    INSERT INTO users (
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
      email: 'demo@saasworld.com',
      password_hash: 'scrypt:placeholder',
      first_name: 'Demo',
      last_name: 'Vendor',
      full_name: 'Demo Vendor',
      company_name: 'SaaSWorld Labs',
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
      email: 'admin@saasworld.com',
      password_hash: 'scrypt:placeholder-admin',
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
      company_name: 'SaaSWorld',
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
      company_name: 'SaaSWorld Labs',
      company_slug: 'saasworld-labs',
      status: 'active',
      created_at: now,
      updated_at: now
    },
    {
      id: 'vendor_saasworld_admin',
      user_id: 'user_admin_demo',
      company_name: 'SaaSWorld',
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
