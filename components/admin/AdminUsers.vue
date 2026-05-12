<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Users</h1>
        <p class="bw-head__sub">{{ users.length }} total · {{ kpis.activeUsers }} active.</p>
      </div>
    </header>

    <AdminGridTable
      :columns="columns"
      :rows="filteredByRoleStatus"
      row-key="id"
      search-placeholder="Search name, email, company…"
      :selectable="true"
      :bulk-actions="bulkActions"
      :exportable="true"
      export-file-name="users-export"
      @bulk-action="handleBulkAction"
    >
      <!-- Role + Status filters in toolbar -->
      <template #toolbar-extra>
        <select v-model="roleF" class="bw-select" aria-label="Filter by role" style="max-width: 160px;">
          <option value="all">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
        <select v-model="statusF" class="bw-select" aria-label="Filter by status" style="max-width: 180px;">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </template>

      <!-- User cell: avatar + name + email -->
      <template #cell-name="{ row }">
        <div class="user-cell">
          <div class="u-avatar" :class="`u-avatar--${row.role}`">{{ row.name.charAt(0) }}</div>
          <div>
            <strong>{{ row.name }}</strong>
            <div class="user-email">{{ row.email }}</div>
          </div>
        </div>
      </template>

      <!-- Role chip -->
      <template #cell-role="{ row }">
        <span class="aw-role" :class="`aw-role--${row.role}`">{{ row.role }}</span>
      </template>

      <!-- Status chip -->
      <template #cell-status="{ row }">
        <span class="bw-chip" :class="statusChip(row.status)">{{ row.status }}</span>
      </template>

      <!-- Joined muted -->
      <template #cell-joinedAt="{ row }">
        <span style="font-size: 0.85rem;">{{ row.joinedAt }}</span>
      </template>

      <!-- Last active muted -->
      <template #cell-lastActive="{ row }">
        <span style="font-size: 0.85rem; color: var(--bw-text-muted);">{{ row.lastActive }}</span>
      </template>

      <!-- Actions -->
      <template #cell-_actions="{ row }">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button
            v-if="row.status === 'active' && row.role !== 'admin'"
            class="bw-btn bw-btn--subtle bw-btn--sm"
            @click.stop="confirmSuspend(row)"
          >Suspend</button>
          <button
            v-else-if="row.status === 'suspended'"
            class="bw-btn bw-btn--ghost bw-btn--sm"
            @click.stop="updateUserStatus(row.id, 'active')"
          >Restore</button>
          <button
            v-else-if="row.status === 'pending'"
            class="bw-btn bw-btn--primary bw-btn--sm"
            @click.stop="updateUserStatus(row.id, 'active')"
          >Approve</button>
        </div>
      </template>
    </AdminGridTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { users, kpis, updateUserStatus } = useAdminData()

const roleF   = ref('all')
const statusF = ref('all')

const filteredByRoleStatus = computed(() =>
  users.value.filter(u => {
    if (roleF.value   !== 'all' && u.role   !== roleF.value)   return false
    if (statusF.value !== 'all' && u.status !== statusF.value) return false
    return true
  })
)

const columns = [
  { key: 'name',       label: 'User',        sortable: true,  hideable: false },
  { key: 'role',       label: 'Role',        sortable: true,  hideable: true  },
  { key: 'status',     label: 'Status',      sortable: true,  hideable: true  },
  { key: 'joinedAt',   label: 'Joined',      sortable: false, hideable: true  },
  { key: 'lastActive', label: 'Last active', sortable: false, hideable: true  },
  { key: '_actions',   label: '',            sortable: false, hideable: false, width: '120px', align: 'right' as const },
]

const bulkActions = [
  { action: 'suspend', label: 'Suspend',  variant: 'danger'  as const },
  { action: 'approve', label: 'Approve',  variant: 'primary' as const },
]

function handleBulkAction({ action, rows }: { action: string; rows: any[] }) {
  if (action === 'suspend') {
    const targets = rows.filter(u => u.status === 'active' && u.role !== 'admin')
    if (!targets.length) return
    if (!confirm(`Suspend ${targets.length} user(s)? They will lose access to the platform.`)) return
    targets.forEach(u => updateUserStatus(u.id, 'suspended'))
  } else if (action === 'approve') {
    rows.filter(u => u.status === 'pending').forEach(u => updateUserStatus(u.id, 'active'))
  }
}

function confirmSuspend(row: any) {
  if (!confirm(`Suspend ${row.name}? They will lose access to the platform.`)) return
  updateUserStatus(row.id, 'suspended')
}

function statusChip(s: string) {
  if (s === 'active')    return 'bw-chip--success'
  if (s === 'suspended') return 'bw-chip--danger'
  return 'bw-chip--warning'
}
</script>

<style scoped>
.user-cell  { display: flex; gap: 10px; align-items: center; }
.user-email { font-size: 0.78rem; color: var(--bw-text-subtle); margin-top: 1px; }
.u-avatar   { width: 34px; height: 34px; border-radius: 50%; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.88rem; flex-shrink: 0; }
.u-avatar--admin  { background: var(--aw-accent); }
.u-avatar--vendor { background: #f59e0b; }
.u-avatar--buyer  { background: #3b82f6; }
</style>
