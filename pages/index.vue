<template>
  <div class="home-page">
    <!-- Hero Section (with integrated AI search) -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <UIcon name="i-heroicons-sparkles" dynamic />
            <span>AI-powered SaaS discovery</span>
          </div>

          <h1 class="hero-title">Find the right software for the way <span class="highlight">you work</span>.</h1>
          <p class="hero-subtitle">Tell us what you need in plain English. We'll shortlist the 3 best apps out of 1,200+ — no sales calls, no bias.</p>

          <!-- Unified AI Search -->
          <div class="hero-search">
            <textarea
              v-model="aiPrompt"
              class="hero-search-input"
              :placeholder="searchPlaceholder"
              rows="2"
              :disabled="aiLoading"
              @keydown.enter.exact.prevent="runAIMatch"
            />
            <div class="hero-search-actions">
              <span class="hero-search-hint">
                <kbd>Enter</kbd> to search
              </span>
              <button
                class="hero-search-btn"
                :disabled="!aiPrompt.trim() || aiLoading"
                @click="runAIMatch"
              >
                <UIcon v-if="!aiLoading" name="i-heroicons-bolt" dynamic />
                <UIcon v-else name="i-heroicons-arrow-path" dynamic class="spin" />
                <span>{{ aiLoading ? 'Matching…' : 'Find my tools' }}</span>
              </button>
            </div>
          </div>

          <!-- Example chips -->
          <div class="hero-chips">
            <span class="chip-label">Try:</span>
            <button
              v-for="(example, i) in examples"
              :key="i"
              class="chip"
              @click="aiPrompt = example"
            >{{ example }}</button>
          </div>

          <!-- Results (inline) -->
          <div v-if="aiResults.length" class="hero-results">
            <h3>Top picks for you</h3>
            <ul>
              <li v-for="r in aiResults" :key="r.name">
                <strong>{{ r.name }}</strong>
                <span>— {{ r.reason }}</span>
              </li>
            </ul>
            <p class="results-note">Demo results. Full AI matching launches soon.</p>
          </div>

          <!-- Trust strip -->
          <div class="hero-trust">
            <span><strong>167</strong> categories</span>
            <span class="dot">·</span>
            <span><strong>1,200+</strong> apps indexed</span>
            <span class="dot">·</span>
            <span><strong>Free</strong> to browse</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Performing Products Section -->
    <section class="top-products-section">
      <div class="container">
        <div class="section-header">
          <h2>Trending right now</h2>
          <p>Discover the most trending, sponsored, and searched applications in our marketplace.</p>
        </div>
        <div class="products-grid">
          <article class="product-card" v-for="(product, index) in topProducts" :key="product.id">
            <!-- Header row: rank + badge -->
            <div class="card-top">
              <span class="rank-chip">#{{ index + 1 }}</span>
              <span class="product-badge" :class="product.badgeType">
                <UIcon dynamic :name="product.badgeIcon" />
                {{ product.badge }}
              </span>
            </div>

            <!-- Identity: logo + name + category -->
            <header class="card-identity">
              <div class="product-logo">
                <UIcon v-if="product.icon" :name="product.icon" dynamic class="product-logo-icon" />
                <img v-else :src="product.image" :alt="product.name + ' logo'" loading="lazy" />
              </div>
              <div class="identity-text">
                <h3>{{ product.name }}</h3>
                <p class="product-category">{{ product.category }}</p>
              </div>
            </header>

            <!-- Value prop -->
            <p class="product-tagline">{{ product.tagline }}</p>

            <!-- Trust strip -->
            <div class="trust-strip">
              <span class="trust-item rating">
                <UIcon dynamic name="i-heroicons-star-solid" />
                <strong>{{ product.rating }}</strong>
                <span class="muted">({{ product.reviewCount }})</span>
              </span>
              <span class="trust-divider">·</span>
              <span class="trust-item muted">
                <UIcon dynamic name="i-heroicons-users" />
                {{ product.users }}
              </span>
            </div>

            <!-- Best-for line -->
            <p class="best-for">
              <UIcon dynamic name="i-heroicons-check-badge" />
              {{ product.bestFor }}
            </p>

            <!-- Attribute tags -->
            <div class="attr-tags">
              <span class="attr-tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
            </div>

            <!-- Footer: pricing + dual CTA -->
            <footer class="card-footer">
              <div class="price-block">
                <span class="price">{{ product.price }}</span>
                <span v-if="product.pricePeriod" class="price-period">{{ product.pricePeriod }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-ghost" :aria-label="'Add ' + product.name + ' to compare'">
                  <UIcon dynamic name="i-heroicons-scale" />
                  <span>Compare</span>
                </button>
                <NuxtLink :to="`/marketplace/app/${product.id}`" class="btn-primary-card">
                  View details
                  <UIcon dynamic name="i-heroicons-arrow-right" />
                </NuxtLink>
              </div>
            </footer>
          </article>
        </div>
        <div class="section-footer">
          <NuxtLink to="/marketplace" class="btn btn-outline">
            View All Products
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Integration Section -->
    <section class="integrations-section">
      <div class="container">
        <div class="integration-content">
          <h2>Seamlessly integrate with your favorite tools</h2>
          <p>Connect SaaSWorld with over 100+ applications and services you already use.</p>
          <NuxtLink to="/integrations" class="btn btn-primary">View all integrations</NuxtLink>
        </div>
        <div class="integration-logos">
          <div class="logo-item" v-for="(logo, index) in integrationLogos" :key="index" @mouseenter="highlightLogo(index)" @mouseleave="resetLogos">
            <div class="logo-tooltip">{{ logo.name }}</div>
            <UIcon :name="logo.icon" dynamic class="integration-icon" :class="{ 'highlighted': highlightedLogo === index }" />
          </div>
        </div>
        <div class="integrations-footer">
          <p class="integration-note">...and many more available on our integrations page.</p>
        </div>
      </div>
    </section>

    <!-- Vendor CTA -->
    <VendorCta />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

// Global categories menu composable for cross-component communication
const { openCategoriesDrawer } = useCategoriesMenu();

// Debug function to test if category button is being clicked
const handleCategoryClick = () => {
  console.log('Category button clicked!');
  openCategoriesDrawer();
};

// --- Unified AI Search (hero) --------------------------------
const aiPrompt = ref('');
const aiLoading = ref(false);
const aiResults = ref<Array<{ name: string; reason: string }>>([]);

const searchPlaceholder = 'Describe what you need — e.g. "CRM for a 10-person remote sales team, budget under $20/user"';

const examples = [
  'CRM for a 10-person sales team',
  'Async video for a distributed engineering team',
  'All-in-one HR + payroll under $200/mo',
];

// Stub matcher — wire to real /api/ai-match endpoint in Phase 2.
const runAIMatch = () => {
  if (!aiPrompt.value.trim() || aiLoading.value) return;
  aiLoading.value = true;
  aiResults.value = [];
  setTimeout(() => {
    aiResults.value = [
      { name: 'Notion', reason: 'Flexible docs + lightweight project tracking for small teams' },
      { name: 'Linear', reason: 'Fast issue tracking loved by product-led teams' },
      { name: 'HubSpot', reason: 'Free CRM tier that scales to full revenue stack' },
    ];
    aiLoading.value = false;
  }, 900);
};

// Advanced SEO implementation using enhanced SEO composables
const { generateEnhancedSEO } = useEnhancedSEO();
const { optimizeContentForLLM, generateRichSnippets } = useLLMOptimization();

// NEW: Comprehensive LLM optimization using orchestrator
// (Perplexity-specific helpers are now exposed by the orchestrator)
const {
  orchestrateLLMOptimization,
  generateOptimizationReport,
  optimizeForPerplexity,
  generateConversationalSchema
} = useLLMOrchestrator();

// Configure comprehensive LLM optimization for homepage
const llmConfig = {
  title: 'SaaSWorld - Global Software Marketplace',
  description: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions with expert reviews.',
  category: 'SaaS Marketplace',
  features: [
    'Comprehensive software directory',
    'Expert reviews and comparisons',
    'Free discovery platform',
    'Global marketplace',
    'Verified applications',
    'Business intelligence'
  ],
  useCases: [
    'Software discovery and comparison',
    'Business solution research',
    'Vendor evaluation',
    'Technology stack planning',
    'Enterprise software procurement',
    'Startup tool selection'
  ],
  benefits: [
    'Save time on software research',
    'Make informed purchasing decisions',
    'Access expert reviews and ratings',
    'Compare features and pricing',
    'Discover new solutions',
    'Free platform access'
  ],
  pricing: 'Free for users, commission-based for vendors',
  targetAudience: [
    'Business owners',
    'IT decision makers',
    'Startup founders',
    'Enterprise procurement teams',
    'Software developers',
    'Digital transformation teams'
  ],
  keywords: [
    'SaaS marketplace',
    'business software',
    'software comparison',
    'enterprise tools',
    'business solutions',
    'software discovery'
  ],
  location: 'Global',
  enabledLLMs: ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity'] as Array<'chatgpt' | 'claude' | 'gemini' | 'copilot' | 'perplexity'>,
  priority: 'high' as const
};

// Generate comprehensive LLM optimization
const llmOptimization = orchestrateLLMOptimization(llmConfig);
const optimizationReport = generateOptimizationReport(llmConfig);

// Generate LLM-optimized content structure
const homePageContent = optimizeContentForLLM(`
# SaaSWorld - Global Software Marketplace for Business Solutions

Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs with expert reviews and comparisons.

## Why Choose SaaSWorld?

SaaSWorld is the world's leading marketplace for business software solutions. We help businesses of all sizes find, compare, and implement the right software tools to drive growth and efficiency.

### Comprehensive Software Directory
Browse through thousands of verified software applications across all business categories including productivity, marketing, sales, finance, and more.

### Expert Reviews and Comparisons
Get detailed insights from our team of software experts and real user reviews to make informed decisions.

### Free Discovery Platform
Access our platform completely free to discover software solutions that match your specific business needs.

## Featured Software Categories

- **AI & Machine Learning**: Artificial intelligence tools for automation and data analysis
- **Project Management**: Team collaboration and task management solutions
- **Design & Creative**: Creative tools for designers and marketing teams
- **E-commerce**: Online store and digital commerce platforms
- **Marketing & Sales**: Customer acquisition and revenue growth tools
- **Finance & Accounting**: Financial management and accounting software

## Top Performing Products

Discover the most trending, sponsored, and searched applications in our marketplace including Slack for team communication, HubSpot for CRM, Zoom for video conferencing, and hundreds more.
`, {
  title: 'SaaSWorld - Global Software Marketplace for Business Solutions',
  category: 'marketplace',
  type: 'homepage',
  targetAudience: ['business-owners', 'entrepreneurs', 'software-buyers', 'decision-makers']
});

// Generate Perplexity.ai optimization
const perplexityOptimization = optimizeForPerplexity({
  title: 'SaaSWorld - Global Software Marketplace',
  description: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs.',
  category: 'Software Marketplace',
  features: [
    'Comprehensive software directory',
    'Expert reviews and comparisons', 
    'Free platform access',
    'Global software coverage',
    'Multi-category support'
  ],
  useCases: [
    'Finding business software',
    'Comparing software features',
    'Reading expert reviews',
    'Discovering new tools',
    'Making informed decisions'
  ],
  benefits: [
    'Save time on research',
    'Make better software choices',
    'Access expert insights',
    'Compare multiple options',
    'Find the right fit for your business'
  ]
});

// Apply comprehensive SEO with LLM optimization
useHead(generateEnhancedSEO({
  title: 'SaaSWorld - Global Software Marketplace for Business Solutions',
  description: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs with expert reviews and comparisons.',
  keywords: [
    'saas marketplace', 'business software', 'enterprise solutions', 'software directory',
    'digital tools', 'cloud applications', 'software comparison', 'saas platform',
    'global software marketplace', 'business tools', 'productivity software',
    'marketing tools', 'sales software', 'project management', 'crm software',
    'artificial intelligence', 'machine learning', 'automation tools',
    'startup software', 'enterprise apps', 'small business tools'
  ],
  canonicalUrl: '/',
  ogImage: '/images/saasworld-og-homepage.jpg',
  ogType: 'website',
  author: 'SaaSWorld Editorial Team',
  locale: 'en_US',
  alternateLocales: ['en_US', 'es_ES', 'fr_FR', 'de_DE', 'pt_BR'],
  schema: generateRichSnippets(homePageContent, 'homepage'),
  breadcrumbs: [
    { name: 'Home', url: '/' }
  ]
}));

// Generate comprehensive JSON-LD schema for homepage
const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://saasworld.com/#website",
      "url": "https://saasworld.com",
      "name": "SaaSWorld",
      "description": "Global marketplace for business software solutions and SaaS tools",
      "inLanguage": "en-US",
      "publisher": {
        "@id": "https://saasworld.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://saasworld.com/marketplace?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://saasworld.com/#organization",
      "name": "SaaSWorld",
      "alternateName": "SaaS World",
      "url": "https://saasworld.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://saasworld.com/images/saasworld-logo.png",
        "width": 300,
        "height": 100
      },
      "description": "Leading global marketplace for business software solutions, helping companies discover and compare SaaS tools.",
      "foundingDate": "2024",
      "sameAs": [
        "https://twitter.com/SaasWorld",
        "https://linkedin.com/company/saasworld",
        "https://github.com/saasworld",
        "https://facebook.com/saasworld"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-800-SAASWORLD",
        "contactType": "customer service",
        "availableLanguage": ["English", "Spanish", "French", "German", "Portuguese"]
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://saasworld.com/#webpage",
      "url": "https://saasworld.com",
      "name": "SaaSWorld - Global Software Marketplace for Business Solutions",
      "description": "Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@id": "https://saasworld.com/#website"
      },
      "about": {
        "@type": "Thing",
        "name": "Business Software Marketplace"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Featured Software Solutions",
        "description": "Top performing software applications in our marketplace",
        "numberOfItems": 6,
        "itemListElement": [
          {
            "@type": "SoftwareApplication",
            "name": "Slack",
            "applicationCategory": "Team Collaboration",
            "operatingSystem": "Web, iOS, Android",
            "url": "https://saasworld.com/marketplace/app/slack"
          },
          {
            "@type": "SoftwareApplication", 
            "name": "HubSpot CRM",
            "applicationCategory": "Customer Relationship Management",
            "operatingSystem": "Web, iOS, Android",
            "url": "https://saasworld.com/marketplace/app/hubspot"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Zoom",
            "applicationCategory": "Video Conferencing",
            "operatingSystem": "Web, iOS, Android, Windows, macOS",
            "url": "https://saasworld.com/marketplace/app/zoom"
          }
        ]
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://saasworld.com"
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is SaaSWorld?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SaaSWorld is a global marketplace for business software solutions where you can discover, compare, and find the best SaaS tools for your business needs."
          }
        },
        {
          "@type": "Question",
          "name": "Is SaaSWorld free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, SaaSWorld is completely free to use. You can browse software solutions, read reviews, and compare tools without any cost."
          }
        },
        {
          "@type": "Question",
          "name": "How many software applications are available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SaaSWorld features thousands of verified software applications across all business categories including AI, project management, marketing, sales, and more."
          }
        }
      ]
    }
  ]
};

