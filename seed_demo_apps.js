const Database = require('better-sqlite3')
const db = new Database('/Users/vivekanandchoudhari/Downloads/SaasWorld-main/.data/saasworld.db')
const now = new Date().toISOString()
const vendorId = 'vendor_saasworld_labs'

const apps = [
  {
    id: 'demo-slack',
    slug: 'slack',
    name: 'Slack',
    provider: 'Salesforce',
    logo: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
    short_description: 'Business messaging platform that brings your team together.',
    long_description: 'Slack is a cloud-based team collaboration platform offering real-time messaging, file sharing, integrations with hundreds of tools, and organised channels for every project, topic, and team.',
    category: 'communication',
    tags: JSON.stringify(['Messaging', 'Collaboration', 'Communication', 'Remote Work', 'Enterprise']),
    pricing_type: 'trial',
    pricing_value: 7.25,
    pricing_period: 'month',
    rating: 4.6,
    review_count: 32410,
    featured: 1,
    trending: 1
  },
  {
    id: 'demo-notion',
    slug: 'notion',
    name: 'Notion',
    provider: 'Notion Labs',
    logo: 'https://www.notion.so/images/logo-ios.png',
    short_description: 'All-in-one workspace for notes, docs, databases, and wikis.',
    long_description: 'Notion is a connected workspace where your team can create docs, take notes, manage tasks, and build a knowledge base. It replaces several standalone tools with a single collaborative platform.',
    category: 'productivity',
    tags: JSON.stringify(['Productivity', 'Notes', 'Wiki', 'Database', 'Docs']),
    pricing_type: 'trial',
    pricing_value: 10,
    pricing_period: 'month',
    rating: 4.7,
    review_count: 18920,
    featured: 0,
    trending: 1
  },
  {
    id: 'demo-hubspot',
    slug: 'hubspot',
    name: 'HubSpot',
    provider: 'HubSpot Inc.',
    logo: 'https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_approved-sprocket-y.png',
    short_description: 'CRM platform with marketing, sales, and customer service tools.',
    long_description: 'HubSpot is an inbound marketing, sales, and service software that helps companies attract visitors, convert leads, and close customers. It offers a free CRM with contact management, pipeline tracking, and integrations.',
    category: 'crm',
    tags: JSON.stringify(['CRM', 'Marketing', 'Sales', 'Email Marketing', 'Automation']),
    pricing_type: 'trial',
    pricing_value: 45,
    pricing_period: 'month',
    rating: 4.4,
    review_count: 11230,
    featured: 1,
    trending: 0
  },
  {
    id: 'demo-linear',
    slug: 'linear',
    name: 'Linear',
    provider: 'Linear Inc.',
    logo: 'https://linear.app/favicon.ico',
    short_description: 'Issue tracker built for modern software teams.',
    long_description: 'Linear is a streamlined issue tracking and project management tool used by software teams. It combines fast keyboard-driven workflows with powerful cycle planning, roadmaps, and GitHub integrations.',
    category: 'project-management',
    tags: JSON.stringify(['Project Management', 'Issue Tracking', 'Dev Tools', 'Agile', 'Engineering']),
    pricing_type: 'trial',
    pricing_value: 8,
    pricing_period: 'month',
    rating: 4.8,
    review_count: 4800,
    featured: 0,
    trending: 1
  },
  {
    id: 'demo-intercom',
    slug: 'intercom',
    name: 'Intercom',
    provider: 'Intercom Inc.',
    logo: 'https://www.intercom.com/favicon.ico',
    short_description: 'Customer messaging platform for support, marketing and sales.',
    long_description: 'Intercom is a customer communication platform that allows businesses to chat with customers in real-time via live chat, bots, and email. It offers a unified inbox, product tours, and a help center for self-service.',
    category: 'customer-support',
    tags: JSON.stringify(['Customer Support', 'Live Chat', 'Help Desk', 'CX', 'Chatbot']),
    pricing_type: 'paid',
    pricing_value: 74,
    pricing_period: 'month',
    rating: 4.3,
    review_count: 2900,
    featured: 0,
    trending: 0
  }
]

const stmt = db.prepare(`
  INSERT OR IGNORE INTO app_listings (
    id, vendor_id, slug, name, provider, logo, short_description, long_description,
    category, tags, pricing_type, pricing_value, pricing_period,
    rating, review_count, featured, trending, sponsored, status,
    created_at, updated_at
  ) VALUES (
    @id, @vendorId, @slug, @name, @provider, @logo, @short_description, @long_description,
    @category, @tags, @pricing_type, @pricing_value, @pricing_period,
    @rating, @review_count, @featured, @trending, 0, 'published',
    @now, @now
  )
`)

for (const app of apps) {
  const result = stmt.run({ ...app, vendorId, now })
  console.log(app.slug, '->', result.changes > 0 ? 'inserted' : 'already exists')
}

// Verify
const rows = db.prepare("SELECT slug, name FROM app_listings WHERE status = 'published'").all()
console.log('\nAll published apps:', rows)
db.close()
