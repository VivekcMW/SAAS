<template>
  <header class="dash-page-header">
    <div class="dash-page-header__left">
      <span v-if="eyebrow" class="dash-page-header__eyebrow">{{ eyebrow }}</span>
      <h1 class="dash-page-header__title">{{ title }}</h1>
      <p v-if="description" class="dash-page-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="dash-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  eyebrow?: string
  description?: string
}>()
</script>

<style scoped>
.dash-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}
.dash-page-header__left { min-width: 0; flex: 1; }
.dash-page-header__eyebrow {
  display: inline-block;
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sw-primary, #ff8838);
  margin-bottom: 0.4rem;
}
.dash-page-header__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e1e1e;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.2;
}
.dash-page-header__desc {
  color: #71717a;
  font-size: 0.95rem;
  margin: 0.4rem 0 0;
  max-width: 680px;
  line-height: 1.55;
}
.dash-page-header__actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
</style>
