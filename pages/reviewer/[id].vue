<template>
  <div class="reviewer-page">
    <div v-if="pending" class="reviewer-loading container"><div class="spinner" /></div>

    <div v-else-if="error || !profile" class="reviewer-empty container">
      <h1>Reviewer not found</h1>
      <NuxtLink to="/marketplace">Browse Marketplace →</NuxtLink>
    </div>

    <template v-else>
      <nav class="bc container" aria-label="Breadcrumb">
        <NuxtLink to="/" class="bc__link">moonmart.ai</NuxtLink>
        <span class="bc__sep">›</span>
        <span class="bc__current">{{ profile.displayName }}</span>
      </nav>

      <!-- Profile header -->
      <section class="reviewer-hero">
        <div class="container reviewer-hero__inner">
          <div class="reviewer-avatar">{{ profile.displayName[0]?.toUpperCase() }}</div>
          <div class="reviewer-info">
            <h1 class="reviewer-info__name">{{ profile.displayName }}</h1>
            <span class="reviewer-info__badge">{{ profile.badgeLevel }}</span>
            <p class="reviewer-info__meta">
              Member since {{ formatDate(profile.memberSince) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="reviewer-stats container">
        <div class="reviewer-stat">
          <div class="reviewer-stat__val">{{ profile.reviewCount }}</div>
          <div class="reviewer-stat__label">Reviews</div>
        </div>
        <div class="reviewer-stat">
          <div class="reviewer-stat__val">{{ profile.verifiedReviews }}</div>
          <div class="reviewer-stat__label">Verified</div>
        </div>
        <div class="reviewer-stat">
          <div class="reviewer-stat__val">{{ profile.averageRating.toFixed(1) }}</div>
          <div class="reviewer-stat__label">Avg Rating</div>
        </div>
        <div class="reviewer-stat">
          <div class="reviewer-stat__val">{{ profile.helpfulVotes }}</div>
          <div class="reviewer-stat__label">Helpful Votes</div>
        </div>
      </section>

      <!-- Reviews list -->
      <section class="reviewer-reviews container">
        <h2 class="reviewer-reviews__title">Reviews by {{ profile.displayName }}</h2>
        <div class="reviewer-review-list">
          <article v-for="rev in reviews" :key="rev.id" class="reviewer-card">
            <div class="reviewer-card__app">
              <NuxtLink :to="`/marketplace/app/${rev.app.slug}`" class="reviewer-card__app-name">{{ rev.app.name }}</NuxtLink>
              <span class="reviewer-card__app-cat">{{ rev.app.category }}</span>
            </div>
            <div class="reviewer-card__rating-row">
              <span class="reviewer-card__stars" :aria-label="`${rev.rating} out of 5 stars`"><BaseRating :value="rev.rating" :max="5" /></span>
              <span v-if="rev.verified" class="reviewer-card__verified">Verified</span>
              <span class="reviewer-card__date">{{ formatDate(rev.createdAt) }}</span>
            </div>
            <h3 class="reviewer-card__title">{{ rev.title }}</h3>
            <p class="reviewer-card__content">{{ rev.content }}</p>
            <div class="reviewer-card__helpful">{{ rev.helpfulVotes }} found this helpful</div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
interface ReviewerProfile {
  userId: string; displayName: string; reviewCount: number; verifiedReviews: number
  averageRating: number; helpfulVotes: number; badgeLevel: string; memberSince: string
}
interface ReviewItem {
  id: string; rating: number; title: string; content: string; verified: boolean
  helpfulVotes: number; createdAt: string; app: { name: string; slug: string; category: string }
}

const route = useRoute()
const id = route.params.id as string

const { data, pending, error } = await useFetch<{ profile: ReviewerProfile; reviews: ReviewItem[] }>(
  `/api/reviewers/${id}`, { key: `reviewer-${id}` }
)

const profile = computed(() => data.value?.profile || null)
const reviews = computed(() => data.value?.reviews || [])

function formatDate(str: string) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

useHead(() => {
  if (!profile.value) return {}
  const p = profile.value
  return {
    title: `${p.displayName} — ${p.reviewCount} Verified SaaS Reviews | moonmart.ai`,
    meta: [
      { name: 'description', content: `${p.displayName} has written ${p.reviewCount} verified SaaS reviews on moonmart.ai. ${p.badgeLevel} · ${p.helpfulVotes} helpful votes.` },
      { name: 'robots', content: 'index, follow' }
    ],
    link: [{ rel: 'canonical', href: `https://moonmart.ai/reviewer/${id}` }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: p.displayName,
        url: `https://moonmart.ai/reviewer/${id}`,
        description: `${p.badgeLevel} on moonmart.ai with ${p.reviewCount} verified reviews.`
      })
    }]
  }
})
</script>

<style scoped>
.reviewer-page { min-height: 100vh; }
.container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
.reviewer-loading, .reviewer-empty { text-align: center; padding: 80px 0; }
.bc { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; }
.bc__link { color: var(--aw-accent); text-decoration: none; }
.bc__sep, .bc__current { color: var(--aw-text-muted); }
.reviewer-hero { padding: 40px 0 28px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.reviewer-hero__inner { max-width: 960px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 20px; }
.reviewer-avatar { width: 64px; height: 64px; background: var(--aw-accent); color: #fff; font-size: 1.6rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.reviewer-info__name { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
.reviewer-info__badge { display: inline-block; padding: 3px 12px; background: var(--aw-accent-50, #eff6ff); color: var(--aw-accent); border-radius: 999px; font-size: 0.72rem; font-weight: 700; margin-bottom: 6px; }
.reviewer-info__meta { font-size: 0.8rem; color: var(--aw-text-muted); }
.reviewer-stats { display: flex; gap: 0; border: 1.5px solid var(--aw-border); border-radius: 14px; overflow: hidden; margin: 28px 0; }
.reviewer-stat { flex: 1; padding: 20px; text-align: center; border-right: 1px solid var(--aw-border); }
.reviewer-stat:last-child { border-right: none; }
.reviewer-stat__val { font-size: 1.6rem; font-weight: 800; color: var(--aw-accent); }
.reviewer-stat__label { font-size: 0.75rem; color: var(--aw-text-muted); margin-top: 2px; }
.reviewer-reviews { padding-bottom: 64px; }
.reviewer-reviews__title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; }
.reviewer-review-list { display: flex; flex-direction: column; gap: 14px; }
.reviewer-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 20px; }
.reviewer-card__app { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.reviewer-card__app-name { font-weight: 700; font-size: 0.9rem; color: var(--aw-accent); text-decoration: none; }
.reviewer-card__app-name:hover { text-decoration: underline; }
.reviewer-card__app-cat { font-size: 0.72rem; color: var(--aw-text-muted); text-transform: uppercase; }
.reviewer-card__rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.reviewer-card__stars { color: #f59e0b; font-size: 0.9rem; letter-spacing: 1px; }
.reviewer-card__verified { background: var(--aw-green-50, #ecfdf5); color: var(--aw-green-700, #047857); font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.reviewer-card__date { font-size: 0.75rem; color: var(--aw-text-muted); margin-left: auto; }
.reviewer-card__title { font-size: 0.9rem; font-weight: 700; margin-bottom: 6px; }
.reviewer-card__content { font-size: 0.84rem; color: var(--aw-text-muted); line-height: 1.6; margin-bottom: 10px; }
.reviewer-card__helpful { font-size: 0.75rem; color: var(--aw-text-muted); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
