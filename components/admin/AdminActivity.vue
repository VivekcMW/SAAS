<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Activity log</h1>
        <p class="bw-head__sub">Every admin and system action on the platform.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--ghost" :disabled="activityLoading" title="Refresh activity log" @click="refresh">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh
        </button>
      </div>
    </header>

    <p v-if="activityError" class="act-error">Failed to load activity log. <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="refresh">Retry</button></p>
    <p v-if="activityLoading" style="padding: 24px; color: var(--bw-text-muted);">Loading activity…</p>
    <AdminGridTable
      v-else
      :columns="columns"
      :rows="activity"
      row-key="id"
      search-placeholder="Search actions, actors, targets…"
      :selectable="false"
      :exportable="true"
      export-file-name="activity-log"
      :initial-page-size="25"
    >
      <!-- When cell: muted timestamp -->
      <template #cell-at="{ row }">
        <span class="act-time">{{ row.at }}</span>
      </template>

      <!-- Actor cell: role badge + name -->
      <template #cell-actor="{ row }">
        <div class="act-actor">
          <span class="aw-role" :class="`aw-role--${row.actorRole === 'system' ? 'admin' : row.actorRole}`">
            {{ row.actorRole }}
          </span>
          <strong>{{ row.actor }}</strong>
        </div>
      </template>

      <!-- Action cell -->
      <template #cell-action="{ row }">
        <span class="act-action">{{ row.action }}</span>
      </template>

      <!-- Target cell: bold -->
      <template #cell-target="{ row }">
        <strong>{{ row.target }}</strong>
      </template>
    </AdminGridTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
const { activity, activityLoading, activityError, loadActivity } = useAdminData()

function refresh() {
  loadActivity()
}

onMounted(() => loadActivity())

const columns = [
  { key: 'at',     label: 'When',   sortable: false, hideable: true,  width: '145px' },
  { key: 'actor',  label: 'Actor',  sortable: true,  hideable: false, width: '165px' },
  { key: 'action', label: 'Action', sortable: true,  hideable: true,  width: '200px' },
  { key: 'target', label: 'Target', sortable: true,  hideable: true  },
]
</script>

<style scoped>
.act-time   { font-size: 0.82rem; color: var(--bw-text-muted); white-space: nowrap; }
.act-actor  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.act-action { font-size: 0.9rem; color: var(--bw-text); }
.act-error  { padding: 12px 16px; background: var(--aw-red-50, #fef2f2); color: var(--aw-red-700, #b91c1c); border-radius: 8px; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
</style>
