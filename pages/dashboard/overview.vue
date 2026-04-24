<template>
  <AdminOverview v-if="role === 'admin'" />
  <VendorOverview v-else-if="role === 'vendor'" />
  <BuyerOverview v-else-if="role === 'buyer'" :first-name="currentUser?.firstName" />
  <div v-else class="p-8">Loading…</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Overview · SaasWorld' })
</script>
