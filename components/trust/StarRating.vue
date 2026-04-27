<template>
  <span class="star-rating" :title="`${rating} out of 5`" :aria-label="`${rating} out of 5 stars`">
    <span v-for="i in 5" :key="i" class="star" :class="starClass(i)">&#9733;</span>
    <span v-if="showNumber" class="star-rating__num">{{ rating }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ rating: number; showNumber?: boolean }>()
function starClass(i: number) {
  if (i <= Math.floor(props.rating)) return 'star--full'
  if (i === Math.ceil(props.rating) && props.rating % 1 >= 0.5) return 'star--half'
  return 'star--empty'
}
</script>

<style scoped>
.star-rating { display: inline-flex; align-items: center; gap: 1px; }
.star { font-size: 1rem; line-height: 1; }
.star--full  { color: #f59e0b; }
.star--half  { color: #f59e0b; opacity: 0.6; }
.star--empty { color: #d1d5db; }
.star-rating__num { font-size: 0.875rem; font-weight: 600; color: #374151; margin-left: 4px; }
</style>