// Add Perplexity.ai conversational schema
// Note: qaPairs are already included inside the schema returned by the orchestrator.
const perplexitySchema = generateConversationalSchema({
  title: 'SaaSWorld',
  description: 'Global software marketplace for business solutions',
  category: 'Software Marketplace'
});

// Add the comprehensive schema to the page
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(homepageSchema)
    } as any,
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(perplexitySchema)
    } as any
  ],
  meta: [
    ...perplexityOptimization.perplexityMeta
  ]
});

// Trending searches
const trendingSearches = [
  'Marketing Tools',
  'CRM',
  'Analytics',
  'Project Management',
  'Design',
  'Accounting',
  'Email Marketing',
  'Team Collaboration',
  'Customer Support',
  'Sales Tools',
  'HR Management',
  'Finance Software'
];

// Control how many trending searches are visible based on screen size (for dropdown)
const maxVisibleTrending = ref(5); // Default for desktop
const visibleTrendingSearches = ref(trendingSearches.slice(0, maxVisibleTrending.value));

// Update visible trending searches based on screen size
const updateVisibleTrending = () => {
  if (window.innerWidth <= 576) {
    maxVisibleTrending.value = 2; // Show 2 items on mobile
  } else if (window.innerWidth <= 768) {
    maxVisibleTrending.value = 3; // Show 3 items on tablets
  } else {
    maxVisibleTrending.value = 5; // Show 5 items on desktop
  }
  visibleTrendingSearches.value = trendingSearches.slice(0, maxVisibleTrending.value);
};

