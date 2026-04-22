<script setup lang="ts">
interface Step {
  label: string
  description?: string
}

interface Props {
  modelValue: number
  steps: Step[]
  clickable?: boolean
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  clickable: false,
  orientation: 'horizontal'
})

const emit = defineEmits<{ 'update:modelValue': [number] }>()

const goTo = (i: number, clickable: boolean) => {
  if (clickable) emit('update:modelValue', i)
}
</script>

<template>
  <ol :class="['stepper', `st-${orientation}`]">
    <li
      v-for="(s, i) in steps"
      :key="i"
      :class="['step', { active: i === modelValue, done: i < modelValue, clickable }]"
      @click="goTo(i, clickable)"
    >
      <span class="step-marker">
        <svg v-if="i < modelValue" viewBox="0 0 16 16" fill="none" width="12" height="12">
          <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span v-else>{{ i + 1 }}</span>
      </span>
      <div class="step-text">
        <span class="step-label">{{ s.label }}</span>
        <span v-if="s.description" class="step-desc">{{ s.description }}</span>
      </div>
      <span v-if="i < steps.length - 1" class="step-connector" />
    </li>
  </ol>
</template>

<style scoped>
.stepper { list-style: none; margin: 0; padding: 0; display: flex; }
.st-horizontal { flex-direction: row; gap: 0; align-items: flex-start; }
.st-vertical { flex-direction: column; gap: 12px; }

.step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.st-vertical .step { flex: none; }

.step.clickable { cursor: pointer; }

.step-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff;
  border: 0.5px solid #d1d5db;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.step.active .step-marker { background: #ff8838; border-color: #ff8838; color: #ffffff; }
.step.done .step-marker { background: #16a34a; border-color: #16a34a; color: #ffffff; }

.step-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.3; }
.step-label { font-size: 13px; font-weight: 500; color: #1f2937; }
.step.active .step-label { color: #ff8838; }
.step-desc { font-size: 12px; color: #6b7280; }

.step-connector {
  height: 0.5px;
  background: #e5e7eb;
  flex: 1;
  margin: 0 8px;
  align-self: center;
}
.step.done .step-connector { background: #16a34a; }

.st-vertical .step-connector {
  position: absolute;
  left: 13px;
  top: 28px;
  bottom: -18px;
  width: 0.5px;
  height: auto;
  margin: 0;
}
</style>
