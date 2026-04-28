<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">
          <span class="vw-ai-chip">AI</span>
          Insights
        </h1>
        <p class="bw-head__sub">Weekly AI report on what's working, what's risky, and what's next.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="exportPdf">Export PDF</button>
      </div>
    </header>

    <div class="in-summary bw-card">
      <div class="in-summary__week">Week of {{ weekLabel }}</div>
      <h2 class="in-summary__title">You're having a strong week.</h2>
      <p class="in-summary__body">
        Leads are up <strong>18%</strong> and demo conversion is steady. Two things to watch:
        Acme Inbox's low health score and a negative review from Truenorth Co.
      </p>
      <div class="in-summary__kpis">
        <div class="in-kpi"><span class="in-kpi__n">+18%</span><span class="in-kpi__l">Leads</span></div>
        <div class="in-kpi"><span class="in-kpi__n">+12%</span><span class="in-kpi__l">MRR</span></div>
        <div class="in-kpi"><span class="in-kpi__n">4.6★</span><span class="in-kpi__l">Avg rating</span></div>
        <div class="in-kpi"><span class="in-kpi__n">37%</span><span class="in-kpi__l">Demo win rate</span></div>
      </div>
    </div>

    <ul class="in-list">
      <li v-for="i in insights" :key="i.id" class="bw-card in-card" :class="`in-card--${i.tone}`">
        <div class="in-card__head">
          <span class="in-card__tone-chip" :class="`in-tone-${i.tone}`">{{ toneLabel(i.tone) }}</span>
          <h3 class="in-card__title">{{ i.title }}</h3>
        </div>
        <p class="in-card__body">{{ i.body }}</p>
        <NuxtLink v-if="i.cta" :to="i.cta.href" class="bw-btn bw-btn--ghost bw-btn--sm">{{ i.cta.label }}</NuxtLink>
      </li>
    </ul>

    <div class="bw-card">
      <h2 class="bw-card__title">What's next (AI recommendation)</h2>
      <ol class="in-next">
        <li>Reply to Priya Shah — hot lead, drafted &amp; waiting in Leads.</li>
        <li>Rewrite Acme Inbox description — I've queued a draft in Content assistant.</li>
        <li>Post your reply to the Truenorth Co review — drafted &amp; tone-matched.</li>
        <li>Match HubSpot's 25% discount on Acme CRM for 10 days.</li>
      </ol>
    </div>

    <div v-if="toast" class="bw-toast-fixed">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const { insights } = useVendorData()

const weekLabel = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
const toast = ref('')

function toneLabel(t: string) {
  if (t === 'win') return 'Win'
  if (t === 'risk') return 'Risk'
  return 'Note'
}
function exportPdf() {
  toast.value = 'PDF export queued — we\'ll email it in a minute.'
  setTimeout(() => toast.value = '', 2400)
}
</script>

<style scoped>
.in-summary { margin-bottom: 20px; }
.in-summary__week { font-size: 0.78rem; color: var(--vw-text-subtle); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.in-summary__title { font-family: var(--f-ui); font-size: 1.4rem; margin: 6px 0 6px; }
.in-summary__body { color: var(--vw-text-muted); line-height: 1.55; margin: 0 0 16px; font-size: 0.95rem; }
.in-summary__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.in-kpi { padding: 12px; background: var(--vw-surface-2); border-radius: 10px; display: flex; flex-direction: column; }
.in-kpi__n { font-weight: 700; font-family: var(--f-ui); font-size: 1.2rem; }
.in-kpi__l { font-size: 0.78rem; color: var(--vw-text-subtle); margin-top: 2px; }

.in-list { list-style: none; padding: 0; margin: 0 0 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
.in-card { border-left: 4px solid transparent; display: flex; flex-direction: column; gap: 10px; }
.in-card--win { border-left-color: var(--vw-health-good); }
.in-card--risk { border-left-color: var(--vw-health-poor); }
.in-card--neutral { border-left-color: var(--vw-viz-1); }

.in-card__head { display: flex; align-items: center; gap: 8px; }
.in-card__tone-chip {
  font-size: 0.68rem; padding: 2px 8px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;
}
.in-tone-win { background: #d1fae5; color: #065f46; }
.in-tone-risk { background: #fee2e2; color: #991b1b; }
.in-tone-neutral { background: var(--vw-surface-2); color: var(--vw-text-muted); }
.in-card__title { font-family: var(--f-ui); font-size: 0.95rem; margin: 0; flex: 1; }
.in-card__body { font-size: 0.88rem; color: var(--vw-text-muted); line-height: 1.5; margin: 0; }

.in-next { padding-left: 20px; margin: 0; font-size: 0.9rem; }
.in-next li { margin-bottom: 6px; }

.bw-toast-fixed {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #111827; color: white; padding: 10px 16px; border-radius: 10px;
  font-size: 0.88rem; z-index: 1000;
}
</style>
