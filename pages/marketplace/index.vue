<template>
  <div class="marketplace-page">
    <!-- Hero Section with Carousel -->
    <MarketplaceHero />
    
    <!-- Applications Listing Section -->
    <section class="applications-section">
      <div class="container">
        <!-- Top sponsored banner (Phase 5) -->
        <div class="marketplace-sponsored-top">
          <SponsoredSlot placement="banner" variant="banner" label="Featured partner" />
        </div>

        <MarketplaceFilters :view-mode="viewMode" @update:view-mode="viewMode = $event" />
        <div class="applications-grid-container">
          <MarketplaceGrid :view-mode="viewMode" @total-loaded="totalApplications = $event" />
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
import MarketplaceFilters from '~/components/marketplace/MarketplaceFilters.vue';
import MarketplaceGrid from '~/components/marketplace/MarketplaceGrid.vue';
import MarketplacePagination from '~/components/marketplace/MarketplacePagination.vue';

// State for total items (for pagination)
const totalApplications = ref(0);
const viewMode = ref<'grid' | 'list'>('grid');

// VC-focused SEO implementation
const { generateVCMeta, generateInvestmentSchema, trackVCEngagement } = useVCSEO();
const { applySEO, generateHreflangTags } = useSEO();

// Generate VC-optimized meta tags for marketplace
const vcMetaConfig = generateVCMeta({
  title: 'Investment Opportunities & SaaS Marketplace | Moonmart',
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

// noindex filter/sort/paginated URLs to prevent crawl waste
const route = useRoute()
const hasFilterParams = computed(() => {
  const q = route.query
  return !!(q.sort || q.filter || q.category || q.page || q.pricing || q.tag || q.search)
})

// Dynamic canonical and pagination links
const BASE_URL = 'https://moonmart.ai'
const currentPage = computed(() => Number(route.query.page) || 1)
const canonicalHref = computed(() => {
  const base = `${BASE_URL}/marketplace`
  return currentPage.value > 1 ? `${base}?page=${currentPage.value}` : base
})

const paginationLinks = computed(() => {
  const links: Array<{ rel: string; href: string }> = [
    { rel: 'canonical', href: canonicalHref.value }
  ]
  if (currentPage.value > 1) {
    const prevHref = currentPage.value === 2 ? `${BASE_URL}/marketplace` : `${BASE_URL}/marketplace?page=${currentPage.value - 1}`
    links.push({ rel: 'prev', href: prevHref })
  }
  if (totalApplications.value > currentPage.value * 24) {
    links.push({ rel: 'next', href: `${BASE_URL}/marketplace?page=${currentPage.value + 1}` })
  }
  return links
})

// Apply comprehensive SEO with VC focus
useHead({
  ...vcMetaConfig,
  link: paginationLinks,
  meta: [
    ...(vcMetaConfig.meta || []),
    { name: 'robots', content: hasFilterParams.value ? 'noindex, follow' : 'index, follow' }
  ]
});

// Generate investment-focused schema
const marketplaceSchema = generateInvestmentSchema({
  type: 'marketplace',
  name: 'Moonmart Investment Marketplace',
  description: 'Premier platform for discovering investment-ready SaaS companies and emerging market opportunities',
  url: 'https://moonmart.ai/marketplace',
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
        name: 'Moonmart Investment Marketplace',
        description: 'Discover emerging SaaS startups and investment opportunities in the global software marketplace',
        url: 'https://moonmart.ai/marketplace',
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
  overflow-x: clip;
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

.marketplace-sponsored-top {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  width: 100%;
  display: block;
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
