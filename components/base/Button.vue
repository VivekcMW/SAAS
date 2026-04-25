<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  to?: string
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  to: '',
  href: ''
})

const emit = defineEmits<{ click: [MouseEvent] }>()

const onClick = (e: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-block': block, 'btn-disabled': disabled }]"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-block': block, 'btn-disabled': disabled }]"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </a>
  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-block': block, 'btn-loading': loading }]"
    @click="onClick"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot v-if="!loading" name="icon-left" />
    <slot />
    <slot v-if="!loading" name="icon-right" />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0.5px solid transparent;
  border-radius: var(--r-sm);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  line-height: 1;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-md { padding: 9px 16px; font-size: 14px; }
.btn-lg { padding: 12px 20px; font-size: 15px; }

.btn-block { display: flex; width: 100%; }

.btn-primary {
  background: var(--mm-gold);
  color: #0A0700;
  border-color: var(--mm-gold);
}
.btn-primary:hover { background: var(--mm-goldl); border-color: var(--mm-goldl); }

.btn-secondary {
  background: var(--mm-s2);
  color: var(--mm-silver);
  border-color: var(--b2);
}
.btn-secondary:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.btn-ghost {
  background: transparent;
  color: var(--mm-silver);
  border-color: transparent;
}
.btn-ghost:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.btn-danger {
  background: var(--mm-err, #dc2626);
  color: #ffffff;
  border-color: var(--mm-err, #dc2626);
}
.btn-danger:hover { background: #b91c1c; border-color: #b91c1c; }

.btn:disabled,
.btn-disabled,
.btn-loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 600ms linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }
</style>
