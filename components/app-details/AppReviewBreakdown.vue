<script setup lang="ts">
import { computed, reactive } from 'vue'

interface OwnerReply {
  body: string
  isPrivate: boolean
  date: string
}

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
  ownerReply?: OwnerReply
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
  isOwner?: boolean
  appId?: string
}

const props = defineProps<Props>()

const pct = (n: number) => {
  if (!props.breakdown || !props.breakdown.total) return 0
  return Math.round((n / props.breakdown.total) * 100)
}

const topReviews = computed(() => props.reviews.slice(0, 3))

// ── Helpful votes ─────────────────────────────────────────────
const helpfulVoted = reactive<Record<string, boolean>>({})
const helpfulCounts = reactive<Record<string, number>>({})

function getHelpfulCount(r: Review): number {
  return helpfulCounts[r.id] ?? (r.helpfulVotes ?? 0)
}

async function toggleHelpful(reviewId: string, currentCount: number) {
  if (helpfulVoted[reviewId]) return
  helpfulVoted[reviewId] = true
  helpfulCounts[reviewId] = currentCount + 1
  try {
    await $fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' }).catch(() => null)
  } catch { /* silent */ }
}

// ── Reply state ────────────────────────────────────────────────
interface ReplyState {
  open: boolean
  text: string
  isPrivate: boolean
  submitting: boolean
  submitted: boolean
  error: string
}

const replyStates = reactive<Record<string, ReplyState>>({})

function getReply(reviewId: string): ReplyState {
  if (!replyStates[reviewId]) {
    replyStates[reviewId] = { open: false, text: '', isPrivate: false, submitting: false, submitted: false, error: '' }
  }
  return replyStates[reviewId]
}

function openReply(reviewId: string) {
  getReply(reviewId).open = true
}

function cancelReply(reviewId: string) {
  const s = getReply(reviewId)
  s.open = false
  s.text = ''
  s.error = ''
}

