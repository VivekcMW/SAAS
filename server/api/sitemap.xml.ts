/**
 * Advanced Sitemap Generation for Moonmart
 * Implements comprehensive sitemap strategy from the Global SEO Strategy
 * Includes hreflang, prioritization, and strategic URL structure
 */

import { allCategoryKeywords } from '~/seo/keywords/index'

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://moonmart.ai'
  const currentDate = new Date().toISOString()
  
  // High-priority pages optimized for lead generation and traffic
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
    { url: '/marketplace', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/categories', priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
    { url: '/trending', priority: '0.8', changefreq: 'daily', lastmod: currentDate },
    { url: '/new-releases', priority: '0.8', changefreq: 'daily', lastmod: currentDate },
    { url: '/popular', priority: '0.8', changefreq: 'daily', lastmod: currentDate },
    { url: '/enterprise', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/startup-tools', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    
    // Content marketing pages for SEO
    { url: '/insights', priority: '0.8', changefreq: 'daily', lastmod: currentDate },
    { url: '/reports', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/comparisons', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/alternatives', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/guides', priority: '0.7', changefreq: 'weekly', lastmod: currentDate },
    
    // Standard pages
    { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/features', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/contact', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/help', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/documentation', priority: '0.6', changefreq: 'weekly', lastmod: currentDate },
    { url: '/careers', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/changelog', priority: '0.6', changefreq: 'weekly', lastmod: currentDate },
    { url: '/community', priority: '0.7', changefreq: 'daily', lastmod: currentDate },
    
    // Legal pages
    { url: '/privacy', priority: '0.4', changefreq: 'yearly', lastmod: currentDate },
    { url: '/terms', priority: '0.4', changefreq: 'yearly', lastmod: currentDate },
    { url: '/cookies', priority: '0.3', changefreq: 'yearly', lastmod: currentDate }
  ]

  // Generate category pages with enhanced SEO structure
  const categoryPages: Array<{ url: string; priority: string; changefreq: string; lastmod: string }> = []
  
  Object.entries(allCategoryKeywords).forEach(([categoryId, categoryData]) => {
    // Main category page with high priority for traffic generation
    categoryPages.push({
      url: `/category/${categoryId}`,
      priority: '0.8',
      changefreq: 'daily',
      lastmod: currentDate
    })

    // Subcategory pages optimized for long-tail keywords
    Object.entries(categoryData.subcategories).forEach(([subcategoryKey, subcategoryData]) => {
      categoryPages.push({
        url: subcategoryData.path,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: currentDate
      })
    })
  })

  // High-value comparison pages targeting competitor keywords
  const comparisonPages = [
    // CRM Comparisons
    '/comparison/salesforce-vs-hubspot',
    '/comparison/pipedrive-vs-zoho-crm',
    '/comparison/monday-crm-vs-airtable',
    '/comparison/freshworks-vs-insightly',
    
    // Communication Tools
    '/comparison/slack-vs-teams',
    '/comparison/zoom-vs-webex',
    '/comparison/discord-vs-telegram',
    '/comparison/google-meet-vs-zoom',
    
    // Project Management
    '/comparison/asana-vs-monday',
    '/comparison/trello-vs-notion',
    '/comparison/clickup-vs-airtable',
    '/comparison/jira-vs-asana',
    '/comparison/basecamp-vs-wrike',
    
    // E-commerce Platforms
    '/comparison/shopify-vs-woocommerce',
    '/comparison/bigcommerce-vs-magento',
    '/comparison/squarespace-vs-wix',
    '/comparison/prestashop-vs-opencart',
    
    // Design Tools
    '/comparison/figma-vs-sketch',
    '/comparison/canva-vs-adobe-creative',
    '/comparison/invision-vs-framer',
    '/comparison/miro-vs-lucidchart',
    
    // Email Marketing
    '/comparison/mailchimp-vs-constant-contact',
    '/comparison/sendinblue-vs-convertkit',
    '/comparison/klaviyo-vs-mailgun',
    '/comparison/campaign-monitor-vs-aweber',
    
    // Analytics & Data
    '/comparison/google-analytics-vs-mixpanel',
    '/comparison/hotjar-vs-crazy-egg',
    '/comparison/tableau-vs-power-bi',
    '/comparison/amplitude-vs-heap',
    
    // Development Tools
    '/comparison/github-vs-gitlab',
    '/comparison/heroku-vs-netlify',
    '/comparison/aws-vs-azure',
    '/comparison/vercel-vs-digitalocean',
    
    // Accounting Software
    '/comparison/quickbooks-vs-xero',
    '/comparison/freshbooks-vs-wave',
    '/comparison/sage-vs-zoho-books',
    '/comparison/kashoo-vs-freeagent'
  ].map(url => ({
    url,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: currentDate
  }))

  // Alternative pages for traffic hijacking
  const alternativePages = [
    // Major CRM alternatives
    '/alternatives/salesforce-alternatives',
    '/alternatives/hubspot-alternatives',
    '/alternatives/pipedrive-alternatives',
    '/alternatives/zoho-crm-alternatives',
    
    // Communication alternatives
    '/alternatives/slack-alternatives',
    '/alternatives/zoom-alternatives',
    '/alternatives/teams-alternatives',
    '/alternatives/discord-alternatives',
    
    // Project management alternatives
    '/alternatives/asana-alternatives',
    '/alternatives/monday-alternatives',
    '/alternatives/trello-alternatives',
    '/alternatives/notion-alternatives',
    '/alternatives/clickup-alternatives',
    
    // E-commerce alternatives
    '/alternatives/shopify-alternatives',
    '/alternatives/woocommerce-alternatives',
    '/alternatives/magento-alternatives',
    '/alternatives/bigcommerce-alternatives',
    
    // Design tool alternatives
    '/alternatives/figma-alternatives',
    '/alternatives/sketch-alternatives',
    '/alternatives/canva-alternatives',
    '/alternatives/adobe-creative-alternatives',
    
    // Email marketing alternatives
    '/alternatives/mailchimp-alternatives',
    '/alternatives/constant-contact-alternatives',
    '/alternatives/sendinblue-alternatives',
    '/alternatives/convertkit-alternatives',
    
    // Developer tool alternatives
    '/alternatives/github-alternatives',
    '/alternatives/gitlab-alternatives',
    '/alternatives/heroku-alternatives',
    '/alternatives/netlify-alternatives',
    
    // Analytics alternatives
    '/alternatives/google-analytics-alternatives',
    '/alternatives/mixpanel-alternatives',
    '/alternatives/hotjar-alternatives',
    '/alternatives/tableau-alternatives'
  ].map(url => ({
    url,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: currentDate
  }))

  // Generate premium app pages with strategic selection
  const premiumApps = [
    // Communication & Collaboration (High search volume)
    'slack', 'microsoft-teams', 'zoom', 'discord', 'google-meet', 'webex', 
    'telegram', 'whatsapp-business', 'skype', 'gotomeeting', 'bluejeans',
    
    // Project Management (High commercial intent)
    'asana', 'monday', 'trello', 'jira', 'clickup', 'basecamp', 'notion',
    'smartsheet', 'wrike', 'airtable', 'linear', 'height', 'todoist',
    
    // CRM & Sales (High-value keywords)
    'salesforce', 'hubspot', 'pipedrive', 'zoho-crm', 'freshworks', 
    'monday-crm', 'insightly', 'copper', 'close', 'nimble', 'active-campaign',
    
    // Design & Creative (Growing market)
    'figma', 'sketch', 'adobe-creative-cloud', 'canva', 'invision', 'framer',
    'miro', 'lucidchart', 'draw-io', 'procreate', 'affinity-designer',
    
    // E-commerce (High transaction value)
    'shopify', 'woocommerce', 'magento', 'bigcommerce', 'squarespace', 'wix',
    'prestashop', 'opencart', 'ecwid', 'volusion', 'sellfy',
    
    // Email Marketing (High ROI)
    'mailchimp', 'constant-contact', 'sendinblue', 'convertkit', 'aweber',
    'getresponse', 'campaign-monitor', 'klaviyo', 'mailgun', 'sendgrid',
    
    // Development Tools (Technical audience)
    'github', 'gitlab', 'bitbucket', 'heroku', 'netlify', 'vercel',
    'digitalocean', 'aws', 'azure', 'google-cloud', 'railway', 'render',
    
    // Analytics & Business Intelligence (Enterprise market)
    'google-analytics', 'mixpanel', 'amplitude', 'hotjar', 'crazy-egg',
    'tableau', 'power-bi', 'looker', 'sisense', 'chartio', 'metabase',
    
    // Productivity Suites (Broad appeal)
    'google-workspace', 'microsoft-365', 'zoho-workplace', 'notion',
    'obsidian', 'roam-research', 'logseq', 'craft', 'bear',
    
    // Accounting & Finance (High commercial value)
    'quickbooks', 'xero', 'freshbooks', 'wave', 'sage', 'zoho-books',
    'freeagent', 'kashoo', 'billy', 'invoice-ninja',
    
    // Customer Support (Service industry)
    'zendesk', 'intercom', 'freshdesk', 'help-scout', 'kayako', 'zoho-desk',
    'livechat', 'drift', 'crisp', 'tawk-to', 'chatbot',
    
    // Payment Processing (Fintech)
    'stripe', 'paypal', 'square', 'braintree', 'adyen', 'worldpay',
    'razorpay', 'mollie', 'klarna', 'checkout'
  ]

  const appPages = premiumApps.map(appId => ({
    url: `/app/${appId}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: currentDate
  }))

  // International localization for global SEO
  const locales = ['en', 'es', 'fr', 'de', 'pt']
  const internationalPages: Array<{ url: string; priority: string; changefreq: string; lastmod: string }> = []

  locales.forEach(locale => {
    if (locale !== 'en') { // English is default without prefix
      // Localize high-priority pages only
      const priorityPages = [...staticPages.slice(0, 10), ...categoryPages.slice(0, 20)]
      priorityPages.forEach(page => {
        internationalPages.push({
          url: `/${locale}${page.url}`,
          priority: (parseFloat(page.priority) * 0.9).toFixed(1), // Slightly lower priority for non-English
          changefreq: page.changefreq,
          lastmod: currentDate
        })
      })
    }
  })

  // Combine all pages with strategic ordering
  const allPages = [
    ...staticPages,
    ...categoryPages,
    ...comparisonPages,
    ...alternativePages,
    ...appPages,
    ...internationalPages
  ]

  // Generate XML sitemap with advanced features
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => {
  const fullUrl = `${baseUrl}${page.url}`
  
  // Generate hreflang alternates for international SEO
  const shouldIncludeHreflang = !page.url.includes('/en/') && 
                                !page.url.includes('/es/') && 
                                !page.url.includes('/fr/') && 
                                !page.url.includes('/de/') && 
                                !page.url.includes('/pt/')

  const hreflangAlternates = shouldIncludeHreflang ? 
    locales.map(locale => {
      const localizedUrl = locale === 'en' ? 
        `${baseUrl}${page.url}` : 
        `${baseUrl}/${locale}${page.url}`
      return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${localizedUrl}" />`
    }).join('\n') + 
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${page.url}" />` 
    : ''

  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${hreflangAlternates ? '\n' + hreflangAlternates : ''}
  </url>`
}).join('\n')}
</urlset>`

  // Set headers for optimal caching and indexing
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=7200') // 1 hour cache, 2 hour CDN
  setHeader(event, 'X-Robots-Tag', 'noindex') // Sitemap shouldn't be indexed itself
  
  return sitemap
})