// Handle trending search click
const handleTrendingSearch = (trend: string) => {
  console.log(`Searching for: ${trend}`);
  // In a real app, this would trigger a search with the selected term
  // You could navigate to search results or apply the search term to the input
};

// Handle search button click
const handleSearch = () => {
  const searchInput = document.querySelector('.search-input') as HTMLInputElement;
  const searchTerm = searchInput?.value || '';
  console.log(`Searching for: ${searchTerm}`);
  // In a real app, this would trigger a search with the input value
  // You could navigate to search results page with the search term
};

// Countries Data with flags
const countries = [
  { code: 'us', name: 'United States', dialCode: '1', flag: '/assets/images/flags/us.svg' },
  { code: 'gb', name: 'United Kingdom', dialCode: '44', flag: '/assets/images/flags/gb.svg' },
  { code: 'ca', name: 'Canada', dialCode: '1', flag: '/assets/images/flags/ca.svg' },
  { code: 'de', name: 'Germany', dialCode: '49', flag: '/assets/images/flags/de.svg' },
  { code: 'fr', name: 'France', dialCode: '33', flag: '/assets/images/flags/fr.svg' },
  { code: 'au', name: 'Australia', dialCode: '61', flag: '/assets/images/flags/au.svg' },
  { code: 'jp', name: 'Japan', dialCode: '81', flag: '/assets/images/flags/jp.svg' },
  { code: 'in', name: 'India', dialCode: '91', flag: '/assets/images/flags/in.svg' },
  { code: 'cn', name: 'China', dialCode: '86', flag: '/assets/images/flags/cn.svg' },
  { code: 'br', name: 'Brazil', dialCode: '55', flag: '/assets/images/flags/br.svg' }
];

