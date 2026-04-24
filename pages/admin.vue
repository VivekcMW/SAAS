<template>
  <div class="p-8">Redirecting…</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
definePageMeta({ layout: 'default' })
const { currentUser } = useAuth()
const router = useRouter()
useHead({ title: 'Admin · SaasWorld' })
onMounted(() => {
  if (!currentUser.value) router.replace('/login')
  else if (currentUser.value.role === 'admin') router.replace('/dashboard/overview')
  else router.replace('/')
})
</script>
