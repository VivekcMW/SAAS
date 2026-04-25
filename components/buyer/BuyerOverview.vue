<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Hi {{ firstName }}, welcome back</h1>
        <p class="bw-head__sub">Here's what's happening with the apps you're evaluating.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/marketplace" class="bw-btn bw-btn--ghost">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5" stroke-linecap="round"/></svg>
          Browse marketplace
        </NuxtLink>
        <NuxtLink to="/dashboard/recommendations" class="bw-btn bw-btn--primary">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
          Get recommendations
        </NuxtLink>
      </div>
    </header>

    <!-- KPIs -->
    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Saved apps</div>
        <div class="bw-kpi__value">{{ kpis.saved }}</div>
        <div class="bw-kpi__foot">Across {{ categories }} categories</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Currently evaluating</div>
        <div class="bw-kpi__value">{{ kpis.evaluating }}</div>
        <div class="bw-kpi__foot">Shortlisted · evaluating · demos</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Open enquiries</div>
        <div class="bw-kpi__value">{{ kpis.openEnquiries }}</div>
        <div class="bw-kpi__foot">{{ unread }} unread replies</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Reviews written</div>
        <div class="bw-kpi__value">{{ kpis.reviews }}</div>
        <div class="bw-kpi__foot">{{ helpful }} people found them helpful</div>
      </div>
    </div>

    <!-- Next step banner -->
    <div v-if="nextStep" class="bw-card next-step">
      <div class="next-step__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      <div class="next-step__body">
        <div class="next-step__eyebrow">Next step</div>
        <div class="next-step__title">{{ nextStep.title }}</div>
        <div class="next-step__desc">{{ nextStep.desc }}</div>
      </div>
      <NuxtLink :to="nextStep.to" class="bw-btn bw-btn--primary">{{ nextStep.cta }}</NuxtLink>
    </div>

    <div class="bw-grid bw-grid--main-aside bw-section">
      <!-- Left: shortlist progress -->
      <section class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Your shortlist</h2>
          <NuxtLink to="/dashboard/products" class="bw-card__link">Manage →</NuxtLink>
        </div>
        <ul class="sl-list">
          <li v-for="a in savedApps.slice(0, 4)" :key="a.id" class="sl-item">
            <div class="sl-logo" :style="{ background: a.color }">{{ a.logo }}</div>
            <div class="sl-main">
              <div class="sl-name">{{ a.name }}</div>
              <div class="sl-meta">{{ a.category }} · from ${{ a.priceFrom }}/seat</div>
            </div>
            <span class="bw-chip" :class="`bw-chip--${tone(a.status)}`">{{ label(a.status) }}</span>
          </li>
        </ul>
      </section>

      <!-- Right: deals + recommend -->
      <aside class="bw-section--aside">
        <section class="bw-card" style="margin-bottom: 16px;">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Deals for you</h2>
            <NuxtLink to="/dashboard/deals" class="bw-card__link">All deals →</NuxtLink>
          </div>
          <div v-for="d in deals.slice(0, 2)" :key="d.id" class="deal-mini">
            <div class="deal-mini__head">
              <strong>{{ d.product }}</strong>
              <span class="bw-chip bw-chip--primary">{{ d.percentOff }}% OFF</span>
            </div>
            <div class="deal-mini__title">{{ d.title }}</div>
          </div>
        </section>

        <section class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Recent activity</h2>
          </div>
          <ul class="activity-list">
            <li v-for="it in digest.slice(0, 3)" :key="it.id" class="activity-item">
              <span class="activity-dot" :class="`is-${it.kind}`"></span>
              <div>
                <div class="activity-title">{{ it.title }}</div>
                <div class="activity-meta">{{ it.at }}</div>
              </div>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBuyerData, statusLabel, statusTone } from '~/composables/useBuyerData'

const props = defineProps<{ firstName?: string }>()
const firstName = computed(() => props.firstName || 'there')

const { savedApps, kpis, enquiries, reviews, deals, digest } = useBuyerData()

const categories = computed(() => new Set(savedApps.value.map(a => a.category)).size)
const unread = computed(() => enquiries.value.reduce((a, e) => a + e.unread, 0))
const helpful = computed(() => reviews.value.reduce((a, r) => a + r.helpful, 0))

const tone = (s: string) => statusTone[s as keyof typeof statusTone]
const label = (s: string) => statusLabel[s as keyof typeof statusLabel]

const nextStep = computed(() => {
  const demo = savedApps.value.find(a => a.status === 'demo-booked')
  if (demo) return { title: `Demo coming up: ${demo.name}`, desc: demo.note || 'Prepare your questions for the demo call.', cta: 'View enquiry', to: '/dashboard/enquiries' }
  const evaluating = savedApps.value.filter(a => a.status === 'evaluating')
  if (evaluating.length >= 2) return { title: `Compare ${evaluating[0].name} vs ${evaluating[1].name}`, desc: 'Finish your evaluation with a side-by-side comparison.', cta: 'Open compare', to: '/dashboard/compare' }
  if (savedApps.value.length < 3) return { title: 'Shortlist 3 apps to unlock comparisons', desc: 'Browse the marketplace and save apps you want to evaluate.', cta: 'Browse apps', to: '/marketplace' }
  return null
})
</script>

<style scoped>
.next-step {
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid var(--bw-primary);
  padding: 14px 20px 18px 22px;
}
.next-step__icon { width: 44px; height: 44px; border-radius: 12px; background: var(--bw-primary-50); color: var(--bw-primary); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.next-step__eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--bw-primary); font-weight: 700; line-height: 1; }
.next-step__title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; margin: 6px 0 3px; line-height: 1.25; }
.next-step__desc { font-size: 0.88rem; color: var(--bw-text-muted); line-height: 1.35; }
.next-step__body { flex: 1; min-width: 0; }
.next-step .bw-btn { flex-shrink: 0; }
@media (max-width: 640px) {
  .next-step { flex-wrap: wrap; padding: 14px 16px 16px 18px; }
  .next-step .bw-btn { width: 100%; justify-content: center; }
}

.sl-list { list-style: none; padding: 0; margin: 0; }
.sl-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--bw-border); }
.sl-item:last-child { border-bottom: none; }
.sl-logo { width: 40px; height: 40px; border-radius: 10px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; }
.sl-main { flex: 1; min-width: 0; }
.sl-name { font-weight: 600; color: var(--bw-text); }
.sl-meta { font-size: 0.82rem; color: var(--bw-text-muted); }

.deal-mini { padding: 10px 0; border-bottom: 1px solid var(--bw-border); }
.deal-mini:last-child { border-bottom: none; }
.deal-mini__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.deal-mini__title { font-size: 0.88rem; color: var(--bw-text-muted); }

.activity-list { list-style: none; padding: 0; margin: 0; }
.activity-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--bw-border); }
.activity-item:last-child { border-bottom: none; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 7px; flex-shrink: 0; background: var(--bw-primary); }
.activity-dot.is-new-app { background: var(--bw-info); }
.activity-dot.is-price-drop { background: var(--bw-success); }
.activity-dot.is-new-feature { background: var(--bw-primary); }
.activity-dot.is-review { background: var(--bw-warning); }
.activity-title { font-size: 0.9rem; font-weight: 500; }
.activity-meta { font-size: 0.78rem; color: var(--bw-text-subtle); margin-top: 2px; }
</style>
