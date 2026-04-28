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
  background: var(--mm-s2);
  border-radius: var(--bw-radius);
  overflow: hidden;
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
  display: flex;
  flex-direction: column;
  border: 0.5px solid var(--b1);
  height: 100%;
}

.integration-card:hover {
  border-color: var(--b2);
  box-shadow: var(--shadow-md);
}

.integration-card.featured {
  border-color: var(--mm-gold);
}

.integration-logo {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  border-bottom: 0.5px solid var(--b1);
  background: var(--mm-bg);
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
  font-size: var(--t-md);
  font-family: var(--f-ui);
  font-weight: 700;
  color: var(--mm-pearl);
}

.integration-content p {
  color: var(--mm-silver);
  margin-bottom: var(--spacing-md);
  font-size: var(--t-sm);
  line-height: 1.6;
  flex: 1;
}

.integration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.tag {
  font-size: var(--t-xs);
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--mm-s3);
  color: var(--mm-slate);
  font-weight: 500;
  border: 0.5px solid var(--b1);
}

.popular-tag {
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  border-color: transparent;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 16px;
  border-radius: var(--r-md);
  font-family: var(--f-ui);
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-outline {
  background: transparent;
  border: 0.5px solid var(--b2);
  color: var(--mm-silver);
}

.btn-outline:hover {
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}
</style>