// Top Products Data
const topProducts = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'Team Collaboration',
    tagline: 'Channel-based messaging that replaces internal email for fast-moving teams.',
    image: '/assets/images/integrations/slack.svg',
    icon: 'logos:slack-icon',
    rating: '4.8',
    reviewCount: '42,100',
    users: '12M+',
    price: 'From $8',
    pricePeriod: '/user/mo',
    bestFor: 'Best for remote teams',
    tags: ['Free plan', 'G2 Leader', 'Enterprise-ready'],
    badge: 'Trending',
    badgeType: 'trending',
    badgeIcon: 'i-heroicons-fire'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'Customer Relationship',
    tagline: 'Free CRM that scales into a full marketing, sales, and service platform.',
    image: '/assets/images/integrations/hubspot.svg',
    icon: 'logos:hubspot',
    rating: '4.7',
    reviewCount: '28,900',
    users: '8M+',
    price: 'Free forever',
    pricePeriod: '',
    bestFor: 'Best for SMB sales teams',
    tags: ['Free forever', 'No credit card', 'SOC 2'],
    badge: 'Sponsored',
    badgeType: 'sponsored',
    badgeIcon: 'i-heroicons-star-solid'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Video Conferencing',
    tagline: 'The reliability benchmark for video meetings, webinars, and events.',
    image: '/assets/images/integrations/zoom.svg',
    icon: 'logos:zoom-icon',
    rating: '4.6',
    reviewCount: '55,300',
    users: '15M+',
    price: 'From $14.99',
    pricePeriod: '/host/mo',
    bestFor: 'Best for external meetings',
    tags: ['Free 40-min', 'HIPAA option', 'Phone & chat'],
    badge: 'Most Searched',
    badgeType: 'popular',
    badgeIcon: 'i-heroicons-magnifying-glass'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    tagline: 'Docs, wikis, tasks, and databases in one connected workspace.',
    image: '/assets/images/integrations/notion.svg',
    icon: 'simple-icons:notion',
    rating: '4.9',
    reviewCount: '18,400',
    users: '4M+',
    price: 'From $10',
    pricePeriod: '/user/mo',
    bestFor: 'Best all-in-one for startups',
    tags: ['Free plan', 'AI add-on', 'Great mobile'],
    badge: 'Trending',
    badgeType: 'trending',
    badgeIcon: 'i-heroicons-fire'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM & Sales',
    tagline: 'The enterprise CRM standard — deeply customizable revenue platform.',
    image: '/assets/images/integrations/salesforce.svg',
    icon: 'logos:salesforce',
    rating: '4.5',
    reviewCount: '71,200',
    users: '20M+',
    price: 'From $25',
    pricePeriod: '/user/mo',
    bestFor: 'Best for enterprise',
    tags: ['Enterprise', 'AppExchange', 'Einstein AI'],
    badge: 'Sponsored',
    badgeType: 'sponsored',
    badgeIcon: 'i-heroicons-star-solid'
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'Design',
    tagline: 'Drag-and-drop design for teams that need beautiful output fast.',
    image: '/assets/images/integrations/canva.svg',
    icon: 'logos:canva',
    rating: '4.8',
    reviewCount: '12,100',
    users: '10M+',
    price: 'From $12.99',
    pricePeriod: '/user/mo',
    bestFor: 'Best for non-designers',
    tags: ['Free plan', 'AI tools', 'Team templates'],
    badge: 'Most Searched',
    badgeType: 'popular',
    badgeIcon: 'i-heroicons-magnifying-glass'
  }
];

