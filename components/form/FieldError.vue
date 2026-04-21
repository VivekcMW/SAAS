<!--
  FieldError Component
  Displays inline error messages for individual form fields
-->
<template>
  <Transition
    name="field-error"
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 transform -translate-y-1"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform -translate-y-1"
  >
    <div 
      v-if="hasErrors" 
      class="field-error mt-1"
      role="alert"
      :aria-describedby="fieldId"
    >
      <div class="field-error-list">
        <p 
          v-for="(error, index) in errors" 
          :key="`${field}-error-${index}`"
          class="field-error-item"
        >
          <UIcon 
            dynamic 
            name="i-heroicons-exclamation-circle" 
            class="info-icon-sm info-icon-error mt-0.5 mr-1.5"
          />
          <span>{{ error }}</span>
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  field: string
  errors: string[]
  fieldId?: string
}

const props = withDefaults(defineProps<Props>(), {
  fieldId: ''
})

// Computed properties
const hasErrors = computed(() => props.errors.length > 0)
</script>

<style scoped>
.field-error {
  min-height: 0;
}
</style>
