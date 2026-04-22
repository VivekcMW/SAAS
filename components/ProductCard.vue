<template>
  <component
    :is="clickable ? 'NuxtLink' : 'div'"
    :to="clickable ? `/marketplace/app/${product.id}` : undefined"
    class="product-card"
    :class="[
      `layout-${layout}`,
      `variant-${variant}`,
      {
        'product-card--clickable': clickable,
        'product-card--sponsored': variant === 'sponsored',
        'product-card--trending': variant === 'trending'
      }
    ]"
    :role="clickable ? undefined : 'article'"
    @click.stop="handleCardClick"
  >
    <!-- Badge Section -->
    <div 
      v-if="showBadge && badgeContent"
      class="card-badge"
      :class="badgePosition"
    >
      <UIcon v-if="badgeContent.icon" :name="badgeContent.icon" dynamic />
      <span>{{ badgeContent.text }}</span>
    </div>

    <!-- Logo Section -->
    <div 
      v-if="showLogo"
      class="card-logo-section"
      :class="{ 'logo-horizontal': layout === 'horizontal' }"
    >
      <div class="product-logo" :class="{ 'product-logo--fallback': usePlaceholder }">
        <img
          v-if="!usePlaceholder"
          :src="product.logo"
          :alt="`${product.name} logo`"
          loading="lazy"
          @error="handleImageError"
        />
        <span v-else class="product-logo-initial" aria-hidden="true">
          {{ (product.name || '?').charAt(0).toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="card-content-section">
      <!-- Header: Name + Category (or Inline Badge) -->
      <div v-if="layout === 'vertical'" class="content-header-vertical">
        <h3 class="product-name">{{ product.name }}</h3>
        <p v-if="product.category" class="product-category">{{ product.category }}</p>
      </div>

      <div v-else class="content-header-horizontal">
        <h3 class="product-name">{{ product.name }}</h3>
        <div v-if="showBadge && badgeContent && badgePosition === 'inline'" class="badge-inline">
          <UIcon v-if="badgeContent.icon" :name="badgeContent.icon" dynamic />
          <span>{{ badgeContent.text }}</span>
        </div>
      </div>

      <!-- Category for Horizontal -->
      <p v-if="product.category && layout === 'horizontal'" class="product-category-secondary">
        {{ product.category }}
      </p>

      <!-- Rating and Metrics -->
      <div v-if="showMetrics" class="card-metrics">
        <!-- Rating Row -->
        <div v-if="product.rating > 0" class="metric-row metric-rating">
          <div class="stars">
            <UIcon 
              v-for="star in 5"
              :key="`star-${star}`"
              :name="star <= Math.round(product.rating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
              dynamic
              :class="{ 'star-filled': star <= Math.round(product.rating) }"
            />
          </div>
          <span class="rating-value">{{ product.rating.toFixed(1) }}</span>
          <span v-if="product.reviewCount" class="review-count">({{ formatCount(product.reviewCount) }})</span>
        </div>
        <div v-else class="metric-row metric-rating metric-rating-empty">
          <span class="rating-empty-label">New listing</span>
        </div>

        <!-- Meta: Users + Price -->
        <div v-if="layout === 'horizontal'" class="metric-row metric-inline">
          <span class="metric-item">
            <UIcon name="i-heroicons-users" dynamic class="metric-icon" />
            {{ formatCount(product.activeUsers) }}
          </span>
          <span class="metric-separator">·</span>
          <span class="metric-item">
            <UIcon name="i-heroicons-currency-dollar" dynamic class="metric-icon" />
            {{ formattedPrice }}
          </span>
        </div>

        <!-- Price Row (Vertical Layout) -->
        <div v-else class="metric-row metric-price">
          <span v-if="product.pricing.type === 'free'">Free</span>
          <span v-else>{{ formattedPrice }}</span>
          <span v-if="product.pricing.period" class="price-period">{{ product.pricing.period }}</span>
        </div>
      </div>

      <!-- Special Labels (Growth Badge + Labels) -->
      <div v-if="showLabels && (hasGrowthStats || specialLabel)" class="card-labels">
        <div v-if="variant === 'trending' && product.growthStats" class="growth-badge">
          <UIcon name="i-heroicons-arrow-trending-up" dynamic />
          +{{ product.growthStats.percentage }}%
        </div>
        <div v-if="specialLabel" class="special-label">
          <UIcon 
            :name="variant === 'sponsored' ? 'i-heroicons-sparkles' : 'i-heroicons-chart-bar-solid'" 
            dynamic 
          />
          {{ specialLabel }}
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div v-if="showActions" class="card-actions-section">
      <button 
        v-if="layout === 'horizontal'"
        class="btn-action btn-primary"
        :class="{
          'btn-primary--sponsored': variant === 'sponsored',
          'btn-primary--trending': variant === 'trending'
        }"
        @click.stop="handleViewDetails"
      >
        View Details
      </button>

      <button 
        v-if="layout === 'horizontal'"
        class="btn-action btn-favorite"
        :class="{ 'btn-favorite--active': isFavorited }"
        @click.stop="handleToggleFavorite"
        :aria-label="isFavorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`"
      >
        <UIcon 
          :name="isFavorited ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" 
          dynamic
        />
      </button>

      <div v-else class="card-cta">
        View details
        <UIcon name="i-heroicons-arrow-right" dynamic />
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface ProductData {
  id: string
  name: string
  logo: string
  category?: string
  rating: number
  reviewCount?: number
  activeUsers: number
  pricing: {
    type: 'free' | 'paid' | 'trial'
    value?: number
    period?: string
  }
  growthStats?: {
    percentage: number
    period: string
    trend: 'up' | 'down' | 'stable'
  }
  isFavorited?: boolean
}

interface Props {
  product: ProductData
  layout?: 'vertical' | 'horizontal'
  variant?: 'regular' | 'sponsored' | 'trending'
  badgePosition?: 'top-right' | 'inline' | 'header'
  showBadge?: boolean
  showLogo?: boolean
  showMetrics?: boolean
  showLabels?: boolean
  showActions?: boolean
  clickable?: boolean
  specialLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  variant: 'regular',
  badgePosition: 'top-right',
  showBadge: true,
  showLogo: true,
  showMetrics: true,
  showLabels: true,
  showActions: true,
  clickable: true
})