// Integration Logos (real brand marks via Iconify logos set)
const integrationLogos = [
  { name: 'Slack', icon: 'logos:slack-icon' },
  { name: 'Google Workspace', icon: 'logos:google-icon' },
  { name: 'Microsoft', icon: 'logos:microsoft-icon' },
  { name: 'Zoom', icon: 'logos:zoom-icon' },
  { name: 'Dropbox', icon: 'logos:dropbox' },
  { name: 'Salesforce', icon: 'logos:salesforce' },
  { name: 'HubSpot', icon: 'logos:hubspot' },
  { name: 'Notion', icon: 'simple-icons:notion' },
  { name: 'GitHub', icon: 'logos:github-icon' },
  { name: 'Stripe', icon: 'logos:stripe' },
  { name: 'Zapier', icon: 'logos:zapier-icon' },
  { name: 'Asana', icon: 'logos:asana' },
];

// Integration logo highlight effect
const highlightedLogo = ref(-1); // -1 means no logo is highlighted

const highlightLogo = (index: number) => {
  highlightedLogo.value = index;
};

const resetLogos = () => {
  highlightedLogo.value = -1;
};

// Initialize trending searches visibility on mount
onMounted(() => {
  updateVisibleTrending();
  
  // Handle window resize for responsive behavior
  window.addEventListener('resize', () => {
    updateVisibleTrending();
  });
});

// Home page data
</script>

<style scoped>
/* Hero Section */
.hero-section {
  /* Add top padding so H1 clears the fixed navbar (72px desktop / 64px mobile) */
  padding: calc(var(--navbar-height) + var(--spacing-xxl)) 0 calc(var(--spacing-xxl) * 1.5);
  background: var(--bg-gray);
  position: relative;
  overflow: visible;
  text-align: center;
  z-index: 1; /* Base z-index for hero section */
}

@media (max-width: 768px) {
  .hero-section {
    padding: calc(var(--navbar-height-mobile) + var(--spacing-xl)) 0 var(--spacing-xxl);
  }
}

.hero-section .container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-content {
  max-width: 800px;
}

.highlight {
  color: var(--sw-primary);
  position: relative;
  display: inline-block;
  white-space: nowrap;
}

/* Subtle 3px underline accent instead of an overlapping block */
.highlight::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--sw-primary);
  border-radius: 2px;
}

.hero-subtitle {
  font-size: 1.125rem;
  font-weight: 300;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* ─── Unified Hero AI Search ──────────────────────────────── */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--sw-ai-soft);
  color: var(--sw-ai);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: var(--fs-caption);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 20px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 3.25rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.025em;
  color: var(--sw-text);
}

.hero-search {
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto var(--spacing-md);
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 6px 6px 10px;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04),
              0 8px 24px rgba(17, 24, 39, 0.06);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.hero-search:focus-within {
  border-color: var(--sw-ai);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04),
              0 0 0 4px rgba(99, 102, 241, 0.15);
}

.hero-search-input {
  width: 100%;
  border: none;
  resize: none;
  padding: 14px 16px 4px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--sw-text);
  background: transparent;
  text-align: left;
}

.hero-search-input:focus { outline: none; }

.hero-search-input::placeholder {
  color: var(--sw-text-subtle);
  opacity: 1;
}

