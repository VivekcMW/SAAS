<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Revenue</h1>
        <p class="bw-head__sub">Platform MRR and vendor earnings.</p>
      </div>
    </header>

    <!-- KPI strip -->
    <div class="bw-kpis">
      <template v-if="liveStatsLoading">
        <div v-for="i in 4" :key="i" class="bw-kpi rev-kpi-skel" />
      </template>
      <template v-else>
        <div class="bw-kpi">
          <div class="bw-kpi__label">MRR</div>
          <div class="bw-kpi__value">${{ kpis.mrr.toLocaleString() }}</div>
          <div class="bw-kpi__foot rev-kpi-foot--up">↑ {{ kpis.mrrGrowth }}% over 12 months</div>
        </div>
        <div class="bw-kpi">
          <div class="bw-kpi__label">ARR (run rate)</div>
          <div class="bw-kpi__value">${{ (kpis.mrr * 12).toLocaleString() }}</div>
          <div class="bw-kpi__foot">Annualised from MRR</div>
        </div>
        <div class="bw-kpi">
          <div class="bw-kpi__label">Platform take</div>
          <div class="bw-kpi__value">${{ kpis.platformFee.toLocaleString() }}</div>
          <div class="bw-kpi__foot">23% take rate</div>
        </div>
        <div class="bw-kpi">
          <div class="bw-kpi__label">Paid vendors</div>
          <div class="bw-kpi__value">8</div>
          <div class="bw-kpi__foot rev-kpi-foot--up">↑ 2 this quarter</div>
        </div>
      </template>
    </div>

    <!-- Charts -->
    <div class="bw-grid bw-grid--main-aside rev-section">

      <!-- MRR chart -->
      <section class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">MRR trend — 12 months</h2>
          <span class="rev-latest-mrr">${{ mrrTrend[mrrTrend.length - 1].toLocaleString() }} latest</span>
        </div>
        <div class="rev-chart-wrap">
          <div class="rev-y-axis">
            <span>${{ (maxMrr / 1000).toFixed(0) }}k</span>
            <span>${{ (maxMrr / 2 / 1000).toFixed(0) }}k</span>
            <span>$0</span>
          </div>
          <div class="rev-chart-area">
            <div class="rev-gridlines">
              <div class="rev-gridline" />
              <div class="rev-gridline" />
              <div class="rev-gridline" />
            </div>
            <div class="rev-bars">
              <div
                v-for="(v, i) in mrrTrend"
                :key="i"
                class="rev-bar-col"
              >
                <div
                  class="rev-bar"
                  :style="{ height: (v / maxMrr * 100) + '%' }"
                  :title="`${months[i]}: $${v.toLocaleString()}`"
                />
                <span class="rev-bar__label">{{ months[i] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Top vendors -->
      <aside class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Top vendors</h2>
          <span class="rev-aside-sub">by MRR</span>
        </div>
        <ul class="top-list">
          <template v-if="liveStatsLoading">
            <li v-for="i in 5" :key="i" class="rev-vendor-skel" />
          </template>
          <template v-else>
            <li v-for="(v, i) in topVendors" :key="v.name">
              <div class="tv-rank">{{ i + 1 }}</div>
              <div class="tv-body">
                <strong class="tv-name">{{ v.name }}</strong>
                <div class="tv-bar-track">
                  <div class="tv-bar-fill" :style="{ width: (v.mrr / topVendors[0].mrr * 100) + '%' }" />
                </div>
              </div>
              <span class="tv-mrr">${{ v.mrr.toLocaleString() }}/mo</span>
            </li>
          </template>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
const { kpis, mrrTrend, loadLiveStats, liveStatsLoading } = useAdminData()
const maxMrr = computed(() => Math.max(...mrrTrend))
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

const topVendors = [
  { name: 'Acme Technologies', mrr: 3640 },
  { name: 'Nebula Data Co.',   mrr: 2180 },
  { name: 'FlowDesk Inc.',     mrr: 1920 },
  { name: 'Wolfsoft Labs',     mrr: 1480 },
  { name: 'Prism Analytics',  mrr: 980  },
]

onMounted(() => loadLiveStats())
</script>

<style scoped>
/* ── KPI strip ─────────────────────────────────────────────── */
.rev-kpi-skel {
  min-height: 88px;
  background: var(--bw-surface-2);
  border-radius: var(--bw-radius);
  animation: rev-pulse 1.5s infinite;
}
.rev-kpi-foot--up { color: var(--bw-success, #2A9D8F); }

/* ── Chart layout ──────────────────────────────────────────── */
.rev-section { margin-top: 20px; }

.rev-chart-wrap {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

/* Y-axis labels */
.rev-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 22px;         /* align with bar labels */
  font-size: 0.68rem;
  color: var(--bw-text-subtle);
  white-space: nowrap;
  min-width: 36px;
}

/* Chart area: gridlines + bars stacked */
.rev-chart-area {
  flex: 1;
  position: relative;
  height: 200px;
  padding-bottom: 22px;         /* room for month labels */
}

.rev-gridlines {
  position: absolute;
  inset: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.rev-gridline {
  border-top: 1px dashed var(--bw-border, rgba(168,180,204,.15));
}

.rev-bars {
  position: absolute;
  inset: 0 0 22px 0;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  padding: 0 2px;
}

.rev-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  gap: 0;
}

.rev-bar {
  width: 100%;
  background: var(--aw-accent);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: opacity 0.15s, filter 0.15s;
  position: relative;
}
.rev-bar:hover {
  opacity: 0.75;
  filter: brightness(1.2);
}

.rev-bar__label {
  font-size: 0.67rem;
  color: var(--bw-text-subtle);
  margin-top: 5px;
  height: 16px;
  line-height: 16px;
}

/* Latest MRR badge in card head */
.rev-latest-mrr {
  font-size: 0.8rem;
  color: var(--bw-text-muted);
  font-weight: 500;
}

/* ── Top vendors ───────────────────────────────────────────── */
.rev-aside-sub {
  font-size: 0.78rem;
  color: var(--bw-text-subtle);
}

.top-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.top-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
}

.tv-rank {
  width: 20px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--bw-text-subtle);
  flex-shrink: 0;
}

.tv-body {
  flex: 1;
  min-width: 0;
}

.tv-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.tv-bar-track {
  height: 5px;
  background: var(--bw-border);
  border-radius: 99px;
  overflow: hidden;
}

.tv-bar-fill {
  height: 100%;
  background: var(--aw-accent);
  border-radius: 99px;
  transition: width 0.4s ease;
}

.tv-mrr {
  font-size: 0.82rem;
  color: var(--bw-text-muted);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.rev-vendor-skel {
  height: 38px;
  border-radius: 8px;
  background: var(--bw-surface-2);
  animation: rev-pulse 1.5s infinite;
}

@keyframes rev-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
</style>
