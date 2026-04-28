<!--
  ReviewSystem Component
  Displays reviews, ratings, and allows users to submit new reviews
-->
<template>
  <div class="rs">
    <!-- Summary -->
    <div class="rs__summary">
      <div class="rs__summary-header">
        <h3 class="rs__heading">User Reviews</h3>
        <BaseButton v-if="canReview" variant="primary" size="sm" @click="showReviewForm = true">
          Write a Review
        </BaseButton>
      </div>

      <div class="rs__cards">
        <!-- Overall rating -->
        <div class="rs__card">
          <div class="rs__overall">
            <span class="rs__score">{{ overallRating.toFixed(1) }}</span>
            <div>
              <BaseRating :model-value="overallRating" readonly size="lg" />
              <p class="rs__count">Based on {{ totalReviews }} reviews</p>
            </div>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="rs__card">
          <h4 class="rs__card-title">Rating Breakdown</h4>
          <div class="rs__bars">
            <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rs__bar-row">
              <span class="rs__bar-label">{{ star }}★</span>
              <div class="rs__bar-track">
                <div class="rs__bar-fill" :style="{ width: `${getStarPercentage(star)}%` }" />
              </div>
              <span class="rs__bar-count">{{ ratingBreakdown[star as keyof typeof ratingBreakdown] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="rs__filters">
      <BaseSelect
        v-model="selectedRating"
        :options="ratingOptions"
        placeholder="All Ratings"
      />
      <BaseSelect
        v-model="sortOrder"
        :options="sortOptions"
        placeholder="Newest First"
      />
    </div>

    <!-- Reviews list -->
    <div class="rs__list">
      <div v-for="review in displayedReviews" :key="review.id" class="rs__review">
        <div class="rs__review-header">
          <div class="rs__reviewer">
            <div class="rs__avatar">{{ review.userName.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="rs__reviewer-name">
                {{ review.userName }}
                <span v-if="review.verified" class="rs__verified">Verified</span>
              </div>
              <div class="rs__reviewer-meta">
                <BaseRating :model-value="review.rating" readonly size="sm" />
                <span>{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <h4 class="rs__review-title">{{ review.title }}</h4>
        <p class="rs__review-body">{{ review.content }}</p>

        <div class="rs__review-footer">
          <div class="rs__meta-tags">
            <span v-if="review.metadata?.platform">Platform: {{ review.metadata.platform }}</span>
            <span v-if="review.metadata?.version">Version: {{ review.metadata.version }}</span>
          </div>
          <button
            class="rs__helpful"
            :disabled="votedReviews.has(review.id)"
            @click="toggleHelpful(review.id)"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7H5m7 3v10M5 7l7 3" />
            </svg>
            {{ votedReviews.has(review.id) ? 'Voted helpful' : 'Helpful' }} ({{ getHelpfulCount(review) }})
          </button>
        </div>
      </div>
    </div>

    <!-- Load more -->
    <div v-if="hasMore" class="rs__load-more">
      <BaseButton variant="secondary" :disabled="loading" @click="loadMoreReviews">
        {{ loading ? 'Loading…' : 'Load More Reviews' }}
      </BaseButton>
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

// Filter/sort option data
const ratingOptions = [
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: '2 Stars', value: '2' },
  { label: '1 Star', value: '1' },
]
const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Rated', value: 'rating_high' },
  { label: 'Lowest Rated', value: 'rating_low' },
  { label: 'Most Helpful', value: 'helpful' },
]

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

const votedReviews = ref<Set<string>>(new Set())
const reviewVoteCounts = ref<Record<string, number>>({})

const getHelpfulCount = (review: Review) => {
  return reviewVoteCounts.value[review.id] ?? review.helpfulVotes
}

const toggleHelpful = async (reviewId: string) => {
  if (votedReviews.value.has(reviewId)) return
  try {
    const res = await $fetch<{ helpfulVotes: number; alreadyVoted: boolean }>(
      `/api/apps/${props.appId}/reviews/${reviewId}/vote`,
      { method: 'POST' }
    )
    if (!res.alreadyVoted) {
      votedReviews.value.add(reviewId)
    }
    reviewVoteCounts.value[reviewId] = res.helpfulVotes
  } catch {
    // ignore — non-critical action
  }
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

<style scoped>
.rs {
  font-family: var(--f-ui);
  color: var(--mm-silver);
}

/* Summary */
.rs__summary { margin-bottom: var(--sp-8); }
.rs__summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-6);
}
.rs__heading {
  font-family: var(--f-ui);
  font-size: var(--t-xl);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0;
}
.rs__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-5);
  margin-bottom: var(--sp-6);
}
@media (max-width: 640px) {
  .rs__cards { grid-template-columns: 1fr; }
}
.rs__card {
  background: var(--mm-surface-2);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-lg);
  padding: var(--sp-6);
}
.rs__overall {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}
.rs__score {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--mm-pearl);
  line-height: 1;
}
.rs__count {
  font-size: var(--t-sm);
  color: var(--mm-silver);
  margin: 0.35rem 0 0;
}
.rs__card-title {
  font-size: var(--t-base);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 var(--sp-4);
}
.rs__bars { display: flex; flex-direction: column; gap: var(--sp-2); }
.rs__bar-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.rs__bar-label {
  font-size: var(--t-sm);
  color: var(--mm-silver);
  width: 1.5rem;
  flex-shrink: 0;
}
.rs__bar-track {
  flex: 1;
  height: 6px;
  background: var(--mm-surface-3);
  border-radius: var(--r-full);
  overflow: hidden;
}
.rs__bar-fill {
  height: 100%;
  background: var(--mm-gold);
  border-radius: var(--r-full);
  transition: width 0.4s ease;
}
.rs__bar-count {
  font-size: var(--t-sm);
  color: var(--mm-silver);
  width: 2.5rem;
  text-align: right;
  flex-shrink: 0;
}

