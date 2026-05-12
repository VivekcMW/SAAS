<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Settings</h1>
        <p class="bw-head__sub">Platform-wide policy and pricing.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save changes' }}</button>
      </div>
    </header>

    <div class="bw-grid bw-grid--2">
      <section class="bw-card">
        <h2 class="bw-card__title st-title">Pricing</h2>
        <label class="st-row">
          <span>Platform fee (%)</span>
          <input v-model.number="settings.platformFee" type="number" min="0" max="50" class="bw-input st-input-narrow" />
        </label>
        <label class="st-row">
          <span>Minimum payout ($)</span>
          <input v-model.number="settings.minPayout" type="number" min="0" class="bw-input st-input-narrow" />
        </label>
      </section>

      <section class="bw-card">
        <h2 class="bw-card__title st-title">Policies</h2>
        <label class="st-row">
          <span>Dispute SLA (days)</span>
          <input v-model.number="settings.disputeSla" type="number" min="1" class="bw-input st-input-narrow" />
        </label>
        <label class="st-row">
          <span>Refund window (days)</span>
          <input v-model.number="settings.refundWindow" type="number" min="0" class="bw-input st-input-narrow" />
        </label>
      </section>

      <section class="bw-card">
        <h2 class="bw-card__title st-title">Marketplace</h2>
        <label class="st-row st-row--check">
          <input v-model="settings.requireApproval" type="checkbox" />
          <span>Require admin approval for new apps</span>
        </label>
        <label class="st-row st-row--check">
          <input v-model="settings.allowSelfSignupVendor" type="checkbox" />
          <span>Allow vendor self-signup</span>
        </label>
        <label class="st-row st-row--check">
          <input v-model="settings.publicReviews" type="checkbox" />
          <span>Public reviews</span>
        </label>
      </section>
    </div>

    <p v-if="saved" class="st-saved">Settings saved.</p>
    <p v-if="saveError" class="st-error">{{ saveError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  platformFee: 23,
  minPayout: 50,
  disputeSla: 7,
  refundWindow: 30,
  requireApproval: true,
  allowSelfSignupVendor: true,
  publicReviews: true
})

const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...settings.value } })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3500)
  } catch (err: any) {
    saveError.value = err?.data?.message || 'Failed to save settings. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.st-title { margin-bottom: 12px; }
.st-input-narrow { max-width: 120px; width: 100%; }
.st-saved { margin-top: 14px; color: var(--bw-success, #2A9D8F); font-size: 0.85rem; font-weight: 500; background: var(--bw-success-50, rgba(42,157,143,.1)); border-radius: 8px; padding: 8px 12px; display: inline-block; }
.st-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--bw-border); font-size: 0.9rem; }
.st-row:last-child { border-bottom: none; }
.st-row--check { justify-content: flex-start; gap: 10px; }
.st-error { margin-top: 14px; color: var(--bw-danger, #EF4444); font-size: 0.85rem; font-weight: 500; background: var(--bw-danger-50); border-radius: 8px; padding: 8px 12px; }
</style>
