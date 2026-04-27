<template>
  <div class="integration-graph">
    <div class="integration-graph__header">
      <h3>Works With</h3>
      <span class="integration-graph__count">{{ data?.total ?? 0 }} integrations</span>
    </div>

    <div v-if="!data?.integrations?.length" class="integration-graph__empty">
      <p>No integrations listed yet.</p>
      <button class="suggest-btn" @click="showSuggest = true">Suggest an integration</button>
    </div>

    <template v-else>
      <!-- Type filter pills -->
      <div class="integration-graph__filters">
        <button
          v-for="t in types"
          :key="t"
          class="type-pill"
          :class="{ 'type-pill--active': selectedType === t }"
          @click="selectedType = t"
        >{{ t === 'all' ? 'All' : t }}</button>
      </div>

      <div class="integration-graph__grid">
        <div
          v-for="int in filtered"
          :key="int.id"
          class="integration-card"
          :class="{ 'integration-card--verified': int.verified }"
        >
          <div class="integration-card__logo">
            <img v-if="int.partner_logo" :src="int.partner_logo" :alt="int.partner_name" width="32" height="32" loading="lazy" />
            <div v-else class="integration-card__logo-placeholder">{{ int.partner_name[0] }}</div>
          </div>
          <div class="integration-card__body">
            <div class="integration-card__name">
              <NuxtLink v-if="int.partner_app_slug" :to="`/app/${int.partner_app_id}`">{{ int.partner_name }}</NuxtLink>
              <span v-else>{{ int.partner_name }}</span>
              <span v-if="int.verified" class="verified-dot" title="Verified integration">&#10003;</span>
            </div>
            <p v-if="int.description" class="integration-card__desc">{{ int.description }}</p>
            <div class="integration-card__meta">
              <span class="type-tag">{{ int.integration_type }}</span>
              <span class="dir-tag">{{ int.direction }}</span>
            </div>
          </div>
          <button class="vote-int-btn" :class="{ 'vote-int-btn--active': voted.has(int.id) }" @click="vote(int)" :title="voted.has(int.id) ? 'Remove vote' : 'This integration exists'">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            {{ int.vote_score + (localVotes[int.id] ?? 0) }}
          </button>
        </div>
      </div>

      <button class="suggest-btn suggest-btn--link" @click="showSuggest = true">+ Suggest a missing integration</button>
    </template>

    <!-- Suggest modal -->
    <div v-if="showSuggest" class="suggest-modal-overlay" @click.self="showSuggest = false">
      <div class="suggest-modal">
        <h4>Suggest an integration</h4>
        <form @submit.prevent="submitSuggest">
          <input v-model="suggestForm.partner_name" type="text" placeholder="Tool name (e.g. Stripe)" required />
          <select v-model="suggestForm.integration_type">
            <option value="native">Native</option>
            <option value="api">API</option>
            <option value="webhook">Webhook</option>
            <option value="zapier">Zapier/Make</option>
            <option value="other">Other</option>
          </select>
          <textarea v-model="suggestForm.description" rows="3" placeholder="What does the integration do?" />
          <p v-if="suggestError" class="form-error">{{ suggestError }}</p>
          <div class="suggest-modal__actions">
            <button type="submit" :disabled="suggestLoading">{{ suggestLoading ? 'Submitting…' : 'Submit' }}</button>
            <button type="button" @click="showSuggest = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ appId: string }>()

const { data, refresh } = await useAsyncData(
  `integrations-${props.appId}`,
  () => $fetch(`/api/integrations/${props.appId}`)
)

const selectedType = ref('all')
const types = computed(() => {
  const t = new Set<string>(['all'])
  for (const int of (data.value as any)?.integrations ?? []) t.add(int.integration_type)
  return [...t]
})
const filtered = computed(() => {
  const list = (data.value as any)?.integrations ?? []
  return selectedType.value === 'all' ? list : list.filter((i: any) => i.integration_type === selectedType.value)
})