.hero-search-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px;
}

.hero-search-hint {
  font-size: var(--fs-caption);
  color: var(--sw-text-subtle);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hero-search-hint kbd {
  background: var(--bg-gray);
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 2px 7px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--sw-text-muted);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.05);
}

.hero-search-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--sw-ai);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  white-space: nowrap;
}

.hero-search-btn:hover:not(:disabled) {
  background: #4F46E5;
  transform: translateY(-1px);
}

.hero-search-btn:disabled {
  background: #D1D5DB;
  color: #fff;
  cursor: not-allowed;
}

.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.chip-label {
  font-size: var(--fs-caption);
  color: var(--sw-text-subtle);
  font-weight: 500;
}

.chip {
  border: 1px solid #E5E7EB;
  background: #fff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.875rem;
  color: var(--sw-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  border-color: var(--sw-ai);
  color: var(--sw-ai);
}

.hero-secondary { margin-bottom: var(--spacing-lg); }

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--sw-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.link-btn:hover {
  background: var(--sw-primary-soft);
  text-decoration: none;
}

.hero-results {
  max-width: 720px;
  margin: 0 auto var(--spacing-lg);
  text-align: left;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 20px 24px;
}

.hero-results h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  color: var(--sw-text);
  font-weight: 600;
}

.hero-results ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-results li {
  color: var(--sw-text-muted);
  padding: 10px 12px;
  background: var(--bg-gray);
  border-radius: 10px;
}

.hero-results strong {
  color: var(--sw-text);
  margin-right: 4px;
}

.results-note {
  font-size: var(--fs-caption);
  color: var(--sw-text-subtle);
  margin: 0;
}

.hero-trust {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  color: var(--sw-text-subtle);
  font-size: 0.875rem;
}

.hero-trust strong {
  color: var(--sw-text);
  font-weight: 600;
}

.hero-trust .dot { opacity: 0.5; }

@media (max-width: 640px) {
  .hero-title { font-size: 2rem; }
  .hero-search-actions { flex-direction: column-reverse; align-items: stretch; gap: 10px; }
  .hero-search-btn { justify-content: center; padding: 12px; }
  .hero-search-hint { justify-content: center; }
  .hero-chips { gap: 6px; }
  .chip { padding: 5px 10px; font-size: 0.8125rem; }
}
/* ─── End Unified Hero ─────────────────────────────────────── */

.search-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  margin-bottom: var(--spacing-xl);
}

.trending-row {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: var(--spacing-xl);
  margin-top: -10px; /* Reduce space between search and trending rows */
  position: relative; /* Create stacking context for child elements */
  z-index: 999999; /* Higher z-index to ensure dropdown is above other elements */
}

.search-categories-dropdown {
  position: relative;
  z-index: 999999;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.search-container {
  display: flex;
  position: relative;
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-md);
  background-color: var(--light-color);
  overflow: hidden;
  border: 1px solid var(--color-gray-200);
  width: 100%;
  max-width: 700px;
}

.country-select {
  position: relative;
  border-right: 1px solid var(--color-gray-200);
  z-index: 10;
}

.selected-country {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-md);
  height: 100%;
  cursor: pointer;
}

.country-flag {
  width: 20px;
  height: 15px;
  margin-right: var(--spacing-xs);
}

.country-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--light-color);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  max-height: 300px;
  overflow-y: auto;
  width: 200px;
  z-index: 20;
  display: none;
}

.country-select:hover .country-dropdown {
  display: block;
}

.country-option {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.country-option:hover {
  background-color: var(--color-gray-100);
}

.search-input {
  flex: 1;
  border: none;
  padding: var(--spacing-md) var(--spacing-md);
  font-family: var(--font-primary);
  font-size: 1rem;
  border-radius: var(--border-radius-md);
  height: 50px;
  width: 100%;
  background: #fff;
  color: var(--sw-text);
}

.search-input::placeholder {
  color: var(--sw-text-subtle);
  opacity: 1;
}

.search-input:focus {
  outline: none;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: var(--light-color);
  border: none;
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  height: 50px;
  min-width: 100px;
}

.search-btn:hover {
  background-color: var(--dark-color);
  color: var(--light-color);
}

.search-btn:hover span,
.search-btn:hover .nuxt-icon {
  color: var(--light-color);
}

.search-btn span {
  margin-left: 2px;
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background-color: var(--color-gray-100);
  color: var(--text-primary);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 0.875rem;
  height: 50px;
  width: 50px;
  flex-shrink: 0;
}

.category-btn:hover {
  background-color: var(--primary-color);
  color: var(--light-color);
  border-color: var(--primary-color);
}

.category-btn:hover .nuxt-icon {
  color: var(--light-color);
}

.category-btn .nuxt-icon {
  font-size: 1.25rem;
}

.trending-searches {
  display: flex;
  align-items: center;
  width: 100%;
  flex-wrap: nowrap;
  overflow-x: hidden;
  padding-bottom: var(--spacing-sm);
  -ms-overflow-style: none;  /* Hide scrollbar in IE and Edge */
  scrollbar-width: none;  /* Hide scrollbar in Firefox */
  justify-content: space-between; /* Space between categories and more button */
  max-width: 700px;
  position: relative;
  height: 42px; /* Fixed height for the trending searches row */
  border-radius: 2px;
  z-index: 999999; /* Ensure high z-index for dropdown parent */
}

.trending-searches::-webkit-scrollbar {
  display: none; /* Hide scrollbar in Chrome, Safari, and Opera */
}

.trending-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: var(--spacing-md);
  white-space: nowrap;
}

