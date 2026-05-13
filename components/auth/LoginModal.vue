<template>
  <div class="modal-wrapper" :class="{ 'show': isVisible }" @click.self="closeModal">
    <div class="modal-container" :class="{ 'show': isVisible, 'register-mode': currentMode === 'register' }">
      <div class="modal-header">
        <h2>{{ dynamicTitle }}</h2>
        <button class="close-button" @click="closeModal">
          <UIcon dynamic name="i-heroicons-x-mark" />
        </button>
      </div>
      
      <div class="modal-body" :class="{ 'scrollable': currentMode === 'register' }">
        <AuthForm 
          :user-type="userType"
          :initial-mode="initialMode"
          :show-user-type-selection="showUserTypeSelection"
          :show-forgot-password="showForgotPasswordTab"
          @login-success="handleLoginSuccess" 
          @register-success="handleRegisterSuccess"
          @forgot-password="handleForgotPassword"
          @mode-change="handleModeChange"
        />
      </div>
      
      <!-- Legacy Forgot Password Form (for backward compatibility) -->
      <div v-if="showForgotPassword" class="forgot-password-container">
        <div class="forgot-password-header">
          <button class="back-button" @click="showForgotPassword = false">
            <UIcon dynamic name="i-heroicons-arrow-left" />
            Back to login
          </button>
        </div>
        <h3>Reset Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        <form class="forgot-password-form" @submit.prevent="handleResetPasswordSubmit">
          <div class="form-group">
            <label for="reset-email">Email Address</label>
            <input
              id="reset-email"
              v-model="resetEmail"
              type="email"
              required
              placeholder="your@email.com"
              :class="{ 'error': resetEmailError }"
            >
            <p v-if="resetEmailError" class="error-message">{{ resetEmailError }}</p>
          </div>
          
          <button 
            type="submit" 
            class="submit-button" 
            :disabled="isResetLoading"
          >
            <span v-if="isResetLoading">
              <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
              Sending...
            </span>
            <span v-else>Send Reset Link</span>
          </button>
        </form>
        
        <div v-if="resetSuccess" class="success-message">
          <UIcon dynamic name="i-heroicons-check-circle" />
          <p>Password reset link sent! Please check your email inbox.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import AuthForm from './AuthForm.vue';

// Props
interface Props {
  isVisible?: boolean;
  title?: string;
  userType?: 'vendor' | 'buyer' | 'admin' | 'superadmin' | null;
  initialMode?: 'login' | 'register' | 'forgot-password';
  showUserTypeSelection?: boolean;
  showForgotPasswordTab?: boolean;
  useLegacyForgotPassword?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  title: '',
  userType: null,
  initialMode: 'login',
  showUserTypeSelection: true,
  showForgotPasswordTab: true,
  useLegacyForgotPassword: false
});

// Emits
const emit = defineEmits([
  'update:isVisible', 
  'login', 
  'register', 
  'close',
  'login-success',
  'register-success',
  'forgot-password',
  'mode-change'
]);

// Current mode state
const currentMode = ref(props.initialMode);

// Dynamic title computation
const dynamicTitle = computed(() => {
  if (props.title) return props.title;
  
  switch (currentMode.value) {
    case 'login':
      return 'Welcome Back';
    case 'register':
      return 'Create Your Account';
    case 'forgot-password':
      return 'Reset Password';
    default:
      return 'Welcome to Moonmart';
  }
});

// Legacy forgot password state (for backward compatibility)
const showForgotPassword = ref(false);
const resetEmail = ref('');
const resetEmailError = ref('');
const isResetLoading = ref(false);
const resetSuccess = ref(false);

// Close modal
const closeModal = () => {
  emit('update:isVisible', false);
  emit('close');
  
  // Reset all states
  showForgotPassword.value = false;
  resetEmail.value = '';
  resetEmailError.value = '';
  resetSuccess.value = false;
  currentMode.value = props.initialMode;
};

// Handle mode changes
const handleModeChange = (newMode: 'login' | 'register' | 'forgot-password') => {
  currentMode.value = newMode;
  emit('mode-change', newMode);
};

// Handle login success
const handleLoginSuccess = (userData: any) => {
  emit('login', userData); // Legacy emit
  emit('login-success', userData); // New emit
  closeModal();
};

