<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Activity log</h1>
        <p class="bw-head__sub">Every admin and system action on the platform.</p>
      </div>
    </header>

    <AdminGridTable
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
const { activity } = useAdminData()

const columns = [
  { key: 'at',     label: 'When',   sortable: false, hideable: true,  width: '140px' },
  { key: 'actor',  label: 'Actor',  sortable: true,  hideable: false },
  { key: 'action', label: 'Action', sortable: true,  hideable: true  },
  { key: 'target', label: 'Target', sortable: true,  hideable: true  },
]
</script>

<style scoped>
.act-time   { font-size: 0.82rem; color: var(--bw-text-muted); white-space: nowrap; }
.act-actor  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.act-action { font-size: 0.9rem; color: var(--bw-text); }
</style>
