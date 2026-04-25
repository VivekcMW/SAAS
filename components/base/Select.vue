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
.field-label { font-size: var(--t-sm); font-weight: 500; color: var(--mm-silver); }
.field-required { color: var(--mm-err, #dc2626); margin-left: 2px; }

.field-wrap {
  position: relative;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  transition: border-color 150ms ease;
}
.field-wrap:focus-within { border-color: var(--mm-gold); }
.field-error .field-wrap { border-color: var(--mm-err, #dc2626); }

.field-select {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--mm-pearl);
  font-family: var(--f-ui);
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
}

.field-sm { padding: 6px 10px; font-size: var(--t-sm); }
.field-md { padding: 8px 12px; font-size: var(--t-base); }
.field-lg { padding: 11px 14px; font-size: var(--t-md); }

.field-chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--mm-slate);
  pointer-events: none;
}

.field-select:disabled { background: var(--mm-s3); color: var(--mm-slate); cursor: not-allowed; }

.field-message { font-size: var(--t-xs); color: var(--mm-slate); margin: 0; }
.field-message-error { color: var(--mm-err, #dc2626); }
</style>
