<!--
  StarRating Component
  Displays star ratings with customizable size and interactive capabilities
-->
<template>
  <div class="star-rating flex items-center">
    <div 
      v-for="star in 5"
      :key="star"
      class="star cursor-pointer transition-colors"
      :class="[
        sizeClasses,
        star <= displayRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
      ]"
      @click="handleStarClick(star)"
      @mouseenter="handleStarHover(star)"
      @mouseleave="handleStarLeave"
    >
      <svg 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        class="w-full h-full"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
    
    <!-- Rating text for screen readers -->
    <span class="sr-only">
      {{ rating }} out of 5 stars
    </span>
    
    <!-- Optional rating display -->
    <span 
      v-if="showText"
      class="ml-2 text-sm text-gray-600 dark:text-gray-400"
    >
      {{ rating.toFixed(1) }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  showText?: boolean
}

interface Emits {
  (e: 'rate', rating: number): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  interactive: false,
  showText: false
})

const emit = defineEmits<Emits>()

// Reactive state
const hoveredRating = ref(0)
const isHovering = ref(false)

// Computed properties
const displayRating = computed(() => {
  if (props.interactive && isHovering.value) {
    return hoveredRating.value
  }
  return Math.round(props.rating)
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  return sizes[props.size]
})

// Methods
const handleStarClick = (star: number) => {
  if (props.interactive) {
    emit('rate', star)
  }
}

const handleStarHover = (star: number) => {
  if (props.interactive) {
    hoveredRating.value = star
    isHovering.value = true
  }
}

const handleStarLeave = () => {
  if (props.interactive) {
    isHovering.value = false
    hoveredRating.value = 0
  }
}
</script>

<style scoped>
.star {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.star:hover {
  transform: scale(1.1);
}

.star-rating:not(.interactive) .star {
  cursor: default;
}

.star-rating:not(.interactive) .star:hover {
  transform: none;
}
</style>
