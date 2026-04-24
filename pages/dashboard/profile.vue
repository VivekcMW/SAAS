<template>
  <BuyerProfile v-if="role === 'buyer' || role === 'admin'" />
  <VendorCompanyProfile v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Profile · SaasWorld' })
</script>
