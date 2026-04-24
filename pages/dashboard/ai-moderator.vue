<template>
  <AdminAIModerator v-if="role === 'admin'" />
  <div v-else class="p-8">Loading…</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const router = useRouter()
const role = computed(() => currentUser.value?.role)
useHead({ title: 'AI Moderator · SaasWorld' })
onMounted(() => {
  if (currentUser.value && currentUser.value.role !== 'admin') router.replace('/dashboard/overview')
})
</script>
