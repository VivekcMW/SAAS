<template>
  <div class="accordion-section" :class="{ 'expanded': isExpanded }">
    <div class="accordion-header" @click="toggle" role="button" :aria-expanded="isExpanded">
      <div class="header-content">
        <span class="section-icon" v-if="icon">{{ icon }}</span>
        <h3>{{ title }}</h3>
        <span class="section-status" v-if="showStatus" :class="statusClass">{{ status }}</span>
      </div>
      <div class="chevron-icon">
        <UIcon dynamic :name="isExpanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
      </div>
    </div>
    
    <transition name="accordion">
      <div v-show="isExpanded" class="accordion-content">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  },
  showStatus: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: '',
    validator: (value: string) => ['', 'complete', 'incomplete', 'required'].includes(value)
  },
  required: {
    type: Boolean,
    default: false
  }
});

const isExpanded = ref(props.defaultExpanded);

const statusClass = computed(() => {
  switch (props.status) {
    case 'complete':
      return 'status-complete';
    case 'incomplete':
      return 'status-incomplete';
    case 'required':
      return 'status-required';
    default:
      return '';
  }
});

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};

// Auto-expand if required and incomplete
onMounted(() => {
  if (props.required && props.status === 'incomplete') {
    isExpanded.value = true;
  }
});

defineExpose({
  toggle,
  isExpanded
});
</script>

<style scoped>
.accordion-section {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  transition: all 0.2s ease;
  background: var(--light-color);
}

.accordion-section:hover {
  border-color: var(--color-gray-300);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.accordion-section.expanded {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px rgba(var(--primary-color-rgb), 0.1);
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, var(--bg-gray) 0%, rgba(var(--primary-color-rgb), 0.02) 100%);
  border-bottom: 1px solid transparent;
}

.accordion-header:hover {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.05) 0%, rgba(var(--primary-color-rgb), 0.08) 100%);
}

.expanded .accordion-header {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.08) 0%, rgba(var(--primary-color-rgb), 0.12) 100%);
  border-bottom-color: var(--color-gray-200);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.section-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.accordion-header h3 {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.2s ease;
}

.expanded .accordion-header h3 {
  color: var(--primary-color);
}

.section-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-complete {
  background: var(--color-green-100);
  color: var(--color-green-700);
}

.status-incomplete {
  background: var(--color-yellow-100);
  color: var(--color-yellow-700);
}

.status-required {
  background: var(--color-red-100);
  color: var(--color-red-700);
}

.chevron-icon {
  color: var(--text-secondary);
  transition: all 0.2s ease;
  transform-origin: center;
}

.expanded .chevron-icon {
  color: var(--primary-color);
  transform: rotate(180deg);
}

.accordion-content {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-100);
  background: var(--light-color);
}

/* Accordion Animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 2000px;
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .accordion-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .accordion-content {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    gap: var(--spacing-sm);
  }
  
  .section-icon {
    font-size: 1.25rem;
  }
  
  .accordion-header h3 {
    font-size: 1rem;
  }
}

/* Accessibility */
.accordion-header:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.accordion-header:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .accordion-section {
    border-width: 2px;
  }
  
  .section-status {
    border: 1px solid currentColor;
  }
}
</style>
