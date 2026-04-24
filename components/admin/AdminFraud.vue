<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title"><span class="aw-ai-chip">AI</span> Fraud detection</h1>
        <p class="bw-head__sub">Anomaly scanning across signups, reviews, and payments.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary">Quarantine suspicious reviews</button>
      </div>
    </header>

    <div class="bw-kpis">
      <div class="bw-kpi"><div class="bw-kpi__label">High severity</div><div class="bw-kpi__value">{{ bySev.high }}</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">Medium</div><div class="bw-kpi__value">{{ bySev.med }}</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">Low</div><div class="bw-kpi__value">{{ bySev.low }}</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">Scanned (24h)</div><div class="bw-kpi__value">18.4k</div><div class="bw-kpi__foot">events</div></div>
    </div>

    <section class="anomaly-grid bw-section">
      <div v-for="a in anomalies" :key="a.id" class="aw-anomaly" :class="`aw-anomaly--${a.severity}`">
        <div class="aw-anomaly__icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
        </div>
        <div style="flex: 1;">
          <h3 class="aw-anomaly__title">{{ a.title }}</h3>
          <p class="aw-anomaly__body">{{ a.body }}</p>
          <div style="display: flex; gap: 10px; margin-top: 8px; align-items: center;">
            <span class="aw-risk" :class="`aw-risk--${a.severity}`">{{ a.metric }}</span>
            <button class="bw-btn bw-btn--subtle bw-btn--sm">Investigate</button>
            <button class="bw-btn bw-btn--ghost bw-btn--sm">Dismiss</button>
          </div>
        </div>
      </div>
    </section>

    <section class="aw-ai-card bw-section">
      <div class="aw-ai-card__title">
        <span class="aw-ai-chip">AI</span>
        How the fraud engine works
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.7;">
        <li><strong>Signup clustering</strong> — groups new accounts by IP subnet, device fingerprint, and signup timing.</li>
        <li><strong>Review burst detection</strong> — flags any listing getting &gt;5 reviews/hour from accounts &lt;30 days old.</li>
        <li><strong>Payment retry signals</strong> — correlates failed payments with card BIN patterns.</li>
        <li><strong>Trust score</strong> — each user gets a 0–100 score updated hourly based on behaviour + signup context.</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { anomalies } = useAdminData()

const bySev = computed(() => ({
  high: anomalies.value.filter(a => a.severity === 'high').length,
  med: anomalies.value.filter(a => a.severity === 'med').length,
  low: anomalies.value.filter(a => a.severity === 'low').length
}))
</script>

<style scoped>
.anomaly-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
</style>