const emit = defineEmits<{
  'view-details': [id: string]
  'toggle-favorite': [id: string, isFavorited: boolean]
  'card-click': [product: ProductData]
}>()

const router = useRouter()
const isFavorited = ref(props.product.isFavorited ?? false)
const logoFailed = ref(false)

// Treat the generic placeholder SVG the same as a failed load so we render a nice initial-letter avatar.
const usePlaceholder = computed(() => {
  const logo = props.product.logo || ''
  return logoFailed.value || logo.includes('placeholder-app-logo') || !logo
})

// Badge content
const badgeContent = computed(() => {
  if (props.variant === 'sponsored') {
    return { icon: 'i-heroicons-sparkles', text: 'SPONSORED' }
  }
  if (props.variant === 'trending') {
    return { icon: 'i-heroicons-arrow-trending-up', text: 'TRENDING' }
  }
  return null
})

// Special label based on variant
const specialLabel = computed(() => {
  if (props.variant === 'sponsored') return 'Premium Quality'
  if (props.variant === 'trending' && props.product.growthStats) return 'Rising Fast'
  return props.specialLabel
})

// Formatted price
const formattedPrice = computed(() => {
  const pricing = props.product.pricing
  if (pricing.type === 'free') return 'Free'
  if (pricing.value !== undefined) {
    const period = pricing.period ? `/${pricing.period}` : ''
    return `From $${pricing.value}${period}`
  }
  return pricing.type === 'paid' ? 'Paid' : 'Contact us'
})

// Check if has growth stats
const hasGrowthStats = computed(() => {
  return props.variant === 'trending' && props.product.growthStats
})

// Format count (1000 -> 1K)
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return count.toString()
}

