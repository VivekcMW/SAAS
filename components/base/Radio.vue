<script setup lang="ts">
interface Props {
  modelValue?: string | number
  value: string | number
  name?: string
  label?: string
  hint?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  hint: '',
  disabled: false,
  id: ''
})

defineEmits<{ 'update:modelValue': [string | number] }>()
const inputId = props.id || `rb-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <label :for="inputId" :class="['radio', { 'is-disabled': disabled }]">
    <input
      :id="inputId"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      class="radio-input"
      @change="$emit('update:modelValue', value)"
    >
    <span class="radio-box">
      <span class="radio-dot" />
    </span>
    <span v-if="label || $slots.default" class="radio-text">
      <span class="radio-label"><slot>{{ label }}</slot></span>
      <span v-if="hint" class="radio-hint">{{ hint }}</span>
    </span>
  </label>
</template>

<style scoped>
.radio { display: inline-flex; align-items: flex-start; gap: 8px; cursor: pointer; user-select: none; }
.is-disabled { opacity: 0.6; cursor: not-allowed; }

.radio-input { position: absolute; opacity: 0; width: 0; height: 0; }

.radio-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border: 0.5px solid #d1d5db;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 1px;
  transition: border-color 150ms ease;
}
.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff8838;
  transform: scale(0);
  transition: transform 150ms ease;
}
.radio-input:checked + .radio-box { border-color: #ff8838; }
.radio-input:checked + .radio-box .radio-dot { transform: scale(1); }
.radio-input:focus-visible + .radio-box { outline: 2px solid #ff8838; outline-offset: 2px; }

.radio-text { display: flex; flex-direction: column; gap: 2px; line-height: 1.3; }
.radio-label { font-size: 14px; color: #374151; }
.radio-hint { font-size: 12px; color: #6b7280; }
</style>