const voted = ref(new Set<string>())
const localVotes = ref<Record<string, number>>({})
async function vote(int: any) {
  const res = await $fetch<any>('/api/integrations/vote', { method: 'POST', body: { integration_id: int.id } })
  if (res.action === 'added') { voted.value.add(int.id); localVotes.value[int.id] = 1 }
  else { voted.value.delete(int.id); localVotes.value[int.id] = 0 }
}

const showSuggest = ref(false)
const suggestLoading = ref(false)
const suggestError = ref('')
const suggestForm = reactive({ partner_name: '', integration_type: 'native', description: '' })

async function submitSuggest() {
  suggestError.value = ''
  suggestLoading.value = true
  try {
    await $fetch('/api/integrations/suggest', { method: 'POST', body: { app_id: props.appId, ...suggestForm } })
    showSuggest.value = false
    suggestForm.partner_name = ''
    suggestForm.description = ''
    await refresh()
  } catch (err: any) {
    suggestError.value = err?.data?.statusMessage || 'Failed to submit.'
  } finally {
    suggestLoading.value = false
  }
}
</script>

<style scoped>
.integration-graph { }
.integration-graph__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.integration-graph__header h3 { font-size: 1.1rem; font-weight: 700; }
.integration-graph__count { font-size: 0.78rem; color: #9ca3af; }
.integration-graph__empty { text-align: center; padding: 2rem; color: #6b7280; font-size: 0.9rem; }
.integration-graph__filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem; }
.type-pill { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 99px; padding: 3px 12px; font-size: 0.78rem; cursor: pointer; text-transform: capitalize; }
.type-pill--active { background: #e0e7ff; color: #3730a3; border-color: #a5b4fc; }
.integration-graph__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 1rem; }
.integration-card { display: flex; align-items: flex-start; gap: 10px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #fff; }
.integration-card--verified { border-color: #a5b4fc; }
.integration-card__logo { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.integration-card__logo img { border-radius: 6px; object-fit: contain; }
.integration-card__logo-placeholder { width: 32px; height: 32px; background: #e0e7ff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #4f46e5; font-size: 0.875rem; }
.integration-card__body { flex: 1; min-width: 0; }
.integration-card__name { font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.integration-card__name a { color: inherit; text-decoration: none; }
.integration-card__name a:hover { color: #4f46e5; }
.verified-dot { color: #16a34a; font-size: 0.8rem; }
.integration-card__desc { font-size: 0.75rem; color: #6b7280; line-height: 1.4; margin: 2px 0 4px; }
.integration-card__meta { display: flex; gap: 4px; }
.type-tag, .dir-tag { font-size: 0.65rem; background: #f3f4f6; color: #6b7280; padding: 1px 6px; border-radius: 4px; text-transform: capitalize; }
.vote-int-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 0.72rem; font-weight: 600; color: #9ca3af; background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 6px; cursor: pointer; flex-shrink: 0; }
.vote-int-btn:hover, .vote-int-btn--active { color: #4f46e5; border-color: #a5b4fc; background: #eef2ff; }
.suggest-btn { background: none; border: 1px dashed #d1d5db; border-radius: 7px; padding: 5px 14px; font-size: 0.8rem; color: #6b7280; cursor: pointer; }
.suggest-btn:hover { border-color: #6366f1; color: #6366f1; }
.suggest-btn--link { margin-top: 0.5rem; }
.suggest-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.suggest-modal { background: #fff; border-radius: 14px; padding: 1.5rem; max-width: 420px; width: 100%; }
.suggest-modal h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
.suggest-modal form { display: flex; flex-direction: column; gap: 8px; }
.suggest-modal input, .suggest-modal select, .suggest-modal textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 7px 10px; font-size: 0.875rem; font-family: inherit; }
.suggest-modal__actions { display: flex; gap: 8px; }
.suggest-modal__actions button { border-radius: 7px; padding: 6px 14px; font-size: 0.875rem; cursor: pointer; }
.suggest-modal__actions button[type=submit] { background: #4f46e5; color: #fff; border: none; }
.suggest-modal__actions button[type=button] { background: none; border: 1px solid #e5e7eb; }
.form-error { color: #dc2626; font-size: 0.8rem; }
</style>
