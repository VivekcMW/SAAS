<!--
  Global App Card Component
  Simple, crisp design for all application cards across the platform
  Features: Logo, Name, Rating, Active Users, Pricing, Action Buttons
-->
<template>
  <div 
    class="app-card"
    :class="cardClasses"
    :role="clickable ? 'button' : undefined"
    :aria-label="clickable ? `View ${app.name} application details` : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
    @keydown.space.prevent="handleCardClick"
  >
    <!-- Variant Badge -->
    <div v-if="badgeText" class="variant-badge" :class="`variant-badge--${variant}`">
      <UIcon v-if="badgeIcon" :name="badgeIcon" class="badge-icon" dynamic />
      <span class="badge-text">{{ badgeText }}</span>
      <div v-if="variant === 'trending' && app.growthStats" class="growth-indicator">
        <UIcon name="i-heroicons-arrow-trending-up" class="growth-icon" dynamic />
        <span>+{{ app.growthStats.percentage }}%</span>
      </div>
    </div>
    <!-- Header: Logo + Name + Rating -->
    <div class="app-header">
      <div class="app-logo">
        <img 
          :src="app.logo" 
          :alt="`${app.name} logo`"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
      
      <div class="app-info">
        <h3 class="app-name" :title="app.name">{{ app.name }}</h3>
        <div class="app-rating">
          <div class="stars">
            <UIcon 
              v-for="star in 5" 
              :key="`star-${star}`"
              :name="getStarIcon(star)"
              :class="getStarClass(star)"
              dynamic
            />
          </div>
          <span class="rating-value">{{ app.rating.toFixed(1) }}</span>
          <span class="rating-count" v-if="app.reviewCount">({{ formatCount(app.reviewCount) }})</span>
        </div>
      </div>
    </div>

    <!-- Metrics: Active Users + Pricing -->
    <div class="app-metrics">
      <div class="metric-item">
        <UIcon name="i-heroicons-users" class="metric-icon" dynamic />
        <span class="metric-value">
          {{ formatCount(app.activeUsers) }} active users
          <span v-if="variant === 'trending' && app.growthStats" class="growth-badge">
            <UIcon name="i-heroicons-arrow-trending-up" dynamic />
            +{{ app.growthStats.percentage }}%
          </span>
        </span>
      </div>
      
      <div class="metric-item">
        <UIcon name="i-heroicons-currency-dollar" class="metric-icon" dynamic />
        <span class="metric-value pricing">{{ formattedPrice }}</span>
      </div>

      <!-- Special Label for Sponsored/Trending -->
      <div v-if="specialLabel" class="metric-item special-label">
        <UIcon 
          :name="variant === 'sponsored' ? 'i-heroicons-trophy' : 'i-heroicons-chart-bar-solid'" 
          class="metric-icon special-icon" 
          dynamic 
        />
        <span class="metric-value special">{{ specialLabel }}</span>
      </div>

      <!-- Premium Features for Sponsored -->
      <div v-if="variant === 'sponsored' && app.premiumFeatures?.length" class="premium-features">
        <div class="feature-item">
          <UIcon name="i-heroicons-check-circle" class="feature-icon" dynamic />
          <span>{{ app.premiumFeatures[0] }}</span>
        </div>
      </div>
    </div>

    <!-- Actions: View Details + Favorites -->
    <div class="app-actions">
      <button 
        class="btn btn-primary"
        :class="{
          'btn-primary--sponsored': variant === 'sponsored',
          'btn-primary--trending': variant === 'trending'
        }"
        @click.stop="handleViewDetails"
        :aria-label="`${primaryButtonText} for ${app.name}`"
      >
        {{ primaryButtonText }}
      </button>
      
      <button 
        class="btn btn-favorite"
        :class="{ 
          'btn-favorite--active': isFavorited,
          'btn-favorite--sponsored': variant === 'sponsored',
          'btn-favorite--trending': variant === 'trending'
        }"
        @click.stop="handleToggleFavorite"
        :aria-label="isFavorited ? `Remove ${app.name} from favorites` : `Add ${app.name} to favorites`"
      >
        <UIcon 
          :name="isFavorited ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" 
          class="heart-icon"
          dynamic 
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { standardFormatPrice } from '~/utils/pricing'

// Types
interface AppData {
  id: string
  name: string
  logo: string
  rating: number
  reviewCount?: number
  activeUsers: number
  pricing: {
    type: 'free' | 'paid' | 'trial'
    value?: number
    period?: string
  }
  isFavorited?: boolean
  growthStats?: {
    percentage: number
    period: string
    trend: 'up' | 'down' | 'stable'
  }
  premiumFeatures?: string[]
}

