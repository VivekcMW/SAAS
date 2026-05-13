<script setup lang="ts">
/**
 * /admin/campaigns — Admin SEM Campaign Review & Approval
 *
 * Lists all vendor campaigns across all apps. Admin can activate/pause/archive.
 */
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'default', middleware: 'admin' })

useHead({ title: 'SEM Campaigns — Admin | Moonmart' })

interface Campaign {
  id: string
  app_id: string
  app_name: string
  app_slug: string
  vendor_id: string
  platform: string
  campaign_type: string
  status: string
  daily_budget: number
  keywords: string
  ad_headlines: string
  ad_descriptions: string
  created_at: string
  updated_at: string
}

const campaigns = ref<Campaign[]>([])
const loading = ref(true)
const actionMessage = ref('')
const expandedId = ref<string | null>(null)

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-red-100 text-red-600',
}

onMounted(async () => {
  await loadCampaigns()
})

async function loadCampaigns() {
  loading.value = true
  try {
    const res = await $fetch<{ campaigns: Campaign[] }>('/api/admin/ads/campaigns')
    campaigns.value = res.campaigns
  } catch { /* ignore */ }
  loading.value = false
}

async function setStatus(id: string, status: string) {
  try {
    await $fetch(`/api/ads/campaigns/${id}`, { method: 'PATCH', body: { status } })
    await loadCampaigns()
    actionMessage.value = `Campaign ${status}.`
    setTimeout(() => { actionMessage.value = '' }, 3000)
  } catch { actionMessage.value = 'Action failed.' }
}

const byStatus = computed(() => {
  const order = ['draft', 'active', 'paused', 'archived']
  return [...campaigns.value].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
})

function keywords(c: Campaign): string[] {
  try { return JSON.parse(c.keywords) } catch { return [] }
}
function headlines(c: Campaign): string[] {
  try { return JSON.parse(c.ad_headlines) } catch { return [] }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">SEM Campaigns</h1>
        <p class="text-gray-500 text-sm">Review and activate vendor advertising campaigns</p>
      </div>
      <span v-if="actionMessage" class="text-sm text-green-700 font-medium">{{ actionMessage }}</span>
    </div>

    <!-- Status summary pills -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <span v-for="st in ['draft', 'active', 'paused', 'archived']" :key="st"
        :class="['px-3 py-1 rounded-full text-sm font-semibold', STATUS_COLORS[st]]">
        {{ campaigns.filter(c => c.status === st).length }} {{ st }}
      </span>
    </div>

    <div class="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-left">
            <th class="px-4 py-3 font-semibold text-gray-600">App</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Platform</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Type</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Budget/day</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Status</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Created</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-10 text-gray-400">Loading…</td>
          </tr>
          <tr v-else-if="!campaigns.length">
            <td colspan="7" class="text-center py-10 text-gray-400">No campaigns yet</td>
          </tr>
          <template v-for="c in byStatus" :key="c.id">
            <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" @click="expandedId = expandedId === c.id ? null : c.id">
              <td class="px-4 py-3">
                <NuxtLink :to="`/marketplace/app/${c.app_slug}`" class="font-medium text-orange-600 hover:underline" @click.stop>{{ c.app_name }}</NuxtLink>
              </td>
              <td class="px-4 py-3 capitalize text-gray-700">{{ c.platform }}</td>
              <td class="px-4 py-3 text-gray-700">{{ c.campaign_type }}</td>
              <td class="px-4 py-3 text-gray-700">${{ c.daily_budget }}</td>
              <td class="px-4 py-3">
                <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600']">{{ c.status }}</span>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(c.created_at).toLocaleDateString() }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2 flex-wrap">
                  <button v-if="c.status === 'draft' || c.status === 'paused'"
                    class="text-xs bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700"
                    @click.stop="setStatus(c.id, 'active')">Activate</button>
                  <button v-if="c.status === 'active'"
                    class="text-xs bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                    @click.stop="setStatus(c.id, 'paused')">Pause</button>
                  <button v-if="c.status !== 'archived'"
                    class="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                    @click.stop="setStatus(c.id, 'archived')">Archive</button>
                </div>
              </td>
            </tr>
            <!-- Expanded row: keywords + headlines -->
            <tr v-if="expandedId === c.id" class="bg-blue-50 border-b border-gray-100">
              <td colspan="7" class="px-6 py-4">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 mb-1">Keywords</p>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="kw in keywords(c)" :key="kw" class="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-700">{{ kw }}</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 mb-1">Ad Headlines</p>
                    <ul class="text-xs text-gray-700 list-disc list-inside space-y-0.5">
                      <li v-for="h in headlines(c)" :key="h">{{ h }}</li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
