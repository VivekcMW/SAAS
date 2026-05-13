/**
 * Apps Sitemap — DB-driven
 * Generates one <url> entry per published app listing, plus
 * their /pricing and /alternatives sub-pages.
 *
 * Priority tiers:
 *   rating ≥ 4.5  → 0.9
 *   rating ≥ 4.0  → 0.8
 *   else          → 0.6
 */
import { getAllPublishedApps } from '../utils/seoEngine'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=7200, s-maxage=14400')

  const baseUrl = 'https://moonmart.ai'

  let apps: Array<{ slug: string; updated_at: string; rating: number; name: string }> = []
  try {
    apps = getAllPublishedApps()
  } catch { /* DB cold start — fall through to empty sitemap */ }

  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const rows = apps.flatMap(app => {
    const slug = escape(app.slug)
    const lastmod = (app.updated_at || new Date().toISOString()).split('T')[0]
    const priority = app.rating >= 4.5 ? '0.9' : app.rating >= 4.0 ? '0.8' : '0.6'

    return [
      // Main app detail page
      `  <url>
    <loc>${baseUrl}/marketplace/app/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/app/${slug}</image:loc>
      <image:title>${escape(app.name)}</image:title>
    </image:image>
  </url>`,
      // Pricing sub-page
      `  <url>
    <loc>${baseUrl}/pricing/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
      // Alternatives sub-page
      `  <url>
    <loc>${baseUrl}/alternatives/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    ]
  })

  // Fallback: if DB empty keep a minimal valid sitemap
  if (rows.length === 0) {
    rows.push(`  <url>\n    <loc>${baseUrl}/marketplace</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.8</priority>\n  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${rows.join('\n')}
</urlset>`
})

/* ── dead code below kept for reference only, never reached ── */
const _UNUSED_featuredApps = {
    // AI & Machine Learning
    'ai-machine-learning': [
      'openai-gpt', 'claude-ai', 'midjourney', 'stable-diffusion', 'jasper-ai',
      'copy-ai', 'writesonic', 'grammarly', 'notion-ai', 'github-copilot',
      'tensorflow', 'pytorch', 'hugging-face', 'replicate', 'runway-ml'
    ],
    
    // Communication & Collaboration
    'communication': [
      'slack', 'microsoft-teams', 'zoom', 'discord', 'telegram', 'whatsapp-business',
      'skype', 'google-meet', 'webex', 'gotomeeting', 'bluejeans', 'jitsi',
      'mattermost', 'rocket-chat', 'element', 'signal', 'wire'
    ],
    
    // Project Management
    'project-management': [
      'trello', 'asana', 'jira', 'monday', 'clickup', 'basecamp', 'smartsheet',
      'wrike', 'airtable', 'notion', 'obsidian', 'todoist', 'any-do',
      'linear', 'height', 'shortcut', 'workfront', 'teamwork'
    ],
    
    // Design & Creative
    'design-creative': [
      'figma', 'adobe-creative-cloud', 'canva', 'sketch', 'invision', 'framer',
      'miro', 'lucidchart', 'draw-io', 'procreate', 'affinity-designer',
      'principle', 'protopie', 'marvel', 'balsamiq', 'adobe-xd'
    ],
    
    // CRM & Sales
    'crm-sales': [
      'salesforce', 'hubspot', 'pipedrive', 'zoho-crm', 'freshworks', 'monday-crm',
      'insightly', 'copper', 'close', 'nimble', 'agile-crm', 'keap',
      'salesmate', 'nutshell', 'zendesk-sell', 'active-campaign'
    ],
    
    // E-commerce
    'ecommerce': [
      'shopify', 'woocommerce', 'magento', 'bigcommerce', 'squarespace', 'wix',
      'prestashop', 'opencart', 'ecwid', 'volusion', 'stripe', 'paypal',
      'square', 'klarna', 'afterpay', 'bold-commerce'
    ],
    
    // Marketing & Analytics
    'marketing-analytics': [
      'google-analytics', 'mixpanel', 'amplitude', 'hotjar', 'crazy-egg',
      'fullstory', 'logrocket', 'heap', 'kissmetrics', 'segment',
      'mailchimp', 'constant-contact', 'sendinblue', 'convertkit', 'aweber'
    ],
    
    // Productivity
    'productivity': [
      'google-workspace', 'microsoft-365', 'zoho-workplace', 'apple-iwork',
      'libreoffice-online', 'onlyoffice', 'quip', 'coda', 'airtable',
      'calendly', 'acuity-scheduling', 'doodle', 'when2meet', 'calendso'
    ],
    
    // Development & IT
    'development': [
      'github', 'gitlab', 'bitbucket', 'heroku', 'netlify', 'vercel',
      'digitalocean', 'aws', 'azure', 'google-cloud', 'docker',
      'kubernetes', 'jenkins', 'circleci', 'travis-ci', 'sentry'
    ],
    
    // Finance & Accounting
    'finance-accounting': [
      'quickbooks', 'xero', 'freshbooks', 'wave', 'sage', 'zoho-books',
      'kashoo', 'billy', 'invoice-ninja', 'freeagent', 'mint',
      'ynab', 'personal-capital', 'expensify', 'receipt-bank'
    ],
    
    // HR & People
    'hr-people': [
      'workday', 'bamboohr', 'greenhouse', 'lever', 'workable',
      'breezy-hr', 'smartrecruiters', 'zoho-recruit', 'indeed-hiring',
      'gusto', 'rippling', 'zenefits', 'justworks', 'adp'
    ],
    
    // Security
    'security': [
      'okta', 'auth0', 'ping-identity', 'onelogin', 'duo-security',
      'lastpass', 'dashlane', 'bitwarden', '1password', 'nordpass',
      'crowdstrike', 'sentinelone', 'palo-alto', 'fortinet', 'check-point'
    ]
  }

  // Generate app pages
  const appPages: Array<{ url: string; priority: string; changefreq: string; lastmod: string; category: string }> = []
  
  Object.entries(featuredApps).forEach(([category, apps]) => {
    apps.forEach(appId => {
      appPages.push({
        url: `/marketplace/app/${appId}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: currentDate,
        category
      })
    })
  })

  // Add trending and popular app pages with higher priority
  const trendingApps = [
    'chatgpt', 'claude-ai', 'midjourney', 'notion', 'figma', 'slack',
    'zoom', 'salesforce', 'hubspot', 'shopify', 'stripe', 'github'
  ]

  trendingApps.forEach(appId => {
    // Update priority for trending apps or add if not exists
    const existingApp = appPages.find(app => app.url.includes(appId))
    if (existingApp) {
      existingApp.priority = '0.9'
      existingApp.changefreq = 'daily'
    } else {
      appPages.push({
        url: `/marketplace/app/${appId}`,
        priority: '0.9',
        changefreq: 'daily',
        lastmod: currentDate,
        category: 'trending'
      })
    }
  })

  // Sort by priority (higher first) then alphabetically
  appPages.sort((a, b) => {
    if (a.priority !== b.priority) {
      return parseFloat(b.priority) - parseFloat(a.priority)
    }
    return a.url.localeCompare(b.url)
  })

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${appPages.map(page => {
  const fullUrl = `${baseUrl}${page.url}`
  
  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
}).join('\n')}
</urlset>`

  // Set appropriate headers
  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=7200') // Cache for 2 hours
  
  return sitemap
})
