<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Billing Configuration</h1>
        <p class="bw-head__sub">Manage plans, subscriptions, refunds and Stripe settings.</p>
      </div>
    </header>

    <!-- Tab bar -->
    <div class="ab-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="ab-tab"
        :class="{ 'ab-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="ab-tab__badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Tab panels -->
    <AdminBillingPlans v-if="activeTab === 'plans'" />
    <AdminBillingSubscriptions v-else-if="activeTab === 'subscriptions'" />
    <AdminBillingRefunds v-else-if="activeTab === 'refunds'" @pending-count="setPendingCount" />
    <AdminBillingStripeConfig v-else-if="activeTab === 'stripe'" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
definePageMeta({ layout: false })
useHead({ title: 'Billing Configuration · Admin' })

const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role ?? 'buyer')
if (role.value !== 'admin') await navigateTo('/dashboard/overview', { replace: true })

const activeTab = ref('plans')
const pendingRefunds = ref(0)

function setPendingCount(n: number) {
  pendingRefunds.value = n
}

const tabs = computed(() => [
  { id: 'plans', label: 'Plan Manager' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'refunds', label: 'Refund Requests', badge: pendingRefunds.value || undefined },
  { id: 'stripe', label: 'Stripe Config' }
])
</script>

<style scoped>
.ab-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--bw-border);
  margin-bottom: 24px;
  padding-bottom: 0;
}
.ab-tab {
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bw-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: -1px;
  transition: color 0.15s;
}
.ab-tab:hover { color: var(--bw-text); }
.ab-tab--active {
  color: var(--bw-text);
  border-bottom-color: var(--mm-accent, #3B82F6);
}
.ab-tab__badge {
  background: var(--mm-warn, #f59e0b);
  color: #000;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}
</style>
