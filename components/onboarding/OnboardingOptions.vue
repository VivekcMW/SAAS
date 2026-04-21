<template>
  <div class="onboarding-options">
    <div class="options-grid">
      <!-- Quick List Option -->
      <div class="option-card quick" @click="selectOption('quick')">
        <div class="option-header">
          <div class="option-icon">
            <UIcon dynamic name="i-heroicons-bolt" />
          </div>
          <div class="option-badge quick">Most Popular</div>
        </div>
        
        <h3>Quick List</h3>
        <p class="option-description">Get listed fast with essential information only</p>
        
        <div class="option-features">
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-clock" />
            <span>5 minutes</span>
          </div>
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-check-circle" />
            <span>4 simple steps</span>
          </div>
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-rocket-launch" />
            <span>Instant listing</span>
          </div>
          <div class="feature-item funding-feature">
            <UIcon dynamic name="i-heroicons-banknotes" />
            <span>Funding preferences</span>
          </div>
        </div>

        <button class="option-button quick">
          Start Quick List
          <UIcon dynamic name="i-heroicons-arrow-right" />
        </button>
      </div>

      <!-- AI-Powered Option -->
      <div class="option-card ai" @click="selectOption('ai')">
        <div class="option-header">
          <div class="option-icon">
            <UIcon dynamic name="i-heroicons-cpu-chip" />
          </div>
          <div class="option-badge ai">AI Powered</div>
        </div>
        
        <h3>AI-Powered List</h3>
        <p class="option-description">Let AI create your listing from your website</p>
        
        <div class="option-features">
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-clock" />
            <span>2 minutes</span>
          </div>
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-sparkles" />
            <span>AI analysis</span>
          </div>
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-document-text" />
            <span>Auto-generated content</span>
          </div>
          <div class="feature-item funding-feature">
            <UIcon dynamic name="i-heroicons-banknotes" />
            <span>Smart funding match</span>
          </div>
        </div>

        <button class="option-button ai">
          Try AI List
          <UIcon dynamic name="i-heroicons-sparkles" />
        </button>
      </div>

      <!-- Complete Profile Option -->
      <div class="option-card complete" @click="selectOption('complete')">
        <div class="option-header">
          <div class="option-icon">
            <UIcon dynamic name="i-heroicons-star" />
          </div>
          <div class="option-badge complete">Best Results</div>
        </div>
        
        <h3>Complete Profile</h3>
        <p class="option-description">Create a comprehensive listing with all details</p>
        
        <div class="option-features">
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-clock" />
            <span>15-20 minutes</span>
          </div>
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-document-duplicate" />
            <span>7 detailed steps</span>
          </div>
          <div class="feature-item">
            <UIcon dynamic name="i-heroicons-trophy" />
            <span>Premium visibility</span>
          </div>
          <div class="feature-item funding-feature">
            <UIcon dynamic name="i-heroicons-banknotes" />
            <span>Complete funding profile</span>
          </div>
        </div>

        <button class="option-button complete">
          Create Complete Profile
          <UIcon dynamic name="i-heroicons-arrow-right" />
        </button>
      </div>
    </div>

    <div class="options-footer">
      <div class="comparison-note">
        <UIcon dynamic name="i-heroicons-information-circle" class="info-icon" />
        <span>You can always upgrade your listing later with additional information</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  selectOption: [option: string]
}>();

const selectOption = (option: string) => {
  emit('selectOption', option);
};
</script>

<style scoped>
.onboarding-options {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  align-items: stretch;
}

.option-card {
  background: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.3s ease;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.option-card:hover::before {
  left: 100%;
}

.option-card.quick:hover {
  border-color: var(--color-success);
}

.option-card.ai:hover {
  border-color: var(--primary-color);
}

.option-card.complete:hover {
  border-color: var(--color-warning);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.option-card.quick .option-icon {
  background: var(--color-success-light);
  color: var(--color-success);
}

.option-card.ai .option-icon {
  background: var(--primary-color-light);
  color: var(--primary-color);
}

.option-card.complete .option-icon {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.option-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.option-badge.quick {
  background: var(--color-success-light);
  color: var(--color-success);
}

.option-badge.ai {
  background: var(--primary-color-light);
  color: var(--primary-color);
}

.option-badge.complete {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.option-card h3 {
  font-size: 1.375rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.option-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: 0.95rem;
  line-height: 1.4;
}

.option-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.feature-item svg {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.option-button {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: relative;
  z-index: 1;
  text-decoration: none;
  outline: none;
  margin-top: auto;
}

.option-button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.option-button.quick {
  background: var(--color-success);
  color: white;
  border: 1px solid var(--color-success);
}

.option-button.quick:hover {
  background: var(--color-success-dark);
  border-color: var(--color-success-dark);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.option-button.ai {
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
}

.option-button.ai:hover {
  background: var(--primary-color-dark);
  border-color: var(--primary-color-dark);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 136, 56, 0.3);
}

.option-button.complete {
  background: var(--color-warning);
  color: white;
  border: 1px solid var(--color-warning);
}

.option-button.complete:hover {
  background: var(--color-warning-dark);
  border-color: var(--color-warning-dark);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Funding feature styling */
.funding-feature {
  color: var(--color-green-600) !important;
  border: 1px solid rgba(34, 197, 94, 0.2);
  background-color: rgba(34, 197, 94, 0.05);
  border-radius: var(--border-radius-sm);
  padding: 2px 4px;
}

.funding-feature svg {
  color: var(--color-green-600);
}

.options-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
}

.comparison-note {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: var(--bg-gray);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .option-card {
    padding: var(--spacing-lg);
  }
  
  .options-header h2 {
    font-size: 1.5rem;
  }
  
  .option-card h3 {
    font-size: 1.25rem;
  }
}

@media (max-width: 576px) {
  .onboarding-options {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .option-features {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .feature-item {
    flex: 0 0 auto;
    font-size: 0.8rem;
  }
  
  .comparison-note {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-xs);
  }
}
</style>
