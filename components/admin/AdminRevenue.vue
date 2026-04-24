<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Revenue</h1>
        <p class="bw-head__sub">Platform MRR and vendor earnings.</p>
      </div>
    </header>

    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">MRR</div>
        <div class="bw-kpi__value">${{ fmt(kpis.mrr) }}</div>
        <div class="bw-kpi__foot">+{{ kpis.mrrGrowth }}% 12-mo</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Platform fee</div>
        <div class="bw-kpi__value">${{ fmt(kpis.platformFee) }}</div>
        <div class="bw-kpi__foot">23% take rate</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Paid vendors</div>
        <div class="bw-kpi__value">8</div>
        <div class="bw-kpi__foot">+2 this quarter</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">ARR (run rate)</div>
        <div class="bw-kpi__value">${{ fmt(kpis.mrr * 12) }}</div>
      </div>
    </div>

    <div class="bw-grid bw-grid--main-aside bw-section">
      <section class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">MRR (12 months)</h2>
        </div>
        <div class="rev-chart">
          <div v-for="(v, i) in mrrTrend" :key="i" class="rev-bar" :style="{ height: (v / maxMrr * 100) + '%' }" :title="`$${v.toLocaleString()}`">
            <span class="rev-bar__label" v-if="i % 2 === 0 || i === mrrTrend.length - 1">{{ months[i] }}</span>
          </div>
        </div>
      </section>

      <aside class="bw-card">
        <h2 class="bw-card__title">Top vendors</h2>
        <ul class="top-list">
          <li><strong>Acme Technologies</strong><span>$3,640/mo</span></li>
          <li><strong>Nebula Data Co.</strong><span>$2,180/mo</span></li>
          <li><strong>FlowDesk Inc.</strong><span>$1,920/mo</span></li>
          <li><strong>Wolfsoft Labs</strong><span>$1,480/mo</span></li>
        </ul>
      </aside>
    </div>

    <div class="aw-ai-card" style="margin-top: 20px;">
      <div class="aw-ai-card__title">
        <span class="aw-ai-chip">AI</span>
        Revenue insight
      </div>
      <p style="margin: 0; font-size: 0.9rem; line-height: 1.55;">
        Growth is driven by vendor mix — MRR per vendor is up 14% YoY. Biggest risk: <strong>2 Free-tier vendors</strong> went inactive in the last 30 days. Forecast: if growth holds, MRR hits <strong>~$72k</strong> by end of next quarter.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { kpis, mrrTrend } = useAdminData()
const maxMrr = computed(() => Math.max(...mrrTrend))
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

function fmt(n: number) { return n.toLocaleString() }
</script>

<style scoped>
.rev-chart { display: flex; align-items: flex-end; gap: 6px; height: 180px; padding: 0 4px; }
.rev-bar { flex: 1; background: var(--aw-accent); border-radius: 4px 4px 0 0; min-height: 4px; position: relative; transition: opacity 0.15s; }
.rev-bar:hover { opacity: 0.8; }
.rev-bar__label { position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: var(--aw-text-subtle); }

.top-list { list-style: none; padding: 0; margin: 0; }
.top-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--aw-border); font-size: 0.88rem; }
.top-list li:last-child { border-bottom: none; }
.top-list span { color: var(--aw-text-muted); font-weight: 600; }
</style>
