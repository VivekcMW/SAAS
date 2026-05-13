/**
 * Blog and Content Sitemap Generation
 * Dedicated sitemap for blog posts, guides, and educational content
 */

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://moonmart.ai'
  const _currentDate = new Date().toISOString().split('T')[0]
  
  // Blog posts by category for better organization and SEO
  const blogPosts = [
    // AI & Machine Learning
    {
      url: '/blog/ai-tools-for-business-2024',
      category: 'AI & Machine Learning',
      lastmod: '2024-01-15',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'article'
    },
    {
      url: '/blog/best-machine-learning-platforms',
      category: 'AI & Machine Learning', 
      lastmod: '2024-01-10',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'article'
    },
    {
      url: '/blog/chatgpt-alternatives-for-business',
      category: 'AI & Machine Learning',
      lastmod: '2024-01-20',
      changefreq: 'weekly',
      priority: '0.9',
      type: 'article'
    },
    
    // Project Management
    {
      url: '/blog/project-management-software-comparison',
      category: 'Project Management',
      lastmod: '2024-01-12',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'comparison'
    },
    {
      url: '/blog/agile-project-management-tools',
      category: 'Project Management',
      lastmod: '2024-01-08',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'article'
    },
    {
      url: '/blog/remote-team-collaboration-guide',
      category: 'Project Management',
      lastmod: '2024-01-18',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'guide'
    },
    
    // Design & Creative
    {
      url: '/blog/design-tools-for-non-designers',
      category: 'Design & Creative',
      lastmod: '2024-01-14',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'article'
    },
    {
      url: '/blog/figma-vs-sketch-comparison',
      category: 'Design & Creative',
      lastmod: '2024-01-16',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'comparison'
    },
    {
      url: '/blog/ui-ux-design-software-guide',
      category: 'Design & Creative',
      lastmod: '2024-01-11',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'guide'
    },
    
    // E-commerce
    {
      url: '/blog/best-ecommerce-platforms-2024',
      category: 'E-commerce',
      lastmod: '2024-01-19',
      changefreq: 'monthly',
      priority: '0.9',
      type: 'article'
    },
    {
      url: '/blog/shopify-alternatives-comparison',
      category: 'E-commerce',
      lastmod: '2024-01-13',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'comparison'
    },
    {
      url: '/blog/ecommerce-seo-best-practices',
      category: 'E-commerce',
      lastmod: '2024-01-17',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'guide'
    },
    
    // Marketing & Sales
    {
      url: '/blog/marketing-automation-tools-guide',
      category: 'Marketing & Sales',
      lastmod: '2024-01-21',
      changefreq: 'weekly',
      priority: '0.8',
      type: 'guide'
    },
    {
      url: '/blog/crm-software-for-small-business',
      category: 'Marketing & Sales',
      lastmod: '2024-01-09',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'article'
    },
    {
      url: '/blog/email-marketing-platforms-comparison',
      category: 'Marketing & Sales',
      lastmod: '2024-01-15',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'comparison'
    },
    
    // Productivity & Business
    {
      url: '/blog/productivity-apps-remote-work',
      category: 'Productivity',
      lastmod: '2024-01-22',
      changefreq: 'weekly',
      priority: '0.8',
      type: 'article'
    },
    {
      url: '/blog/time-tracking-software-review',
      category: 'Productivity',
      lastmod: '2024-01-07',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'review'
    },
    {
      url: '/blog/business-process-automation-guide',
      category: 'Productivity',
      lastmod: '2024-01-20',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'guide'
    },
    
    // Finance & Accounting
    {
      url: '/blog/accounting-software-small-business',
      category: 'Finance & Accounting',
      lastmod: '2024-01-16',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'article'
    },
    {
      url: '/blog/quickbooks-alternatives-comparison',
      category: 'Finance & Accounting',
      lastmod: '2024-01-12',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'comparison'
    },
    
    // General Business & Strategy
    {
      url: '/blog/saas-trends-2024',
      category: 'Business Strategy',
      lastmod: '2024-01-23',
      changefreq: 'weekly',
      priority: '0.9',
      type: 'article'
    },
    {
      url: '/blog/choosing-right-software-for-startup',
      category: 'Business Strategy',
      lastmod: '2024-01-18',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'guide'
    },
    {
      url: '/blog/digital-transformation-small-business',
      category: 'Business Strategy',
      lastmod: '2024-01-14',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'article'
    }
  ];
  
  // Guides and tutorials
  const guides = [
    {
      url: '/guides/getting-started-with-saas',
      lastmod: '2024-01-10',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'guide'
    },
    {
      url: '/guides/software-evaluation-checklist',
      lastmod: '2024-01-15',
      changefreq: 'monthly',
      priority: '0.9',
      type: 'guide'
    },
    {
      url: '/guides/roi-calculator-software-investment',
      lastmod: '2024-01-12',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'guide'
    },
    {
      url: '/guides/software-implementation-best-practices',
      lastmod: '2024-01-18',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'guide'
    },
    {
      url: '/guides/vendor-evaluation-framework',
      lastmod: '2024-01-20',
      changefreq: 'monthly',
      priority: '0.8',
      type: 'guide'
    }
  ];
  
  // Help and documentation pages
  const helpPages = [
    {
      url: '/help/how-to-search-software',
      lastmod: '2024-01-05',
      changefreq: 'monthly',
      priority: '0.6',
      type: 'help'
    },
    {
      url: '/help/understanding-software-reviews',
      lastmod: '2024-01-08',
      changefreq: 'monthly',
      priority: '0.6',
      type: 'help'
    },
    {
      url: '/help/comparing-software-features',
      lastmod: '2024-01-11',
      changefreq: 'monthly',
      priority: '0.6',
      type: 'help'
    },
    {
      url: '/help/software-pricing-guide',
      lastmod: '2024-01-14',
      changefreq: 'monthly',
      priority: '0.7',
      type: 'help'
    }
  ];

  // Combine all content pages
  const allContentPages = [...blogPosts, ...guides, ...helpPages];

  // Sort by priority and date for better SEO value
  allContentPages.sort((a, b) => {
    if (a.priority !== b.priority) {
      return parseFloat(b.priority) - parseFloat(a.priority);
    }
    return new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime();
  });

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${allContentPages.map(page => {
  const fullUrl = `${baseUrl}${page.url}`;
  
  // Add news sitemap elements for recent blog posts
  const isRecentArticle = page.type === 'article' && 
    new Date(page.lastmod).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000); // Last 7 days
  
  const newsExtension = isRecentArticle ? `
    <news:news>
      <news:publication>
        <news:name>Moonmart Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${page.lastmod}</news:publication_date>
      <news:title>${generateTitleFromUrl(page.url)}</news:title>
    </news:news>` : '';

  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${newsExtension}
  </url>`;
}).join('\n')}
</urlset>`;

  // Set appropriate headers
  setHeader(event, 'Content-Type', 'application/xml');
  setHeader(event, 'Cache-Control', 'public, max-age=7200, s-maxage=14400'); // Cache for 2 hours
  
  return sitemap;
});

/**
 * Generate readable title from URL slug
 */
function generateTitleFromUrl(url: string): string {
  const slug = url.split('/').pop() || '';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}
