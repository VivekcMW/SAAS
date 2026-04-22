<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '14px',
  rounded: 'sm',
  block: false
})
</script>

<template>
  <span
    :class="['skeleton', `r-${rounded}`, { 'skeleton-block': block }]"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton {
  display: inline-block;
  background: #f3f4f6;
  background-image: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}
.skeleton-block { display: block; }

.r-sm { border-radius: 4px; }
.r-md { border-radius: 6px; }
.r-lg { border-radius: 8px; }
.r-full { border-radius: 999px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
