<template>
  <BuyerReviews v-if="role === 'buyer'" />
  <VendorReviews v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Reviews · Moonmart' })
</script>
