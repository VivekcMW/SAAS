<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Support</h1>
        <p class="bw-head__sub">{{ openCount }} open · {{ tickets.length }} total.</p>
      </div>
    </header>

    <div class="bw-toolbar">
      <select v-model="kindF" class="bw-select" style="max-width: 180px;">
        <option value="all">All types</option>
        <option value="dispute">Disputes</option>
        <option value="flag">Flags</option>
        <option value="report">Reports</option>
      </select>
      <select v-model="statusF" class="bw-select" style="max-width: 160px;">
        <option value="open">Open</option>
        <option value="resolved">Resolved</option>
        <option value="all">All</option>
      </select>
    </div>

    <div v-if="rows.length === 0" class="bw-empty">
      <p class="bw-empty__title">Nothing here.</p>
      <p class="bw-empty__desc">No tickets match this filter.</p>
    </div>

    <ul v-else class="sp-list">
      <li v-for="t in rows" :key="t.id" class="bw-card">
        <div class="sp-item-head">
          <span class="bw-chip" :class="kindChip(t.kind)">{{ kindLabel(t.kind) }}</span>
          <div class="sp-item-body">
            <h3 class="sp-item-title">{{ t.subject }}</h3>
            <div class="sp-item-meta">
              From <strong>{{ t.from }}</strong>
              <template v-if="t.against"> · against <strong>{{ t.against }}</strong></template>
              <template v-if="t.amount"> · ${{ t.amount }}</template>
              · {{ t.openedAt }}
            </div>
          </div>
          <span class="bw-chip" :class="t.status === 'open' ? 'bw-chip--warning' : 'bw-chip--success'">{{ t.status }}</span>
        </div>
        <p class="sp-desc">{{ t.description }}</p>
        <div v-if="t.status === 'open'" class="sp-actions">
          <button class="bw-btn bw-btn--primary bw-btn--sm" @click="resolveTicket(t.id)">Resolve</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { tickets, resolveTicket } = useAdminData()

const kindF = ref('all')
const statusF = ref<'open' | 'resolved' | 'all'>('open')

const openCount = computed(() => tickets.value.filter(t => t.status === 'open').length)
const rows = computed(() => tickets.value.filter(t => {
  if (kindF.value !== 'all' && t.kind !== kindF.value) return false
  if (statusF.value !== 'all' && t.status !== statusF.value) return false
  return true
}))

function kindChip(k: string) {
  if (k === 'dispute') return 'bw-chip--danger'
  if (k === 'flag') return 'bw-chip--warning'
  return 'bw-chip--info'
}
function kindLabel(k: string) {
  return k.charAt(0).toUpperCase() + k.slice(1)
}
</script>

<style scoped>
.sp-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.sp-item-head { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
.sp-item-body { flex: 1; min-width: 240px; }
.sp-item-title { font-size: 0.95rem; font-weight: 700; margin: 0 0 4px; }
.sp-item-meta { font-size: 0.82rem; color: var(--aw-text-muted); }
.sp-desc { font-size: 0.88rem; line-height: 1.6; margin: 12px 0 0; color: var(--aw-text); }
.sp-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--aw-border); }
</style>
