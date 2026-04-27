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
        <button class="bw-btn bw-btn--primary bw-btn--sm" @click="showInviteForm = !showInviteForm">Invite member</button>
      </div>
      <div v-if="showInviteForm" class="bw-card" style="margin-bottom: 16px; background: var(--vw-surface-2);">
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">
          <input v-model="inviteEmail" type="email" placeholder="teammate@company.com" class="bw-input" style="flex: 1; min-width: 220px;" />
          <select v-model="inviteRole" class="bw-input" style="width: 140px;">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button class="bw-btn bw-btn--primary bw-btn--sm" :disabled="inviting" @click="invite">{{ inviting ? 'Inviting…' : 'Send invite' }}</button>
          <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="showInviteForm = false">Cancel</button>
        </div>
      </div>
      <div v-if="loadingMembers" style="padding: 20px; text-align: center; color: var(--vw-muted);">Loading…</div>
      <div v-else-if="members.length === 0" style="padding: 20px; text-align: center; color: var(--vw-muted);">No team members yet.</div>
      <table v-else class="bw-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="m in members" :key="m.id">
            <td><strong>{{ m.name }}</strong></td>
            <td>{{ m.email }}</td>
            <td><span class="bw-chip" :class="m.role === 'owner' ? 'bw-chip--primary' : 'bw-chip--neutral'">{{ m.role }}</span></td>
            <td><span class="bw-chip" :class="m.status === 'active' ? 'bw-chip--success' : 'bw-chip--neutral'">{{ m.status }}</span></td>
            <td><button class="bw-btn bw-btn--subtle bw-btn--sm" :disabled="m.role === 'owner'" @click="removeMember(m.id)">Remove</button></td>
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
import { ref, onMounted } from 'vue'

const tab = ref<'team' | 'api'>('team')

interface TeamMember { id: string; name: string; email: string; role: string; status: string }
const members = ref<TeamMember[]>([])
const loadingMembers = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('editor')
const showInviteForm = ref(false)
const inviting = ref(false)

async function loadMembers() {
  loadingMembers.value = true
  try {
    const data = await $fetch<{ members: TeamMember[] }>('/api/vendor/team')
    members.value = data.members
  } catch { /* ignore */ } finally {
    loadingMembers.value = false
  }
}

async function invite() {
  if (!inviteEmail.value) return
  inviting.value = true
  try {
    await $fetch('/api/vendor/team/invite', { method: 'POST', body: { email: inviteEmail.value, role: inviteRole.value } })
    inviteEmail.value = ''
    showInviteForm.value = false
    await loadMembers()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Invite failed')
  } finally {
    inviting.value = false
  }
}

async function removeMember(id: string) {
  if (!confirm('Remove this team member?')) return
  await $fetch(`/api/vendor/team/${id}`, { method: 'DELETE' })
  await loadMembers()
}

const keys = [
  { id: '1', name: 'Production', key: 'sk_live_••••••••••yT7a', created: 'Sep 12, 2025' },
  { id: '2', name: 'Staging', key: 'sk_test_••••••••••wQ2m', created: 'Oct 3, 2025' }
]

onMounted(() => loadMembers())
</script>

<style scoped>
.api-key { font-family: monospace; font-size: 0.85rem; background: var(--vw-surface-2); padding: 3px 8px; border-radius: 6px; }
</style>
