<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Ensure critical CSS is loaded early
useHead({
  link: [
    { rel: 'stylesheet', href: '/styles.css' }
  ]
})
</script>

<style>
/* App-level global overrides — DO NOT define tokens here; see assets/css/tokens.css */

/* Container utility (used across pages) */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--sp-4, 1rem);
}
</style>
