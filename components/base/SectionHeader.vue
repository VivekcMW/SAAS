<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  align: 'left',
  as: 'h2'
})
</script>

<template>
  <header :class="['section-header', `align-${align}`]">
    <div class="section-header-text">
      <component :is="as" class="section-title">{{ title }}</component>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action" class="section-action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.align-center { flex-direction: column; align-items: center; text-align: center; }

.section-header-text { min-width: 0; }

.section-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.25;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.section-action { flex-shrink: 0; }

@media (max-width: 600px) {
  .section-header { flex-direction: column; align-items: flex-start; }
  .section-title { font-size: 19px; }
}
</style>
