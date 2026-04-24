<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Admin overview</h1>
        <p class="bw-head__sub">Platform health, moderation queue, and AI-surfaced risks.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/ai-moderator" class="bw-btn bw-btn--ghost">
          <span class="aw-ai-chip">AI</span>
          AI moderator
        </NuxtLink>
      </div>
    </header>

    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Total users</div>
        <div class="bw-kpi__value">{{ kpis.totalUsers.toLocaleString() }}</div>
        <div class="bw-kpi__foot">{{ kpis.totalBuyers }} buyers · {{ kpis.totalVendors }} vendors</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">MRR</div>
        <div class="bw-kpi__value">${{ fmt(kpis.mrr) }}</div>
        <div class="bw-kpi__foot">+{{ kpis.mrrGrowth }}% 12-mo</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Moderation queue</div>
        <div class="bw-kpi__value">{{ kpis.pendingApps + kpis.openFlags + kpis.openDisputes }}</div>
        <div class="bw-kpi__foot">{{ kpis.pendingApps }} apps · {{ kpis.openFlags }} flags · {{ kpis.openDisputes }} disputes</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Listings live</div>
        <div class="bw-kpi__value">{{ kpis.totalListings }}</div>
        <div class="bw-kpi__foot">Platform-wide</div>
      </div>
    </div>

    <!-- AI anomalies -->
    <section class="aw-ai-card" style="margin-bottom: 20px;">
      <h2 class="aw-ai-card__title">
        <span class="aw-ai-chip">AI</span>
        Today's risk signals
      </h2>
      <div class="anomaly-grid">
        <div v-for="a in anomalies" :key="a.id" class="aw-anomaly" :class="`aw-anomaly--${a.severity}`">
          <div class="aw-anomaly__icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          </div>
          <div style="flex: 1;">
            <h3 class="aw-anomaly__title">{{ a.title }}</h3>
            <p class="aw-anomaly__body">{{ a.body }}</p>
            <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
              <span class="aw-risk" :class="`aw-risk--${a.severity}`">{{ a.metric }}</span>
              <NuxtLink v-if="a.cta" :to="a.cta.href" class="bw-link">{{ a.cta.label }} →</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="bw-grid bw-grid--main-aside">
      <!-- Queue -->
      <section class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Moderation queue</h2>
          <NuxtLink to="/dashboard/pending-apps" class="bw-link">Open queue →</NuxtLink>
        </div>
        <ul class="q-list">
          <li v-for="a in pendingApps.filter(a => a.status === 'pending').slice(0, 4)" :key="a.id" class="q-item">
            <div class="q-logo" :style="{ background: a.color }">{{ a.logo }}</div>
            <div style="flex: 1; min-width: 0;">
              <div class="q-name">{{ a.name }}</div>
              <div class="q-meta">{{ a.vendorName }} · {{ a.submittedAt }}</div>
            </div>
            <div class="q-right">
              <span class="aw-risk" :class="riskBand(a.aiRiskScore)">risk {{ a.aiRiskScore }}</span>
              <span class="aw-ai-chip">{{ recText(a.aiRecommendation) }}</span>
            </div>
          </li>
        </ul>
      </section>

      <!-- Right rail -->
      <aside>
        <section class="bw-card" style="margin-bottom: 16px;">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Signups (7d)</h2>
          </div>
          <div class="aw-spark">
            <div v-for="(v, i) in signupsByDay" :key="i" class="aw-spark__bar" :style="{ height: (v / maxSignup * 100) + '%' }" />
          </div>
          <div class="spark-labels">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </section>

        <section class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Recent audit events</h2>
            <NuxtLink to="/dashboard/audit-log" class="bw-link">All →</NuxtLink>
          </div>
          <ul class="audit-list">
            <li v-for="e in auditLog.slice(0, 4)" :key="e.id">
              <span class="aw-role" :class="`aw-role--${e.actorRole === 'system' ? 'admin' : e.actorRole}`">{{ e.actorRole }}</span>
              <span style="flex: 1;">{{ e.action }} <strong>{{ e.target }}</strong></span>
              <span style="color: var(--aw-text-subtle); font-size: 0.78rem;">{{ e.at }}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { kpis, pendingApps, anomalies, signupsByDay, auditLog } = useAdminData()
const maxSignup = computed(() => Math.max(...signupsByDay))

function fmt(n: number) { return n.toLocaleString() }
function riskBand(n: number) {
  if (n < 30) return 'aw-risk--low'
  if (n < 60) return 'aw-risk--med'
  return 'aw-risk--high'
}
function recText(r: string) {
  if (r === 'approve') return 'AI: approve'
  if (r === 'reject') return 'AI: reject'
  return 'AI: review'
}
</script>

<style scoped>
.anomaly-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.q-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.q-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--aw-surface-2); border-radius: 10px; }
.q-logo { width: 34px; height: 34px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; }
.q-name { font-weight: 600; font-size: 0.9rem; }
.q-meta { font-size: 0.78rem; color: var(--aw-text-subtle); }
.q-right { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

.spark-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--aw-text-subtle); margin-top: 6px; }

.audit-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.audit-list li { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--aw-border); font-size: 0.85rem; }
.audit-list li:last-child { border-bottom: none; }
</style>
