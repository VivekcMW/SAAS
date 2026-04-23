<template>
  <BuyerEnquiries v-if="role === 'buyer'" />
  <VendorLeads v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: role.value === 'vendor' ? 'Leads · SaasWorld' : 'Enquiries · SaasWorld' })
</script>
