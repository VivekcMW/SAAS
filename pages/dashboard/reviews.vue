<template>
  <div class="reviews">
    <DashPageHeader
      :title="headerTitle"
      :eyebrow="headerEyebrow"
      :description="headerDesc"
    />

    <div v-if="toast" class="toast toast-success">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
      <span>{{ toast }}</span>
    </div>

    <!-- Summary -->
    <div class="reviews__stats">
      <DashStatCard
        v-for="s in stats"
        :key="s.label"
        :label="s.label"
        :value="s.value"
        :delta="s.delta"
        :tone="s.tone"
        :icon="s.icon"
      />
    </div>

    <!-- Rating breakdown (vendor + admin) -->
    <section v-if="viewMode === 'vendor'" class="card breakdown">
      <header class="card__head">
        <h2>Rating breakdown</h2>
        <span class="breakdown__overall">
          <span class="breakdown__big">{{ overallRating.toFixed(1) }}</span>
          <span class="stars" aria-hidden="true">
            <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" width="14" height="14">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" :fill="i <= Math.round(overallRating) ? '#facc15' : '#e4e0dc'" :stroke="i <= Math.round(overallRating) ? '#facc15' : '#e4e0dc'" stroke-width="1.4"/>
            </svg>
          </span>
          <span class="breakdown__count">{{ totalReviews }} reviews</span>
        </span>
      </header>
      <div class="breakdown__bars">
        <div v-for="row in ratingDistribution" :key="row.stars" class="bar-row">
          <span class="bar-row__label">{{ row.stars }}★</span>
          <div class="bar-row__track">
            <div class="bar-row__fill" :style="{ width: row.pct + '%' }" />
          </div>
          <span class="bar-row__count">{{ row.count }}</span>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <div class="toolbar">
      <div class="toolbar__search">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input v-model="query" type="text" placeholder="Search reviews…" />
      </div>
      <div class="toolbar__filters">
        <button
          v-for="f in ratingFilters"
          :key="f.key"
          type="button"
          class="chip"
          :class="{ 'is-active': ratingFilter === f.key }"
          @click="ratingFilter = f.key"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- List -->
    <div v-if="filtered.length" class="list">
      <article v-for="r in filtered" :key="r.id" class="review">
        <header class="review__head">
          <div class="review__avatar" :style="{ background: r.avatarBg }">{{ r.initials }}</div>
          <div class="review__meta">
            <div class="review__author">
              {{ r.author }}
              <span v-if="r.verified" class="review__badge" title="Verified buyer">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                Verified
              </span>
            </div>
            <div class="review__sub">
              {{ r.company }} · <NuxtLink :to="`/app/${r.productSlug}`">{{ r.product }}</NuxtLink> · {{ r.time }}
            </div>
          </div>
          <div class="review__stars" aria-label="Rating">
            <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" :fill="i <= r.rating ? '#facc15' : '#e4e0dc'" :stroke="i <= r.rating ? '#facc15' : '#e4e0dc'" stroke-width="1.4"/></svg>
          </div>
        </header>

        <h3 class="review__title">{{ r.title }}</h3>
        <p class="review__body">{{ r.body }}</p>

        <!-- Vendor reply -->
        <div v-if="r.reply" class="review__reply">
          <div class="review__reply-head">
            <span class="review__reply-author">{{ r.reply.author }}</span>
            <span class="review__reply-role">Vendor</span>
            <span class="review__reply-time">· {{ r.reply.time }}</span>
          </div>
          <p>{{ r.reply.body }}</p>
        </div>

        <footer class="review__foot">
          <span class="review__sentiment" :class="`is-${r.sentiment}`">
            {{ sentimentLabel(r.sentiment) }}
          </span>
          <div class="review__actions">
            <button v-if="viewMode === 'vendor' && !r.reply" type="button" class="btn-ghost" @click="onReply(r)">
              {{ replyingId === r.id ? 'Cancel' : 'Reply' }}
            </button>
            <button v-if="viewMode === 'vendor'" type="button" class="btn-ghost" @click="onFlag(r)">
              Flag
            </button>
            <NuxtLink v-if="role === 'buyer'" :to="`/app/${r.productSlug}`" class="btn-ghost">View on app</NuxtLink>
          </div>
        </footer>

        <!-- Inline reply composer -->
        <div v-if="replyingId === r.id" class="review__composer">
          <textarea
            v-model="replyDraft"
            rows="3"
            placeholder="Write a reply to this review…"
          />
          <div class="review__composer-actions">
            <button type="button" class="btn-ghost" @click="cancelReply">Cancel</button>
            <button type="button" class="btn-primary" :disabled="!replyDraft.trim()" @click="submitReply(r)">Post reply</button>
          </div>
        </div>
      </article>
    </div>

    <DashEmptyState
      v-else
      :title="emptyTitle"
      :description="emptyDesc"
      :icon="ICONS.star"
    >
      <template #actions>
        <NuxtLink v-if="role === 'buyer'" to="/marketplace" class="btn-primary">Find apps to review</NuxtLink>
        <NuxtLink v-else to="/dashboard/products" class="btn-primary">View your apps</NuxtLink>
      </template>
    </DashEmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { currentUser } = useAuth()
