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

.field-label { font-size: var(--t-sm); font-weight: 500; color: var(--mm-silver); }
.field-required { color: var(--mm-err, #dc2626); margin-left: 2px; }

.field-textarea {
  width: 100%;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  padding: 8px 12px;
  font-family: var(--f-ui);
  font-size: var(--t-base);
  color: var(--mm-pearl);
  resize: vertical;
  outline: none;
  transition: border-color 150ms ease;
}
.field-textarea::placeholder { color: var(--mm-slate); }
.field-textarea:focus { border-color: var(--mm-gold); }
.field-error .field-textarea { border-color: var(--mm-err, #dc2626); }
.field-textarea:disabled { background: var(--mm-s3); color: var(--mm-slate); cursor: not-allowed; }

.field-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.field-message { font-size: var(--t-xs); color: var(--mm-slate); margin: 0; }
.field-message-error { color: var(--mm-err, #dc2626); }
.field-count { font-size: var(--t-xs); color: var(--mm-slate); margin-left: auto; }
</style>
