<template>
  <div class="vw">
    <!-- Header -->
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">{{ greeting }} — here's your pulse</h1>
        <p class="bw-head__sub">Leads, listings, and the 3 things worth doing today.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/copilot" class="bw-btn bw-btn--primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Ask copilot
        </NuxtLink>
      </div>
    </header>

    <!-- KPIs -->
    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Active listings</div>
        <div class="bw-kpi__value">{{ kpis.activeListings }} / {{ kpis.totalListings }}</div>
        <div class="bw-kpi__foot">Across {{ kpis.totalListings }} products</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Open leads</div>
        <div class="bw-kpi__value">{{ kpis.openLeads }}</div>
        <div class="bw-kpi__foot">{{ kpis.hotLeads }} hot</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Views (30d)</div>
        <div class="bw-kpi__value">{{ fmt(kpis.views30d) }}</div>
        <div class="bw-kpi__foot">{{ kpis.leads30d }} leads</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Avg rating</div>
        <div class="bw-kpi__value">★ {{ kpis.avgRating }}</div>
        <div class="bw-kpi__foot">MRR ${{ fmt(kpis.mrr) }}</div>
      </div>
    </div>

    <!-- Onboarding checklist (hides automatically once all done) -->
    <div v-if="!onboardingDone" class="bw-card ob-card bw-section">
      <div class="ob-head">
        <div>
          <h2 class="bw-card__title">Get set up — {{ obStepsDone }}/{{ obSteps.length }} done</h2>
          <p class="ob-sub">Complete these to start generating leads.</p>
        </div>
        <div class="ob-progress-ring" :style="{ '--pct': obPct }">
          <span class="ob-progress-ring__num">{{ obPct }}%</span>
        </div>
      </div>
      <ol class="ob-list">
        <li v-for="step in obSteps" :key="step.id" class="ob-step" :class="{ 'is-done': step.done }">
          <span class="ob-step__check">
            <svg v-if="step.done" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <div class="ob-step__body">
            <div class="ob-step__label">{{ step.label }}</div>
            <div class="ob-step__hint">{{ step.hint }}</div>
          </div>
          <NuxtLink v-if="!step.done" :to="step.to" class="bw-btn bw-btn--subtle bw-btn--sm">{{ step.cta }}</NuxtLink>
        </li>
      </ol>
    </div>

    <!-- AI Today actions -->
    <div class="vw-ai-card today-actions">
      <div class="vw-ai-card__title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        Top 3 actions for today (AI-ranked by revenue impact)
      </div>
      <ul class="today-list">
        <li v-for="a in todayActions" :key="a.id" class="today-item">
          <span class="today-impact" :class="`is-${a.impact}`">{{ a.impact }}</span>
          <div class="today-body">
            <div class="today-title">{{ a.title }}</div>
            <div class="today-why">{{ a.why }}</div>
          </div>
          <NuxtLink :to="a.to" class="bw-btn bw-btn--subtle bw-btn--sm">{{ a.cta }}</NuxtLink>
        </li>
      </ul>
    </div>

    <div class="bw-grid bw-grid--main-aside bw-section">
      <!-- Left: recent leads -->
      <section class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Recent leads</h2>
          <NuxtLink to="/dashboard/leads" class="bw-card__link">All leads →</NuxtLink>
        </div>
        <ul class="rl-list">
          <li v-for="l in leads.slice(0, 4)" :key="l.id" class="rl-item">
            <div class="rl-avatar">{{ l.buyerName.charAt(0) }}</div>
            <div class="rl-main">
              <div class="rl-name">{{ l.buyerName }} · <span class="rl-company">{{ l.buyerCompany }}</span></div>
              <div class="rl-subject">{{ l.subject }}</div>
            </div>
            <span class="bw-chip" :class="tempClass(l.temperature)">{{ l.temperature }}</span>
            <span class="rl-time">{{ l.updatedAt }}</span>
          </li>
        </ul>
      </section>

      <!-- Right: listing health + insights -->
      <aside>
        <div class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Listing health</h2>
            <NuxtLink to="/dashboard/products" class="bw-card__link">Manage →</NuxtLink>
          </div>
          <ul class="lh-list">
            <li v-for="l in listings" :key="l.id" class="lh-item">
              <div class="lh-logo" :style="{ background: l.color }">{{ l.logo }}</div>
              <div class="lh-main">
                <div class="lh-name">{{ l.name }}</div>
                <div class="vw-health-bar">
                  <div class="vw-health-bar__fill" :class="healthBar(l.healthScore)" :style="{ width: l.healthScore + '%' }" />
                </div>
              </div>
              <div class="vw-health" :class="healthClass(l.healthScore)">
                <span class="vw-health__dot" />
                {{ l.healthScore }}
              </div>
            </li>
          </ul>
        </div>

        <div class="bw-card bw-section">
          <div class="bw-card__head">
            <h2 class="bw-card__title">This week, from AI</h2>
            <NuxtLink to="/dashboard/insights" class="bw-card__link">All →</NuxtLink>
          </div>
          <ul class="ai-insights">
            <li v-for="i in insights.slice(0, 2)" :key="i.id" class="ai-ins-item" :class="`is-${i.tone}`">
              <div class="ai-ins-delta">{{ i.delta }}</div>
              <div class="ai-ins-head">{{ i.headline }}</div>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
const { kpis, todayActions, leads, listings, insights, promotions } = useVendorData()
const { fmtNumber } = useFmt()
function fmt(n: number) { return fmtNumber(n) }

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

