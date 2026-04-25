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
            <div 
              v-for="(item, index) in getDefaultKnowledgeItems()" 
              :key="index" 
              class="knowledge-item"
              @click="openKnowledgeItem(item, integration)"
              tabindex="0"
              @keydown.enter="openKnowledgeItem(item, integration)"
              @keydown.space.prevent="openKnowledgeItem(item, integration)"
              role="button"
              :aria-label="`Learn more about ${integration.name} ${item.title}`"
            >
              <NuxtIcon :name="item.icon" class="knowledge-icon" />
              <div class="knowledge-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
                <div class="kb-link">
                  <NuxtIcon name="heroicons:arrow-right" class="kb-icon" />
                  Learn more
                </div>
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

    <!-- Documentation Modal -->
    <div class="kb-modal-overlay" v-if="showDocModal" @click="showDocModal = false">
      <div class="kb-modal-container" @click.stop>
        <div class="kb-modal-header">
          <h3>{{ currentKnowledgeContent?.title }}</h3>
          <button class="close-button" @click="showDocModal = false">
            <NuxtIcon name="heroicons:x-mark" size="1.25rem" />
          </button>
        </div>
        <div class="kb-modal-body">
          <div class="kb-content documentation-content">
            <div class="kb-section">
              <h4>Getting Started</h4>
              <p>Welcome to the {{ currentKnowledgeContent?.integration }} documentation. This guide will help you set up and configure the integration between Moonmart and {{ currentKnowledgeContent?.integration }}.</p>
              
              <h5>Prerequisites</h5>
              <ul>
                <li>An active Moonmart account</li>
                <li>Admin access to your {{ currentKnowledgeContent?.integration }} account</li>
                <li>API credentials (if applicable)</li>
              </ul>
              
              <h5>Installation Steps</h5>
              <ol>
                <li>
                  <strong>Connect Your Account</strong>
                  <p>Navigate to the Integrations page in your Moonmart dashboard and select {{ currentKnowledgeContent?.integration }}. Click "Connect" and follow the authentication prompts.</p>
                </li>
                <li>
                  <strong>Configure Settings</strong>
                  <p>After connecting your account, you'll need to configure which data should be synchronized between Moonmart and {{ currentKnowledgeContent?.integration }}.</p>
                </li>
                <li>
                  <strong>Set Up Automation Rules</strong>
                  <p>Create custom automation rules to streamline your workflow between Moonmart and {{ currentKnowledgeContent?.integration }}.</p>
                </li>
                <li>
                  <strong>Test the Integration</strong>
                  <p>Perform a test to ensure data is flowing correctly between systems.</p>
                </li>
              </ol>
            </div>
            
            <div class="kb-section">
              <h4>Advanced Configuration</h4>
              <p>Once you have the basic integration working, you can explore these advanced options:</p>
              
              <ul>
                <li>
                  <strong>Custom Field Mapping</strong>
                  <p>Map specific fields between Moonmart and {{ currentKnowledgeContent?.integration }} to ensure your data aligns perfectly.</p>
                </li>
                <li>
                  <strong>Webhook Setup</strong>
                  <p>Configure webhooks for real-time updates between systems.</p>
                </li>
                <li>
                  <strong>Batch Processing</strong>
                  <p>Set up scheduled batch processing for large data transfers.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Videos Modal -->
    <div class="kb-modal-overlay" v-if="showVideoModal" @click="showVideoModal = false">
      <div class="kb-modal-container" @click.stop>
        <div class="kb-modal-header">
          <h3>{{ currentKnowledgeContent?.title }}</h3>
          <button class="close-button" @click="showVideoModal = false">
            <NuxtIcon name="heroicons:x-mark" size="1.25rem" />
          </button>
        </div>
        <div class="kb-modal-body">
          <div class="kb-content video-content">
            <div class="video-grid">
              <div class="video-card">
                <div class="video-placeholder">
                  <NuxtIcon name="heroicons:play-circle" size="3rem" />
                  <span>Getting Started with {{ currentKnowledgeContent?.integration }}</span>
                </div>
                <h4>Introduction Tutorial</h4>
                <p>Learn the basics of integrating Moonmart with {{ currentKnowledgeContent?.integration }}.</p>
                <span class="video-duration">5:32</span>
              </div>
              
              <div class="video-card">
                <div class="video-placeholder">
                  <NuxtIcon name="heroicons:play-circle" size="3rem" />
                  <span>Advanced Configuration</span>
                </div>
                <h4>Advanced Settings</h4>
                <p>Explore advanced configuration options for optimal integration.</p>
                <span class="video-duration">8:17</span>
              </div>
              
              <div class="video-card">
                <div class="video-placeholder">
                  <NuxtIcon name="heroicons:play-circle" size="3rem" />
                  <span>Troubleshooting Guide</span>
                </div>
                <h4>Troubleshooting Common Issues</h4>
                <p>Learn how to solve the most common integration problems.</p>
                <span class="video-duration">6:45</span>
              </div>
              
              <div class="video-card">
                <div class="video-placeholder">
                  <NuxtIcon name="heroicons:play-circle" size="3rem" />
                  <span>Data Synchronization</span>
                </div>
                <h4>Data Sync Strategies</h4>
                <p>Best practices for keeping your data in sync across platforms.</p>
                <span class="video-duration">7:22</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Modal -->
    <div class="kb-modal-overlay" v-if="showFAQModal" @click="showFAQModal = false">
      <div class="kb-modal-container" @click.stop>
        <div class="kb-modal-header">
          <h3>{{ currentKnowledgeContent?.title }}</h3>
          <button class="close-button" @click="showFAQModal = false">
            <NuxtIcon name="heroicons:x-mark" size="1.25rem" />
          </button>
        </div>
        <div class="kb-modal-body">
          <div class="kb-content faq-content">
            <div class="faq-accordion">
              <div class="faq-item">
                <div class="faq-question" @click="toggleFaq(1)">
                  <h4>How do I connect my {{ currentKnowledgeContent?.integration }} account?</h4>
                  <NuxtIcon name="heroicons:chevron-down" size="1.25rem" :class="{ 'rotate-icon': openFaqs.includes(1) }" />
                </div>
                <div class="faq-answer" :class="{ 'faq-answer-open': openFaqs.includes(1) }">
                  <p>To connect your {{ currentKnowledgeContent?.integration }} account, navigate to the Integrations page in your Moonmart dashboard. Find the {{ currentKnowledgeContent?.integration }} tile and click "Connect". You will be prompted to authorize the connection using your {{ currentKnowledgeContent?.integration }} credentials.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" @click="toggleFaq(2)">
                  <h4>Is my data secure when using this integration?</h4>
                  <NuxtIcon name="heroicons:chevron-down" size="1.25rem" :class="{ 'rotate-icon': openFaqs.includes(2) }" />
                </div>
                <div class="faq-answer" :class="{ 'faq-answer-open': openFaqs.includes(2) }">
                  <p>Yes, all data transferred between Moonmart and {{ currentKnowledgeContent?.integration }} is encrypted using industry-standard protocols. We use OAuth for authentication and never store your actual {{ currentKnowledgeContent?.integration }} password. You can review and revoke access at any time from your account settings.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" @click="toggleFaq(3)">
                  <h4>How often does data sync between platforms?</h4>
                  <NuxtIcon name="heroicons:chevron-down" size="1.25rem" :class="{ 'rotate-icon': openFaqs.includes(3) }" />
                </div>
                <div class="faq-answer" :class="{ 'faq-answer-open': openFaqs.includes(3) }">
                  <p>By default, data syncs every 15 minutes. However, you can adjust this in your integration settings to sync as frequently as every 5 minutes or as infrequently as once per day, depending on your needs. Real-time syncing is available for certain data types when using webhooks.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" @click="toggleFaq(4)">
                  <h4>What should I do if the integration stops working?</h4>
                  <NuxtIcon name="heroicons:chevron-down" size="1.25rem" :class="{ 'rotate-icon': openFaqs.includes(4) }" />
                </div>
                <div class="faq-answer" :class="{ 'faq-answer-open': openFaqs.includes(4) }">
                  <p>If you encounter issues with your {{ currentKnowledgeContent?.integration }} integration, try these troubleshooting steps: 1) Check if your API credentials are still valid, 2) Disconnect and reconnect the integration, 3) Ensure you have the necessary permissions in both systems, 4) Check our status page for any ongoing service disruptions, or 5) Contact our support team for assistance.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" @click="toggleFaq(5)">
                  <h4>Can I customize which data is synchronized?</h4>
                  <NuxtIcon name="heroicons:chevron-down" size="1.25rem" :class="{ 'rotate-icon': openFaqs.includes(5) }" />
                </div>
                <div class="faq-answer" :class="{ 'faq-answer-open': openFaqs.includes(5) }">
                  <p>Yes, you have full control over which data fields are synchronized between Moonmart and {{ currentKnowledgeContent?.integration }}. After connecting your account, you can access the field mapping settings to customize exactly which information is shared between systems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  integration: Integration;
}>();

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

