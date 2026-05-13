<template>
  <div>
    <!-- Status banner -->
    <div v-if="config.testMode !== undefined" class="absc-mode-banner" :class="config.testMode ? 'absc-mode-banner--test' : 'absc-mode-banner--live'">
      <strong>{{ config.testMode ? 'TEST MODE' : 'LIVE MODE' }}</strong>
      {{ config.testMode ? '— Using Stripe test keys. No real charges will occur.' : '— Using Stripe live keys. Real charges are active.' }}
    </div>

    <div class="bw-grid bw-grid--2" style="gap: 20px;">

      <!-- Keys section -->
      <section class="bw-card">
        <h2 class="bw-card__title absc-title">API Keys</h2>
        <p class="absc-hint">Existing secret values are masked. Leave a field blank to keep the current value.</p>

        <label class="st-row absc-field">
          <span>Publishable key</span>
          <input v-model="form.publishableKey" class="bw-input" placeholder="pk_test_… or pk_live_…" >
        </label>
        <label class="st-row absc-field">
          <span>Secret key</span>
          <input v-model="form.secretKey" type="password" class="bw-input" placeholder="Leave blank to keep current" autocomplete="new-password" >
          <div v-if="config.secretKeyMasked" class="absc-masked">Current: {{ config.secretKeyMasked }}</div>
        </label>
        <label class="st-row absc-field">
          <span>Webhook signing secret</span>
          <input v-model="form.webhookSecret" type="password" class="bw-input" placeholder="Leave blank to keep current" autocomplete="new-password" >
          <div v-if="config.webhookSecretMasked" class="absc-masked">Current: {{ config.webhookSecretMasked }}</div>
        </label>
        <label class="st-row absc-field st-row--check" style="margin-top: 8px;">
          <input v-model="form.testMode" type="checkbox" >
          <span>Test mode</span>
        </label>
      </section>

      <!-- Price IDs section -->
      <section class="bw-card">
        <h2 class="bw-card__title absc-title">Stripe Price IDs</h2>
        <p class="absc-hint">These link your plans to Stripe prices. Find them in your Stripe Dashboard under Products.</p>

        <label class="st-row absc-field">
          <span>Vendor Growth — Monthly</span>
          <input v-model="form.priceVendorGrowthMonthly" class="bw-input" placeholder="price_..." >
        </label>
        <label class="st-row absc-field">
          <span>Vendor Growth — Annual</span>
          <input v-model="form.priceVendorGrowthAnnual" class="bw-input" placeholder="price_..." >
        </label>
        <label class="st-row absc-field">
          <span>Buyer Pro — Monthly</span>
          <input v-model="form.priceBuyerProMonthly" class="bw-input" placeholder="price_..." >
        </label>
        <label class="st-row absc-field">
          <span>Buyer Pro — Annual</span>
          <input v-model="form.priceBuyerProAnnual" class="bw-input" placeholder="price_..." >
        </label>
      </section>
    </div>

    <div v-if="lastUpdated" style="font-size: 0.8rem; color: var(--bw-text-muted); margin-top: 12px;">
      Last saved: {{ lastUpdated }}
    </div>

    <p v-if="saveError" class="absc-error">{{ saveError }}</p>
    <p v-if="saved" class="absc-success">Stripe configuration saved.</p>

    <div style="display:flex; gap:10px; margin-top: 20px;">
      <button class="bw-btn bw-btn--primary" :disabled="saving" @click="save">
        {{ saving ? 'Saving…' : 'Save Stripe config' }}
      </button>
      <button class="bw-btn bw-btn--ghost" @click="load">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface StripeConfig {
  publishableKey: string; secretKeyMasked: string; webhookSecretMasked: string
  priceVendorGrowthMonthly: string; priceVendorGrowthAnnual: string
  priceBuyerProMonthly: string; priceBuyerProAnnual: string
  testMode: boolean; updatedAt: string | null
}

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

const config = ref<Partial<StripeConfig>>({})
const form = reactive({
  publishableKey: '', secretKey: '', webhookSecret: '', testMode: false,
  priceVendorGrowthMonthly: '', priceVendorGrowthAnnual: '',
  priceBuyerProMonthly: '', priceBuyerProAnnual: ''
})

const lastUpdated = computed(() => {
  if (!config.value.updatedAt) return null
  return new Date(config.value.updatedAt).toLocaleString()
})

async function load() {
  loading.value = true
  saved.value = false
  saveError.value = ''
  try {
    const data = await $fetch<StripeConfig>('/api/admin/billing/stripe-config')
    config.value = data
    form.publishableKey = data.publishableKey ?? ''
    form.secretKey = ''
    form.webhookSecret = ''
    form.testMode = data.testMode ?? false
    form.priceVendorGrowthMonthly = data.priceVendorGrowthMonthly ?? ''
    form.priceVendorGrowthAnnual = data.priceVendorGrowthAnnual ?? ''
    form.priceBuyerProMonthly = data.priceBuyerProMonthly ?? ''
    form.priceBuyerProAnnual = data.priceBuyerProAnnual ?? ''
  } finally {
    loading.value = false
  }
}
onMounted(() => { load() })

async function save() {
  saving.value = true
  saved.value = false
  saveError.value = ''
  try {
    await $fetch('/api/admin/billing/stripe-config', { method: 'PUT', body: { ...form } })
    saved.value = true
    await load()
    setTimeout(() => { saved.value = false }, 4000)
  } catch (e: any) {
    saveError.value = e?.data?.message ?? 'Failed to save Stripe configuration.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.absc-title { margin-bottom: 8px; }
.absc-hint { font-size: 0.8rem; color: var(--bw-text-muted); margin-bottom: 16px; }
.absc-field { flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 12px; }
.absc-field span { font-size: 0.875rem; }
.absc-masked { font-size: 0.75rem; color: var(--bw-text-muted); font-family: monospace; margin-top: 2px; }
.absc-error { color: var(--mm-danger, #ef4444); font-size: 0.875rem; margin-top: 10px; }
.absc-success { color: var(--mm-success, #22c55e); font-size: 0.875rem; margin-top: 10px; }

.absc-mode-banner {
  border-radius: 6px; padding: 10px 16px; margin-bottom: 20px;
  font-size: 0.875rem;
}
.absc-mode-banner--test { background: rgba(245, 158, 11, 0.15); color: var(--mm-warn, #f59e0b); }
.absc-mode-banner--live { background: rgba(34, 197, 94, 0.12); color: var(--mm-success, #22c55e); }
</style>
