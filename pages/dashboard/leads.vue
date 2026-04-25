<template>
  <VendorLeads v-if="role === 'vendor'" />
  <BuyerEnquiries v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Leads · Moonmart' })
</script>