// Define types
interface Integration {
  name: string;
  logo: string;
  description: string;
  category: string;
  popular?: boolean;
  link?: string;
}

interface KnowledgeItem {
  icon: string;
  title: string;
  description: string;
  type: string;
}

interface KnowledgeContent {
  integration: string;
  type: string;
  title: string;
}

// Knowledge base sections modal state
const showDocModal = ref(false);
const showVideoModal = ref(false);
const showFAQModal = ref(false);
const currentKnowledgeContent = ref<KnowledgeContent | null>(null);
const openFaqs = ref<number[]>([1]); // Open the first FAQ by default

// Toggle FAQs open/closed
const toggleFaq = (id: number) => {
  if (openFaqs.value.includes(id)) {
    openFaqs.value = openFaqs.value.filter(item => item !== id);
  } else {
    openFaqs.value.push(id);
  }
};

// Handle opening knowledge base items
const openKnowledgeItem = (item: KnowledgeItem, integration: Integration) => {
  try {
    // Reset all modals first to ensure proper state
    showDocModal.value = false;
    showVideoModal.value = false;
    showFAQModal.value = false;
    
    // Set content based on integration and item type
    currentKnowledgeContent.value = {
      integration: integration.name,
      type: item.type,
      title: `${integration.name} ${item.title}`
    };
    
    // Log the action for analytics purposes
    logKnowledgeAction(integration.name, item.title);
    
    // Use nextTick to ensure DOM is updated before trying to focus elements
    nextTick(() => {
      // Open the appropriate modal based on the item type
      switch(item.type) {
        case 'documentation':
          showDocModal.value = true;
          setTimeout(() => {
            const closeButton = document.querySelector('.kb-modal-header .close-button') as HTMLElement;
            if (closeButton) closeButton.focus();
          }, 100);
          break;
        case 'videos':
          showVideoModal.value = true;
          setTimeout(() => {
            const closeButton = document.querySelector('.kb-modal-header .close-button') as HTMLElement;
            if (closeButton) closeButton.focus();
          }, 100);
          break;
        case 'faq':
          showFAQModal.value = true;
          setTimeout(() => {
            const closeButton = document.querySelector('.kb-modal-header .close-button') as HTMLElement;
            if (closeButton) closeButton.focus();
          }, 100);
          break;
        default:
          console.warn(`Unknown knowledge base item type: ${item.type}`);
          break;
      }
    });
  } catch (error) {
    console.error('Error opening knowledge base item:', error);
    // Fallback behavior - handle potential errors gracefully
    alert('Sorry, there was an issue loading this content. Please try again.');
  }
};

