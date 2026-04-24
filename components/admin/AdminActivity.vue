<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Activity log</h1>
        <p class="bw-head__sub">Every admin and system action on the platform.</p>
      </div>
    </header>

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
          <tr v-for="e in activity" :key="e.id">
            <td style="font-size: 0.82rem; color: var(--aw-text-muted); white-space: nowrap;">{{ e.at }}</td>
            <td>
              <span class="aw-role" :class="`aw-role--${e.actorRole === 'system' ? 'admin' : e.actorRole}`">{{ e.actorRole }}</span>
              <strong style="margin-left: 8px;">{{ e.actor }}</strong>
            </td>
            <td>{{ e.action }}</td>
            <td><strong>{{ e.target }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { activity } = useAdminData()
</script>
