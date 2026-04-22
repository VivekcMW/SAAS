<script setup lang="ts">
interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: Option[]
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select...',
  label: '',
  hint: '',
  error: '',
  disabled: false,
  required: false,
  id: '',
  size: 'md'
})

defineEmits<{ 'update:modelValue': [string | number] }>()
const inputId = props.id || `sel-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['field', { 'field-error': error }]">
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}<span v-if="required" class="field-required">*</span>
    </label>
    <div class="field-wrap">
      <select
        :id="inputId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="['field-select', `field-${size}`]"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>
      <svg class="field-chevron" viewBox="0 0 20 20" fill="none">
        <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <p v-if="error" class="field-message field-message-error">{{ error }}</p>
    <p v-else-if="hint" class="field-message">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 13px; font-weight: 500; color: #374151; }
.field-required { color: #dc2626; margin-left: 2px; }

.field-wrap {
  position: relative;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 150ms ease;
}
.field-wrap:focus-within { border-color: #ff8838; }
.field-error .field-wrap { border-color: #dc2626; }

.field-select {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #1f2937;
  font-family: inherit;
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
}

.field-sm { padding: 6px 10px; font-size: 13px; }
.field-md { padding: 8px 12px; font-size: 14px; }
.field-lg { padding: 11px 14px; font-size: 15px; }

.field-chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #6b7280;
  pointer-events: none;
}

.field-select:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

.field-message { font-size: 12px; color: #6b7280; margin: 0; }
.field-message-error { color: #dc2626; }
</style>
