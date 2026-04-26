<template>
  <VendorNews v-if="role === 'vendor' || role === 'admin'" />
  <div v-else class="dn-buyer">
    <p>News management is only available to vendors.</p>
    <NuxtLink to="/dashboard">Back to dashboard</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'News · Moonmart' })
</script>

<style scoped>
.dn-buyer {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 24px; color: var(--mm-slate); font-size: 15px; text-align: center;
}
.dn-buyer a { color: var(--mm-sea); text-decoration: none; }
.dn-buyer a:hover { text-decoration: underline; }
</style>