.trending-badges {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: nowrap;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  flex: 1;
  height: 100%;
  align-items: center;
}

.trending-badges::-webkit-scrollbar {
  display: none;
}

.trending-badge {
  background-color: var(--bg-gray);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 400;
  padding: 0.3rem var(--spacing-md);
  border-radius: 2px;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  display: inline-block;
  border: 1px solid var(--color-gray-200);
}

.trending-badge:hover {
  background-color: var(--color-gray-200);
  color: var(--text-primary);
}

.categories-dropdown {
  position: relative;
  z-index: 999999; /* Maximum z-index to ensure dropdown appears above all other elements */
}

.more-categories-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.3rem var(--spacing-md);
  white-space: nowrap;
  transition: all var(--transition-fast);
  margin-left: var(--spacing-md);
  gap: 0.25rem;
}

.more-categories-btn:hover {
  color: var(--color-primary-dark);
}

.close-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-menu-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--text-primary);
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99998; /* Just below the dropdown but above other content */
  animation: fadeIn 0.2s ease;
}

.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.categories-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  background: var(--light-color);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-md);
  z-index: 999999; /* Maximum z-index to be higher than any other element */
  border: 1px solid var(--color-gray-200);
  max-height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-300) transparent;
  transition: opacity 0.2s ease, transform 0.2s ease;
  animation: fadeIn 0.2s ease;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.categories-menu::-webkit-scrollbar {
  width: 6px;
}

.categories-menu::-webkit-scrollbar-track {
  background: transparent;
}

.categories-menu::-webkit-scrollbar-thumb {
  background-color: var(--color-gray-300);
  border-radius: 20px;
}

.categories-header {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background-color: var(--light-color);
  z-index: 2;
}

.categories-content {
  width: 100%;
  overflow-x: hidden;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  width: 100%;
  overflow: visible;
}

.category-item {
  color: var(--text-primary);
  padding: var(--spacing-sm);
  text-decoration: none;
  border-radius: 3px;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
  height: 38px;
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  border: 1px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 2px);
  box-sizing: border-box;
}

.category-item:hover {
  background-color: var(--color-gray-100);
  color: var(--primary-color);
  border-color: var(--color-gray-200);
}

.search-filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: var(--light-color);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-family: var(--font-primary);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.search-filter-btn:hover {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.hero-cta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  justify-content: center;
}

.hero-cta .btn {
  padding: 14px 32px;  /* Fixed precise padding */
  font-size: 1.125rem;
  width: 240px;
  height: 52px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-cta .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(var(--primary-color-rgb), 0.3);
}

.animate-pulse {
  animation: pulse 2.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(var(--primary-color-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
  }
}

.hero-stats {
  display: flex;
  gap: var(--spacing-xxl);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.stat-item h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--sw-text);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
}

.stat-item p {
  margin: 0;
  color: var(--sw-text-subtle);
  font-size: var(--fs-caption);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Top Products Section */
.top-products-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--light-color);
  position: relative;
  z-index: 1; /* Ensure it stays below dropdown */
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xxl);
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.section-header p {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: var(--spacing-xxl);
}

/* ─── Trending Product Card (redesigned) ───────────────────── */
.product-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  text-align: left;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-3px);
  border-color: var(--sw-primary);
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.08),
              0 2px 6px rgba(17, 24, 39, 0.04);
}

/* Top row — rank + badge */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rank-chip {
  background: var(--sw-text);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.product-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.product-badge.trending   { background: #FEE2E2; color: #B91C1C; }
.product-badge.sponsored  { background: var(--sw-primary-soft); color: var(--sw-primary-hover); }
.product-badge.popular    { background: var(--sw-ai-soft); color: var(--sw-ai); }

/* Identity: logo + name */
.card-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 8px;
  overflow: hidden;
}

.product-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-logo-icon {
  width: 32px;
  height: 32px;
  font-size: 32px;
}

.identity-text { min-width: 0; }

.identity-text h3 {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--sw-text);
  margin: 0 0 2px;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.product-category {
  font-size: 0.75rem;
  color: var(--sw-text-subtle);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* Tagline */
.product-tagline {
  color: var(--sw-text-muted);
  font-size: 0.9375rem;
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}

/* Trust strip */
.trust-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--sw-text-muted);
}

