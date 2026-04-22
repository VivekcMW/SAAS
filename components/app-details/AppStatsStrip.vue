<script setup lang="ts">
interface Stat {
  label: string
  value: string | number
  icon?: string
  hint?: string
}

interface Props {
  stats: Stat[]
}

defineProps<Props>()
</script>

<template>
  <div class="stats-strip">
    <div v-for="(s, i) in stats" :key="i" class="stat">
      <div class="stat-head">
        <Icon v-if="s.icon" :name="s.icon" class="stat-icon" />
        <span class="stat-label">{{ s.label }}</span>
      </div>
      <div class="stat-value">{{ s.value }}</div>
      <div v-if="s.hint" class="stat-hint">{{ s.hint }}</div>
    </div>
  </div>
</template>

<style scoped>
.stats-strip {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.stat {
  padding: 16px;
  border-right: 0.5px solid #e5e7eb;
}
.stat:last-child { border-right: none; }

.stat-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.stat-icon { width: 14px; height: 14px; color: #9ca3af; }
.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}
.stat-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

@media (max-width: 900px) {
  .stats-strip { grid-template-columns: repeat(3, 1fr); }
  .stat:nth-child(3n) { border-right: none; }
  .stat:nth-child(n+4) { border-top: 0.5px solid #e5e7eb; }
}
@media (max-width: 500px) {
  .stats-strip { grid-template-columns: repeat(2, 1fr); }
  .stat { border-right: 0.5px solid #e5e7eb; }
  .stat:nth-child(2n) { border-right: none; }
  .stat:nth-child(n+3) { border-top: 0.5px solid #e5e7eb; }
  .stat:nth-child(3n) { border-right: 0.5px solid #e5e7eb; }
}
</style>
