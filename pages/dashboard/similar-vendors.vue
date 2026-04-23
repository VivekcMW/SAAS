<template>
  <VendorSimilarVendors v-if="role === 'vendor'" />
  <div v-else class="vendor-only bw-empty">This page is vendor-only.</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
const router = useRouter()
onMounted(() => { if (role.value === 'buyer') router.replace('/dashboard/compare') })
useHead({ title: 'Similar vendors · SaasWorld' })
</script>

<style scoped>
.vendor-only { margin: 40px; }
</style>
