<template>
  <div class="dash-page">
    <VendorReviewRequests v-if="currentUser" />
    <div v-else class="p-8">Loading…</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const router = useRouter()
useHead({ title: 'Review Requests — Moonmart' })
onMounted(() => {
  if (currentUser.value === null) router.replace('/login')
})
</script>
