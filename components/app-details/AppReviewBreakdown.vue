<script setup lang="ts">
import { computed } from 'vue'

interface Review {
  id: string
  author: string
  avatar?: string
  title?: string
  rating: number
  reviewTitle?: string
  content: string
  date: string
  verified?: boolean
  helpfulVotes?: number
}

interface RatingBreakdown {
  5: number
  4: number
  3: number
  2: number
  1: number
  total: number
}

interface Props {
  overallRating: number
  reviewCount: number
  breakdown?: RatingBreakdown
  reviews: Review[]
  sentimentTags?: { tag: string; percent: number; positive: boolean }[]
  viewAllHref?: string
}

const props = defineProps<Props>()

const pct = (n: number) => {
  if (!props.breakdown || !props.breakdown.total) return 0
  return Math.round((n / props.breakdown.total) * 100)
}

const topReviews = computed(() => props.reviews.slice(0, 3))
</script>

<template>
  <div class="review-breakdown">
    <div class="breakdown-grid">
      <!-- Score column -->
      <div class="score-col">
        <div class="score-value">{{ overallRating.toFixed(1) }}</div>
        <Rating :model-value="overallRating" readonly size="md" />
        <p class="score-count">{{ reviewCount.toLocaleString() }} reviews</p>
      </div>

      <!-- Distribution bars -->
      <div class="bars-col">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="bar-row">
          <span class="bar-star">{{ star }} star</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: `${pct(breakdown?.[star as keyof RatingBreakdown] || 0)}%` }"
            ></div>
          </div>
          <span class="bar-pct">{{ pct(breakdown?.[star as keyof RatingBreakdown] || 0) }}%</span>
        </div>
      </div>

      <!-- Sentiment tags -->
      <div v-if="sentimentTags?.length" class="sentiment-col">
        <p class="sentiment-title">What users say</p>
        <div class="sentiment-list">
          <span
            v-for="(t, i) in sentimentTags"
            :key="i"
            :class="['sentiment-tag', t.positive ? 'positive' : 'negative']"
          >
            <Icon :name="t.positive ? 'heroicons:hand-thumb-up' : 'heroicons:hand-thumb-down'" />
            {{ t.tag }}
            <span class="sentiment-pct">{{ t.percent }}%</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Top reviews -->
    <div v-if="topReviews.length" class="reviews-list">
      <article v-for="r in topReviews" :key="r.id" class="review-card">
        <header class="review-head">
          <Avatar :src="r.avatar" :name="r.author" size="sm" />
          <div class="reviewer">
            <div class="reviewer-name">
              {{ r.author }}
              <Badge v-if="r.verified" variant="success" size="sm">Verified</Badge>
            </div>
            <div v-if="r.title" class="reviewer-title">{{ r.title }}</div>
          </div>
          <div class="review-stars">
            <Rating :model-value="r.rating" readonly size="sm" />
          </div>
        </header>
        <h4 v-if="r.reviewTitle" class="review-title">{{ r.reviewTitle }}</h4>
        <p class="review-content">{{ r.content }}</p>
        <footer class="review-footer">
          <span class="review-date">{{ r.date }}</span>
          <span v-if="r.helpfulVotes" class="review-helpful">
            <Icon name="heroicons:hand-thumb-up" />
            {{ r.helpfulVotes }} helpful
          </span>
        </footer>
      </article>
    </div>

    <NuxtLink v-if="viewAllHref" :to="viewAllHref" class="view-all">
      Read all {{ reviewCount.toLocaleString() }} reviews →
    </NuxtLink>
  </div>
</template>

<style scoped>
.breakdown-grid {
  display: grid;
  grid-template-columns: 200px 1fr 260px;
  gap: 24px;
  padding: 20px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  margin-bottom: 16px;
}

.score-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-right: 0.5px solid var(--b1);
  padding-right: 20px;
}
.score-value { font-size: 42px; font-weight: 700; color: var(--mm-pearl); line-height: 1; }
.score-count { margin: 0; font-size: 13px; color: var(--mm-slate); }

.bars-col { display: flex; flex-direction: column; gap: 6px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-star { font-size: 12px; color: var(--mm-slate); width: 48px; flex-shrink: 0; }
.bar-track {
  flex: 1;
  height: 6px;
  background: var(--b2);
  border-radius: var(--r-sm);
  overflow: hidden;
}
.bar-fill { height: 100%; background: var(--mm-gold); transition: width 300ms ease; }
.bar-pct { font-size: 12px; color: var(--mm-slate); width: 40px; text-align: right; flex-shrink: 0; }

.sentiment-col { border-left: 0.5px solid var(--b1); padding-left: 20px; }
.sentiment-title {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--mm-slate);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.sentiment-list { display: flex; flex-wrap: wrap; gap: 6px; }
.sentiment-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xs);
  font-size: 12px;
  color: var(--mm-silver);
}
.sentiment-tag.positive { color: var(--mm-seal); border-color: var(--mm-sea); background: var(--mm-sea-soft); }
.sentiment-tag.negative { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }
.sentiment-tag :deep(svg) { width: 12px; height: 12px; }
.sentiment-pct { font-weight: 600; margin-left: 2px; }

/* Reviews list */
.reviews-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.review-card {
  padding: 16px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
}
.review-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.reviewer { flex: 1; min-width: 0; }
.reviewer-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--mm-pearl);
}
.reviewer-title { font-size: 12px; color: var(--mm-slate); margin-top: 2px; }

.review-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--mm-pearl);
}
.review-content {
  margin: 0;
  font-size: 13px;
  color: var(--mm-silver);
  line-height: 1.55;
}
.review-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--mm-slate);
}
.review-helpful {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.review-helpful :deep(svg) { width: 12px; height: 12px; }

.view-all {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: var(--mm-gold);
  text-decoration: none;
}
.view-all:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .breakdown-grid { grid-template-columns: 1fr; }
  .score-col, .sentiment-col { border: none; padding: 0; }
}
</style>
