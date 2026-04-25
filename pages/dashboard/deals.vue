<template>
  <BuyerDeals v-if="role === 'buyer'" />
  <div v-else class="bw">
    <div class="bw-empty">
      <h3 class="bw-empty__title">Available to buyers</h3>
      <p class="bw-empty__desc">This page is part of the buyer workspace.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Deals — Moonmart' })
</script>