// Onboarding checklist
const obSteps = computed(() => [
  {
    id: 'listing',
    label: 'Create your first listing',
    hint: 'Describe your product so buyers can find it.',
    to: '/dashboard/products',
    cta: 'Add listing',
    done: kpis.totalListings > 0
  },
  {
    id: 'live',
    label: 'Publish a listing',
    hint: 'Go live so buyers can discover and enquire.',
    to: '/dashboard/products',
    cta: 'Manage listings',
    done: kpis.activeListings > 0
  },
  {
    id: 'lead',
    label: 'Reply to your first lead',
    hint: 'Fast replies win deals. Aim to respond within 2 hours.',
    to: '/dashboard/leads',
    cta: 'View leads',
    done: leads.value.some(l => l.status === 'replied')
  },
  {
    id: 'review',
    label: 'Collect your first review',
    hint: 'Reviews are your #1 ranking signal on Moonmart.',
    to: '/dashboard/review-requests',
    cta: 'Send request',
    done: kpis.avgRating > 0
  },
  {
    id: 'promo',
    label: 'Launch a promotion or deal',
    hint: 'Discounts and featured placements drive 3× more leads.',
    to: '/dashboard/promotions',
    cta: 'Add promotion',
    done: promotions.value.length > 0
  }
])
const obStepsDone = computed(() => obSteps.value.filter(s => s.done).length)
const obPct = computed(() => Math.round(obStepsDone.value / obSteps.value.length * 100))
const onboardingDone = computed(() => obStepsDone.value === obSteps.value.length)
function tempClass(t: string) {
  if (t === 'hot') return 'bw-chip--danger'
  if (t === 'warm') return 'bw-chip--warning'
  return 'bw-chip--neutral'
}
function healthClass(s: number) {
  if (s >= 75) return 'vw-health--good'
  if (s >= 50) return 'vw-health--fair'
  return 'vw-health--poor'
}
function healthBar(s: number) {
  if (s >= 75) return 'vw-health-bar__fill--good'
  if (s >= 50) return 'vw-health-bar__fill--fair'
  return 'vw-health-bar__fill--poor'
}
</script>

<style scoped>
/* Onboarding checklist */
.ob-card { background: var(--vw-primary-50); border-color: var(--vw-primary); }
.ob-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.ob-sub { font-size: 0.84rem; color: var(--vw-text-muted); margin: 4px 0 0; }

.ob-progress-ring {
  --pct: 0;
  width: 52px; height: 52px; flex-shrink: 0;
  border-radius: 50%;
  background: conic-gradient(var(--vw-primary) calc(var(--pct) * 1%), var(--vw-surface-2) 0%);
  display: flex; align-items: center; justify-content: center;
}
.ob-progress-ring__num { font-size: 0.72rem; font-weight: 700; color: var(--vw-text); background: var(--vw-surface); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; }

.ob-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
.ob-step {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0; border-top: 1px solid var(--vw-border);
}
.ob-step:first-child { border-top: none; }
.ob-step__check {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid var(--vw-border-strong);
  display: flex; align-items: center; justify-content: center;
}
.ob-step.is-done .ob-step__check { background: var(--vw-primary); border-color: var(--vw-primary); color: white; }
.ob-step.is-done .ob-step__label { text-decoration: line-through; color: var(--vw-text-muted); }
.ob-step__body { flex: 1; min-width: 0; }
.ob-step__label { font-size: 0.9rem; font-weight: 600; }
.ob-step__hint { font-size: 0.8rem; color: var(--vw-text-muted); margin-top: 2px; }

.today-actions { margin-bottom: 24px; }
.today-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.today-item {
  display: flex; align-items: center; gap: 14px;
  background: var(--vw-surface); border: 1px solid var(--vw-border);
  border-radius: 10px; padding: 12px 14px;
}
.today-impact {
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
  padding: 3px 8px; border-radius: 4px; letter-spacing: 0.05em;
}
.today-impact.is-high { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.today-impact.is-med { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.today-impact.is-low { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.today-body { flex: 1; min-width: 0; }
.today-title { font-weight: 600; font-size: 0.92rem; color: var(--vw-text); }
.today-why { font-size: 0.82rem; color: var(--vw-text-muted); margin-top: 2px; }

.rl-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.rl-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--vw-border); }
.rl-item:last-child { border: none; }
.rl-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--vw-primary); color: white; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rl-main { flex: 1; min-width: 0; }
.rl-name { font-weight: 600; font-size: 0.9rem; }
.rl-company { color: var(--vw-text-muted); font-weight: 400; }
.rl-subject { font-size: 0.82rem; color: var(--vw-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rl-time { font-size: 0.75rem; color: var(--vw-text-subtle); white-space: nowrap; }

.lh-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.lh-item { display: flex; align-items: center; gap: 12px; }
.lh-logo {
  width: 32px; height: 32px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
}
.lh-main { flex: 1; min-width: 0; }
.lh-name { font-size: 0.88rem; font-weight: 600; margin-bottom: 6px; }

.ai-insights { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.ai-ins-item {
  padding: 10px 12px; border-radius: 8px; background: var(--vw-surface-2);
  border-left: 3px solid var(--vw-text-subtle);
}
.ai-ins-item.is-win { border-left-color: var(--vw-health-good); }
.ai-ins-item.is-risk { border-left-color: var(--vw-health-poor); }
.ai-ins-delta { font-size: 0.72rem; font-weight: 700; color: var(--vw-text-muted); }
.ai-ins-head { font-size: 0.88rem; font-weight: 600; margin-top: 2px; }
</style>
