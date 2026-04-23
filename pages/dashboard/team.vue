<template>
  <VendorTeamAPI v-if="role === 'vendor'" />
  <div v-else class="vendor-only bw-empty">Team &amp; API is available for vendors.</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
const router = useRouter()
onMounted(() => { if (role.value === 'buyer') router.replace('/dashboard/overview') })
useHead({ title: 'Team · SaasWorld' })
</script>

<style scoped>
.vendor-only { margin: 40px; }
</style>
