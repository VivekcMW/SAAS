<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">My reviews</h1>
        <p class="bw-head__sub">Reviews you've written, plus apps you could review next.</p>
      </div>
    </header>

    <!-- KPIs -->
    <div class="bw-kpis" style="grid-template-columns: repeat(3, 1fr); max-width: 640px;">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Reviews written</div>
        <div class="bw-kpi__value">{{ reviews.length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Average rating given</div>
        <div class="bw-kpi__value">★ {{ avgRating }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">People helped</div>
        <div class="bw-kpi__value">{{ totalHelpful }}</div>
      </div>
    </div>

    <div class="bw-grid bw-grid--main-aside">
      <!-- My reviews -->
      <section class="bw-card" style="padding: 0;">
        <div class="bw-card__head" style="padding: 20px 20px 0;">
          <h2 class="bw-card__title">Your reviews</h2>
        </div>
        <ul v-if="reviews.length" class="rev-list">
          <li v-for="r in reviews" :key="r.id" class="rev-item">
            <div class="rev-head">
              <NuxtLink :to="`/app/${r.productSlug}`" class="rev-product">{{ r.product }}</NuxtLink>
              <div class="rev-stars" :title="`${r.rating} / 5`">
                <span v-for="n in 5" :key="n" class="rev-star" :class="{ 'is-on': n <= r.rating }">★</span>
              </div>
            </div>
            <h3 class="rev-title">{{ r.title }}</h3>
            <p class="rev-body">{{ r.body }}</p>
            <div class="rev-foot">
              <span>{{ formatDate(r.createdAt) }}</span>
              <span>· {{ r.helpful }} found helpful</span>
              <span v-if="r.vendorReplied" class="bw-chip bw-chip--success" style="margin-left: auto;">Vendor replied</span>
            </div>
          </li>
        </ul>
        <div v-else class="bw-empty" style="border: 0;">
          <h3 class="bw-empty__title">No reviews yet</h3>
          <p class="bw-empty__desc">Share your experience with apps you use to help other buyers.</p>
        </div>
      </section>

      <!-- Apps to review -->
      <aside>
        <section class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Apps you could review</h2>
          </div>
          <p style="font-size: 0.86rem; color: var(--bw-text-muted); margin-bottom: 12px;">Saved apps you haven't reviewed yet.</p>
          <ul class="review-next">
            <li v-for="a in reviewable" :key="a.id" class="review-next__item">
              <div class="review-next__logo" :style="{ background: a.color }">{{ a.logo }}</div>
              <div class="review-next__body">
                <div class="review-next__name">{{ a.name }}</div>
                <div class="review-next__cat">{{ a.category }}</div>
              </div>
              <NuxtLink :to="`/app/${a.slug}#review`" class="bw-btn bw-btn--ghost bw-btn--sm">Write</NuxtLink>
            </li>
          </ul>
          <div v-if="!reviewable.length" style="font-size: 0.86rem; color: var(--bw-text-muted);">You're all caught up — nice work.</div>
        </section>

        <section class="bw-card" style="margin-top: 16px; background: var(--bw-primary-50); border-color: var(--bw-primary);">
          <h3 style="font-family: var(--f-ui); margin: 0 0 8px; font-size: 0.95rem;">Verified Buyer badge</h3>
          <p style="font-size: 0.86rem; color: var(--bw-text); margin: 0 0 12px;">Write 3 verified reviews to unlock the Verified Buyer badge on your profile.</p>
          <div class="progress"><div class="progress__fill" :style="{ width: `${progress}%` }"></div></div>
          <div style="font-size: 0.78rem; color: var(--bw-text-muted); margin-top: 6px;">{{ reviews.length }} / 3 reviews</div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBuyerData } from '~/composables/useBuyerData'

const { reviews, savedApps } = useBuyerData()

const avgRating = computed(() => {
  if (!reviews.value.length) return '—'
  return (reviews.value.reduce((a, r) => a + r.rating, 0) / reviews.value.length).toFixed(1)
})
const totalHelpful = computed(() => reviews.value.reduce((a, r) => a + r.helpful, 0))
const reviewable = computed(() => {
  const reviewed = new Set(reviews.value.map(r => r.productSlug))
  return savedApps.value.filter(a => !reviewed.has(a.slug)).slice(0, 4)
})
const progress = computed(() => Math.min(100, (reviews.value.length / 3) * 100))

const formatDate = (s: string) => new Date(s).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
</script>

<style scoped>
.rev-list { list-style: none; margin: 0; padding: 0; }
.rev-item { padding: 20px; border-top: 1px solid var(--bw-border); }
.rev-item:first-child { border-top: none; }
.rev-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.rev-product { font-weight: 700; color: var(--bw-text); text-decoration: none; }
.rev-product:hover { color: var(--bw-primary); }
.rev-stars { color: var(--bw-border-strong); font-size: 1rem; letter-spacing: 1px; }
.rev-star.is-on { color: var(--bw-warning); }
.rev-title { font-family: var(--f-ui); font-size: 1rem; font-weight: 600; margin: 0 0 6px; color: var(--bw-primary); }
.rev-body { color: var(--bw-text-muted); font-size: 0.88rem; margin: 0 0 10px; }
.rev-foot { display: flex; gap: 6px; font-size: 0.78rem; color: var(--bw-text-subtle); align-items: center; }

.review-next { list-style: none; margin: 0; padding: 0; }
.review-next__item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--bw-border); }
.review-next__item:first-child { border-top: none; }
.review-next__logo { width: 32px; height: 32px; border-radius: 8px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: var(--f-ui); font-weight: 700; font-size: 0.82rem; }
.review-next__body { flex: 1; min-width: 0; }
.review-next__name { font-weight: 600; font-size: 0.88rem; color: var(--bw-text); }
.review-next__cat { font-size: 0.78rem; color: var(--bw-text-subtle); }

.progress { height: 6px; border-radius: 999px; background: var(--bw-surface); overflow: hidden; }
.progress__fill { height: 100%; background: var(--bw-primary); transition: width .3s ease; }
</style>
