<template>
  <div class="app-details-page">
    <!-- Loading State -->
    <div v-if="pending" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading application details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <UIcon name="i-heroicons-exclamation-triangle" dynamic />
      </div>
      <h2>Application Not Found</h2>
      <p>The requested application could not be found.</p>
      <NuxtLink to="/marketplace" class="btn btn-primary">
        Back to Marketplace
      </NuxtLink>
    </div>

    <!-- Application Details -->
    <div v-else-if="app" class="app-content">
      <!-- Hero Section -->
      <section class="app-hero">
        <div class="container">
          <div class="hero-content">
            <div class="app-header">
              <div class="app-logo-large">
                <img :src="app.logo" :alt="app.name + ' logo'" @error="handleImageError" />
              </div>
              <div class="app-info">
                <div class="app-badges">
                  <span v-if="app.featured" class="badge featured">
                    <UIcon name="i-heroicons-star" dynamic /> Featured
                  </span>
                  <span v-if="app.trending" class="badge trending">
                    <UIcon name="i-heroicons-chart-bar" dynamic /> Trending
                  </span>
                  <span v-if="isRecentlyAdded(app)" class="badge recent">
                    <UIcon name="i-heroicons-clock" dynamic /> New
                  </span>
                </div>
                <h1 class="app-title">{{ app.name }}</h1>
                <p class="app-provider">by {{ app.provider }}</p>
                <div class="app-meta-hero">
                  <div class="rating-large">
                    <div class="stars">
                      <UIcon 
                        v-for="star in 5" 
                        :key="star" 
                        :name="getStarIcon(star, app.rating)" 
                        dynamic
                        :class="getStarClass(star, app.rating)"
                      />
                    </div>
                    <span class="rating-value">{{ app.rating.toFixed(1) }}</span>
                    <span class="rating-count">({{ app.reviewCount }} reviews)</span>
                  </div>
                  <div class="pricing-large">
                    <span class="price">{{ formatPrice(app.pricing) }}</span>
                  </div>
                </div>
                <div class="app-tags-hero">
                  <span v-for="tag in app.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="hero-actions">
              <button class="btn btn-primary btn-large" @click="startTrial">
                {{ app.pricing.type === 'free' ? 'Get Started Free' : 'Start Free Trial' }}
              </button>
              <button class="btn btn-outline btn-large" @click="viewDemo">
                View Demo
              </button>
              <button class="btn btn-ghost" @click="addToWishlist">
                <UIcon name="i-heroicons-heart" dynamic />
                Save
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- App Screenshots/Gallery -->
      <section class="app-gallery" v-if="app.screenshots && app.screenshots.length > 0">
        <div class="container">
          <h2>Screenshots</h2>
          <div class="gallery-grid">
            <div 
              v-for="(screenshot, index) in app.screenshots" 
              :key="index"
              class="screenshot-item"
              @click="openLightbox(index)"
            >
              <img :src="screenshot.url" :alt="screenshot.caption" />
            </div>
          </div>
        </div>
      </section>

      <!-- App Description & Features -->
      <section class="app-description">
        <div class="container">
          <div class="content-grid">
            <div class="main-content">
              <h2>About {{ app.name }}</h2>
              <div class="description-text" v-html="app.longDescription || app.description"></div>
              
              <h3>Key Features</h3>
              <ul class="features-list">
                <li v-for="feature in app.features" :key="feature">
                  <UIcon name="i-heroicons-check-circle" dynamic />
                  {{ feature }}
                </li>
              </ul>

              <h3>What's Included</h3>
              <div class="included-items">
                <div v-for="item in app.included" :key="item" class="included-item">
                  <UIcon name="i-heroicons-check" dynamic />
                  {{ item }}
                </div>
              </div>
            </div>

            <div class="sidebar">
              <!-- Pricing Card -->
              <div class="pricing-card">
                <h3>Pricing</h3>
                <div class="pricing-details">
                  <div class="price-display">{{ formatPrice(app.pricing) }}</div>
                  <div class="price-description">{{ getPricingDescription(app.pricing) }}</div>
                </div>
                <div class="pricing-features">
                  <div v-for="feature in app.pricingFeatures" :key="feature" class="pricing-feature">
                    <UIcon name="i-heroicons-check" dynamic />
                    <span>{{ feature }}</span>
                  </div>
                </div>
                <button class="btn btn-primary full-width" @click="startTrial">
                  {{ app.pricing.type === 'free' ? 'Get Started Free' : 'Start Free Trial' }}
                </button>
              </div>

              <!-- App Info Card -->
              <div class="info-card">
                <h3>App Information</h3>
                <div class="info-items">
                  <div class="info-item">
                    <span class="label">Category:</span>
                    <span class="value">{{ getCategoryName(app.category) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Developer:</span>
                    <span class="value">{{ app.provider }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Last Updated:</span>
                    <span class="value">{{ formatDate(app.lastUpdated || '2024-01-01') }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Version:</span>
                    <span class="value">{{ app.version || '1.0.0' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Languages:</span>
                    <span class="value">{{ app.languages?.join(', ') || 'English' }}</span>
                  </div>
                </div>
              </div>

              <!-- Integration Card -->
              <div class="integration-card" v-if="app.integrations && app.integrations.length > 0">
                <h3>Integrations</h3>
                <div class="integrations-list">
                  <div v-for="integration in app.integrations.slice(0, 6)" :key="integration" class="integration-item">
                    <img :src="`/assets/images/integrations/${integration.toLowerCase()}.svg`" :alt="integration" />
                    <span>{{ integration }}</span>
                  </div>
                  <div v-if="app.integrations.length > 6" class="integration-more">
                    +{{ app.integrations.length - 6 }} more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="app-reviews">
        <div class="container">
          <div class="reviews-header">
            <h2>Reviews & Ratings</h2>
            <div class="overall-rating">
              <div class="rating-score">{{ app.rating.toFixed(1) }}</div>
              <div class="rating-details">
                <div class="stars">
                  <UIcon 
                    v-for="star in 5" 
                    :key="star" 
                    :name="getStarIcon(star, app.rating)" 
                    dynamic
                    :class="getStarClass(star, app.rating)"
                  />
                </div>
                <div class="rating-text">Based on {{ app.reviewCount }} reviews</div>
              </div>
            </div>
          </div>
          
          <div class="reviews-grid">
            <div v-for="review in mockReviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">{{ review.author.charAt(0) }}</div>
                  <div class="reviewer-details">
                    <div class="reviewer-name">{{ review.author }}</div>
                    <div class="reviewer-title">{{ review.title }}</div>
                  </div>
                </div>
                <div class="review-rating">
                  <div class="stars">
                    <UIcon 
                      v-for="star in 5" 
                      :key="star" 
                      :name="star <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'" 
                      dynamic
                      :class="{ 'filled': star <= review.rating }"
                    />
                  </div>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
              </div>
              <div class="review-content">
                <p>{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Enhanced Reviews Section -->
      <section class="app-reviews" v-if="app">
        <div class="container">
          <ReviewSystem 
            :app-id="appId"
            :reviews="reviewsData?.reviews || []"
            :overall-rating="reviewsData?.averageRating || app.rating"
            :rating-breakdown="reviewsData?.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 }"
            :can-review="true"
            @review-submitted="onReviewSubmitted"
          />
        </div>
      </section>

      <!-- Analytics Dashboard (Admin/Owner only) -->
      <section class="app-analytics" v-if="analyticsData && canViewAnalytics">
        <div class="container">
          <h2>Analytics Overview</h2>
          <AnalyticsDashboard 
            :app-id="appId"
            :timeframe="'30d'"
          />
        </div>
      </section>

      <!-- Similar Apps -->
      <section class="similar-apps">
        <div class="container">
          <h2>Similar Applications</h2>
          <div class="similar-apps-grid">
            <div v-for="similarApp in similarApps" :key="similarApp.id" class="similar-app-card">
              <NuxtLink :to="`/marketplace/app/${similarApp.id}`" class="similar-app-link">
                <div class="similar-app-logo">
                  <img :src="similarApp.logo" :alt="similarApp.name" />
                </div>
                <h4>{{ similarApp.name }}</h4>
                <p>{{ similarApp.description.substring(0, 80) }}...</p>
                <div class="similar-app-rating">
                  <div class="stars">
                    <UIcon 
                      v-for="star in 5" 
                      :key="star" 
                      :name="getStarIcon(star, similarApp.rating)" 
                      dynamic
                      :class="getStarClass(star, similarApp.rating)"
                    />
                  </div>
                  <span>{{ similarApp.rating.toFixed(1) }}</span>
                </div>
                <div class="similar-app-price">{{ formatPrice(similarApp.pricing) }}</div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, useNuxtApp } from '#app';

// Types
interface AppPricing {
  type: 'free' | 'trial' | 'paid';
  value?: number;
  period?: string;
}

interface Application {
  id: string;
  name: string;
  logo: string;
  provider: string;
  description: string;
  longDescription?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  pricing: AppPricing;
  category: string;
  featured?: boolean;
  trending?: boolean;
  screenshots?: { url: string; caption: string }[];
  features?: string[];
  included?: string[];
  pricingFeatures?: string[];
  integrations?: string[];
  lastUpdated?: string;
  version?: string;
  languages?: string[];
}

// Use global market plugin
const nuxtApp = useNuxtApp();
let formatCurrency, getLocalizedPrice, currentRegionSettings;

try {
  if (nuxtApp.$globalMarket) {
    formatCurrency = nuxtApp.$globalMarket.formatCurrency;
    getLocalizedPrice = nuxtApp.$globalMarket.getLocalizedPrice;
    currentRegionSettings = nuxtApp.$globalMarket.currentRegionSettings;
  } else {
    formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };
    getLocalizedPrice = (amount: number) => amount;
    currentRegionSettings = computed(() => ({ 
      currency: 'USD', 
      locale: 'en-US',
      name: 'United States',
      tax: 8.5,
      flag: 'us'
    }));
  }
} catch (error) {
  formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  getLocalizedPrice = (amount: number) => amount;
  currentRegionSettings = computed(() => ({ 
    currency: 'USD', 
    locale: 'en-US',
    name: 'United States',
    tax: 8.5,
    flag: 'us'
  }));
}

const route = useRoute();
const router = useRouter();
const appId = route.params.id as string;

// Initialize analytics tracking
const { trackAppView, trackAppDownload, trackTrialStart, trackSectionView, trackTimeSpent, trackScrollDepth } = useAnalytics()

// State for API data fetching with enhanced missing fields
const { data: app, pending, error } = await useFetch<Application>(`/api/apps/${appId}`, {
  key: `app-${appId}`,
  server: true
});

// Load review data
const { data: reviewsData, refresh: refreshReviews } = await useFetch(`/api/apps/${appId}/reviews`, {
  key: `reviews-${appId}`,
  default: () => ({
    reviews: [],
    total: 0,
    averageRating: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 }
  }),
  transform: (data: any) => ({
    ...data,
    reviews: data.reviews?.map((review: any) => ({
      ...review,
      createdAt: new Date(review.createdAt),
      updatedAt: new Date(review.updatedAt)
    })) || []
  })
})

// Load analytics data for this app (if user has permission)
const { data: analyticsData } = await useFetch(`/api/apps/${appId}/metrics`, {
  key: `analytics-${appId}`,
  default: () => null,
  server: false // Load on client side only
})

// Mock similar apps for now - in production, this would also come from API
const mockSimilarApps: Application[] = [
  {
    id: 'app-002',
    name: 'Asana Tasks',
    logo: '/assets/images/integrations/asana.svg',
    provider: 'Asana Inc.',
    description: 'Advanced project management tool with team collaboration features, timeline tracking, and resource allocation.',
    rating: 4.5,
    reviewCount: 189,
    tags: ['Project Management', 'Collaboration'],
    pricing: { type: 'trial' as const, value: 19, period: 'month' },
    category: 'productivity'
  },
  {
    id: 'app-003',
    name: 'Zapier Connect',
    logo: '/assets/images/integrations/zapier.svg',
    provider: 'Zapier Inc.',
    description: 'Real-time data synchronization platform for businesses with multi-source integration capabilities.',
    rating: 4.2,
    reviewCount: 127,
    tags: ['Data', 'Integration', 'Sync'],
    pricing: { type: 'paid' as const, value: 49, period: 'month' },
    category: 'integration'
  }
];

// Helper functions
const formatPrice = (pricing: AppPricing) => {
  if (pricing.type === 'free') return 'Free';
  if (pricing.type === 'trial') return 'Free Trial';
  if (pricing.value && pricing.period) {
    try {
      const localizedAmount = getLocalizedPrice(pricing.value, 'USD');
      const formattedPrice = formatCurrency(localizedAmount);
      return `${formattedPrice}/${pricing.period}`;
    } catch (error) {
      return `$${pricing.value}/${pricing.period}`;
    }
  }
  return 'Contact for pricing';
};

const getStarIcon = (starPosition: number, rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  if (starPosition <= fullStars) {
    return 'i-heroicons-star-solid';
  } else if (starPosition === fullStars + 1 && hasHalfStar) {
    return 'i-heroicons-star-solid';
  } else {
    return 'i-heroicons-star';
  }
};

const getStarClass = (starPosition: number, rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  if (starPosition <= fullStars) {
    return 'filled';
  } else if (starPosition === fullStars + 1 && hasHalfStar) {
    return 'filled half-star';
  } else {
    return '';
  }
};

const isRecentlyAdded = (app: Application) => {
  if (!app.lastUpdated) return false;
  const updateDate = new Date(app.lastUpdated);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return updateDate > thirtyDaysAgo;
};

const getCategoryName = (category: string) => {
  const categories: Record<string, string> = {
    crm: 'Customer Relationship Management',
    productivity: 'Productivity',
    marketing: 'Marketing',
    finance: 'Finance',
    development: 'Development',
    integration: 'Integration'
  };
  return categories[category] || category;
};

const getPricingDescription = (pricing: AppPricing) => {
  if (pricing.type === 'free') return 'Always free to use';
  if (pricing.type === 'trial') return 'Free trial available';
  return 'Billed monthly, cancel anytime';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Mock reviews data - In production, this would come from API
const mockReviews = [
  {
    id: 1,
    author: 'Sarah Johnson',
    title: 'Marketing Manager',
    rating: 5,
    date: '2024-01-10',
    comment: 'This app has transformed our sales process. The automation features are incredible and the customer support is top-notch.'
  },
  {
    id: 2,
    author: 'Mike Chen',
    title: 'Sales Director',
    rating: 4,
    date: '2023-12-28',
    comment: 'Great CRM system with lots of customization options. Takes some time to set up initially but worth the investment.'
  },
  {
    id: 3,
    author: 'Emily Rodriguez',
    title: 'Business Owner',
    rating: 5,
    date: '2023-12-15',
    comment: 'Perfect for small businesses. The pricing is reasonable and the features are exactly what we needed.'
  }
];

// Computed
const similarApps = computed(() => {
  if (!app.value) return [];
  return mockSimilarApps
    .filter((a: Application) => a.id !== app.value!.id && a.category === app.value!.category)
    .slice(0, 4);
});

// Check if user can view analytics (admin/owner only)
const canViewAnalytics = computed(() => {
  // In a real app, this would check user permissions
  // For now, return false to hide analytics from general users
  return false;
});

// Methods with analytics tracking
const startTrial = async () => {
  // Track trial start event
  await trackTrialStart(appId, app.value?.pricing.type || 'trial')
  
  // In a real app, this would redirect to the app's signup page
  window.open(`https://signup.example.com/${app.value?.id}`, '_blank');
};

const viewDemo = async () => {
  // Track demo view
  await trackAppDownload(appId, 'demo', 'web')
  
  // In a real app, this would open a demo or video
  window.open(`https://demo.example.com/${app.value?.id}`, '_blank');
};

const addToWishlist = async () => {
  // Track wishlist action
  await trackSectionView(appId, 'wishlist_add')
  
  // Add to wishlist functionality
  console.log('Added to wishlist:', app.value?.name);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/images/placeholder-app.png';
};

const openLightbox = (index: number) => {
  // Open screenshot in lightbox
  console.log('Open screenshot:', index);
};

// Handle review submission
const onReviewSubmitted = async () => {
  // Refresh review data when new review is submitted
  await refreshReviews();
  
  // Track review submission
  await trackSectionView(appId, 'review_submitted');
};

// Analytics lifecycle hooks
let timeTracker: (() => void) | undefined
let scrollTracker: (() => void) | undefined

onMounted(async () => {
  if (app.value) {
    // Track page view
    await trackAppView(appId, {
      appName: app.value.name,
      category: app.value.category,
      pricing: app.value.pricing.type
    })
    
    // Set up time tracking
    timeTracker = trackTimeSpent(appId)
    
    // Set up scroll depth tracking
    scrollTracker = trackScrollDepth(appId)
  }
})

onUnmounted(() => {
  // Clean up tracking
  if (timeTracker) timeTracker()
  if (scrollTracker) scrollTracker()
})

// SEO - update based on fetched app data
watchEffect(() => {
  if (app.value) {
    useHead({
      title: `${app.value.name} - SaaSWorld Marketplace`,
      meta: [
        { 
          name: 'description', 
          content: app.value.description
        },
        { 
          property: 'og:title', 
          content: `${app.value.name} - SaaSWorld Marketplace`
        },
        { 
          property: 'og:description', 
          content: app.value.description
        },
        { property: 'og:type', content: 'website' },
        { 
          property: 'og:url', 
          content: `https://saasworld.club/marketplace/app/${appId}` 
        },
        { 
          property: 'og:image', 
          content: app.value.logo
        }
      ]
    });
  } else {
    useHead({
      title: 'Application Details - SaaSWorld',
      meta: [
        { 
          name: 'description', 
          content: 'Discover amazing SaaS applications on SaaSWorld Marketplace'
        }
      ]
    });
  }
});
</script>

<style scoped>
.app-details-page {
  min-height: 100vh;
  background-color: var(--light-color);
}

/* Loading & Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 60vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Hero Section */
.app-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-xxl) 0;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-xl);
  align-items: start;
}

.app-header {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.app-logo-large {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 16px;
  padding: 1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.app-logo-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-info {
  flex: 1;
}

.app-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.badge.featured {
  background-color: rgba(76, 236, 196, 0.2);
  color: #4ECDC4;
}

.badge.trending {
  background-color: rgba(255, 107, 107, 0.2);
  color: #FF6B6B;
}

.badge.recent {
  background-color: rgba(255, 230, 109, 0.2);
  color: #FFE66D;
}

.app-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  line-height: 1.1;
}

.app-provider {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.app-meta-hero {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: 1.5rem;
}

.rating-large {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-large .stars {
  display: flex;
  gap: 0.25rem;
}

.rating-large .stars svg {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.3);
}

.rating-large .stars svg.filled {
  color: #fbbf24;
}

.rating-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.rating-count {
  opacity: 0.8;
}

.pricing-large .price {
  font-size: 2rem;
  font-weight: 700;
}

.app-tags-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
  min-width: 200px;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.btn-ghost {
  background: transparent;
  color: white;
  border: none;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Gallery Section */
.app-gallery {
  padding: var(--spacing-xxl) 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.screenshot-item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.screenshot-item:hover {
  transform: scale(1.02);
}

.screenshot-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* Description Section */
.app-description {
  padding: var(--spacing-xxl) 0;
  background: white;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--spacing-xxl);
}

.main-content h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.main-content h3 {
  font-size: 1.5rem;
  margin: var(--spacing-xl) 0 var(--spacing-lg) 0;
  color: var(--text-primary);
}

.description-text {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-xl) 0;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  font-size: 1.125rem;
  color: var(--text-primary);
}

.features-list li svg {
  color: #10b981;
  width: 20px;
  height: 20px;
}

.included-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.included-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.included-item svg {
  color: #10b981;
  width: 16px;
  height: 16px;
}

/* Sidebar Cards */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pricing-card, .info-card, .integration-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.pricing-card h3, .info-card h3, .integration-card h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.price-display {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.price-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.pricing-features {
  margin-bottom: var(--spacing-lg);
}

.pricing-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--text-primary);
}

.pricing-feature svg {
  color: #10b981;
  width: 16px;
  height: 16px;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.info-item .label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
}

.info-item .value {
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

.integrations-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.integration-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.integration-item img {
  width: 20px;
  height: 20px;
}

.integration-more {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 0.5rem;
}

/* Reviews Section */
.app-reviews {
  padding: var(--spacing-xxl) 0;
  background: #f9fafb;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.reviews-header h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin: 0;
}

.overall-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.rating-score {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.rating-details .stars {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.rating-details .stars svg {
  width: 20px;
  height: 20px;
  color: #d1d5db;
}

.rating-details .stars svg.filled {
  color: #fbbf24;
}

.rating-text {
  color: var(--text-secondary);
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.review-card {
  background: white;
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.reviewer-name {
  font-weight: 600;
  color: var(--text-primary);
}

.reviewer-title {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.review-rating {
  text-align: right;
}

.review-rating .stars {
  display: flex;
  gap: 0.125rem;
  margin-bottom: 0.25rem;
}

.review-rating .stars svg {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.review-rating .stars svg.filled {
  color: #fbbf24;
}

.review-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.review-content p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Similar Apps Section */
.similar-apps {
  padding: var(--spacing-xxl) 0;
  background: white;
}

.similar-apps h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.similar-apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.similar-app-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.similar-app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.similar-app-link {
  display: block;
  padding: var(--spacing-lg);
  text-decoration: none;
  color: inherit;
}

.similar-app-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.similar-app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.similar-app-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.similar-app-card p {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.similar-app-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.similar-app-rating .stars {
  display: flex;
  gap: 0.125rem;
}

.similar-app-rating .stars svg {
  width: 14px;
  height: 14px;
  color: #d1d5db;
}

.similar-app-rating .stars svg.filled {
  color: #fbbf24;
}

.similar-app-price {
  font-weight: 600;
  color: var(--primary-color);
}

/* Utility Classes */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  gap: 0.5rem;
}

.full-width {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .app-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .app-logo-large {
    width: 100px;
    height: 100px;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .reviews-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .container {
    padding: 0 var(--spacing-md);
  }
}
</style>
