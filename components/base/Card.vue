<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
  clickable?: boolean
  to?: string
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hover: false,
  clickable: false,
  to: ''
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="['card', `pad-${padding}`, { 'card-hover': hover, 'card-clickable': true }]"
  >
    <slot />
  </NuxtLink>
  <div
    v-else
    :class="['card', `pad-${padding}`, { 'card-hover': hover, 'card-clickable': clickable }]"
  >
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  display: block;
}

.pad-none { padding: 0; }
.pad-sm { padding: 12px; }
.pad-md { padding: 16px; }
.pad-lg { padding: 24px; }

.card-clickable { cursor: pointer; }
.card-hover { transition: background-color 150ms ease; }
.card-hover:hover { background: #f9fafb; }
</style>
