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
  font-size: var(--t-sm);
  font-weight: 500;
  color: var(--mm-silver);
}
.field-required { color: var(--mm-err, #dc2626); margin-left: 2px; }

.field-wrap {
  display: flex;
  align-items: center;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  transition: border-color 150ms ease;
}
.field-wrap:focus-within { border-color: var(--mm-gold); }

.field-error .field-wrap { border-color: var(--mm-err, #dc2626); }

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--mm-pearl);
  font-family: var(--f-ui);
  width: 100%;
}
.field-input::placeholder { color: var(--mm-slate); }

.field-sm { padding: 6px 10px; font-size: var(--t-sm); }
.field-md { padding: 8px 12px; font-size: var(--t-base); }
.field-lg { padding: 11px 14px; font-size: var(--t-md); }

.field-input:disabled { background: var(--mm-s3); color: var(--mm-slate); cursor: not-allowed; }

.field-message { font-size: var(--t-xs); color: var(--mm-slate); margin: 0; }
.field-message-error { color: var(--mm-err, #dc2626); }
</style>