// Props
interface Props {
  app: AppData
  variant?: 'regular' | 'sponsored' | 'trending'
  clickable?: boolean
  showFavorites?: boolean
  showGrowthStats?: boolean
  showPremiumFeatures?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'regular',
  clickable: true,
  showFavorites: true,
  showGrowthStats: false,
  showPremiumFeatures: false
})

// Emits
const emit = defineEmits<{
  'view-details': [appId: string]
  'toggle-favorite': [appId: string, isFavorited: boolean]
  'card-click': [appId: string]
}>()

// State
const isFavorited = ref(props.app.isFavorited || false)

// Computed
const formattedPrice = computed(() => {
  return standardFormatPrice(props.app.pricing)
})

const cardClasses = computed(() => {
  return {
    'app-card--favorited': isFavorited.value,
    'app-card--clickable': props.clickable,
    'app-card--sponsored': props.variant === 'sponsored',
    'app-card--trending': props.variant === 'trending',
    'app-card--regular': props.variant === 'regular'
  }
})

const badgeText = computed(() => {
  switch (props.variant) {
    case 'sponsored':
      return 'SPONSORED'
    case 'trending':
      return null // Removed trending badge
    default:
      return null
  }
})

const badgeIcon = computed(() => {
  switch (props.variant) {
    case 'sponsored':
      return 'i-heroicons-sparkles'
    case 'trending':
      return null // Removed trending badge icon
    default:
      return null
  }
})

const specialLabel = computed(() => {
  if (props.variant === 'sponsored') {
    const labels = ['Editor\'s Choice', 'Most Popular', 'Premium Quality', 'Best in Category']
    return labels[Math.floor(Math.random() * labels.length)]
  } else if (props.variant === 'trending') {
    const labels = ['Rising Fast', 'Hot Right Now', 'Most Searched', 'Viral This Month']
    return labels[Math.floor(Math.random() * labels.length)]
  }
  return null
})

const primaryButtonText = computed(() => {
  switch (props.variant) {
    case 'sponsored':
      return 'Try Premium'
    case 'trending':
      return 'Join the Trend'
    default:
      return 'View Details'
  }
})

