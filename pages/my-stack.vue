<script setup lang="ts">
// Redirect to the canonical stack page which uses the real DB-backed API
definePageMeta({ layout: false })
await navigateTo('/dashboard/stack', { replace: true })
</script>
<template><div /></template>
