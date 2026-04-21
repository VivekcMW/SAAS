<!--
  ReviewSystem Component
  Displays reviews, ratings, and allows users to submit new reviews
  Preserves existing design while adding comprehensive review functionality
-->
<template>
  <div class="review-system">
    <!-- Review Summary Section -->
    <div class="review-summary mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          User Reviews
        </h3>
        <button 
          v-if="canReview"
          @click="showReviewForm = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Write a Review
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <!-- Overall Rating -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ overallRating.toFixed(1) }}
            </div>
            <div>
              <div class="flex items-center gap-1 mb-1">
                <StarRating :rating="overallRating" size="lg" />
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Based on {{ totalReviews }} reviews
              </div>
            </div>
          </div>
        </div>

        <!-- Rating Breakdown -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4">
            Rating Breakdown
          </h4>
          <div class="space-y-2">
            <div 
              v-for="star in [5, 4, 3, 2, 1]" 
              :key="star"
              class="flex items-center gap-3"
            >
              <span class="text-sm w-6">{{ star }}★</span>
              <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-yellow-400 h-2 rounded-full transition-all"
                  :style="{ width: `${getStarPercentage(star)}%` }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400 w-12">
                {{ ratingBreakdown[star as keyof typeof ratingBreakdown] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <select 
        v-model="selectedRating"
        class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>

      <select 
        v-model="sortOrder"
        class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="rating_high">Highest Rated</option>
        <option value="rating_low">Lowest Rated</option>
        <option value="helpful">Most Helpful</option>
      </select>
    </div>

    <!-- Reviews List -->
    <div class="space-y-6">
      <div 
        v-for="review in displayedReviews" 
        :key="review.id"
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {{ review.userName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ review.userName }}
                <span v-if="review.verified" class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Verified
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <StarRating :rating="review.rating" size="sm" />
                <span>{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
          {{ review.title }}
        </h4>
        
        <p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {{ review.content }}
        </p>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span v-if="review.metadata?.platform">
              Platform: {{ review.metadata.platform }}
            </span>
            <span v-if="review.metadata?.version">
              Version: {{ review.metadata.version }}
            </span>
          </div>
          
          <button 
            @click="toggleHelpful(review.id)"
            class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7H5m7 3v10M5 7l7 3" />
            </svg>
            Helpful ({{ review.helpfulVotes }})
          </button>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore" class="text-center mt-8">
      <button 
        @click="loadMoreReviews"
        :disabled="loading"
        class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Loading...' : 'Load More Reviews' }}
      </button>
    </div>

    <!-- Review Form Modal -->
    <ReviewFormModal 
      v-if="showReviewForm"
      :app-id="appId"
      @close="showReviewForm = false"
      @submitted="onReviewSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import type { Review, RatingBreakdown } from '~/types/enhanced-app'

interface Props {
  appId: string
  reviews: Review[]
  overallRating: number
  ratingBreakdown: RatingBreakdown
  canReview: boolean
}

const props = defineProps<Props>()

// Reactive state
const showReviewForm = ref(false)
const selectedRating = ref('')
const sortOrder = ref('newest')
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// Computed properties
const totalReviews = computed(() => props.ratingBreakdown.total)

const displayedReviews = computed(() => {
  let filtered = [...props.reviews]
  
  // Filter by rating
  if (selectedRating.value) {
    filtered = filtered.filter(review => review.rating === Number(selectedRating.value))
  }
  
  // Sort reviews
  filtered.sort((a, b) => {
    switch (sortOrder.value) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'rating_high':
        return b.rating - a.rating
      case 'rating_low':
        return a.rating - b.rating
      case 'helpful':
        return b.helpfulVotes - a.helpfulVotes
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  
  return filtered
})

// Methods
const getStarPercentage = (star: number): number => {
  if (totalReviews.value === 0) return 0
  return (props.ratingBreakdown[star as keyof typeof props.ratingBreakdown] / totalReviews.value) * 100
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const toggleHelpful = async (reviewId: string) => {
  // In real implementation, this would call API to toggle helpful vote
  console.log('Toggle helpful for review:', reviewId)
}

const loadMoreReviews = async () => {
  loading.value = true
  try {
    // In real implementation, fetch more reviews from API
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
    currentPage.value++
    // hasMore.value = false // Set based on API response
  } catch (error) {
    console.error('Failed to load more reviews:', error)
  } finally {
    loading.value = false
  }
}

const onReviewSubmitted = () => {
  showReviewForm.value = false
  // Refresh reviews or add new review to list
  // emit('review-submitted') or refresh data
}

// Watch for filter changes
watch([selectedRating, sortOrder], () => {
  currentPage.value = 1
})
</script>
