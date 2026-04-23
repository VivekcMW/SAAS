<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Team &amp; API</h1>
        <p class="bw-head__sub">Invite teammates and manage API keys.</p>
      </div>
    </header>

    <div class="bw-tabs">
      <button class="bw-tab" :class="{ 'is-active': tab === 'team' }" @click="tab = 'team'">Team</button>
      <button class="bw-tab" :class="{ 'is-active': tab === 'api' }" @click="tab = 'api'">API keys</button>
    </div>

    <!-- Team -->
    <section v-if="tab === 'team'" class="bw-card">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Members</h2>
        <button class="bw-btn bw-btn--primary bw-btn--sm">Invite member</button>
      </div>
      <table class="bw-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          <tr v-for="m in members" :key="m.id">
            <td><strong>{{ m.name }}</strong></td>
            <td>{{ m.email }}</td>
            <td><span class="bw-chip" :class="m.role === 'Owner' ? 'bw-chip--primary' : 'bw-chip--neutral'">{{ m.role }}</span></td>
            <td><button class="bw-btn bw-btn--subtle bw-btn--sm" :disabled="m.role === 'Owner'">Remove</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- API -->
    <section v-if="tab === 'api'" class="bw-card">
      <div class="bw-card__head">
        <h2 class="bw-card__title">API keys</h2>
        <button class="bw-btn bw-btn--primary bw-btn--sm">Create key</button>
      </div>
      <table class="bw-table">
        <thead><tr><th>Name</th><th>Key</th><th>Created</th><th></th></tr></thead>
        <tbody>
          <tr v-for="k in keys" :key="k.id">
            <td><strong>{{ k.name }}</strong></td>
            <td><code class="api-key">{{ k.key }}</code></td>
            <td>{{ k.created }}</td>
            <td><button class="bw-btn bw-btn--subtle bw-btn--sm">Revoke</button></td>
          </tr>
        </tbody>
      </table>
      <div class="vw-ai-card" style="margin-top: 16px;">
        <div class="vw-ai-card__title"><span class="vw-ai-chip">AI</span> Tip</div>
        <p style="margin: 0; font-size: 0.88rem;">Rotate keys every 90 days. Never embed production keys in client-side code.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tab = ref<'team' | 'api'>('team')
const members = [
  { id: '1', name: 'You', email: 'demo@saasworld.com', role: 'Owner' },
  { id: '2', name: 'Rahul Menon', email: 'rahul@acme.example', role: 'Admin' },
  { id: '3', name: 'Sofia Nunez', email: 'sofia@acme.example', role: 'Editor' }
]
const keys = [
  { id: '1', name: 'Production', key: 'sk_live_••••••••••yT7a', created: 'Sep 12, 2025' },
  { id: '2', name: 'Staging', key: 'sk_test_••••••••••wQ2m', created: 'Oct 3, 2025' }
]
</script>

<style scoped>
.api-key { font-family: monospace; font-size: 0.85rem; background: var(--vw-surface-2); padding: 3px 8px; border-radius: 6px; }
</style>
