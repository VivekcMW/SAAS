<script setup lang="ts">
interface Props {
  vertical?: boolean
  label?: string
  spacing?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  vertical: false,
  label: '',
  spacing: 'md'
})
</script>

<template>
  <div v-if="!vertical" :class="['divider-h', `sp-${spacing}`]" aria-hidden="true">
    <span v-if="label" class="divider-label">{{ label }}</span>
  </div>
  <span v-else class="divider-v" aria-hidden="true" />
</template>

<style scoped>
.divider-h {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #9ca3af;
  font-size: 12px;
}
.divider-h::before,
.divider-h::after {
  content: "";
  flex: 1;
  height: 0.5px;
  background: #e5e7eb;
}
.divider-h:not(:has(.divider-label))::after { display: none; }

.sp-sm { margin: 8px 0; }
.sp-md { margin: 16px 0; }
.sp-lg { margin: 24px 0; }

.divider-label { white-space: nowrap; }

.divider-v {
  display: inline-block;
  width: 0.5px;
  align-self: stretch;
  background: #e5e7eb;
  margin: 0 8px;
}
</style>