// Handle register success
const handleRegisterSuccess = (userData: any) => {
  emit('register', userData); // Legacy emit
  emit('register-success', userData); // New emit
  closeModal();
};

// Handle forgot password request
const handleForgotPassword = (email: string | undefined) => {
  if (props.useLegacyForgotPassword) {
    // Use legacy overlay system
    showForgotPassword.value = true;
    resetEmail.value = email || '';
  } else {
    // Use new integrated system (handled by AuthForm)
    emit('forgot-password', email);
  }
};

// Handle password reset submission (legacy)
const handleResetPasswordSubmit = async () => {
  resetEmailError.value = '';

  if (!resetEmail.value) {
    resetEmailError.value = 'Email is required';
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.value)) {
    resetEmailError.value = 'Please enter a valid email address';
    return;
  }

  try {
    isResetLoading.value = true;

    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: resetEmail.value }
    });

    resetSuccess.value = true;
    emit('forgot-password', resetEmail.value);

    setTimeout(() => {
      showForgotPassword.value = false;
      resetEmail.value = '';
      resetSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    resetEmailError.value = error?.data?.statusMessage || 'Failed to send reset link. Please try again.';
  } finally {
    isResetLoading.value = false;
  }
};

// Reset states when modal visibility changes
watch(() => props.isVisible, (isVisible) => {
  if (!isVisible) {
    showForgotPassword.value = false;
    resetEmail.value = '';
    resetEmailError.value = '';
    resetSuccess.value = false;
    currentMode.value = props.initialMode;
  } else {
    // Set body overflow when modal opens
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }
});

// Clean up body overflow when component unmounts
watch(() => props.isVisible, (isVisible) => {
  if (typeof document !== 'undefined') {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});

// Watch for initial mode changes
watch(() => props.initialMode, (newMode) => {
  currentMode.value = newMode;
});
</script>



<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(7, 9, 15, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  padding: 1rem;
}

.modal-wrapper.show {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  min-height: 600px;
  background-color: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform: translateY(-50px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-container.register-mode {
  max-height: 90vh;
  min-height: auto;
}

.modal-container.show {
  transform: translateY(0);
  opacity: 1;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 0.5px solid var(--b1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--mm-pearl);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-md);
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--mm-s3);
  color: var(--mm-pearl);
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
}

.modal-body.scrollable {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

/* Forgot Password Styling */
.forgot-password-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--mm-s1);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.forgot-password-header {
  margin-bottom: var(--spacing-lg);
}

.back-button {
  background: none;
  border: none;
  color: var(--mm-gold);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  padding: 0;
}

.back-button:hover {
  text-decoration: underline;
}

.forgot-password-container h3 {
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
}

.forgot-password-container p {
  color: var(--mm-slate);
  margin-bottom: var(--spacing-lg);
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.success-message {
  margin-top: var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--mm-sea-soft);
  border: 0.5px solid var(--mm-sea);
  border-radius: var(--r-sm);
  color: var(--mm-seal);
}

.success-message p {
  color: inherit;
  margin: 0;
}

/* Form styling from AuthForm */
.form-group {
  display: flex;
  flex-direction: column;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--mm-silver);
}

input[type="email"] {
  padding: var(--spacing-md);
  background: var(--mm-s2);
  color: var(--mm-pearl);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

input.error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: var(--spacing-xs);
  margin-bottom: 0;
}

.submit-button {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--mm-gold);
  color: #0A0700;
  border: none;
  border-radius: var(--r-sm);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.forgot-password-container .submit-button:hover {
  background-color: var(--mm-goldl);
}

.submit-button:disabled {
  background-color: var(--mm-s3);
  color: var(--mm-slate);
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 576px) {
  .modal-container {
    max-width: 100%;
    height: 100%;
    border-radius: 0;
    max-height: 100vh;
  }
}

@media (max-width: 640px) {
  .modal-wrapper {
    padding: 0.5rem;
  }
  
  .modal-container {
    margin: 1rem;
    min-height: auto;
  }
  
  .modal-container.register-mode {
    max-height: calc(100vh - 2rem);
  }
  
  .modal-body.scrollable {
    max-height: calc(100vh - 180px);
  }
}

@media (max-height: 600px) {
  .modal-container {
    min-height: auto;
  }
  
  .modal-container.register-mode {
    max-height: 100vh;
  }
  
  .modal-body.scrollable {
    max-height: calc(100vh - 120px);
  }
}
</style>
