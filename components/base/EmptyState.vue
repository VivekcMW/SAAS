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
        <circle cx="24" cy="24" r="20" stroke="var(--b2)" stroke-width="1.5" />
        <path d="M16 24h16M24 16v16" stroke="var(--b2)" stroke-width="1.5" stroke-linecap="round" />
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
  color: var(--mm-slate);
}
.empty-icon { margin-bottom: 12px; }
.empty-title { margin: 0 0 4px; font-size: var(--t-base); font-weight: 600; color: var(--mm-pearl); }
.empty-description { margin: 0; font-size: var(--t-base); color: var(--mm-slate); max-width: 420px; }
.empty-action { margin-top: 16px; }
</style>