// Event handlers
const handleViewDetails = () => {
  emit('view-details', props.product.id)
  if (props.clickable) {
    router.push(`/marketplace/app/${props.product.id}`)
  }
}

const handleToggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('toggle-favorite', props.product.id, isFavorited.value)
}

const handleCardClick = () => {
  emit('card-click', props.product)
  if (props.clickable && props.layout === 'vertical') {
    router.push(`/marketplace/app/${props.product.id}`)
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img) {
    img.style.opacity = '0.5'
  }
  logoFailed.value = true
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════ */
/* SHARED BASE STYLES */
/* ═══════════════════════════════════════════════════════════ */

.product-card {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  text-decoration: none;
  color: inherit;
  display: flex;
  gap: 16px;
}

.product-card:hover {
  background: #f9fafb;
}

.product-card--clickable {
  cursor: pointer;
}

/* ═══════════════════════════════════════════════════════════ */
/* VERTICAL LAYOUT (Landing Page) */
/* ═══════════════════════════════════════════════════════════ */

.product-card.layout-vertical {
  flex-direction: column;
  height: 100%;
}

.product-card.layout-vertical .card-badge.top-right {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.product-card.layout-vertical .card-logo-section {
  width: 100%;
}

.product-card.layout-vertical .card-content-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-card.layout-vertical .content-header-vertical {
  padding-right: 50px;
}

.product-card.layout-vertical .card-metrics {
  margin-top: auto;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-card.layout-vertical .card-actions-section {
  margin-top: 8px;
}

/* ═══════════════════════════════════════════════════════════ */
/* HORIZONTAL LAYOUT (Marketplace) */
/* ═══════════════════════════════════════════════════════════ */

.product-card.layout-horizontal {
  flex-direction: row;
  align-items: center;
  height: auto;
}

.product-card.layout-horizontal .card-logo-section {
  flex-shrink: 0;
}

.product-card.layout-horizontal .card-content-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-card.layout-horizontal .content-header-horizontal {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.product-card.layout-horizontal .card-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.product-card.layout-horizontal .card-actions-section {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ═══════════════════════════════════════════════════════════ */
/* LOGO SECTION */
/* ═══════════════════════════════════════════════════════════ */

.product-logo {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 6px;
  overflow: hidden;
}

.product-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-logo--fallback {
  background: #fff3e6;
  padding: 0;
}
.product-logo-initial {
  font-size: 18px;
  font-weight: 700;
  color: #b45309;
  line-height: 1;
}

/* ═══════════════════════════════════════════════════════════ */
/* BADGE */
/* ═══════════════════════════════════════════════════════════ */

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: #fff7ed;
  color: #b45309;
}

.card-badge.top-right {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.card-badge.inline {
  position: static;
  margin: 0;
}

.card-badge :deep(.nuxt-icon),
.card-badge svg {
  width: 12px;
  height: 12px;
}

.badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  background: #fff7ed;
  color: #b45309;
}

.badge-inline :deep(.nuxt-icon),
.badge-inline svg {
  width: 11px;
  height: 11px;
}

/* Sponsored variant badge */
.variant-sponsored .card-badge {
  background: #fff7ed;
  color: #b45309;
}

/* Trending variant badge */
.variant-trending .card-badge {
  background: #fee2e2;
  color: #b91c1c;
}

/* ═══════════════════════════════════════════════════════════ */
/* TEXT CONTENT */
/* ═══════════════════════════════════════════════════════════ */

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-category {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-category-secondary {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════ */
/* METRICS & RATINGS */
/* ═══════════════════════════════════════════════════════════ */

.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
}

.metric-rating {
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars :deep(.nuxt-icon),
.stars svg {
  width: 14px;
  height: 14px;
  color: #d1d5db;
}

.stars :deep(svg.star-filled),
.stars svg.star-filled,
.stars .star-filled :deep(.nuxt-icon),
.stars .star-filled :deep(svg),
.stars .star-filled svg {
  color: #f59e0b;
}

.rating-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.85rem;
}

.review-count {
  color: #9ca3af;
  font-size: 0.75rem;
}

.metric-rating-empty {
  min-height: 20px;
}
.rating-empty-label {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.metric-inline {
  gap: 6px;
  font-size: 0.8rem;
  color: #6b7280;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-icon {
  width: 14px;
  height: 14px;
  color: #9ca3af;
}

.metric-separator {
  color: #d1d5db;
}

.metric-price {
  color: #1f2937;
  font-weight: 600;
}

.price-period {
  color: #9ca3af;
  font-size: 0.75rem;
  margin-left: 2px;
}

/* ═══════════════════════════════════════════════════════════ */
/* LABELS & BADGES */
/* ═══════════════════════════════════════════════════════════ */

.card-labels {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.growth-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #b91c1c;
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.growth-badge :deep(.nuxt-icon),
.growth-badge svg {
  width: 12px;
  height: 12px;
}

.special-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7c3aed;
  font-size: 0.8rem;
  font-weight: 500;
}

.special-label :deep(.nuxt-icon),
.special-label svg {
  width: 13px;
  height: 13px;
}

/* ═══════════════════════════════════════════════════════════ */
/* ACTIONS & BUTTONS */
/* ═══════════════════════════════════════════════════════════ */

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ff8838;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 4px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.product-card.layout-vertical:hover .card-cta {
  color: #e87c2a;
}

.product-card.layout-vertical:hover .card-cta :deep(.nuxt-icon),
.product-card.layout-vertical:hover .card-cta svg {
  transform: translateX(2px);
}

.card-cta :deep(.nuxt-icon),
.card-cta svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

/* Buttons (Horizontal Layout) */
.btn-action {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary {
  background: #ff8838;
  color: #1f2937;
  min-width: 120px;
  text-align: center;
}

.btn-primary:hover {
  background: #e87c2a;
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary--sponsored:hover {
  background: #ff6b1f;
}

.btn-primary--trending:hover {
  background: #3b82f6;
}

.btn-favorite {
  width: 40px;
  height: 40px;
  background: #374151;
  color: #f3f4f6;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-favorite:hover {
  background: #4b5563;
}

.btn-favorite--active {
  background: #dc2626;
  color: #ffffff;
}

.btn-favorite--active:hover {
  background: #b91c1c;
}

.btn-favorite :deep(.nuxt-icon),
.btn-favorite svg {
  width: 18px;
  height: 18px;
}

/* ═══════════════════════════════════════════════════════════ */
/* VARIANT STYLES */
/* ═══════════════════════════════════════════════════════════ */

.product-card.variant-sponsored {
  /* Same base border - type indicated by badge */
}

.product-card.variant-sponsored .badge-inline {
  background: #fff7ed;
  color: #b45309;
}

.product-card.variant-trending {
  /* Same base border - type indicated by badge */
}

.product-card.variant-trending .badge-inline {
  background: #fee2e2;
  color: #b91c1c;
}

/* ═══════════════════════════════════════════════════════════ */
/* RESPONSIVE */
/* ═══════════════════════════════════════════════════════════ */

@media (max-width: 1024px) {
  .product-card.layout-vertical {
    gap: 12px;
    padding: 14px;
  }

  .product-card.layout-horizontal {
    gap: 12px;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .product-card {
    gap: 10px;
    padding: 12px;
  }

  .product-card.layout-horizontal {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-card.layout-horizontal .card-logo-section {
    width: 100%;
  }

  .product-card.layout-horizontal .card-content-section {
    width: 100%;
  }

  .product-card.layout-horizontal .card-actions-section {
    width: 100%;
    flex-direction: row;
    gap: 8px;
  }

  .btn-action {
    flex: 1;
  }

  .product-name {
    font-size: 0.95rem;
  }

  .product-category {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .product-card {
    gap: 8px;
    padding: 10px;
  }

  .product-logo {
    width: 40px;
    height: 40px;
  }

  .product-name {
    font-size: 0.9rem;
  }

  .metric-row {
    font-size: 0.75rem;
  }
}
</style>
