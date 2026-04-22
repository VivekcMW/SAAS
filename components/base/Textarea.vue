<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  id?: string
  rows?: number
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  label: '',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  id: '',
  rows: 4,
  maxlength: 0
})

defineEmits<{ 'update:modelValue': [string] }>()
const inputId = props.id || `ta-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['field', { 'field-error': error }]">
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}<span v-if="required" class="field-required">*</span>
    </label>
    <textarea
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :maxlength="maxlength || undefined"
      class="field-textarea"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div class="field-footer">
      <p v-if="error" class="field-message field-message-error">{{ error }}</p>
      <p v-else-if="hint" class="field-message">{{ hint }}</p>
      <span v-if="maxlength" class="field-count">{{ String(modelValue).length }}/{{ maxlength }}</span>
    </div>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 4px; }

.field-label { font-size: 13px; font-weight: 500; color: #374151; }
.field-required { color: #dc2626; margin-left: 2px; }

.field-textarea {
  width: 100%;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 14px;
  color: #1f2937;
  resize: vertical;
  outline: none;
  transition: border-color 150ms ease;
}
.field-textarea::placeholder { color: #9ca3af; }
.field-textarea:focus { border-color: #ff8838; }
.field-error .field-textarea { border-color: #dc2626; }
.field-textarea:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

.field-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.field-message { font-size: 12px; color: #6b7280; margin: 0; }
.field-message-error { color: #dc2626; }
.field-count { font-size: 12px; color: #9ca3af; margin-left: auto; }
</style>
