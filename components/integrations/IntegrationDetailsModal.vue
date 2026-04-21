<template>
  <div class="popover-container" :class="{ 'popover-visible': isVisible }">
    <div class="popover-overlay" v-if="isVisible" @click="closeModal"></div>
    <div class="popover-content" :class="{ 'popover-content-visible': isVisible }">
      <div class="popover-header">
        <div class="integration-logo">
          <img :src="integration.logo" :alt="integration.name" />
        </div>
        <button class="close-button" @click="closeModal">
          <NuxtIcon name="heroicons:x-mark" size="1.25rem" />
        </button>
      </div>
      
      <div class="popover-body">
        <h2 class="integration-title">{{ integration.name }}</h2>
        <div class="integration-tags">
          <span class="tag">{{ integration.category }}</span>
          <span class="tag popular-tag" v-if="integration.popular">Popular</span>
        </div>
        
        <div class="integration-section">
          <h3>Overview</h3>
          <p>{{ integration.description }}</p>
        </div>
        
        <div class="integration-section">
          <h3>Benefits</h3>
          <ul class="benefits-list">
            <li v-for="benefit in getDefaultBenefits(integration)" :key="benefit">
              <NuxtIcon name="heroicons:check-circle" class="benefit-icon" />
              <span>{{ benefit }}</span>
            </li>
          </ul>
        </div>
        
        <div class="integration-section">
          <h3>Setup Guide</h3>
          <div class="setup-steps">
            <div v-for="(step, index) in getDefaultSetupSteps()" :key="index" class="setup-step">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="integration-section">
          <h3>Knowledge Base</h3>
          <div class="knowledge-items">
            <div v-for="(item, index) in getDefaultKnowledgeItems()" :key="index" class="knowledge-item">
              <NuxtIcon :name="item.icon" class="knowledge-icon" />
              <div class="knowledge-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <a href="#" class="kb-link">Learn more</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="popover-footer">
        <button class="btn btn-outline" @click="closeModal">Close</button>
        <button class="btn btn-primary">Connect {{ integration.name }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  integration: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const getDefaultBenefits = (integration: any) => {
  // Provide some default benefits based on integration category
  const defaultBenefits = [
    `Seamless integration between SaaSWorld and ${integration.name}`,
    'Automatic data synchronization in real-time',
    'Streamlined workflow between platforms',
    'Reduced manual data entry and potential errors'
  ];
  
  // Add category-specific benefits
  switch(integration.category) {
    case 'Communication':
      defaultBenefits.push('Enhanced team communication capabilities');
      defaultBenefits.push('Centralized messaging and notifications');
      break;
    case 'Productivity':
      defaultBenefits.push('Improved document workflow and collaboration');
      defaultBenefits.push('Increased team productivity through automated tasks');
      break;
    case 'Project Management':
      defaultBenefits.push('Better project tracking and milestone management');
      defaultBenefits.push('Centralized view of project tasks and resources');
      break;
    case 'Marketing':
      defaultBenefits.push('Enhanced marketing campaign tracking');
      defaultBenefits.push('Improved customer targeting and segmentation');
      break;
    case 'CRM':
      defaultBenefits.push('Complete customer journey visibility');
      defaultBenefits.push('Enhanced lead tracking and opportunity management');
      break;
    case 'Finance':
      defaultBenefits.push('Streamlined billing and invoicing processes');
      defaultBenefits.push('Improved financial reporting and analytics');
      break;
    case 'Storage':
      defaultBenefits.push('Secure file sharing and storage');
      defaultBenefits.push('Centralized document management');
      break;
  }
  
  return defaultBenefits;
};

const getDefaultSetupSteps = () => {
  return [
    {
      title: 'Connect your account',
      description: 'Log in to your account and authorize SaaSWorld to connect with this service.'
    },
    {
      title: 'Configure settings',
      description: 'Select the data and features you want to sync between platforms.'
    },
    {
      title: 'Test the integration',
      description: 'Run a test to ensure data flows correctly between systems.'
    },
    {
      title: 'Activate and customize',
      description: 'Activate the integration and customize any additional settings as needed.'
    }
  ];
};

const getDefaultKnowledgeItems = () => {
  return [
    {
      icon: 'heroicons:document-text',
      title: 'Documentation',
      description: 'Detailed documentation about setting up and using this integration.'
    },
    {
      icon: 'heroicons:video-camera',
      title: 'Tutorial Videos',
      description: 'Step-by-step video tutorials showing how to configure and use the integration.'
    },
    {
      icon: 'heroicons:question-mark-circle',
      title: 'FAQ',
      description: 'Frequently asked questions and troubleshooting tips.'
    }
  ];
};
</script>

<style scoped>
.popover-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

.popover-visible {
  pointer-events: auto;
}

.popover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.popover-content {
  position: absolute;
  top: 0;
  right: -480px; /* Start off-screen */
  width: 100%;
  max-width: 450px;
  height: 100%;
  background-color: var(--light-color);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  overflow-y: auto;
  transition: right 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  display: flex;
  flex-direction: column;
}

.popover-content-visible {
  right: 0;
}

.popover-header {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  background-color: var(--light-color);
  z-index: 2;
}

.integration-logo {
  height: 50px;
  width: auto;
  display: flex;
  align-items: center;
}

.integration-logo img {
  max-height: 100%;
  max-width: 180px;
  object-fit: contain;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.close-button:hover {
  background-color: var(--color-gray-100);
  color: var(--text-primary);
}

.popover-body {
  padding: var(--spacing-lg);
  flex-grow: 1;
  overflow-y: auto;
}

.integration-title {
  font-size: 1.75rem;
  margin-bottom: var(--spacing-md);
}

.integration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
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

.integration-section {
  margin-bottom: var(--spacing-xl);
}

.integration-section h3 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-gray-200);
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.benefits-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
}

.benefit-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.setup-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.setup-step {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.step-number {
  background-color: var(--primary-color);
  color: var(--light-color);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.step-content {
  flex-grow: 1;
}

.step-content h4 {
  font-size: 1rem;
  margin-bottom: var(--spacing-xs);
}

.step-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.knowledge-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.knowledge-item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
}

.knowledge-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.knowledge-content {
  flex-grow: 1;
}

.knowledge-content h4 {
  font-size: 1rem;
  margin-bottom: var(--spacing-xs);
}

.knowledge-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xs);
}

.kb-link {
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.kb-link:hover {
  text-decoration: underline;
}

.popover-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  position: sticky;
  bottom: 0;
  background-color: var(--light-color);
  z-index: 2;
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
  border: none;
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

.btn-primary {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .benefits-list {
    grid-template-columns: 1fr;
  }
  
  .popover-footer {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
  
  .popover-content {
    max-width: 100%;
  }
}
</style>