// Handle keyboard navigation for accessibility
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    // Close any open modals first
    if (showDocModal.value) {
      showDocModal.value = false;
      event.preventDefault();
    } else if (showVideoModal.value) {
      showVideoModal.value = false;
      event.preventDefault();
    } else if (showFAQModal.value) {
      showFAQModal.value = false;
      event.preventDefault();
    } 
    // Then close the sidebar if no modal is open
    else if (props.isVisible) {
      closeModal();
      event.preventDefault();
    }
  }
};

// Add keyboard listener when component mounts
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

// Remove keyboard listener when component unmounts
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// Focus trap for accessibility
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    // Focus the sidebar when it opens
    setTimeout(() => {
      const closeBtn = document.querySelector('.close-button') as HTMLElement;
      if (closeBtn) closeBtn.focus();
    }, 100);
  }
});

const getDefaultBenefits = (integration: any) => {
  // Provide some default benefits based on integration category
  const defaultBenefits = [
    `Seamless integration between Moonmart and ${integration.name}`,
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
      description: 'Log in to your account and authorize Moonmart to connect with this service.'
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
      description: 'Detailed documentation about setting up and using this integration.',
      type: 'documentation'
    },
    {
      icon: 'heroicons:video-camera',
      title: 'Tutorial Videos',
      description: 'Step-by-step video tutorials showing how to configure and use the integration.',
      type: 'videos'
    },
    {
      icon: 'heroicons:question-mark-circle',
      title: 'FAQ',
      description: 'Frequently asked questions and troubleshooting tips.',
      type: 'faq'
    }
  ];
};

