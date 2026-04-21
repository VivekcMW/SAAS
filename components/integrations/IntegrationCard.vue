<template>
  <div class="integration-card" :class="{ 'featured': integration.popular }">
    <div class="integration-logo">
      <img :src="integration.logo" :alt="integration.name" />
    </div>
    <div class="integration-content">
      <h3>{{ integration.name }}</h3>
      <p>{{ integration.description }}</p>
      <div class="integration-tags">
        <span class="tag">{{ integration.category }}</span>
        <span class="tag popular-tag" v-if="integration.popular">Popular</span>
      </div>
      <slot>
        <button class="btn btn-outline" @click="showDetails">Learn more</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  integration: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['show-details']);

const showDetails = () => {
  emit('show-details', props.integration);
};
</script>

<style scoped>
.integration-card {
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-gray-200);
  height: 100%;
}

.integration-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.integration-card.featured {
  border-left: 3px solid var(--primary-color);
}

.integration-logo {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  border-bottom: 1px solid var(--color-gray-100);
  background-color: var(--bg-gray);
}

.integration-logo img {
  max-width: 80%;
  max-height: 80px;
  object-fit: contain;
}

.integration-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.integration-content h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

.integration-content p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  flex: 1;
}

.integration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.tag {
  font-size: 0.75rem;
  padding: 2px var(--spacing-sm);
  border-radius: 50px;
  background-color: var(--bg-gray);
  color: var(--text-secondary);
}

.popular-tag {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.btn {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: var(--light-color);
}
</style>