.trust-item { display: inline-flex; align-items: center; gap: 4px; }
.trust-item.rating strong {
  color: var(--sw-text);
  font-weight: 700;
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
  font-size: 0.875rem;
}
.trust-item.rating :deep(.nuxt-icon),
.trust-item.rating svg { color: #F59E0B; }
.trust-item.muted { color: var(--sw-text-subtle); }
.trust-item .muted { color: var(--sw-text-subtle); font-size: 0.8125rem; }
.trust-divider { color: var(--sw-text-subtle); opacity: 0.5; }

/* Best-for line */
.best-for {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--color-success-dark, #059669);
  font-weight: 500;
}

/* Attribute tags */
.attr-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.attr-tag {
  font-size: 0.75rem;
  color: var(--sw-text-muted);
  background: var(--bg-gray);
  border: 1px solid #E5E7EB;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
}

/* Footer: price + CTAs */
.card-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px dashed #E5E7EB;
}

.price-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
}

.price {
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--sw-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.price-period {
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
  font-size: 0.8125rem;
  color: var(--sw-text-subtle);
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 9px 12px;
  border: 1px solid #E5E7EB;
  background: #fff;
  color: var(--sw-text-muted);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
  flex-shrink: 0;
}

.btn-ghost:hover {
  border-color: var(--sw-text-muted);
  color: var(--sw-text);
  background: var(--bg-gray);
}

.btn-primary-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 9px 14px;
  background: var(--sw-primary);
  color: #fff !important;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s, transform 0.1s;
  flex: 1;
}

.btn-primary-card:hover {
  background: var(--sw-primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .products-grid { grid-template-columns: 1fr; }
}
/* ─── End Trending Product Card ───────────────────────────── */

.section-footer {
  text-align: center;
}

.section-footer .btn-outline {
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

/* Integrations Section */
.integrations-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--bg-gray);
  position: relative;
  z-index: 1; /* Ensure it stays below dropdown */
}

.integrations-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xxl);
  align-items: center;
}

.integration-content h2 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.integration-content p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 90%;
}

.integration-logos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.logo-item {
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
}

.logo-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
  z-index: 2;
}

.logo-item img {
  max-width: 80%;
  max-height: 60px;
  transition: all var(--transition-fast);
  filter: grayscale(30%);
}

.logo-item:hover img, .logo-item img.highlighted {
  filter: grayscale(0%);
  transform: scale(1.1);
}

.integration-icon {
  width: 56px;
  height: 56px;
  font-size: 56px;
  transition: all var(--transition-fast);
  filter: grayscale(40%);
  opacity: 0.85;
}

.logo-item:hover .integration-icon,
.integration-icon.highlighted {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}

.logo-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  pointer-events: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
  z-index: 100;
}

.logo-item:hover .logo-tooltip {
  opacity: 1;
  transform: translateX(-50%) scale(1);
  bottom: -25px;
}

.integrations-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.integration-note {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-xxl) 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, #3b27b8 100%);
  color: var(--light-color);
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btn-light {
  background-color: var(--light-color);
  color: var(--primary-color);
}

.btn-light:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Responsive Styles */
@media (max-width: 992px) {
  .integrations-section .container {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2.75rem;
  }
  
  .hero-subtitle {
    max-width: 100%;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .integration-content {
    text-align: center;
  }
  
  .integration-content p {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .integration-logos {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-header h2,
  .integration-content h2,
  .cta-content h2 {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
  
  .categories-menu {
    max-width: 320px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .hero-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .hero-cta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .hero-cta .btn {
    width: 100%;
    max-width: 240px;
    margin: 0 auto;
    height: 52px;
  }
  
  .integration-logos {
    grid-template-columns: 1fr;
  }
  
  .search-wrapper {
    max-width: 90%;
  }
  
  .search-container {
    width: 100%;
  }
  
  .search-btn {
    min-width: 80px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .search-btn span {
    display: none; /* Hide text on mobile, show only icon */
  }
  
  .category-btn {
    width: 44px;
    height: 44px;
    padding: var(--spacing-xs);
  }
  
  .category-btn .nuxt-icon {
    font-size: 1.125rem;
  }
  
  .country-select {
    border-right: none;
    border-bottom: 1px solid var(--color-gray-200);
    width: 100%;
  }
  
  .selected-country {
    justify-content: center;
    padding: var(--spacing-sm);
  }
  
  .search-row,
  .search-categories-dropdown {
    max-width: 90%;
  }
  
  .trending-searches {
    justify-content: space-between;
    max-width: 100%;
    padding-bottom: var(--spacing-xs);
    height: 36px; /* Adjusted height for mobile */
  }
  
  .trending-label {
    font-size: 0.75rem;
  }
  
  .trending-badge {
    font-size: 0.75rem;
    padding: 0.2rem var(--spacing-sm);
  }
  
  .categories-menu {
    width: calc(100vw - 40px);
    max-width: 280px;
    left: auto;
    right: 0;
    max-height: 300px;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    overflow-x: hidden;
    z-index: 999999; /* Ensure it's on top of everything on mobile */
  }
  
  .categories-header {
    padding-bottom: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }
  
  .categories-content {
    overflow-x: hidden;
    max-height: 220px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
    width: 100%;
    overflow: visible;
  }
  
  .category-item {
    height: 36px;
    font-size: 0.875rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  
  .more-categories-btn {
    padding: 0.2rem var(--spacing-sm);
    font-size: 0.75rem;
  }
}
</style>