// Track modals for analytics (can be expanded later)
const logKnowledgeAction = (integrationName: string, itemType: string) => {
  console.log(`Knowledge item accessed: ${integrationName} - ${itemType}`);
  // This could later be expanded to track actual analytics
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
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.popover-visible .popover-overlay {
  opacity: 1;
}

.popover-content {
  position: absolute;
  top: 0;
  right: -480px; /* Start off-screen */
  width: 100%;
  max-width: 450px;
  height: 100%;
  background-color: var(--light-color);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow-y: auto;
  transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
  position: relative;
  display: inline-block;
}

.integration-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.integration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.tag {
  font-size: 0.75rem;
  padding: 4px var(--spacing-sm);
  border-radius: 4px;
  background-color: var(--bg-gray);
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.popular-tag {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.integration-section {
  margin-bottom: var(--spacing-xl);
  position: relative;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: background-color 0.2s ease;
}

.integration-section:hover {
  background-color: var(--bg-gray);
}

.integration-section h3 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-gray-200);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.integration-section h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: var(--primary-color);
  border-radius: 2px;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.knowledge-item:hover, .knowledge-item:focus {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
  outline: none;
}

.knowledge-item:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
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
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  background-color: rgba(var(--primary-color-rgb), 0.1);
  transition: background-color 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.kb-link:hover {
  background-color: rgba(var(--primary-color-rgb), 0.2);
  color: var(--primary-color);
}

.kb-icon {
  margin-right: var(--spacing-xs);
  font-size: 0.875rem;
  vertical-align: middle;
  transition: transform 0.2s ease;
}

.kb-link:hover .kb-icon {
  transform: translateX(2px);
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
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.popover-content:not(:hover) .popover-footer {
  transform: translateY(100%);
  opacity: 0;
}

.popover-content:hover .popover-footer,
.popover-content:focus-within .popover-footer {
  transform: translateY(0);
  opacity: 1;
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

@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* Knowledge Base Modals */
.kb-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(3px);
}

.kb-modal-container {
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.3s ease;
}

.kb-modal-header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  background-color: var(--light-color);
  z-index: 2;
}

.kb-modal-header h3 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--primary-color);
}

.kb-modal-body {
  padding: var(--spacing-lg);
}

.kb-content {
  font-size: 0.95rem;
}

.kb-section {
  margin-bottom: var(--spacing-xl);
}

.kb-section h4 {
  font-size: 1.125rem;
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  border-bottom: 1px solid var(--color-gray-100);
  padding-bottom: var(--spacing-xs);
}

.kb-section h5 {
  font-size: 1rem;
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.kb-section p {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  line-height: 1.6;
}

.kb-section ul, .kb-section ol {
  padding-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.kb-section li {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.kb-section strong {
  color: var(--text-primary);
}

/* Video Content Styles */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.video-card {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.video-placeholder {
  background-color: var(--bg-gray);
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  position: relative;
  overflow: hidden;
}

.video-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1) 0%, rgba(var(--primary-color-rgb), 0.2) 100%);
  z-index: 1;
}

.video-placeholder Icon {
  z-index: 2;
  margin-bottom: var(--spacing-sm);
  transition: transform 0.3s ease;
}

.video-card:hover .video-placeholder Icon {
  transform: scale(1.2);
}

.video-placeholder span {
  z-index: 2;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.video-card h4 {
  padding: var(--spacing-sm) var(--spacing-md);
  margin: 0;
  font-size: 1rem;
}

.video-card p {
  padding: 0 var(--spacing-md);
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.video-duration {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  margin: 0 var(--spacing-md) var(--spacing-md);
  background-color: var(--bg-gray);
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* FAQ Styles */
.faq-item {
  border-bottom: 1px solid var(--color-gray-200);
}

.faq-question {
  padding: var(--spacing-md) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-question:hover {
  color: var(--primary-color);
}

.faq-question h4 {
  font-size: 1rem;
  margin: 0;
  flex: 1;
  padding-right: var(--spacing-md);
}

.faq-question .rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-answer p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.faq-answer-open {
  max-height: 300px; /* Adjust as needed */
  padding-bottom: var(--spacing-md);
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
  
  .video-grid {
    grid-template-columns: 1fr;
  }
  
  .kb-modal-container {
    width: 95%;
    max-height: 80vh;
  }
}
</style>