useHead({ title: 'Reviews — SaaSWorld Dashboard' })

const role = computed(() => currentUser.value?.role || 'buyer')
// For reviews, admin shares the vendor view (full list + moderation)
const viewMode = computed<'vendor' | 'buyer'>(() => (role.value === 'buyer' ? 'buyer' : 'vendor'))

const headerTitle = computed(() => viewMode.value === 'vendor' ? (role.value === 'admin' ? 'Reviews moderation' : 'Reviews') : 'My reviews')
const headerEyebrow = computed(() => viewMode.value === 'vendor' ? (role.value === 'admin' ? 'Platform feedback' : 'Customer feedback') : "What you've shared")
const headerDesc = computed(() => viewMode.value === 'vendor'
  ? (role.value === 'admin'
      ? 'Track all reviews across the marketplace. Reply on behalf of vendors or flag abusive content.'
      : 'Track ratings, sentiment and reply to every review your customers leave.')
  : "Reviews you've posted on apps across the SaaSWorld marketplace.")

interface Reply { author: string; time: string; body: string }
interface Review {
  id: string
  author: string
  initials: string
  avatarBg: string
  company: string
  product: string
  productSlug: string
  rating: number
  title: string
  body: string
  time: string
  sentiment: 'positive' | 'neutral' | 'negative'
  verified: boolean
  reply: Reply | null
}

const vendorReviews: Review[] = [
  { id: 'r1', author: 'Priya Rao', initials: 'PR', avatarBg: '#FFF1E6', company: 'Acme Corp', product: 'TaskFlow Pro', productSlug: 'taskflow-pro', rating: 5, title: 'Completely changed how our team ships work', body: 'We used to juggle three tools. TaskFlow Pro replaced all of them and the AI scheduler saves each PM about 4 hours per week. Onboarding took half a day.', time: '2 days ago', sentiment: 'positive', verified: true, reply: { author: 'Demo Vendor', time: '1 day ago', body: 'Thanks Priya — glad to hear the AI scheduler is landing well. We have even more automations coming next month.' } },
  { id: 'r2', author: 'Marco Lopez', initials: 'ML', avatarBg: '#E6F4FF', company: 'Northwind', product: 'Analytics Hub', productSlug: 'analytics-hub', rating: 4, title: 'Strong dashboards, could use more data sources', body: 'Great out of the box experience and the dashboards look clean. Would love to see native BigQuery and Snowflake connectors soon.', time: '5 days ago', sentiment: 'positive', verified: true, reply: null },
  { id: 'r3', author: 'Sara Kim', initials: 'SK', avatarBg: '#F3E8FF', company: 'Luma Health', product: 'TaskFlow Pro', productSlug: 'taskflow-pro', rating: 3, title: 'Good but mobile app needs work', body: 'Desktop is excellent, but the mobile app is slow and the push notifications are unreliable. Hoping for an update.', time: '1 week ago', sentiment: 'neutral', verified: true, reply: null },
  { id: 'r4', author: 'Tom Becker', initials: 'TB', avatarBg: '#FFE6E1', company: 'Pine & Co', product: 'TaskFlow Pro', productSlug: 'taskflow-pro', rating: 2, title: 'Billing issue went unresolved', body: 'We were double-charged last month and it took 8 days to get a response. Product itself is fine but support made me downgrade my review.', time: '2 weeks ago', sentiment: 'negative', verified: true, reply: { author: 'Demo Vendor', time: '1 week ago', body: 'Tom — we escalated your ticket and refunded in full. Please email support@ if anything else is outstanding.' } }
]

