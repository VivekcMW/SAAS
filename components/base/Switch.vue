<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  labelOff?: string
  labelOn?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  labelOff: '',
  labelOn: '',
  disabled: false,
  size: 'md',
  id: ''
})

defineEmits<{ 'update:modelValue': [boolean] }>()
const inputId = props.id || `sw-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <label :for="inputId" :class="['switch-wrap', { 'is-disabled': disabled }]">
    <span v-if="labelOff" class="switch-side">{{ labelOff }}</span>
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="switch-input"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span :class="['switch', `sw-${size}`]">
      <span class="switch-thumb" />
    </span>
    <span v-if="labelOn" class="switch-side">{{ labelOn }}</span>
    <span v-if="label" class="switch-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.switch-wrap { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.is-disabled { opacity: 0.6; cursor: not-allowed; }

.switch-input { position: absolute; opacity: 0; width: 0; height: 0; }

.switch {
  position: relative;
  background: #d1d5db;
  border-radius: 999px;
  transition: background-color 150ms ease;
  flex-shrink: 0;
}
.sw-sm { width: 30px; height: 16px; }
.sw-md { width: 36px; height: 20px; }

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  background: #ffffff;
  border-radius: 50%;
  transition: left 150ms ease;
}
.sw-sm .switch-thumb { width: 12px; height: 12px; }
.sw-md .switch-thumb { width: 16px; height: 16px; }

.switch-input:checked + .switch { background: #ff8838; }
.switch-input:checked + .sw-sm .switch-thumb { left: 16px; }
.switch-input:checked + .sw-md .switch-thumb { left: 18px; }
.switch-input:focus-visible + .switch { outline: 2px solid #ff8838; outline-offset: 2px; }

.switch-label, .switch-side { font-size: 14px; color: #374151; }
</style>
