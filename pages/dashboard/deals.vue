<template>
  <BuyerDeals v-if="role === 'buyer'" />
  <VendorDeals v-else-if="role === 'vendor' || role === 'admin'" />
  <div v-else class="bw">
    <div class="bw-empty">
      <h3 class="bw-empty__title">Please log in</h3>
      <p class="bw-empty__desc">Sign in to view your deals.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Deals — Moonmart' })
</script>