const buyerReviews: Review[] = [
  { id: 'br1', author: 'Demo Buyer', initials: 'DB', avatarBg: '#FFF1E6', company: 'Acme Corp', product: 'Slack', productSlug: 'slack', rating: 5, title: 'The default choice for team chat', body: 'Channels, threads and Slack Connect make cross-company collaboration effortless. The app ecosystem is the killer feature.', time: '3 days ago', sentiment: 'positive', verified: true, reply: null },
  { id: 'br2', author: 'Demo Buyer', initials: 'DB', avatarBg: '#FFF1E6', company: 'Acme Corp', product: 'HubSpot', productSlug: 'hubspot', rating: 4, title: 'Powerful but steep learning curve', body: 'CRM and marketing automation in one is great, but the configuration is overwhelming for small teams. Onboarding templates would help.', time: '2 weeks ago', sentiment: 'positive', verified: true, reply: { author: 'HubSpot Team', time: '1 week ago', body: 'Thanks for the honest feedback — check out our new Starter Playbooks at the Academy, they cut setup time in half.' } }
]

const reviews = computed(() => viewMode.value === 'vendor' ? vendorReviews : buyerReviews)

// Icons
const ICONS = {
  star: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  smile: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
  frown: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>'
}

const totalReviews = computed(() => reviews.value.length)

const overallRating = computed(() => {
  const list = reviews.value
  if (!list.length) return 0
  return list.reduce((a, r) => a + r.rating, 0) / list.length
})

const stats = computed(() => {
  const list = reviews.value
  const positive = list.filter(r => r.sentiment === 'positive').length
  const pctPos = list.length ? Math.round((positive / list.length) * 100) : 0
  const replied = list.filter(r => r.reply).length

  if (viewMode.value === 'vendor') {
    return [
      { label: 'Total reviews', value: String(list.length), delta: '+12%', tone: 'up' as const, icon: ICONS.chat },
      { label: 'Overall rating', value: overallRating.value.toFixed(1), delta: '+0.3', tone: 'up' as const, icon: ICONS.star },
      { label: 'Positive', value: `${pctPos}%`, delta: '+5.2%', tone: 'up' as const, icon: ICONS.smile },
      { label: 'Replied', value: `${replied}/${list.length}`, delta: '—', tone: 'neutral' as const, icon: ICONS.check }
    ]
  }
  return [
    { label: 'Reviews posted', value: String(list.length), delta: '—', tone: 'neutral' as const, icon: ICONS.chat },
    { label: 'Avg. rating given', value: overallRating.value.toFixed(1), delta: '—', tone: 'neutral' as const, icon: ICONS.star },
    { label: 'Vendor replies', value: String(list.filter(r => r.reply).length), delta: '—', tone: 'neutral' as const, icon: ICONS.check }
  ]
})

const ratingDistribution = computed(() => {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews.value) counts[r.rating] = (counts[r.rating] || 0) + 1
  const total = reviews.value.length || 1
  return [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: counts[stars],
    pct: Math.round((counts[stars] / total) * 100)
  }))
})

const ratingFilters = [
  { key: 'all', label: 'All' },
  { key: 'positive', label: 'Positive' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'negative', label: 'Negative' }
]

const query = ref('')
const ratingFilter = ref<string>('all')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return reviews.value.filter((r) => {
    if (ratingFilter.value !== 'all' && r.sentiment !== ratingFilter.value) return false
    if (q && !(r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.product.toLowerCase().includes(q))) return false
    return true
  })
})

function sentimentLabel(s: string) {
  const map: Record<string, string> = { positive: 'Positive', neutral: 'Neutral', negative: 'Negative' }
  return map[s] || s
}

const emptyTitle = computed(() => viewMode.value === 'vendor' ? 'No reviews yet' : 'No reviews posted yet')
const emptyDesc = computed(() => viewMode.value === 'vendor'
  ? 'Reviews will appear here as customers share feedback on your apps.'
  : 'Leave a review on an app you use to help other buyers.')

// Inline reply state
const replyingId = ref<string | null>(null)
const replyDraft = ref('')
const toast = ref('')
function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

function onReply(r: Review) {
  replyingId.value = replyingId.value === r.id ? null : r.id
  replyDraft.value = ''
}

function submitReply(r: Review) {
  const body = replyDraft.value.trim()
  if (!body) return
  r.reply = {
    author: role.value === 'admin' ? 'SaaSWorld Admin' : (currentUser.value?.fullName || 'Vendor'),
    time: 'Just now',
    body
  }
  replyingId.value = null
  replyDraft.value = ''
  flash('Reply posted.')
}

function cancelReply() {
  replyingId.value = null
  replyDraft.value = ''
}

