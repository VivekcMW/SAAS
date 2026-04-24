<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">All apps</h1>
        <p class="bw-head__sub">{{ kpis.totalListings }} live listings across the platform.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/pending-apps" class="bw-btn bw-btn--primary">Review queue · {{ kpis.pendingApps }}</NuxtLink>
      </div>
    </header>

    <div class="bw-toolbar">
      <input v-model="q" class="bw-input" placeholder="Search apps or vendors…" style="max-width: 340px;" />
      <select v-model="filter" class="bw-select" style="max-width: 200px;">
        <option value="all">All statuses</option>
        <option value="live">Live</option>
        <option value="pending">Pending review</option>
      </select>
    </div>

    <div class="bw-card">
      <table class="bw-table">
        <thead>
          <tr>
            <th>App</th>
            <th>Vendor</th>
            <th>Category</th>
            <th>Status</th>
            <th>AI risk</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in rows" :key="a.id">
            <td>
              <div style="display: flex; gap: 10px; align-items: center;">
                <div class="q-logo" :style="{ background: a.color }">{{ a.logo }}</div>
                <strong>{{ a.name }}</strong>
              </div>
            </td>
            <td>{{ a.vendorName }}</td>
            <td>{{ a.category }}</td>
            <td><span class="bw-chip" :class="statusChip(a.status)">{{ a.status }}</span></td>
            <td>
              <span class="aw-risk" :class="riskBand(a.aiRiskScore)">{{ a.aiRiskScore }}</span>
            </td>
            <td style="text-align: right;">
              <button class="bw-btn bw-btn--ghost bw-btn--sm">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { pendingApps, kpis } = useAdminData()

const q = ref('')
const filter = ref('all')

const rows = computed(() => pendingApps.value.filter(a => {
  if (filter.value === 'live' && a.status !== 'approved') return false
  if (filter.value === 'pending' && a.status !== 'pending') return false
  if (q.value && !`${a.name} ${a.vendorName}`.toLowerCase().includes(q.value.toLowerCase())) return false
  return true
}))

function statusChip(s: string) {
  if (s === 'approved') return 'bw-chip--success'
  if (s === 'rejected') return 'bw-chip--danger'
  return 'bw-chip--warning'
}
function riskBand(n: number) { return n < 30 ? 'aw-risk--low' : n < 60 ? 'aw-risk--med' : 'aw-risk--high' }
</script>

<style scoped>
.q-logo { width: 30px; height: 30px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }
</style>
