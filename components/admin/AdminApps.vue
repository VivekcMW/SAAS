<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Apps</h1>
        <p class="bw-head__sub">{{ kpis.liveApps }} live · {{ kpis.pendingApps }} pending approval.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink v-if="kpis.pendingApps > 0" to="/dashboard/pending-apps" class="bw-btn bw-btn--primary">
          Review pending · {{ kpis.pendingApps }}
        </NuxtLink>
      </div>
    </header>

    <AdminGridTable
      :columns="columns"
      :rows="filteredByStatus"
      row-key="id"
      search-placeholder="Search apps or vendors…"
      :selectable="true"
      :bulk-actions="bulkActions"
      :exportable="true"
      export-file-name="apps-export"
      @bulk-action="handleBulkAction"
    >
      <!-- Status filter in toolbar -->
      <template #toolbar-extra>
        <select v-model="statusFilter" class="bw-select" aria-label="Filter by status" style="max-width: 200px;">
          <option value="all">All statuses</option>
          <option value="approved">Live</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </template>

      <!-- App cell: logo + name -->
      <template #cell-name="{ row }">
        <div class="app-cell">
          <div class="app-logo" :style="{ background: row.color }">{{ row.logo }}</div>
          <div>
            <strong>{{ row.name }}</strong>
            <div class="app-meta">{{ row.category }}</div>
          </div>
        </div>
      </template>

      <!-- Status chip -->
      <template #cell-status="{ row }">
        <span class="bw-chip" :class="statusChip(row.status)">{{ statusLabel(row.status) }}</span>
      </template>

      <!-- Submitted muted -->
      <template #cell-submittedAt="{ row }">
        <span style="font-size: 0.85rem; color: var(--bw-text-muted);">{{ row.submittedAt }}</span>
      </template>

      <!-- Actions -->
      <template #cell-_actions="{ row }">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button
            v-if="row.status === 'pending'"
            class="bw-btn bw-btn--primary bw-btn--sm"
            @click.stop="decideApp(row.id, 'approved')"
          >Approve</button>
          <button
            v-if="row.status === 'pending'"
            class="bw-btn bw-btn--ghost bw-btn--sm"
            @click.stop="confirmReject(row)"
          >Reject</button>
        </div>
      </template>
    </AdminGridTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { apps, kpis, decideApp } = useAdminData()

const statusFilter = ref('all')

const filteredByStatus = computed(() =>
  statusFilter.value === 'all'
    ? apps.value
    : apps.value.filter(a => a.status === statusFilter.value)
)

const columns = [
  { key: 'name',        label: 'App',       sortable: true,  hideable: false },
  { key: 'vendorName',  label: 'Vendor',    sortable: true,  hideable: true  },
  { key: 'category',    label: 'Category',  sortable: true,  hideable: true  },
  { key: 'status',      label: 'Status',    sortable: true,  hideable: true  },
  { key: 'submittedAt', label: 'Submitted', sortable: false, hideable: true  },
  { key: '_actions',    label: '',          sortable: false, hideable: false, width: '160px', align: 'right' as const },
]

const bulkActions = [
  { action: 'approve', label: 'Approve all', variant: 'primary' as const },
  { action: 'reject',  label: 'Reject all',  variant: 'danger'  as const },
]

function handleBulkAction({ action, rows }: { action: string; rows: any[] }) {
  if (action === 'reject' && !confirm(`Reject ${rows.length} app(s)? This cannot be undone.`)) return
  rows.forEach(r => decideApp(r.id, action === 'approve' ? 'approved' : 'rejected'))
}

function confirmReject(row: any) {
  if (!confirm(`Reject "${row.name}"? This cannot be undone.`)) return
  decideApp(row.id, 'rejected')
}

function statusChip(s: string) {
  if (s === 'approved') return 'bw-chip--success'
  if (s === 'rejected') return 'bw-chip--danger'
  return 'bw-chip--warning'
}
function statusLabel(s: string) {
  if (s === 'approved') return 'Live'
  if (s === 'rejected') return 'Rejected'
  return 'Pending'
}
</script>

<style scoped>
.app-cell { display: flex; gap: 10px; align-items: center; }
.app-logo { width: 32px; height: 32px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }
.app-meta { font-size: 0.75rem; color: var(--bw-text-subtle); margin-top: 1px; }
</style>
