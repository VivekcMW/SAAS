<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Reviews</h1>
        <p class="bw-head__sub">Reply to buyers with AI-drafted, tone-matched responses.</p>
      </div>
      <div class="bw-head__actions">
        <label class="tone-select">
          Tone
          <select v-model="tone" class="bw-input bw-input--sm">
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="empathetic">Empathetic</option>
          </select>
        </label>
      </div>
    </header>

    <div class="bw-tabs">
      <button class="bw-tab" :class="{ 'is-active': f === 'all' }" @click="f = 'all'">
        All<span class="bw-tab__count">{{ reviews.length }}</span>
      </button>
      <button class="bw-tab" :class="{ 'is-active': f === 'unreplied' }" @click="f = 'unreplied'">
        Needs reply<span class="bw-tab__count">{{ reviews.filter(r => !r.replied).length }}</span>
      </button>
      <button class="bw-tab" :class="{ 'is-active': f === 'negative' }" @click="f = 'negative'">
        Negative<span class="bw-tab__count">{{ reviews.filter(r => r.sentiment === 'negative').length }}</span>
      </button>
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

        <!-- Already replied -->
        <div v-if="r.replied" class="rv-replied">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          You replied to this review.
        </div>

        <!-- Draft panel shown after generation -->
        <div v-else-if="drafts[r.id]" class="vw-ai-card">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
              AI
            </span>
            Reply draft · <span class="tone-badge">{{ tone }}</span>
          </div>
          <textarea v-model="drafts[r.id]" class="rv-draft-area" rows="5" />
          <div class="rv-draft-actions">
            <button class="bw-btn bw-btn--primary bw-btn--sm" :disabled="posting[r.id]" @click="postReply(r)">
              {{ posting[r.id] ? 'Posting…' : 'Post reply' }}
            </button>
            <button class="bw-btn bw-btn--subtle bw-btn--sm" :disabled="generating[r.id]" @click="generateDraft(r.id)">
              {{ generating[r.id] ? 'Generating…' : 'Regenerate' }}
            </button>
            <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="drafts[r.id] = ''">Discard</button>
          </div>
          <p v-if="postErr[r.id]" class="rv-err">{{ postErr[r.id] }}</p>
        </div>

        <!-- Generate trigger -->
        <div v-else class="rv-actions">
          <button class="bw-btn bw-btn--subtle bw-btn--sm rv-gen-btn" :disabled="generating[r.id]" @click="generateDraft(r.id)">
            <svg v-if="!generating[r.id]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="spin"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-dasharray="56" stroke-dashoffset="14"/></svg>
            {{ generating[r.id] ? 'Generating…' : 'Generate AI reply' }}
          </button>
          <p v-if="genErr[r.id]" class="rv-err">{{ genErr[r.id] }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const { reviews, markReviewReplied } = useVendorData()

const f = ref<'all' | 'unreplied' | 'negative'>('all')
const tone = ref<'professional' | 'friendly' | 'empathetic'>('professional')
const drafts = reactive<Record<string, string>>({})
const generating = reactive<Record<string, boolean>>({})
const posting = reactive<Record<string, boolean>>({})
const genErr = reactive<Record<string, string>>({})
const postErr = reactive<Record<string, string>>({})

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

async function generateDraft(reviewId: string) {
  generating[reviewId] = true
  genErr[reviewId] = ''
  drafts[reviewId] = ''
  try {
    const res = await $fetch<{ draft: string }>('/api/ai/review-reply', {
      method: 'POST',
      body: { reviewId, tone: tone.value }
    })
    drafts[reviewId] = res.draft
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    genErr[reviewId] = err?.data?.statusMessage ?? 'Failed to generate draft. Please try again.'
  } finally {
    generating[reviewId] = false
  }
}

async function postReply(r: { id: string }) {
  const draft = drafts[r.id]
  if (!draft?.trim()) return
  posting[r.id] = true
  postErr[r.id] = ''
  try {
    // Best-effort server persist; vendor can also post manually
    await $fetch('/api/reviews/reply', { method: 'POST', body: { reviewId: r.id, body: draft } }).catch(() => null)
    markReviewReplied(r.id)
    drafts[r.id] = ''
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    postErr[r.id] = err?.data?.statusMessage ?? 'Failed to post reply.'
  } finally {
    posting[r.id] = false
  }
}
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

.tone-select {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.82rem; color: var(--vw-text-muted);
}
.bw-input--sm { padding: 4px 8px; font-size: 0.82rem; }
.tone-badge { text-transform: capitalize; color: var(--vw-ai-text, #818cf8); font-size: 0.78rem; }

.rv-actions { display: flex; flex-direction: column; gap: 4px; }
.rv-gen-btn { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; }

.rv-draft-area {
  width: 100%;
  background: var(--vw-surface-2);
  border: 0.5px solid var(--vw-border, rgba(255,255,255,0.08));
  border-radius: 8px;
  color: inherit;
  font-family: var(--f-ui);
  font-size: 0.88rem;
  line-height: 1.55;
  padding: 10px 12px;
  resize: vertical;
  box-sizing: border-box;
}
.rv-draft-area:focus { outline: none; border-color: var(--vw-ai-text, #818cf8); }
.rv-draft-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.rv-err { font-size: 0.78rem; color: #f87171; margin: 2px 0 0; }
.rv-replied { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--vw-health-good); font-weight: 500; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.9s linear infinite; transform-origin: center; }
</style>