// Methods
const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString()
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}k`
  } else {
    return `${(count / 1000000).toFixed(1)}M`
  }
}

const getStarIcon = (starPosition: number): string => {
  const fullStars = Math.floor(props.app.rating)
  const hasHalfStar = (props.app.rating % 1) >= 0.5
  
  if (starPosition <= fullStars) {
    return 'i-heroicons-star-solid'
  } else if (starPosition === fullStars + 1 && hasHalfStar) {
    return 'i-heroicons-star-solid'
  } else {
    return 'i-heroicons-star'
  }
}

const getStarClass = (starPosition: number): string => {
  const fullStars = Math.floor(props.app.rating)
  const hasHalfStar = (props.app.rating % 1) >= 0.5
  
  if (starPosition <= fullStars) {
    return 'star star--filled'
  } else if (starPosition === fullStars + 1 && hasHalfStar) {
    return 'star star--half'
  } else {
    return 'star star--empty'
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const initials = props.app.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
  
  // Create simple colored placeholder
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Generate color based on app name
    const colorHash = props.app.name.split('').reduce((acc, char) => acc + (char.codePointAt(0) || 0), 0)
    const hue = colorHash % 360
    
    ctx.fillStyle = `hsl(${hue}, 70%, 85%)`
    ctx.fillRect(0, 0, 64, 64)
    
    ctx.fillStyle = `hsl(${hue}, 80%, 30%)`
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, 32, 32)
  }
  
  img.src = canvas.toDataURL()
}

const handleCardClick = () => {
  if (props.clickable) {
    emit('card-click', props.app.id)
  }
}

const handleViewDetails = () => {
  emit('view-details', props.app.id)
}

const handleToggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('toggle-favorite', props.app.id, isFavorited.value)
}
</script>

<style scoped>
.app-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 20px;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.app-card--clickable {
  cursor: pointer;
}

.app-card--clickable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Sponsored Card Variant */
.app-card--sponsored {
  border: 2px solid #FF8838;
  background: #ffffff;
  position: relative;
}

.app-card--sponsored:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(255, 136, 56, 0.2);
  border-color: #E87C2A;
}

/* Trending Card Variant */
.app-card--trending {
  border: 2px solid #3B82F6;
  background: #ffffff;
  position: relative;
}

.app-card--trending:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
  border-color: #2563EB;
}

/* Variant Badge */
.variant-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.3;
  z-index: 10;
}

.variant-badge--sponsored {
  background: #FEF3E2;
  color: #92400E;
  border: none;
}

.variant-badge--trending {
  background: #E0E7FF;
  color: #1D4ED8;
  border: none;
}

.badge-icon {
  width: 10px;
  height: 10px;
}

.badge-text {
  font-size: 9px;
}

.growth-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: 4px;
}

.growth-icon {
  width: 10px;
  height: 10px;
}

/* Header */
.app-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.app-logo {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.25;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.star--filled {
  color: #fbbf24;
}

.star--half {
  color: #fbbf24;
}

.rating-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.rating-count {
  font-size: 14px;
  color: #6b7280;
}

/* Metrics */
.app-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
  flex-shrink: 0;
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-value.pricing {
  color: #374151;
  font-weight: 600;
}

.metric-value.special {
  color: #7c3aed;
  font-weight: 600;
}

.special-icon {
  color: #7c3aed;
}

.growth-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #B91C1C;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
}

.premium-features {
  margin-top: 4px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}

.feature-icon {
  width: 14px;
  height: 14px;
  color: #059669;
}

/* Actions */
.app-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  letter-spacing: -0.01em;
}

.btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.btn-primary {
  background: #1e40af;
  color: #ffffff;
}

.btn-primary:hover {
  background: #1e3a8a;
  transform: translateY(-1px);
}

.btn-primary--sponsored {
  background: #FF8838;
  color: #1f2937;
  border: 1px solid #E87C2A;
  font-weight: 700;
}

.btn-primary--sponsored:hover {
  background: #E87C2A;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 136, 56, 0.3);
}

.btn-primary--trending {
  background: #1D4ED8;
  color: #ffffff;
  border: 1px solid #1E40AF;
  font-weight: 700;
}

.btn-primary--trending:hover {
  background: #1E40AF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

.btn-favorite {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 10px;
  min-width: 44px;
  flex: 0 0 auto;
}

.btn-favorite:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.btn-favorite--sponsored {
  background: #FFF3E0;
  border-color: #FF8838;
}

.btn-favorite--sponsored:hover {
  background: #FFE8D0;
  box-shadow: 0 2px 8px rgba(255, 136, 56, 0.2);
}

.btn-favorite--trending {
  background: #EFF6FF;
  border-color: #3B82F6;
}

.btn-favorite--trending:hover {
  background: #DBEAFE;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.btn-favorite--active {
  color: #991b1b;
  border-color: #fecaca;
  background: #fef2f2;
}

.btn-favorite--active:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}

.heart-icon {
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;
}

.btn-favorite--active .heart-icon {
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .app-card {
    padding: 16px;
  }
  
  .app-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .app-header {
    gap: 10px;
  }
  
  .app-logo {
    width: 56px;
    height: 56px;
  }
  
  .app-name {
    font-size: 16px;
  }
  
  .app-metrics {
    margin-bottom: 16px;
  }
}

/* Animations */
/* Animations removed - using solid colors for cleaner, more minimal design */

/* Responsive */
@media (max-width: 768px) {
  .app-card {
    padding: 16px;
  }
  
  .app-card--sponsored,
  .app-card--trending {
    border-width: 1px;
  }
  
  .app-card--sponsored::before,
  .app-card--trending::after {
    display: none;
  }
  
  .variant-badge {
    position: static;
    margin-bottom: 12px;
    align-self: flex-start;
  }
  
  .app-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .app-header {
    gap: 10px;
  }
  
  .app-logo {
    width: 56px;
    height: 56px;
  }
  
  .app-name {
    font-size: 16px;
  }
  
  .app-metrics {
    margin-bottom: 16px;
  }
  
  .variant-badge {
    font-size: 10px;
    padding: 4px 8px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .app-card--sponsored {
    border-color: #000000;
  }
  
  .app-card--trending {
    border-color: #000000;
  }
  
  .star--filled {
    color: #000000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .app-card,
  .btn,
  .heart-icon,
  .variant-badge {
    transition: none;
    animation: none;
  }
  
  .app-card:hover,
  .app-card--sponsored:hover,
  .app-card--trending:hover {
    transform: none;
  }
  
  .app-card--sponsored::before {
    display: none;
  }
  
  .growth-badge {
    animation: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .app-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .app-card--sponsored {
    background: linear-gradient(#1f2937, #1f2937) padding-box,
                linear-gradient(45deg, #ffd700, #4f46e5, #ffd700) border-box;
  }
  
  .app-card--trending {
    background: linear-gradient(#1f2937, #1f2937) padding-box,
                linear-gradient(45deg, #ff6b6b, #ff8e8e, #ff6b6b) border-box;
  }
  
  .app-name {
    color: #f9fafb;
  }
  
  .rating-value {
    color: #e5e7eb;
  }
  
  .rating-count,
  .metric-value {
    color: #9ca3af;
  }
  
  .metric-value.pricing {
    color: #e5e7eb;
  }
  
  .btn-favorite {
    background: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }
  
  .btn-favorite:hover {
    background: #4b5563;
  }
}
</style>
