<template>
  <BuyerSavedApps v-if="role === 'buyer'" />
  <VendorListings v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: role.value === 'vendor' ? 'Listings · SaasWorld' : 'Saved apps · SaasWorld' })
</script>
