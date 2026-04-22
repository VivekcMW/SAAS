<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
  shape: 'circle'
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
})
</script>

<template>
  <span :class="['avatar', `size-${size}`, `shape-${shape}`]" :aria-label="alt || name">
    <img v-if="src" :src="src" :alt="alt || name" class="avatar-img">
    <span v-else class="avatar-initials">{{ initials }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.shape-circle { border-radius: 50%; }
.shape-square { border-radius: 6px; }

.size-xs { width: 20px; height: 20px; font-size: 9px; }
.size-sm { width: 28px; height: 28px; font-size: 11px; }
.size-md { width: 36px; height: 36px; font-size: 13px; }
.size-lg { width: 48px; height: 48px; font-size: 16px; }
.size-xl { width: 64px; height: 64px; font-size: 20px; }

.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { line-height: 1; }
</style>
