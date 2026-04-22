<script setup lang="ts">
interface Badge {
  label: string
  icon?: string
  hint?: string
}

interface Props {
  badges: Badge[]
}

defineProps<Props>()
</script>

<template>
  <div v-if="badges.length" class="trust-row">
    <span
      v-for="b in badges"
      :key="b.label"
      class="trust-badge"
      :title="b.hint"
    >
      <Icon v-if="b.icon" :name="b.icon" class="trust-icon" />
      <span>{{ b.label }}</span>
    </span>
  </div>
</template>

<style scoped>
.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
}
.trust-icon { width: 12px; height: 12px; color: #6b7280; }
</style>
