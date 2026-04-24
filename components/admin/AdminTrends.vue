<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title"><span class="aw-ai-chip">AI</span> Trends & forecast</h1>
        <p class="bw-head__sub">Weekly AI-generated report on platform growth.</p>
      </div>
    </header>

    <div class="bw-kpis">
      <div class="bw-kpi"><div class="bw-kpi__label">Signups (7d)</div><div class="bw-kpi__value">{{ totalSignups }}</div><div class="bw-kpi__foot">+18% vs prior week</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">New listings (7d)</div><div class="bw-kpi__value">6</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">Enquiries (7d)</div><div class="bw-kpi__value">+23%</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">Forecast MRR (EOQ)</div><div class="bw-kpi__value">$72k</div></div>
    </div>

    <section class="aw-ai-card bw-section">
      <div class="aw-ai-card__title">
        <span class="aw-ai-chip">AI</span>
        This week's summary
      </div>
      <p style="margin: 0 0 12px; line-height: 1.6;">
        Platform signups are up <strong>18%</strong> week-over-week, with strongest growth in <strong>CRM</strong> and <strong>AI tools</strong> categories. Enquiry volume rose <strong>23%</strong>, mostly from mid-market buyers (51–200 employees). Free-tier activation held flat at <strong>34%</strong>, a slight drag on the signup → MRR pipeline.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <div class="insight-row insight-row--up"><strong>Bright spot</strong><span>CRM category clicks +41%</span></div>
        <div class="insight-row insight-row--down"><strong>Watch</strong><span>2 vendors went inactive</span></div>
        <div class="insight-row insight-row--flat"><strong>Neutral</strong><span>Free → paid at 4.2%</span></div>
      </div>
    </section>

    <div class="bw-grid bw-grid--main-aside bw-section">
      <section class="bw-card">
        <div class="bw-card__head"><h2 class="bw-card__title">Signups per day (last 7)</h2></div>
        <div class="aw-spark" style="height: 140px;">
          <div v-for="(v, i) in signupsByDay" :key="i" class="aw-spark__bar" :style="{ height: (v / maxS * 100) + '%' }" :title="v + ' signups'" />
        </div>
        <div class="day-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      </section>

      <aside class="bw-card">
        <h2 class="bw-card__title">Forecast (next 90d)</h2>
        <ul class="forecast-list">
          <li><span>Signups</span><strong class="up">+22%</strong></li>
          <li><span>MRR</span><strong class="up">+17%</strong></li>
          <li><span>Listings</span><strong class="up">+14</strong></li>
          <li><span>Churn</span><strong class="down">~3%</strong></li>
        </ul>
        <p style="margin-top: 12px; font-size: 0.82rem; color: var(--aw-text-muted);">Confidence: 78%. Based on 12-month trend + seasonality.</p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { signupsByDay } = useAdminData()
const maxS = computed(() => Math.max(...signupsByDay))
const totalSignups = computed(() => signupsByDay.reduce((a, b) => a + b, 0))
</script>

<style scoped>
.insight-row { display: flex; flex-direction: column; padding: 10px 12px; border-radius: 8px; font-size: 0.85rem; border-left: 3px solid; }
.insight-row--up { border-color: var(--aw-risk-low); background: var(--aw-risk-low-50); }
.insight-row--down { border-color: var(--aw-risk-high); background: var(--aw-risk-high-50); }
.insight-row--flat { border-color: var(--aw-risk-med); background: var(--aw-risk-med-50); }
.insight-row strong { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }

.day-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--aw-text-subtle); margin-top: 6px; }

.forecast-list { list-style: none; padding: 0; margin: 0; }
.forecast-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--aw-border); }
.forecast-list li:last-child { border-bottom: none; }
.up { color: var(--aw-risk-low); }
.down { color: var(--aw-risk-high); }
</style>
