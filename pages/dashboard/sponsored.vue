<template>
  <AdminSponsored />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const router = useRouter()
useHead({ title: 'Sponsored Slots · Moonmart Admin' })
onMounted(() => {
  if (currentUser.value && currentUser.value.role !== 'admin') router.replace('/dashboard/overview')
})
</script>
