<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Content Configuration</h1>
        <p class="bw-head__sub">Manage site-wide banners and other content settings.</p>
      </div>
    </header>

    <!-- Tab bar -->
    <div class="ac-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="ac-tab"
        :class="{ 'ac-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="ac-tab__icon" v-html="tab.icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab panels -->
    <AdminBannerConfig v-if="activeTab === 'banner'" />
    <ClientOnly v-else-if="activeTab === 'geomap'">
      <AdminGeoMap />
    </ClientOnly>
    <AdminReviews v-else-if="activeTab === 'reviews'" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
definePageMeta({ layout: false })
useHead({ title: 'Content Configuration · Admin' })

const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role ?? 'buyer')
if (role.value !== 'admin') await navigateTo('/dashboard/overview', { replace: true })

const activeTab = ref('banner')

const tabs = [
  {
    id: 'banner',
    label: 'Welcome Banner',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg>`,
  },
  {
    id: 'geomap',
    label: 'Visitor Map',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  },
  {
    id: 'reviews',
    label: 'Review Moderation',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
]
</script>

<style scoped>
.ac-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--bw-border);
  margin-bottom: 24px;
  padding-bottom: 0;
}
.ac-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bw-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 0.15s;
}
.ac-tab:hover { color: var(--bw-text); }
.ac-tab--active {
  color: var(--bw-text);
  border-bottom-color: var(--mm-accent, #3B82F6);
}
.ac-tab__icon {
  display: flex;
  align-items: center;
  opacity: 0.7;
}
.ac-tab--active .ac-tab__icon { opacity: 1; }
</style>
