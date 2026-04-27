<template>
  <div class="auth-badge" :class="`auth-badge--${level}`" :title="tooltip">
    <svg v-if="level === 'highly-verified'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4"/><path d="M12 2l2.4 4.8 5.6.8-4 3.9.9 5.5L12 14.4l-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/></svg>
    <svg v-else-if="level === 'verified'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  level: 'highly-verified' | 'verified' | 'basic' | 'unverified'
  score?: number
}>()

const label = computed(() => {
  const map: Record<string, string> = {
    'highly-verified': 'Verified Purchase',
    'verified': 'Verified',
    'basic': 'Basic',
    'unverified': 'Unverified'
  }
  return map[props.level] || 'Unverified'
})

const tooltip = computed(() => {
  if (props.score !== undefined) {
    return `Authenticity score: ${props.score}% — ${label.value}`
  }
  const map: Record<string, string> = {
    'highly-verified': 'This reviewer confirmed their purchase. Moonmart verified this review.',
    'verified': 'This review passed our authenticity checks.',
    'basic': 'Basic review — limited verification signals.',
    'unverified': 'This review has not been verified.'
  }
  return map[props.level]
})
</script>

<style scoped>
.auth-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}
.auth-badge--highly-verified { background: #d1fae5; color: #065f46; }
.auth-badge--verified        { background: #dbeafe; color: #1d4ed8; }
.auth-badge--basic           { background: #fef3c7; color: #92400e; }
.auth-badge--unverified      { background: #f3f4f6; color: #6b7280; }
</style>
