<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Overview</h1>
        <p class="bw-head__sub">Platform health at a glance.</p>
      </div>
    </header>

    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Users</div>
        <div class="bw-kpi__value">{{ kpis.totalUsers }}</div>
        <div class="bw-kpi__foot">{{ kpis.totalBuyers }} buyers · {{ kpis.totalVendors }} vendors</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Live apps</div>
        <div class="bw-kpi__value">{{ kpis.liveApps }}</div>
        <div class="bw-kpi__foot">{{ kpis.pendingApps }} pending</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">MRR</div>
        <div class="bw-kpi__value">${{ (kpis.mrr ?? 0).toLocaleString() }}</div>
        <div class="bw-kpi__foot">+{{ kpis.mrrGrowth ?? 0 }}% 12-mo</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Intent signals</div>
        <div class="bw-kpi__value">{{ liveStats?.intentEvents?.last30d ?? '—' }}</div>
        <div class="bw-kpi__foot">Last 30 days</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Discovery queue</div>
        <div class="bw-kpi__value">
          <NuxtLink to="/dashboard/discovery" class="bw-kpi__link">{{ liveStats?.discovery?.pending ?? kpis.pendingApps }}</NuxtLink>
        </div>
        <div class="bw-kpi__foot">Pending review</div>
      </div>
    </div>

    <div class="bw-grid bw-grid--main-aside bw-section">
      <section>
        <section v-if="pendingApps.length > 0" class="bw-card bw-section">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Needs your attention</h2>
            <NuxtLink to="/dashboard/pending-apps" class="bw-card__link">Manual queue →</NuxtLink>
          </div>
          <ul class="q-list">
            <li v-for="a in pendingApps" :key="a.id" class="q-item">
              <div class="q-logo" :style="{ background: a.color }">{{ a.logo }}</div>
              <div class="q-item__body">
                <div class="q-name">{{ a.name }}</div>
                <div class="q-meta">{{ a.vendorName }} · submitted {{ a.submittedAt }}</div>
              </div>
              <span class="bw-chip bw-chip--warning">Pending</span>
            </li>
          </ul>
        </section>

        <section class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Recent activity</h2>
            <NuxtLink to="/dashboard/activity" class="bw-card__link">View all →</NuxtLink>
          </div>
          <ul class="activity-list">
            <li v-for="e in activity.slice(0, 6)" :key="e.id">
              <span class="aw-role" :class="`aw-role--${e.actorRole === 'system' ? 'admin' : e.actorRole}`">{{ e.actorRole }}</span>
              <span class="act-body"><strong>{{ e.actor }}</strong> {{ e.action }} <strong>{{ e.target }}</strong></span>
              <span class="act-time">{{ e.at }}</span>
            </li>
          </ul>
        </section>
      </section>

      <aside>
        <section class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Signups (7d)</h2>
          </div>
          <div class="aw-spark">
            <div v-for="(v, i) in signupsByDay" :key="i" class="aw-spark__bar" :style="{ height: (v / maxSignup * 100) + '%' }" :title="v + ' signups'" />
          </div>
          <div class="day-labels">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </section>

        <section v-if="openTickets.length > 0" class="bw-card">
          <div class="bw-card__head">
            <h2 class="bw-card__title">Open support</h2>
            <NuxtLink to="/dashboard/support" class="bw-card__link">All →</NuxtLink>
          </div>
          <ul class="ticket-list">
            <li v-for="t in openTickets.slice(0, 3)" :key="t.id">
              <div class="ticket-title">{{ t.subject }}</div>
              <div class="ticket-meta">{{ t.kind }} · {{ t.openedAt }}</div>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
const { kpis: mockKpis, apps, activity, tickets, signupsByDay } = useAdminData()
const maxSignup = computed(() => Math.max(...signupsByDay))
const pendingApps = computed(() => apps.value.filter(a => a.status === 'pending').slice(0, 4))
const openTickets = computed(() => tickets.value.filter(t => t.status === 'open'))

interface LiveStats {
  users: { total: number; buyers: number; vendors: number }
  listings: { total: number; published: number; pending: number; autoDiscovered: number }
  reviews: { total: number; pending: number }
  discovery: { total: number; pending: number }
  subscriptions: { active: number; mrr: number }
  intentEvents: { last30d: number }
  topCategories: Array<{ category: string; count: number }>
}

const liveStats = ref<LiveStats | null>(null)
const kpis = computed(() => {
  if (liveStats.value) {
    const s = liveStats.value
    return {
      totalUsers: s.users?.total ?? 0,
      totalBuyers: s.users?.buyers ?? 0,
      totalVendors: s.users?.vendors ?? 0,
      liveApps: s.listings?.published ?? 0,
      pendingApps: s.listings?.pending ?? 0,
      mrr: s.subscriptions?.mrr ?? 0,
      mrrGrowth: 0,
      openTickets: 0
    }
  }
  return mockKpis.value
})

onMounted(async () => {
  try {
    liveStats.value = await $fetch<LiveStats>('/api/admin/stats')
  } catch { /* use mock fallback */ }
})
</script>

<style scoped>
.q-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.q-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--aw-surface-2); border-radius: 10px; }
.q-item__body { flex: 1; min-width: 0; }
.q-logo { width: 34px; height: 34px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; }
.q-name { font-weight: 600; font-size: 0.88rem; }
.q-meta { font-size: 0.75rem; color: var(--aw-text-subtle); }

.activity-list { list-style: none; padding: 0; margin: 0; }
.activity-list li { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--aw-border); font-size: 0.85rem; }
.activity-list li:last-child { border-bottom: none; }
.act-body { flex: 1; }
.act-time { color: var(--aw-text-subtle); font-size: 0.75rem; white-space: nowrap; }

.day-labels { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--aw-text-subtle); margin-top: 6px; }

.ticket-list { list-style: none; padding: 0; margin: 0; }
.ticket-list li { padding: 9px 0; border-bottom: 1px solid var(--aw-border); }
.ticket-list li:last-child { border-bottom: none; }
.ticket-title { font-size: 0.85rem; font-weight: 600; }
.ticket-meta  { font-size: 0.75rem; color: var(--aw-text-subtle); margin-top: 2px; }

aside { display: flex; flex-direction: column; gap: 16px; }
.bw-section { margin-bottom: 16px; }
</style>
