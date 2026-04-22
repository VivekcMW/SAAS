<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  id?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  label: '',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  id: '',
  size: 'md'
})

defineEmits<{ 'update:modelValue': [string | number] }>()

const inputId = props.id || `input-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['field', { 'field-error': error }]">
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}<span v-if="required" class="field-required">*</span>
    </label>
    <div class="field-wrap">
      <slot name="prefix" />
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="['field-input', `field-${size}`]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <slot name="suffix" />
    </div>
    <p v-if="error" class="field-message field-message-error">{{ error }}</p>
    <p v-else-if="hint" class="field-message">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}
.field-required { color: #dc2626; margin-left: 2px; }

.field-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 150ms ease;
}
.field-wrap:focus-within { border-color: #ff8838; }

.field-error .field-wrap { border-color: #dc2626; }

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #1f2937;
  font-family: inherit;
  width: 100%;
}
.field-input::placeholder { color: #9ca3af; }

.field-sm { padding: 6px 10px; font-size: 13px; }
.field-md { padding: 8px 12px; font-size: 14px; }
.field-lg { padding: 11px 14px; font-size: 15px; }

.field-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

.field-message { font-size: 12px; color: #6b7280; margin: 0; }
.field-message-error { color: #dc2626; }
</style>
