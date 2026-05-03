<template>
  <article class="review-card" :class="{ 'review-card--flagged': (review.flag_count ?? 0) >= 3 }">
    <header class="review-card__header">
      <div class="review-card__meta">
        <StarRating :rating="review.rating" />
        <AuthenticityBadge
          :level="(review.authenticity_label || 'unverified') as 'highly-verified' | 'verified' | 'basic' | 'unverified'"
          :score="review.authenticity_score"
        />
      </div>
      <time class="review-card__date">{{ formatDate(review.created_at) }}</time>
    </header>

    <h3 class="review-card__title">{{ review.title }}</h3>

    <p class="review-card__body">{{ review.content }}</p>

    <div v-if="review.pros?.length || review.cons?.length" class="review-card__lists">
      <div v-if="review.pros?.length" class="review-card__list review-card__list--pros">
        <strong>Pros</strong>
        <ul>
          <li v-for="(pro, i) in review.pros" :key="i">{{ pro }}</li>
        </ul>
      </div>
      <div v-if="review.cons?.length" class="review-card__list review-card__list--cons">
        <strong>Cons</strong>
        <ul>
          <li v-for="(con, i) in review.cons" :key="i">{{ con }}</li>
        </ul>
      </div>
    </div>

    <footer class="review-card__footer">
      <div class="review-card__author">
        <strong>{{ review.user_name }}</strong>
        <span v-if="review.user_role || review.company_size" class="review-card__role">
          {{ [review.user_role, review.company_size].filter(Boolean).join(' · ') }}
        </span>
      </div>
      <div class="review-card__actions">
        <span class="review-card__helpful">{{ review.helpful_votes }} found helpful</span>
        <button class="review-card__flag" @click="$emit('flag', review.id)" title="Flag this review">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Flag
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  review: {
    id: string
    user_name: string
    rating: number
    title: string
    content: string
    pros?: string[]
    cons?: string[]
    user_role?: string
    company_size?: string
    authenticity_label?: string
    authenticity_score?: number
    helpful_votes?: number
    flag_count?: number
    created_at: string
  }
}>()
defineEmits<{ (e: 'flag', id: string): void }>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.review-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  background: #fff;
}
.review-card--flagged { border-color: #fca5a5; background: #fff7f7; }
.review-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
.review-card__meta { display: flex; align-items: center; gap: 0.5rem; }
.review-card__date { font-size: 0.78rem; color: #9ca3af; }
.review-card__title { font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem; }
.review-card__body { font-size: 0.9rem; color: #374151; line-height: 1.6; margin-bottom: 0.75rem; }
.review-card__lists { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.review-card__list { flex: 1; min-width: 160px; }
.review-card__list strong { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
.review-card__list ul { margin: 0.25rem 0 0 1rem; padding: 0; font-size: 0.85rem; color: #374151; }
.review-card__list--pros strong { color: #16a34a; }
.review-card__list--cons strong { color: #dc2626; }
.review-card__footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-top: 1px solid #f3f4f6; padding-top: 0.75rem; margin-top: 0.75rem; }
.review-card__author { display: flex; flex-direction: column; gap: 2px; }
.review-card__author strong { font-size: 0.875rem; }
.review-card__role { font-size: 0.78rem; color: #6b7280; }
.review-card__actions { display: flex; align-items: center; gap: 1rem; }
.review-card__helpful { font-size: 0.78rem; color: #9ca3af; }
.review-card__flag { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #9ca3af; background: none; border: none; cursor: pointer; padding: 0; }
.review-card__flag:hover { color: #dc2626; }
</style>
