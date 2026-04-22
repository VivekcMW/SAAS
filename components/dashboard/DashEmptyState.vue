<template>
  <div class="dash-empty">
    <div v-if="icon" class="dash-empty__icon" aria-hidden="true" v-html="icon" />
    <h3 class="dash-empty__title">{{ title }}</h3>
    <p v-if="description" class="dash-empty__desc">{{ description }}</p>
    <div v-if="$slots.actions" class="dash-empty__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<style scoped>
.dash-empty {
  background: #fff;
  border: 1px dashed #e4e0dc;
  border-radius: 14px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 540px;
  margin: 0 auto;
}
.dash-empty__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.dash-empty__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.4rem;
}
.dash-empty__desc {
  color: #71717a;
  font-size: 0.92rem;
  margin: 0 0 1.25rem;
  line-height: 1.55;
}
.dash-empty__actions { display: inline-flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
</style>
