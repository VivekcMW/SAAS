<script setup lang="ts">
interface Props {
  modelValue?: boolean | (string | number)[]
  value?: string | number
  label?: string
  hint?: string
  disabled?: boolean
  indeterminate?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: '',
  label: '',
  hint: '',
  disabled: false,
  indeterminate: false,
  id: ''
})

const emit = defineEmits<{ 'update:modelValue': [boolean | (string | number)[]] }>()

const inputId = props.id || `cb-${Math.random().toString(36).slice(2, 9)}`

const isChecked = () => {
  if (Array.isArray(props.modelValue)) return props.modelValue.includes(props.value)
  return !!props.modelValue
}

const onChange = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  if (Array.isArray(props.modelValue)) {
    const arr = [...props.modelValue]
    if (checked) arr.push(props.value)
    else {
      const i = arr.indexOf(props.value)
      if (i > -1) arr.splice(i, 1)
    }
    emit('update:modelValue', arr)
  } else {
    emit('update:modelValue', checked)
  }
}
</script>

<template>
  <label :for="inputId" :class="['checkbox', { 'is-disabled': disabled }]">
    <input
      :id="inputId"
      type="checkbox"
      :checked="isChecked()"
      :disabled="disabled"
      :indeterminate="indeterminate"
      class="checkbox-input"
      @change="onChange"
    >
    <span class="checkbox-box">
      <svg v-if="!indeterminate" viewBox="0 0 16 16" fill="none" class="checkbox-check">
        <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 16 16" fill="none" class="checkbox-check">
        <path d="M4 8h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="checkbox-text">
      <span class="checkbox-label"><slot>{{ label }}</slot></span>
      <span v-if="hint" class="checkbox-hint">{{ hint }}</span>
    </span>
  </label>
</template>

<style scoped>
.checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.is-disabled { opacity: 0.6; cursor: not-allowed; }

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border: 0.5px solid #d1d5db;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 1px;
  color: transparent;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.checkbox-check { width: 12px; height: 12px; }

.checkbox-input:checked + .checkbox-box,
.checkbox-input:indeterminate + .checkbox-box {
  background: #ff8838;
  border-color: #ff8838;
  color: #ffffff;
}
.checkbox-input:focus-visible + .checkbox-box { outline: 2px solid #ff8838; outline-offset: 2px; }

.checkbox-text { display: flex; flex-direction: column; gap: 2px; line-height: 1.3; }
.checkbox-label { font-size: 14px; color: #374151; }
.checkbox-hint { font-size: 12px; color: #6b7280; }
</style>
