<script setup lang="ts">
/**
 * VendorPromoteApp.vue
 *
 * Promote widget for vendor dashboard listing cards.
 * Shows current campaign status and lets vendors create a new campaign draft.
 *
 * Props:
 *   appId   — app_listings.id
 *   appName — display name
 */
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  appId: string
  appName: string
}>()

interface Campaign {
  id: string
  status: string
  platform: string
  daily_budget: number
  impressions: number
  clicks: number
  spend: number
  created_at: string
}

const campaigns = ref<Campaign[]>([])
const loading = ref(false)
const showForm = ref(false)
const submitting = ref(false)
const success = ref(false)
const error = ref('')

// Form state
const form = ref({
  dailyBudget: 10,
  platform: 'google',
  campaignType: 'search',
})

const activeCampaign = computed(() => campaigns.value.find(c => c.status === 'active'))
const draftCampaign = computed(() => campaigns.value.find(c => c.status === 'draft'))
const hasCampaign = computed(() => campaigns.value.length > 0)

const statusColor = (status: string) => ({
  active: 'text-green-700 bg-green-100',
  draft: 'text-yellow-700 bg-yellow-100',
  paused: 'text-gray-600 bg-gray-100',
  archived: 'text-red-700 bg-red-100',
}[status] || 'text-gray-600 bg-gray-100')

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch<{ campaigns: Campaign[] }>(`/api/ads/campaigns?appId=${props.appId}`)
    campaigns.value = data.campaigns
  } catch { /* ignore — user may not be vendor yet */ }
  loading.value = false
})

async function submitCampaign() {
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/ads/campaigns', {
      method: 'POST',
      body: {
        appId: props.appId,
        platform: form.value.platform,
        campaignType: form.value.campaignType,
        dailyBudget: form.value.dailyBudget,
      }
    })
    // Refresh
    const data = await $fetch<{ campaigns: Campaign[] }>(`/api/ads/campaigns?appId=${props.appId}`)
    campaigns.value = data.campaigns
    success.value = true
    showForm.value = false
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage || 'Failed to create campaign. Please try again.'
  }
  submitting.value = false
}
</script>

<template>
  <div class="vendor-promote-widget">
    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse h-10 bg-gray-100 rounded-md" />

    <!-- Has campaign -->
    <template v-else-if="hasCampaign">
      <div v-for="camp in campaigns" :key="camp.id" class="campaign-row">
        <div class="campaign-info">
          <span :class="['campaign-status-pill', statusColor(camp.status)]">
            {{ camp.status.charAt(0).toUpperCase() + camp.status.slice(1) }}
          </span>
          <span class="campaign-platform text-gray-500 text-xs ml-2">{{ camp.platform }}</span>
          <span class="campaign-budget text-gray-500 text-xs ml-2">${{ camp.daily_budget }}/day</span>
        </div>
        <div v-if="camp.status === 'active'" class="campaign-stats text-xs text-gray-500 mt-1">
          {{ camp.impressions.toLocaleString() }} impressions · {{ camp.clicks.toLocaleString() }} clicks · ${{ camp.spend.toFixed(2) }} spent
        </div>
        <div v-if="camp.status === 'draft'" class="text-xs text-yellow-700 mt-1">
          Pending admin review to activate
        </div>
      </div>

      <!-- Success toast -->
      <div v-if="success" class="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
        Campaign draft submitted! Our team will review and activate it shortly.
      </div>
    </template>

    <!-- No campaign yet — show Promote button -->
    <template v-else>
      <button
        v-if="!showForm"
        class="promote-btn"
        @click="showForm = true"
      >
        ⚡ Promote {{ appName }}
      </button>

      <!-- Promote form -->
      <div v-if="showForm" class="promote-form">
        <h4 class="form-title">Create Ad Campaign</h4>

        <div class="form-field">
          <label class="form-label">Daily Budget (USD)</label>
          <input
            v-model.number="form.dailyBudget"
            type="range"
            min="5"
            max="100"
            step="5"
            class="form-range"
          >
          <span class="form-range-value">${{ form.dailyBudget }}/day</span>
        </div>

        <div class="form-field">
          <label class="form-label">Platform</label>
          <div class="platform-toggle">
            <button
              :class="['platform-btn', form.platform === 'google' ? 'active' : '']"
              @click="form.platform = 'google'"
            >Google Ads</button>
            <button
              :class="['platform-btn', form.platform === 'bing' ? 'active' : '']"
              @click="form.platform = 'bing'"
            >Bing Ads</button>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">Campaign Type</label>
          <div class="platform-toggle">
            <button
              :class="['platform-btn', form.campaignType === 'search' ? 'active' : '']"
              @click="form.campaignType = 'search'"
            >Search</button>
            <button
              :class="['platform-btn', form.campaignType === 'dsa' ? 'active' : '']"
              @click="form.campaignType = 'dsa'"
            >DSA</button>
          </div>
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>

        <div class="form-actions">
          <button class="btn-cancel" @click="showForm = false">Cancel</button>
          <button class="btn-submit" :disabled="submitting" @click="submitCampaign">
            {{ submitting ? 'Submitting…' : 'Submit for Review' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.vendor-promote-widget { font-size: 13px; }
.campaign-row { padding: 8px 0; }
.campaign-info { display: flex; align-items: center; }
.campaign-status-pill { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; }

.promote-btn {
  background: #f97316;
  color: #fff;
  border: none;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.promote-btn:hover { background: #ea6c0a; }

.promote-form { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-top: 8px; background: #fafafa; }
.form-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #111827; }
.form-field { margin-bottom: 12px; }
.form-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 5px; }
.form-range { width: 100%; accent-color: #f97316; }
.form-range-value { font-size: 13px; font-weight: 700; color: #f97316; }

.platform-toggle { display: flex; gap: 6px; }
.platform-btn { flex: 1; padding: 5px 0; font-size: 12px; font-weight: 600; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; background: #fff; color: #374151; transition: all 0.12s; }
.platform-btn.active { background: #f97316; border-color: #f97316; color: #fff; }

.form-error { color: #dc2626; font-size: 12px; margin-bottom: 8px; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
.btn-cancel { padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; background: #fff; color: #374151; }
.btn-submit { padding: 6px 14px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
