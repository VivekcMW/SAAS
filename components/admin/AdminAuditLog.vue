<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Audit log</h1>
        <p class="bw-head__sub">All admin, vendor, and system actions across the platform.</p>
      </div>
    </header>

    <div class="bw-toolbar">
      <select v-model="roleF" class="bw-select" style="max-width: 200px;">
        <option value="all">All actors</option>
        <option value="admin">Admin</option>
        <option value="system">System</option>
        <option value="vendor">Vendor</option>
        <option value="buyer">Buyer</option>
      </select>
    </div>

    <div class="bw-card">
      <table class="bw-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in rows" :key="e.id">
            <td style="font-size: 0.85rem; color: var(--aw-text-muted); white-space: nowrap;">{{ e.at }}</td>
            <td>
              <span class="aw-role" :class="`aw-role--${e.actorRole === 'system' ? 'admin' : e.actorRole}`">{{ e.actorRole }}</span>
              <span style="margin-left: 8px; font-size: 0.85rem;">{{ e.actor }}</span>
            </td>
            <td style="font-size: 0.88rem;">{{ e.action }}</td>
            <td><strong style="font-size: 0.88rem;">{{ e.target }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { auditLog } = useAdminData()

const roleF = ref('all')
const rows = computed(() => auditLog.value.filter(e => roleF.value === 'all' || e.actorRole === roleF.value))
</script>
