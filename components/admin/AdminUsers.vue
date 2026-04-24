<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Users</h1>
        <p class="bw-head__sub">{{ users.length }} total · {{ kpis.activeUsers }} active.</p>
      </div>
    </header>

    <div class="bw-toolbar">
      <input v-model="q" class="bw-input" placeholder="Search name, email, company…" style="max-width: 320px;" />
      <select v-model="roleF" class="bw-select" style="max-width: 160px;">
        <option value="all">All roles</option>
        <option value="buyer">Buyers</option>
        <option value="vendor">Vendors</option>
        <option value="admin">Admins</option>
      </select>
      <select v-model="statusF" class="bw-select" style="max-width: 180px;">
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>

    <div class="bw-card">
      <table class="bw-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Last active</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in rows" :key="u.id">
            <td>
              <div style="display: flex; gap: 10px; align-items: center;">
                <div class="u-avatar" :class="`u-avatar--${u.role}`">{{ u.name.charAt(0) }}</div>
                <div>
                  <strong>{{ u.name }}</strong>
                  <div style="font-size: 0.78rem; color: var(--aw-text-subtle);">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td><span class="aw-role" :class="`aw-role--${u.role}`">{{ u.role }}</span></td>
            <td><span class="bw-chip" :class="statusChip(u.status)">{{ u.status }}</span></td>
            <td style="font-size: 0.85rem;">{{ u.joinedAt }}</td>
            <td style="font-size: 0.85rem; color: var(--aw-text-muted);">{{ u.lastActive }}</td>
            <td style="text-align: right;">
              <button
                v-if="u.status === 'active' && u.role !== 'admin'"
                class="bw-btn bw-btn--subtle bw-btn--sm"
                @click="updateUserStatus(u.id, 'suspended')"
              >Suspend</button>
              <button
                v-else-if="u.status === 'suspended'"
                class="bw-btn bw-btn--ghost bw-btn--sm"
                @click="updateUserStatus(u.id, 'active')"
              >Restore</button>
              <button
                v-else-if="u.status === 'pending'"
                class="bw-btn bw-btn--primary bw-btn--sm"
                @click="updateUserStatus(u.id, 'active')"
              >Approve</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { users, kpis, updateUserStatus } = useAdminData()

const q = ref('')
const roleF = ref('all')
const statusF = ref('all')

const rows = computed(() => users.value.filter(u => {
  if (roleF.value !== 'all' && u.role !== roleF.value) return false
  if (statusF.value !== 'all' && u.status !== statusF.value) return false
  if (q.value && !`${u.name} ${u.email} ${u.companyName || ''}`.toLowerCase().includes(q.value.toLowerCase())) return false
  return true
}))

function statusChip(s: string) {
  if (s === 'active') return 'bw-chip--success'
  if (s === 'suspended') return 'bw-chip--danger'
  return 'bw-chip--warning'
}
</script>

<style scoped>
.u-avatar { width: 34px; height: 34px; border-radius: 50%; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.88rem; flex-shrink: 0; }
.u-avatar--admin { background: var(--aw-accent); }
.u-avatar--vendor { background: #f59e0b; }
.u-avatar--buyer { background: #3b82f6; }
</style>
