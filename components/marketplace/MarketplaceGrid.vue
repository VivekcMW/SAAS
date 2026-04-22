<template>
  <div class="marketplace-grid">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading applications...</p>
    </div>
    
    <div v-else-if="applications.length === 0" class="no-results">
      <div class="no-results-icon">
        <UIcon name="i-heroicons-magnifying-glass" dynamic />
      </div>
      <h3>No applications found</h3>
      <p>Try adjusting your filters or search criteria</p>
      <button class="btn btn-primary" @click="resetFilters">Reset Filters</button>
    </div>
    
    <div v-else class="grid-container">
      <template v-for="(app, index) in applications" :key="app.id">
        <!-- Global Product Card - Horizontal Layout -->
        <div class="grid-item">
          <ProductCard 
            :product="transformAppData(app)"
            layout="vertical"
            :variant="getAppVariant(app)"
            @view-details="navigateToApp"
            @toggle-favorite="handleToggleFavorite"
            @card-click="navigateToApp"
          />
        </div>

        <!-- Sponsored slot — after 3rd cell, then every 6th cell. Aligns to grid row height. -->
        <div v-if="shouldShowAd(index)" class="grid-item ad-item">
          <SponsoredSlot
            placement="grid"
            variant="native-card"
            label="Sponsored"
            :exclude="visibleAppIds"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from '#app'

interface AppPricing {
  type: 'free' | 'trial' | 'paid' | 'contact'
  value?: number
  period?: string
}

interface Application {
  id: string
  slug?: string
  name: string
  logo: string
  provider?: string
  description: string
  rating: number
  reviewCount: number
  tags: string[]
  pricing: AppPricing
  category: string
  featured?: boolean
  trending?: boolean
  sponsored?: boolean
}

const applications = ref<Application[]>([])
const loading = ref(true)
const favorites = ref<string[]>([])
const route = useRoute()
const router = useRouter()

// Used to exclude apps already on the page from the sponsored slot rotation
const visibleAppIds = computed(() => applications.value.map(a => a.id))

// Inject sponsored cell after position 3 (index 2), then every 6 cells after that.
// On a 4-col grid this puts ads at: end of row 1, mid-row 3, mid-row 5, etc.
const shouldShowAd = (index: number) => index === 2 || (index > 2 && (index - 2) % 6 === 0)

const isInFavorites = (appId: string) => favorites.value.includes(appId)

const loadFavorites = () => {
  if (!process.client) {
    return
  }

  const storedFavorites = localStorage.getItem('app-favorites')
  favorites.value = storedFavorites ? JSON.parse(storedFavorites) : []
}

const loadApplications = async () => {
  loading.value = true

  try {
    const response = await $fetch<{ apps: Application[] }>('/api/apps', {
      query: {
        search: typeof route.query.search === 'string' ? route.query.search : undefined,
        category: typeof route.query.category === 'string' ? route.query.category : undefined
      }
    })

    applications.value = response.apps || []
  } catch (error) {
    console.error('Failed to load marketplace applications:', error)
    applications.value = []
  } finally {
    loading.value = false
  }
}

const navigateToApp = async (appId: string) => {
  const app = applications.value.find(item => item.id === appId)
  const identifier = app?.slug || appId
  await router.push(`/marketplace/app/${identifier}`)
}

const getActiveUsers = (app: Application) => {
  if (app.featured) return 48200
  if (app.trending) return 31800
  return 12600
}

const transformAppData = (app: Application) => ({
  id: app.id,
  name: app.name,
  logo: app.logo,
  rating: app.rating,
  reviewCount: app.reviewCount,
  activeUsers: getActiveUsers(app),
  pricing: app.pricing,
  isFavorited: isInFavorites(app.id),
  growthStats: app.trending ? {
    percentage: 18,
    period: 'week',
    trend: 'up' as const
  } : undefined,
  premiumFeatures: app.sponsored ? ['Sponsored placement', 'Priority visibility', 'Enhanced analytics'] : undefined
})

