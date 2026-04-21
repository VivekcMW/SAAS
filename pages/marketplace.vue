<template>
  <div class="marketplace-page">
    <!-- Hero Section with Carousel -->
    <MarketplaceHero />
    
    <!-- Applications Listing Section -->
    <section class="applications-section">
      <div class="container">
        <MarketplaceFilters />
        <div class="applications-grid-container">
          <MarketplaceAdBanner position="top" />
          <MarketplaceGrid />
          <MarketplaceAdBanner position="middle" />
          <MarketplacePagination :totalItems="totalApplications" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Import marketplace components
import MarketplaceHero from '~/components/marketplace/MarketplaceHero.vue';
import MarketplaceCategories from '~/components/marketplace/MarketplaceCategories.vue';
import MarketplaceFilters from '~/components/marketplace/MarketplaceFilters.vue';
import MarketplaceGrid from '~/components/marketplace/MarketplaceGrid.vue';
import MarketplaceAdBanner from '~/components/marketplace/MarketplaceAdBanner.vue';
import MarketplacePagination from '~/components/marketplace/MarketplacePagination.vue';

// State for total items (for pagination)
const totalApplications = ref(0);

// VC-focused SEO implementation
const { generateVCMeta, generateInvestmentSchema, trackVCEngagement } = useVCSEO();
const { applySEO, generateHreflangTags } = useSEO();

// Generate VC-optimized meta tags for marketplace
const vcMetaConfig = generateVCMeta({
  title: 'Investment Opportunities & SaaS Marketplace | SaaSWorld',
  description: 'Discover emerging SaaS startups, investment-ready companies, and high-growth software solutions. The premier marketplace for VCs to research market trends and identify promising investment opportunities.',
  keywords: [
    'software marketplace', 'business software', 'saas tools', 'enterprise applications',
    'software directory', 'business solutions', 'digital tools', 'cloud software',
    'venture capital', 'investment opportunities', 'startup discovery', 'emerging companies',
    'saas investment', 'growth companies', 'funding rounds', 'market intelligence'
  ],
  page: 'marketplace',
  hasInvestmentOpportunities: true,
  marketSize: '$500+ billion SaaS market'
});

// Apply comprehensive SEO with VC focus
useHead({
  ...vcMetaConfig,
  link: [
    { rel: 'canonical', href: 'https://saasworld.com/marketplace' }
  ]
});

// Generate investment-focused schema
const marketplaceSchema = generateInvestmentSchema({
  type: 'marketplace',
  name: 'SaaSWorld Investment Marketplace',
  description: 'Premier platform for discovering investment-ready SaaS companies and emerging market opportunities',
  url: 'https://saasworld.com/marketplace',
  marketCategory: 'Software Marketplace',
  investmentHighlights: [
    'Comprehensive startup database',
    'Real-time funding status tracking',
    'Growth metrics and analytics',
    'Market intelligence platform',
    'VC partnership network'
  ]
});

// Add comprehensive structured data
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'SaaSWorld Investment Marketplace',
        description: 'Discover emerging SaaS startups and investment opportunities in the global software marketplace',
        url: 'https://saasworld.com/marketplace',
        mainEntity: {
          '@type': 'ItemList',
          name: 'Investment-Ready Software Companies',
          description: 'Curated collection of high-growth SaaS companies and emerging market leaders',
          numberOfItems: totalApplications.value
        },
        about: [
          {
            '@type': 'Thing',
            name: 'Venture Capital Investment Opportunities'
          },
          {
            '@type': 'Thing',
            name: 'SaaS Startup Discovery Platform'
          },
          {
            '@type': 'Thing',
            name: 'Market Intelligence for Investors'
          }
        ],
        additionalProperty: (marketplaceSchema as any).additionalProperty || []
      })
    } as any
  ]
});


onMounted(async () => {
  try {
    const response = await $fetch<{ total: number }>('/api/apps')
    totalApplications.value = response.total || 0
  } catch (error) {
    console.error('Failed to load marketplace totals:', error)
  }
})

// Track VC engagement on marketplace page
onMounted(() => {
  trackVCEngagement({
    type: 'page_view',
    page: 'marketplace',
    isVCReferral: document.referrer.includes('crunchbase') || 
                  document.referrer.includes('techcrunch') ||
                  document.referrer.includes('venturebeat') ||
                  document.referrer.includes('angellist')
  });
});
</script>

<style scoped>
.marketplace-page {
  padding-bottom: var(--spacing-xxl);
}

.applications-section {
  margin-top: var(--spacing-xxl);
  margin-bottom: var(--spacing-xxl);
  padding-top: var(--spacing-xl);
}

.applications-grid-container {
  margin-top: var(--spacing-xl);
  padding: 1rem 0;
}

/* Ensure proper spacing for the grid */
.applications-grid-container > * + * {
  margin-top: 2rem;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
}
</style>
