<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Empower your business with our <span class="highlight">Saasworld.club</span> platform</h1>
          <p class="hero-subtitle">The Saasworld.club is a digital marketplace for web applications that provides a wide range of apps that can be searched on the need of users and helps to make decisions for small and medium businesses, that can be used by multiple personas and businesses.</p>
          
          <!-- Search row -->
          <div class="search-row">
            <div class="search-container">
              <!-- Country select hidden for now 
              <div class="country-select">
                <div class="selected-country">
                  <img src="/assets/images/flags/us.svg" alt="US Flag" class="country-flag">
                  <span>+1</span>
                  <UIcon dynamic name="i-heroicons-chevron-down" />
                </div>
                <div class="country-dropdown">
                  <div class="country-option" v-for="country in countries" :key="country.code">
                    <img :src="country.flag" :alt="country.name + ' Flag'" class="country-flag">
                    <span>+{{ country.dialCode }}</span>
                  </div>
                </div>
              </div>
              -->
              <input type="text" placeholder="Search for applications..." class="search-input">
              <button class="search-btn" @click="handleSearch">
                <UIcon name="i-heroicons-magnifying-glass" dynamic />
                <span>Search</span>
              </button>
            </div>
            <button class="category-btn" @click="handleCategoryClick" title="Browse Categories">
              <UIcon name="i-heroicons-squares-2x2" dynamic />
            </button>
            <!-- Filter button hidden for now 
            <button class="search-filter-btn">
              <UIcon dynamic name="i-heroicons-funnel" />
              <span>Filter</span>
            </button>
            -->
          </div>
          
          <div class="hero-cta">
            <NuxtLink to="/marketplace" class="btn btn-primary animate-pulse">
              Explore Marketplace
            </NuxtLink>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div class="stat-item">
              <h3>99.9%</h3>
              <p>Uptime SLA</p>
            </div>
            <div class="stat-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
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
          <div class="product-card" v-for="(product, index) in topProducts" :key="index">
            <div class="product-badge" :class="product.badgeType">
              <UIcon dynamic :name="product.badgeIcon" />
              {{ product.badge }}
            </div>
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="product-content">
              <h3>{{ product.name }}</h3>
              <p class="product-category">{{ product.category }}</p>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-stats">
                <div class="stat">
                  <UIcon dynamic name="i-heroicons-star-solid" />
                  <span>{{ product.rating }}</span>
                </div>
                <div class="stat">
                  <UIcon dynamic name="i-heroicons-users" />
                  <span>{{ product.users }}</span>
                </div>
              </div>
              <div class="product-pricing">
                <span class="price">{{ product.price }}</span>
                <span class="price-period">{{ product.pricePeriod }}</span>
              </div>
              <NuxtLink :to="`/marketplace/app/${product.id}`" class="btn btn-primary btn-sm">
                View Details
              </NuxtLink>
            </div>
          </div>
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
            <img :src="logo.src" :alt="logo.name" :class="{ 'highlighted': highlightedLogo === index }" />
          </div>
        </div>
        <div class="integrations-footer">
          <p class="integration-note">...and many more available on our integrations page.</p>
        </div>
      </div>
    </section>

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
    description: 'Transform the way your team communicates with Slack\'s powerful messaging platform.',
    image: '/assets/images/integrations/slack.svg',
    rating: '4.8',
    users: '12M+',
    price: '$8',
    pricePeriod: '/month',
    badge: 'Trending',
    badgeType: 'trending',
    badgeIcon: 'i-heroicons-fire'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'Customer Relationship',
    description: 'Grow better with HubSpot\'s free CRM software that helps you track leads and customers.',
    image: '/assets/images/integrations/hubspot.svg',
    rating: '4.7',
    users: '8M+',
    price: 'Free',
    pricePeriod: '',
    badge: 'Sponsored',
    badgeType: 'sponsored',
    badgeIcon: 'i-heroicons-star-solid'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Video Conferencing',
    description: 'Connect, collaborate, and celebrate from anywhere with Zoom\'s reliable video platform.',
    image: '/assets/images/integrations/zoom.svg',
    rating: '4.6',
    users: '15M+',
    price: '$14.99',
    pricePeriod: '/month',
    badge: 'Most Searched',
    badgeType: 'popular',
    badgeIcon: 'i-heroicons-magnifying-glass'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    description: 'Your connected workspace for docs, notes, tasks, wikis, and databases.',
    image: '/assets/images/integrations/notion.svg',
    rating: '4.9',
    users: '4M+',
    price: '$10',
    pricePeriod: '/month',
    badge: 'Trending',
    badgeType: 'trending',
    badgeIcon: 'i-heroicons-fire'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM & Sales',
    description: 'The world\'s #1 CRM platform that helps you sell, service, and market like never before.',
    image: '/assets/images/integrations/salesforce.svg',
    rating: '4.5',
    users: '20M+',
    price: '$25',
    pricePeriod: '/month',
    badge: 'Sponsored',
    badgeType: 'sponsored',
    badgeIcon: 'i-heroicons-star-solid'
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'Design',
    description: 'Create stunning designs with Canva\'s easy-to-use design platform.',
    image: '/assets/images/integrations/canva.svg',
    rating: '4.8',
    users: '10M+',
    price: '$12.99',
    pricePeriod: '/month',
    badge: 'Most Searched',
    badgeType: 'popular',
    badgeIcon: 'i-heroicons-magnifying-glass'
  }
];

// Integration Logos
const integrationLogos = [
  { name: 'Slack', src: '/assets/images/integrations/slack.svg' },
  { name: 'Google Workspace', src: '/assets/images/integrations/google.svg' },
  { name: 'Microsoft', src: '/assets/images/integrations/microsoft.svg' },
  { name: 'Zoom', src: '/assets/images/integrations/zoom.svg' },
  { name: 'Dropbox', src: '/assets/images/integrations/dropbox.svg' },
  { name: 'Salesforce', src: '/assets/images/integrations/salesforce.svg' }
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

.hero-title {
  font-size: 3.25rem;
  line-height: 1.2;
  margin-bottom: var(--spacing-lg);
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
  font-size: 1.1rem;
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

.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 420px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

.product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-badge.trending {
  background-color: #FF6B6B;
  color: white;
}

.product-badge.sponsored {
  background-color: #4ECDC4;
  color: white;
}

.product-badge.popular {
  background-color: #FFE66D;
  color: #2C3E50;
}

.product-image {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  height: 80px;
  border-radius: 0.25rem;
  margin-bottom: var(--spacing-sm);
}

.product-image img {
  max-width: 60px;
  max-height: 60px;
  object-fit: contain;
}

.product-content {
  padding: 0 var(--spacing-sm) var(--spacing-sm);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-content h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
  line-height: 1.3;
}

.product-category {
  font-size: 0.875rem;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-description {
  color: var(--text-secondary);
  font-size: 0.825rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.product-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.stat .nuxt-icon {
  color: #fbbf24;
}

.product-pricing {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.price {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--primary-color);
}

.price-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  width: 100%;
  justify-content: center;
}

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
    font-size: 1.1rem;
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