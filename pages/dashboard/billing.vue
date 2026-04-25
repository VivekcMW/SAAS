<template>
  <BuyerBilling v-if="role === 'buyer'" />
  <VendorBillingPlan v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Billing · Moonmart' })
</script>
