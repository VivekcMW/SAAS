<template>
  <div>
    <!-- Redirecting to billing page -->
  </div>
</template>

<script setup lang="ts">
// Redirect subscriptions to billing page since they are now consolidated
await navigateTo('/dashboard/billing', { replace: true });
</script>