const getAppVariant = (app: Application): 'regular' | 'sponsored' | 'trending' => {
  if (app.sponsored) return 'sponsored'
  if (app.trending) return 'trending'
  return 'regular'
}

const handleToggleFavorite = (appId: string, isFavorited: boolean) => {
  if (isFavorited && !favorites.value.includes(appId)) {
    favorites.value.push(appId)
  }

  if (!isFavorited) {
    favorites.value = favorites.value.filter(id => id !== appId)
  }

  if (process.client) {
    localStorage.setItem('app-favorites', JSON.stringify(favorites.value))
  }
}

const resetFilters = () => {
  router.replace({ query: {} })
}

watch(() => route.query, loadApplications, { deep: true })

onMounted(async () => {
  loadFavorites()
  await loadApplications()
})
</script>

<style scoped>
/* Grid Layout */
.marketplace-grid {
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.app-card-link {
  text-decoration: none;
  color: inherit;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

/* Sponsored slot cell — fills exactly one grid cell, matches AppCard row height */
.ad-item {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ad-item :deep(.sponsored-slot),
.ad-item :deep(.ad-card) {
  height: 100%;
  width: 100%;
}

/* Collapse the cell when no ad inventory is available so we don't leave a gap */
.ad-item:not(:has(.sponsored-slot)) {
  display: none;
}

/* Status Badges */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.5rem 0.75rem;
  border-radius: 0;
  font-size: var(--fs-caption);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.featured {
  background-color: #4ECDC4;
  color: #0F172A;
}

.status-badge.trending {
  background-color: #FF6B6B;
  color: #111827;
}

.status-badge.recent {
  background-color: #FFE66D;
  color: #2C3E50;
}

/* App Header */
.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-logo {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
}

.app-logo img.placeholder-logo {
  object-fit: cover;
}

.app-name {
  font-size: var(--fs-title-sm);
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* App Categories */
.app-categories {
  margin-bottom: 1rem;
}

.app-provider {
  font-size: var(--fs-sm);
  color: #4b5563;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: var(--fs-caption);
  font-weight: 500;
  white-space: nowrap;
}

.app-tag-more {
  background: #e5e7eb;
  color: #374151;
}

/* App Description */
.app-description {
  color: #4b5563;
  font-size: var(--fs-sm);
  line-height: var(--lh-body);
  margin: 0 0 1rem 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* App Meta */
.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.app-pricing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-label {
  font-size: var(--fs-caption);
  color: #6b7280;
  font-weight: 500;
}

.free-tag {
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: var(--fs-caption);
  font-weight: 600;
}

.trial-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: var(--fs-caption);
  font-weight: 600;
}

.price-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: var(--fs-caption);
  font-weight: 600;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.stars svg {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.stars svg.filled {
  color: #fbbf24;
}

.rating-value {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: #374151;
}

.rating-count {
  font-size: var(--fs-caption);
  color: #6b7280;
}

/* App Footer */
.app-footer {
  margin-top: auto;
}

.app-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0;
  font-weight: 600;
  font-size: var(--fs-sm);
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #1D4ED8;
  color: #fff;
}

.btn-primary:hover {
  background: #1E40AF;
  transform: translateY(-1px);
}

.btn.full-width {
  width: 100%;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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

.loading-container p {
  color: #6b7280;
  font-weight: 500;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.no-results-icon svg {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: var(--fs-title);
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.no-results p {
  color: #6b7280;
  margin: 0 0 2rem 0;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 1280px) {
  .grid-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.5rem;
  }
  
  .app-card {
    padding: 1.25rem;
  }
  
  .app-header {
    gap: 0.75rem;
  }
  
  .app-logo {
    width: 56px;
    height: 56px;
  }
  
  .app-name {
    font-size: var(--fs-body-lg);
  }
  
  .app-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .app-rating {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .app-card {
    padding: 1rem;
  }
  
  .app-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .app-logo {
    width: 48px;
    height: 48px;
    align-self: center;
  }
  
  .status-badge {
    position: static;
    align-self: flex-start;
    margin-bottom: 0.75rem;
  }
}
</style>