/* Filters */
.rs__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-6);
}

/* Reviews list */
.rs__list { display: flex; flex-direction: column; gap: var(--sp-5); }
.rs__review {
  background: var(--mm-surface);
  border: 0.5px solid var(--mm-border);
  border-radius: var(--r-lg);
  padding: var(--sp-6);
  transition: border-color 150ms ease;
}
.rs__review:hover { border-color: var(--mm-border-md); }
.rs__review-header { margin-bottom: var(--sp-3); }
.rs__reviewer { display: flex; align-items: flex-start; gap: var(--sp-3); }
.rs__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--r-full);
  background: var(--mm-gold);
  color: var(--mm-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--t-base);
  flex-shrink: 0;
}
.rs__reviewer-name {
  font-size: var(--t-base);
  font-weight: 600;
  color: var(--mm-pearl);
  line-height: 1.4;
}
.rs__verified {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: var(--t-xs);
  font-weight: 600;
  color: var(--color-success, #2A9D8F);
  background: rgba(42, 157, 143, 0.12);
  border-radius: var(--r-full);
  padding: 0.15rem 0.55rem;
}
.rs__reviewer-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: 0.2rem;
  font-size: var(--t-sm);
  color: var(--mm-slate);
}
.rs__review-title {
  font-size: var(--t-base);
  font-weight: 600;
  color: var(--mm-pearl);
  margin: 0 0 var(--sp-2);
}
.rs__review-body {
  font-size: var(--t-base);
  line-height: 1.65;
  color: var(--mm-silver);
  margin: 0 0 var(--sp-4);
}
.rs__review-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-3);
}
.rs__meta-tags {
  display: flex;
  gap: var(--sp-4);
  font-size: var(--t-sm);
  color: var(--mm-slate);
}
.rs__helpful {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--t-sm);
  color: var(--mm-slate);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 150ms ease;
}
.rs__helpful:hover { color: var(--mm-gold); }
.rs__helpful:disabled { opacity: 0.5; cursor: default; }
.rs__helpful:disabled:hover { color: var(--mm-slate); }

/* Load more */
.rs__load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--sp-8);
}
</style>
