<template>
  <BuyerStack v-if="currentUser" />
  <div v-else class="p-8">Loading…</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const router = useRouter()
useHead({ title: 'My Stack — Moonmart' })
onMounted(() => {
  if (currentUser.value === null) router.replace('/login')
})
</script>
