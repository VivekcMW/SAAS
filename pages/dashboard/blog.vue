<template>
  <AdminBlog v-if="role === 'admin'" />
  <div v-else class="bw">
    <div class="bw-empty">
      <h3 class="bw-empty__title">Admin only</h3>
      <p class="bw-empty__desc">Blog management is restricted to administrators.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
definePageMeta({ layout: false })
const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')
useHead({ title: 'Blog CMS · Admin' })
</script>
