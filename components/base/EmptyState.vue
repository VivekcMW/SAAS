<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Nothing here yet',
  description: '',
  icon: true
})
</script>

<template>
  <div class="empty">
    <div v-if="icon && !$slots.icon" class="empty-icon">
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <circle cx="24" cy="24" r="20" stroke="#e5e7eb" stroke-width="1.5" />
        <path d="M16 24h16M24 16v16" stroke="#e5e7eb" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </div>
    <slot name="icon" />
    <h4 class="empty-title">{{ title }}</h4>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}
.empty-icon { margin-bottom: 12px; }
.empty-title { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #1f2937; }
.empty-description { margin: 0; font-size: 14px; color: #6b7280; max-width: 420px; }
.empty-action { margin-top: 16px; }
</style>
