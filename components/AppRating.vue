<!-- 
  Unified AppRating Component
  Solves the critical inconsistency in star rating display between components
-->
<template>
  <div 
    class="app-rating"
    :class="{
      'app-rating--compact': variant === 'compact',
      'app-rating--large': variant === 'large'
    }"
    :aria-label="`Rating: ${rating.toFixed(1)} out of 5 stars with ${reviewCount} reviews`"
  >
    <div class="stars" role="img" :aria-label="`${rating.toFixed(1)} stars`">
      <UIcon 
        v-for="star in 5" 
        :key="`star-${star}`"
        :name="getStarIcon(star)"
        :class="getStarClass(star)"
        :aria-hidden="true"
        dynamic
      />
    </div>
    
    <span 
      class="rating-value" 
      :class="{ 'sr-only': hideValue }"
    >
      {{ rating.toFixed(1) }}
    </span>
    
    <span 
      v-if="showCount && reviewCount > 0" 
      class="rating-count"
      :class="{ 'sr-only': hideCount }"
    >
      ({{ formatReviewCount(reviewCount) }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rating: number
  reviewCount?: number
  showCount?: boolean
  hideValue?: boolean
  hideCount?: boolean
  variant?: 'default' | 'compact' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  reviewCount: 0,
  showCount: true,
  hideValue: false,
  hideCount: false,
  variant: 'default'
})

/**
 * Get the appropriate star icon based on position and rating
 */
const getStarIcon = (starPosition: number): string => {
  const fullStars = Math.floor(props.rating)
  const hasHalfStar = (props.rating % 1) >= 0.5
  
  if (starPosition <= fullStars) {
    return 'i-heroicons-star-solid'
  } else if (starPosition === fullStars + 1 && hasHalfStar) {
    return 'i-heroicons-star-solid'
  } else {
    return 'i-heroicons-star'
  }
}

/**
 * Get the appropriate CSS class for star styling
 */
const getStarClass = (starPosition: number): string => {
  const fullStars = Math.floor(props.rating)
  const hasHalfStar = (props.rating % 1) >= 0.5
  
  if (starPosition <= fullStars) {
    return 'star star--filled'
  } else if (starPosition === fullStars + 1 && hasHalfStar) {
    return 'star star--half'
  } else {
    return 'star star--empty'
  }
}

/**
 * Format review count for display (e.g., 1234 -> 1.2k)
 */
const formatReviewCount = (count: number): string => {
  if (count < 1000) {
    return count.toString()
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}k`
  } else {
    return `${(count / 1000000).toFixed(1)}m`
  }
}

/**
 * Computed rating quality indicator
 */
const ratingQuality = computed(() => {
  if (props.rating >= 4.5) return 'excellent'
  if (props.rating >= 4.0) return 'very-good'
  if (props.rating >= 3.5) return 'good'
  if (props.rating >= 3.0) return 'fair'
  return 'poor'
})
</script>

<style scoped>
.app-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.app-rating--compact {
  gap: 0.25rem;
}

.app-rating--large {
  gap: 0.75rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
  align-items: center;
}

.app-rating--compact .stars {
  gap: 0.0625rem;
}

.app-rating--large .stars {
  gap: 0.25rem;
}

.star {
  width: 16px;
  height: 16px;
  color: #d1d5db; /* Default empty star color */
  transition: color 0.2s ease;
}

.app-rating--compact .star {
  width: 14px;
  height: 14px;
}

.app-rating--large .star {
  width: 20px;
  height: 20px;
}

.star--filled {
  color: #fbbf24; /* Filled star color */
}

.star--half {
  color: #fbbf24; /* Half star color - could be implemented with gradient */
}

.star--empty {
  color: #d1d5db; /* Empty star color */
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.app-rating--compact .rating-value {
  font-size: 0.75rem;
}

.app-rating--large .rating-value {
  font-size: 1rem;
}

.rating-count {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

.app-rating--compact .rating-count {
  font-size: 0.6875rem;
}

.app-rating--large .rating-count {
  font-size: 0.875rem;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .star--filled {
    color: #000;
  }
  
  .star--empty {
    color: #666;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .star {
    transition: none;
  }
}

/* Dark mode support (if using in the future) */
@media (prefers-color-scheme: dark) {
  .rating-value {
    color: #f9fafb;
  }
  
  .rating-count {
    color: #9ca3af;
  }
  
  .star--empty {
    color: #4b5563;
  }
}
</style>
