<template>
  <VendorSponsorships />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const router = useRouter()
useHead({ title: 'Sponsorships · Moonmart Vendor' })
onMounted(() => {
  if (currentUser.value && currentUser.value.role !== 'vendor') router.replace('/dashboard/overview')
})
</script>
