<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Reviews</h1>
        <p class="bw-head__sub">Reply to buyers with AI-drafted, tone-matched responses.</p>
      </div>
      <div class="bw-head__actions">
        <span class="vw-ai-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          AI sentiment on
        </span>
      </div>
    </header>

    <div class="bw-tabs">
      <button class="bw-tab" :class="{ 'is-active': f === 'all' }" @click="f = 'all'">All<span class="bw-tab__count">{{ reviews.length }}</span></button>
      <button class="bw-tab" :class="{ 'is-active': f === 'unreplied' }" @click="f = 'unreplied'">Needs reply<span class="bw-tab__count">{{ reviews.filter(r => !r.replied).length }}</span></button>
      <button class="bw-tab" :class="{ 'is-active': f === 'negative' }" @click="f = 'negative'">Negative<span class="bw-tab__count">{{ reviews.filter(r => r.sentiment === 'negative').length }}</span></button>
    </div>

    <ul class="rv-list">
      <li v-for="r in list" :key="r.id" class="bw-card rv">
        <div class="rv-head">
          <div class="rv-buyer">
            <div class="rv-avatar">{{ r.buyerName.charAt(0) }}</div>
            <div>
              <div class="rv-name">{{ r.buyerName }} · <span class="rv-company">{{ r.buyerCompany }}</span></div>
              <div class="rv-meta">{{ r.listingName }} · {{ r.at }}</div>
            </div>
          </div>
          <div class="rv-tags">
            <span class="rv-stars" :title="r.rating + ' / 5'">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
            <span class="bw-chip" :class="sentimentChip(r.sentiment)">{{ r.sentiment }}</span>
          </div>
        </div>
        <h3 class="rv-title">{{ r.title }}</h3>
        <p class="rv-body">{{ r.body }}</p>

        <div v-if="!r.replied && r.aiReplyDraft" class="vw-ai-card">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">AI</span>
            Tone-matched reply draft
          </div>
          <p class="rv-draft">{{ r.aiReplyDraft }}</p>
          <div class="rv-draft-actions">
            <button class="bw-btn bw-btn--primary bw-btn--sm" @click="postReply(r.id)">Post this reply</button>
            <button class="bw-btn bw-btn--subtle bw-btn--sm">Edit</button>
            <button class="bw-btn bw-btn--subtle bw-btn--sm">Regenerate</button>
          </div>
        </div>
        <div v-else-if="r.replied" class="rv-replied">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          You replied to this review.
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { reviews, markReviewReplied } = useVendorData()

const f = ref<'all' | 'unreplied' | 'negative'>('all')
const list = computed(() => {
  if (f.value === 'unreplied') return reviews.value.filter(r => !r.replied)
  if (f.value === 'negative') return reviews.value.filter(r => r.sentiment === 'negative')
  return reviews.value
})

function sentimentChip(s: string) {
  if (s === 'positive') return 'bw-chip--success'
  if (s === 'negative') return 'bw-chip--danger'
  return 'bw-chip--neutral'
}
function postReply(id: string) { markReviewReplied(id) }
</script>

<style scoped>
.rv-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
.rv { display: flex; flex-direction: column; gap: 12px; }
.rv-head { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.rv-buyer { display: flex; gap: 10px; align-items: center; }
.rv-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--vw-primary); color: white; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}
.rv-name { font-weight: 600; font-size: 0.9rem; }
.rv-company { color: var(--vw-text-muted); font-weight: 400; }
.rv-meta { font-size: 0.78rem; color: var(--vw-text-subtle); }

.rv-tags { display: flex; align-items: center; gap: 8px; }
.rv-stars { color: #f59e0b; font-size: 0.95rem; letter-spacing: 1px; }

.rv-title { font-family: var(--f-ui); font-size: 1rem; margin: 0; }
.rv-body { font-size: 0.88rem; color: var(--vw-text-muted); line-height: 1.5; margin: 0; }

.rv-draft { font-size: 0.85rem; line-height: 1.5; margin: 4px 0 10px; }
.rv-draft-actions { display: flex; gap: 6px; flex-wrap: wrap; }

.rv-replied { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--vw-health-good); font-weight: 500; }
</style>
