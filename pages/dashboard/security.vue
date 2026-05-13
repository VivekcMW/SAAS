<template>
  <div class="security-page">
    <div class="security-header">
      <h1>Security</h1>
      <p>Manage your passkeys and authentication methods.</p>
    </div>

    <!-- Passkeys section -->
    <section class="security-card">
      <div class="security-card__header">
        <div>
          <h2>Passkeys</h2>
          <p>Sign in with Face ID, Touch ID, or a hardware security key — no password needed.</p>
        </div>
      </div>

      <!-- Existing passkeys -->
      <ul v-if="credentials.length" class="cred-list">
        <li v-for="cred in credentials" :key="cred.id" class="cred-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cred-icon" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.25 3.75 10.17 9 11.33C17.25 21.17 21 16.25 21 11V5l-9-4z"/>
            <circle cx="12" cy="11" r="2.5"/>
            <path d="M12 13.5V17"/>
          </svg>
          <div class="cred-info">
            <span class="cred-label">Passkey</span>
            <span class="cred-date">Added {{ formatDate(cred.created_at) }}</span>
          </div>
          <button class="cred-remove" :disabled="removing === cred.id" @click="removeCredential(cred.id)">
            {{ removing === cred.id ? 'Removing…' : 'Remove' }}
          </button>
        </li>
      </ul>
      <p v-else class="cred-empty">No passkeys registered yet.</p>

      <!-- Register new passkey -->
      <div class="passkey-add">
        <PasskeyButton mode="register" @registered="onRegistered" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Security · Moonmart' })

const { currentUser } = useAuth()
const router = useRouter()

onMounted(() => {
  if (!currentUser.value) router.replace('/login')
})

interface CredRow { id: string; created_at: string }
const credentials = ref<CredRow[]>([])
const removing = ref<string | null>(null)

const loadCredentials = async () => {
  try {
    const res = await $fetch<CredRow[]>('/api/auth/passkey/list')
    credentials.value = res
  } catch { /* ignore */ }
}

onMounted(loadCredentials)

const { fmtDate } = useFmt()
const formatDate = (iso: string) => fmtDate(iso, { year: 'numeric', month: 'short', day: 'numeric' })

const removeCredential = async (id: string) => {
  removing.value = id
  try {
    await $fetch(`/api/auth/passkey/remove`, { method: 'DELETE', body: { id } })
    credentials.value = credentials.value.filter((c) => c.id !== id)
  } catch { /* ignore */ }
  removing.value = null
}

const onRegistered = () => { loadCredentials() }
</script>

<style scoped>
.security-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 24px;
}

.security-header {
  margin-bottom: 32px;
}

.security-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.security-header p {
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.security-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
}

.security-card__header {
  margin-bottom: 20px;
}

.security-card__header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px;
}

.security-card__header p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin: 0;
}

.cred-list {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cred-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.cred-icon { color: #FFC850; flex-shrink: 0; }

.cred-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cred-label {
  font-size: 0.875rem;
  color: #fff;
  font-weight: 500;
}

.cred-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.cred-remove {
  background: none;
  border: 1px solid rgba(255, 80, 80, 0.35);
  color: rgba(255, 100, 100, 0.8);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.cred-remove:hover:not(:disabled) {
  background: rgba(255, 80, 80, 0.1);
}

.cred-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cred-empty {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.875rem;
  margin: 0 0 20px;
}

.passkey-add {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 20px;
}
</style>
