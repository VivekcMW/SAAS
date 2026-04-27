<template>
  <AdminDiscoveryQueue v-if="role === 'admin'" />
  <div v-else class="p-8">Access restricted.</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const router = useRouter()
const role = computed(() => currentUser.value?.role)
useHead({ title: 'Auto-Discovery Queue · Moonmart Admin' })
onMounted(() => {
  if (currentUser.value && currentUser.value.role !== 'admin') router.replace('/dashboard/overview')
})
</script>
