<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  showButton?: boolean
  buttonLabel?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search...',
  size: 'md',
  showButton: false,
  buttonLabel: 'Search'
})

const emit = defineEmits<{
  'update:modelValue': [string]
  search: [string]
  clear: []
}>()

const onInput = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
const onSubmit = (e: Event) => {
  e.preventDefault()
  emit('search', (e.target as HTMLFormElement).querySelector('input')?.value || '')
}
const onClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <form :class="['search', `search-${size}`]" @submit="onSubmit">
    <svg class="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" />
      <path d="M14 14l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      class="search-input"
      @input="onInput"
    >
    <button
      v-if="modelValue"
      type="button"
      class="search-clear"
      aria-label="Clear"
      @click="onClear"
    >
      <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
    <button v-if="showButton" type="submit" class="search-submit">{{ buttonLabel }}</button>
  </form>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  overflow: hidden;
  transition: border-color 150ms ease;
}
.search:focus-within { border-color: var(--mm-gold); }

.search-sm { min-height: 32px; }
.search-md { min-height: 38px; }
.search-lg { min-height: 44px; }

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--mm-slate);
  margin-left: 10px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 10px;
  font-size: var(--t-base);
  color: var(--mm-pearl);
  font-family: var(--f-ui);
  min-width: 0;
}
.search-input::placeholder { color: var(--mm-slate); }
.search-input::-webkit-search-cancel-button { display: none; }

.search-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--mm-slate);
  padding: 4px 8px;
  display: flex;
  align-items: center;
  transition: color 150ms ease;
}
.search-clear:hover { color: var(--mm-pearl); }

.search-submit {
  background: var(--mm-gold);
  color: #0A0700;
  border: none;
  padding: 0 16px;
  font-size: var(--t-base);
  font-weight: 500;
  cursor: pointer;
  align-self: stretch;
  transition: background-color 150ms ease;
}
.search-submit:hover { background: var(--mm-goldl); }
</style>
