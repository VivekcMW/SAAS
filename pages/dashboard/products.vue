<template>
  <AdminApps v-if="role === 'admin'" />
  <BuyerSavedApps v-else-if="role === 'buyer'" />
  <VendorListings v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: role.value === 'vendor' ? 'Listings · Moonmart' : 'Saved apps · Moonmart' })
</script>