async function submitReply(reviewId: string) {
  const s = getReply(reviewId)
  if (!s.text.trim()) return
  s.submitting = true
  s.error = ''
  try {
    await $fetch(`/api/vendor/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: { body: s.text.trim(), isPrivate: s.isPrivate }
    })
    s.submitted = true
    s.open = false
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string }
    s.error = err?.data?.statusMessage || err?.message || 'Could not post reply.'
  } finally {
    s.submitting = false
  }
}
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
          <button
            :class="['review-helpful-btn', { voted: helpfulVoted[r.id] }]"
            type="button"
            :disabled="helpfulVoted[r.id]"
            @click="toggleHelpful(r.id, getHelpfulCount(r))"
          >
            <Icon name="heroicons:hand-thumb-up" />
            {{ getHelpfulCount(r) }} Helpful
          </button>
          <!-- Owner reply CTA -->
          <button
            v-if="!replyStates[r.id]?.submitted && !r.ownerReply"
            class="reply-open-btn"
            type="button"
            @click="openReply(r.id)"
          >
            <Icon name="heroicons:chat-bubble-left-right" />
            Reply
          </button>
          <span v-if="replyStates[r.id]?.submitted" class="reply-sent-badge">
            <Icon name="heroicons:check-circle" />
            Reply sent
          </span>
        </footer>

        <!-- Existing owner reply display -->
        <div v-if="r.ownerReply" class="owner-reply-block">
          <div class="owner-reply-header">
            <Icon name="heroicons:building-office-2" class="orh-icon" />
            <span class="orh-label">Owner Reply</span>
            <span v-if="r.ownerReply.isPrivate" class="orh-private">
              <Icon name="heroicons:lock-closed" />
              Private
            </span>
            <span v-else class="orh-public">
              <Icon name="heroicons:globe-alt" />
              Public
            </span>
            <span class="orh-date">{{ r.ownerReply.date }}</span>
          </div>
          <p class="owner-reply-body">{{ r.ownerReply.body }}</p>
        </div>

        <!-- Reply compose panel -->
        <div v-if="replyStates[r.id]?.open" class="reply-compose">
          <!-- Visibility toggle -->
          <div class="reply-visibility-row">
            <span class="rv-label">Reply visibility:</span>
            <div class="rv-pills">
              <button
                type="button"
                :class="['rv-pill', { active: !replyStates[r.id].isPrivate }]"
                @click="replyStates[r.id].isPrivate = false"
              >
                <Icon name="heroicons:globe-alt" />
                Public
              </button>
              <button
                type="button"
                :class="['rv-pill', { active: replyStates[r.id].isPrivate }]"
                @click="replyStates[r.id].isPrivate = true"
              >
                <Icon name="heroicons:lock-closed" />
                Private
              </button>
            </div>
            <span class="rv-hint" v-if="replyStates[r.id].isPrivate">Only the reviewer can see this</span>
            <span class="rv-hint" v-else>Visible to all visitors</span>
          </div>

          <textarea
            v-model="replyStates[r.id].text"
            class="reply-textarea"
            placeholder="Write a helpful, professional response…"
            rows="4"
            :disabled="replyStates[r.id].submitting"
          ></textarea>

          <p v-if="replyStates[r.id].error" class="reply-error">
            <Icon name="heroicons:exclamation-circle" />
            {{ replyStates[r.id].error }}
          </p>

          <div class="reply-actions">
            <span class="reply-char-count">{{ replyStates[r.id].text.length }}/2000</span>
            <button type="button" class="reply-cancel" @click="cancelReply(r.id)">Cancel</button>
            <button
              type="button"
              class="reply-submit"
              :disabled="replyStates[r.id].submitting || !replyStates[r.id].text.trim()"
              @click="submitReply(r.id)"
            >
              <span v-if="replyStates[r.id].submitting" class="spinner"></span>
              <Icon v-else name="heroicons:paper-airplane" />
              {{ replyStates[r.id].submitting ? 'Posting…' : 'Post reply' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <a v-if="viewAllHref" :href="viewAllHref" class="view-all">
      View all {{ reviewCount.toLocaleString() }} reviews
    </a>
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
.sentiment-tag.negative { color: #fecaca; border-color: rgba(248,113,113,0.3); }
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
  gap: 10px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--mm-slate);
  flex-wrap: wrap;
}
.review-helpful-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: transparent;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--mm-slate);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.review-helpful-btn :deep(svg) { width: 13px; height: 13px; }
.review-helpful-btn:hover:not(:disabled) {
  border-color: var(--mm-gold);
  color: var(--mm-gold);
  background: rgba(212,168,67,0.06);
}
.review-helpful-btn.voted {
  border-color: var(--mm-gold);
  color: var(--mm-gold);
  background: rgba(212,168,67,0.1);
  cursor: default;
}

.view-all {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: var(--mm-gold);
  text-decoration: none;
}
.view-all:hover { text-decoration: underline; }

/* ── Owner reply button ──────────────────────────────────────── */
.reply-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  background: transparent;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--mm-slate);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.reply-open-btn:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.reply-open-btn :deep(svg) { width: 13px; height: 13px; }
.reply-sent-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-size: 12px;
  color: var(--mm-gold);
}
.reply-sent-badge :deep(svg) { width: 13px; height: 13px; }

/* ── Existing owner reply ────────────────────────────────────── */
.owner-reply-block {
  margin-top: 12px;
  padding: 12px 14px;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-left: 3px solid var(--mm-gold);
  border-radius: var(--r-md);
}
.owner-reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.orh-icon { width: 14px; height: 14px; color: var(--mm-gold); flex-shrink: 0; }
.orh-label { font-size: 12px; font-weight: 700; color: var(--mm-pearl); }
.orh-private, .orh-public {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: var(--r-full);
}
.orh-private { background: rgba(168,181,204,0.1); border: 0.5px solid var(--b2); color: var(--mm-slate); }
.orh-private :deep(svg), .orh-public :deep(svg) { width: 11px; height: 11px; }
.orh-public { background: rgba(212,168,67,0.08); border: 0.5px solid rgba(212,168,67,0.3); color: var(--mm-gold); }
.orh-date { margin-left: auto; font-size: 11px; color: var(--mm-slate); }
.owner-reply-body {
  margin: 0;
  font-size: 13px;
  color: var(--mm-silver);
  line-height: 1.6;
}

/* ── Reply compose panel ─────────────────────────────────────── */
.reply-compose {
  margin-top: 12px;
  padding: 14px;
  background: var(--mm-s1);
  border: 0.5px solid rgba(212,168,67,0.25);
  border-radius: var(--r-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-visibility-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.rv-label { font-size: 12px; font-weight: 600; color: var(--mm-slate); }
.rv-pills { display: flex; gap: 6px; }
.rv-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--r-full);
  border: 0.5px solid var(--b2);
  background: var(--mm-s2);
  font-size: 12px;
  font-weight: 500;
  color: var(--mm-slate);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.rv-pill :deep(svg) { width: 13px; height: 13px; }
.rv-pill.active {
  background: rgba(212,168,67,0.1);
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}
.rv-hint { font-size: 11.5px; color: var(--mm-slate); font-style: italic; }

.reply-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  font-size: 13.5px;
  color: var(--mm-pearl);
  line-height: 1.6;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}
.reply-textarea::placeholder { color: var(--mm-slate); }
.reply-textarea:focus { border-color: var(--mm-gold); }
.reply-textarea:disabled { opacity: 0.6; }

.reply-error {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 12px;
  color: #f87171;
}
.reply-error :deep(svg) { width: 13px; height: 13px; flex-shrink: 0; }

.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.reply-char-count { font-size: 11.5px; color: var(--mm-slate); margin-right: auto; }
.reply-cancel {
  background: transparent;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  padding: 6px 14px;
  font-size: 13px;
  color: var(--mm-slate);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.reply-cancel:hover { border-color: var(--b3); color: var(--mm-silver); }
.reply-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: var(--mm-gold);
  color: #0A0700;
  border: none;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.reply-submit:hover:not(:disabled) { background: #e8bb4a; }
.reply-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.reply-submit :deep(svg) { width: 14px; height: 14px; }
.spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(10,7,0,0.25);
  border-top-color: #0A0700;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .breakdown-grid { grid-template-columns: 1fr; }
  .score-col, .sentiment-col { border: none; padding: 0; }
}
</style>