function onFlag(r: Review) {
  const reason = window.prompt(`Flag this review by ${r.author}?\nEnter a short reason:`, 'Abusive language')
  if (!reason) return
  flash(`Review flagged for moderation: “${reason}”`)
}
</script>

<style scoped>
.reviews { display: flex; flex-direction: column; gap: 1.5rem; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--sw-primary, #ff8838);
  color: #fff;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.btn-primary:hover { background: var(--sw-primary-hover, #e67326); }

.reviews__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 1100px) { .reviews__stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .reviews__stats { grid-template-columns: 1fr; } }

/* Breakdown */
.card {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  overflow: hidden;
}
.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #f0efec;
  flex-wrap: wrap;
  gap: 1rem;
}
.card__head h2 {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0;
}
.breakdown__overall { display: inline-flex; align-items: center; gap: 0.6rem; }
.breakdown__big {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e1e1e;
  line-height: 1;
}
.stars { display: inline-flex; gap: 1px; }
.breakdown__count { font-size: 0.82rem; color: #71717a; }

.breakdown__bars { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
.bar-row {
  display: grid;
  grid-template-columns: 30px 1fr 40px;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
}
.bar-row__label { color: #52525b; font-weight: 600; }
.bar-row__track {
  height: 8px;
  background: #f4f3f0;
  border-radius: 999px;
  overflow: hidden;
}
.bar-row__fill {
  height: 100%;
  background: var(--sw-primary, #ff8838);
  border-radius: 999px;
}
.bar-row__count { color: #71717a; text-align: right; font-variant-numeric: tabular-nums; }

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.toolbar__search {
  flex: 1;
  min-width: 240px;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 10px;
  color: #71717a;
}
.toolbar__search:focus-within {
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.1);
}
.toolbar__search input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  color: #1e1e1e;
  min-width: 0;
}
.toolbar__filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.chip {
  padding: 0.5rem 0.85rem;
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #52525b;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.chip:hover { border-color: #e4e0dc; background: #fbfaf8; }
.chip.is-active {
  background: var(--sw-primary-soft, #fff1e6);
  border-color: var(--sw-primary, #ff8838);
  color: var(--sw-primary, #ff8838);
}

/* List */
.list { display: flex; flex-direction: column; gap: 0.85rem; }

.review {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
}

.review__head { display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.75rem; }
.review__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-weight: 700;
  font-size: 0.85rem;
  color: #1e1e1e;
  flex-shrink: 0;
}
.review__meta { flex: 1; min-width: 0; }
.review__author {
  font-weight: 600;
  color: #1e1e1e;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.review__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #15803d;
  background: #dcfce7;
  padding: 2px 7px;
  border-radius: 999px;
}
.review__sub { font-size: 0.8rem; color: #71717a; margin-top: 0.1rem; }
.review__sub a { color: var(--sw-primary, #ff8838); text-decoration: none; }
.review__sub a:hover { text-decoration: underline; }

.review__stars { display: inline-flex; gap: 1px; flex-shrink: 0; }

.review__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.4rem;
}
.review__body {
  font-size: 0.92rem;
  color: #52525b;
  line-height: 1.6;
  margin: 0 0 0.85rem;
}

.review__reply {
  background: #fbfaf8;
  border-left: 3px solid var(--sw-primary, #ff8838);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.85rem;
}
.review__reply-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  font-size: 0.82rem;
}
.review__reply-author { font-weight: 600; color: #1e1e1e; }
.review__reply-role {
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.review__reply-time { color: #71717a; }
.review__reply p { margin: 0; font-size: 0.88rem; color: #52525b; line-height: 1.55; }

.review__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.review__sentiment {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
}
.review__sentiment.is-positive { background: #dcfce7; color: #15803d; }
.review__sentiment.is-neutral { background: #f4f4f5; color: #52525b; }
.review__sentiment.is-negative { background: #fee2e2; color: #b91c1c; }

.review__actions { display: flex; gap: 0.5rem; }
.btn-ghost {
  padding: 0.5rem 0.85rem;
  background: transparent;
  border: 1px solid #f0efec;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #52525b;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.15s ease;
}
.btn-ghost:hover { background: #fbfaf8; color: #1e1e1e; border-color: #e4e0dc; }
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }

.review__composer {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.review__composer textarea {
  width: 100%;
  resize: vertical;
  min-height: 70px;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e4e0dc;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1e1e1e;
  background: #fff;
}
.review__composer textarea:focus {
  outline: none;
  border-color: #ff8838;
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.15);
}
.review__composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
</style>
