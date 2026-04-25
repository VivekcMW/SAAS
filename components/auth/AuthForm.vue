<template>
  <div class="auth-form-container">
    <!-- Form Tabs -->
    <div class="form-tabs">
      <button 
        :class="{ active: mode === 'login' }" 
        @click="switchMode('login')"
      >
        Login
      </button>
      <button 
        :class="{ active: mode === 'register' }" 
        @click="switchMode('register')"
      >
        Register
      </button>
    </div>
    
    <!-- Forgot Password Form -->
    <form v-if="mode === 'forgot-password'" @submit.prevent="handleForgotPassword" class="auth-form">
      <div class="forgot-password-header">
        <h3>Reset Your Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>
      
      <div class="form-group">
        <label for="forgot-email">Email Address</label>
        <input
          id="forgot-email"
          v-model="forgotPasswordForm.email"
          type="email"
          required
          placeholder="your@email.com"
          :class="{ 'error': forgotPasswordErrors.email }"
        />
        <p v-if="forgotPasswordErrors.email" class="error-message">{{ forgotPasswordErrors.email }}</p>
      </div>
      
      <button 
        type="submit" 
        class="submit-button" 
        :disabled="isLoading"
      >
        <span v-if="isLoading">
          <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
          Sending Reset Link...
        </span>
        <span v-else>Send Reset Link</span>
      </button>
      
      <div v-if="forgotPasswordSuccess" class="success-message">
        <UIcon dynamic name="i-heroicons-check-circle" />
        <p>Password reset link sent! Please check your email.</p>
      </div>
      
      <div v-if="forgotPasswordErrors.general" class="general-error">
        {{ forgotPasswordErrors.general }}
      </div>
      
      <div class="back-to-login">
        <button type="button" @click="switchMode('login')" class="link-button">
          <UIcon dynamic name="i-heroicons-arrow-left" />
          Back to Login
        </button>
      </div>
    </form>
    
    <!-- Login Form -->
    <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          v-model="loginForm.email"
          type="email"
          required
          placeholder="your@email.com"
          :class="{ 'error': loginErrors.email }"
        />
        <p v-if="loginErrors.email" class="error-message">{{ loginErrors.email }}</p>
      </div>
      
      <div class="form-group">
        <label for="login-password">Password</label>
        <div class="password-input">
          <input
            id="login-password"
            v-model="loginForm.password"
            :type="showLoginPassword ? 'text' : 'password'"
            required
            placeholder="Enter your password"
            :class="{ 'error': loginErrors.password }"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="showLoginPassword = !showLoginPassword"
          >
            <UIcon dynamic :name="showLoginPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" />
          </button>
        </div>
        <p v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</p>
      </div>
      
      <div class="form-options">
        <label class="checkbox-container">
          <input type="checkbox" v-model="loginForm.rememberMe" />
          <span class="checkbox-label">Remember me</span>
        </label>
        <button type="button" class="forgot-password-link" @click="switchMode('forgot-password')">
          Forgot password?
        </button>
      </div>
      
      <button 
        type="submit" 
        class="submit-button" 
        :disabled="isLoading"
      >
        <span v-if="isLoading">
          <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
          Logging in...
        </span>
        <span v-else>Login</span>
      </button>
      
      <div v-if="loginErrors.general" class="general-error">
        {{ loginErrors.general }}
      </div>

      <!-- Demo credentials -->
      <div class="demo-box">
        <div class="demo-head">
          <span class="demo-label">Demo accounts</span>
          <span class="demo-hint">Click to auto-fill</span>
        </div>
        <div class="demo-row-list">
          <button
            v-for="d in demoAccounts"
            :key="d.role"
            type="button"
            class="demo-btn"
            :disabled="isLoading"
            @click="useDemoAccount(d)"
          >
            <div class="demo-btn__top">
              <span class="demo-btn__role">{{ d.label }}</span>
              <span class="demo-btn__badge">{{ d.desc }}</span>
            </div>
            <div class="demo-btn__creds">
              <span class="demo-btn__cred">
                <UIcon dynamic name="i-heroicons-envelope" />
                <code>{{ d.email }}</code>
              </span>
              <span class="demo-btn__cred">
                <UIcon dynamic name="i-heroicons-key" />
                <code>{{ d.password }}</code>
              </span>
            </div>
          </button>
        </div>
      </div>

      <div class="social-login">
        <p>Or login with</p>
        <div class="social-buttons">
          <!-- First Row -->
          <div class="social-row">
            <button type="button" class="social-button google" @click="socialLogin('google')">
              <UIcon dynamic name="i-logos-google-icon" />
              <span>Google</span>
            </button>
            <button type="button" class="social-button facebook" @click="socialLogin('facebook')">
              <UIcon dynamic name="i-logos-facebook" />
              <span>Facebook</span>
            </button>
            <button type="button" class="social-button linkedin" @click="socialLogin('linkedin')">
              <UIcon dynamic name="i-logos-linkedin-icon" />
              <span>LinkedIn</span>
            </button>
          </div>
          <!-- Second Row -->
          <div class="social-row">
            <button type="button" class="social-button github" @click="socialLogin('github')">
              <UIcon dynamic name="i-mdi-github" />
              <span>GitHub</span>
            </button>
            <button type="button" class="social-button x-twitter" @click="socialLogin('x')">
              <UIcon dynamic name="i-simple-icons-x" />
              <span>X</span>
            </button>
          </div>
        </div>
      </div>
    </form>
    
    <!-- Register Form -->
    <form v-if="mode === 'register'" @submit.prevent="handleRegister" class="auth-form">
      <div class="form-row">
        <div class="form-group">
          <label for="register-firstName">First Name</label>
          <input
            id="register-firstName"
            v-model="registerForm.firstName"
            type="text"
            required
            placeholder="First name"
            :class="{ 'error': registerErrors.firstName }"
          />
          <p v-if="registerErrors.firstName" class="error-message">{{ registerErrors.firstName }}</p>
        </div>
        <div class="form-group">
          <label for="register-lastName">Last Name</label>
          <input
            id="register-lastName"
            v-model="registerForm.lastName"
            type="text"
            required
            placeholder="Last name"
            :class="{ 'error': registerErrors.lastName }"
          />
          <p v-if="registerErrors.lastName" class="error-message">{{ registerErrors.lastName }}</p>
        </div>
      </div>
      
      <div class="form-group">
        <label for="register-email">Email</label>
        <input
          id="register-email"
          v-model="registerForm.email"
          type="email"
          required
          placeholder="your@email.com"
          :class="{ 'error': registerErrors.email }"
        />
        <p v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</p>
      </div>
      
      <!-- User Type Selection Dropdown with Checkboxes -->
      <div v-if="showUserTypeSelection" class="form-group">
        <label class="form-label">Account Type(s)</label>
        <p class="form-helper-text">Select all that apply - you can be multiple types of users</p>
        
        <div class="custom-dropdown" :class="{ 'open': isDropdownOpen, 'error': registerErrors.userType }">
          <button 
            type="button" 
            class="dropdown-toggle"
            @click="isDropdownOpen = !isDropdownOpen"
            @blur="handleDropdownBlur"
          >
            <span class="selected-text">
              {{ selectedUserTypes.length > 0 ? getSelectedTypesText() : 'Select account types...' }}
            </span>
            <UIcon dynamic name="i-heroicons-chevron-down" class="dropdown-arrow" />
          </button>
          
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <label 
              v-for="type in userTypes"
              :key="type.value"
              class="dropdown-item"
            >
              <input
                type="checkbox"
                :value="type.value"
                v-model="selectedUserTypes"
                class="checkbox-input"
              />
              <div class="item-content">
                <UIcon dynamic :name="type.icon" class="item-icon" />
                <div class="item-text">
                  <span class="item-label">{{ type.label }}</span>
                  <span class="item-description">{{ type.description }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <p v-if="registerErrors.userType" class="error-message">{{ registerErrors.userType }}</p>
      </div>
      
      <div class="form-group">
        <label for="register-password">Password</label>
        <div class="password-input">
          <input
            id="register-password"
            v-model="registerForm.password"
            :type="showRegisterPassword ? 'text' : 'password'"
            required
            placeholder="Create a strong password"
            :class="{ 'error': registerErrors.password }"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="showRegisterPassword = !showRegisterPassword"
          >
            <UIcon dynamic :name="showRegisterPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" />
          </button>
        </div>
        <p v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</p>
        <div class="password-strength" v-if="registerForm.password">
          <div class="strength-meter">
            <span 
              class="strength-bar" 
              :style="{ width: `${passwordStrength.score * 25}%`, backgroundColor: passwordStrength.color }"
            ></span>
          </div>
          <span class="strength-text" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.message }}
          </span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="register-confirmPassword">Confirm Password</label>
        <div class="password-input">
          <input
            id="register-confirmPassword"
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            placeholder="Confirm your password"
            :class="{ 'error': registerErrors.confirmPassword }"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <UIcon dynamic :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" />
          </button>
        </div>
        <p v-if="registerErrors.confirmPassword" class="error-message">{{ registerErrors.confirmPassword }}</p>
      </div>
      
      <div class="form-check">
        <label class="checkbox-container">
          <input type="checkbox" v-model="registerForm.acceptTerms" :class="{ 'error': registerErrors.acceptTerms }" />
          <span class="checkbox-label">I accept the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
        </label>
        <p v-if="registerErrors.acceptTerms" class="error-message">{{ registerErrors.acceptTerms }}</p>
      </div>
      
      <button 
        type="submit" 
        class="submit-button" 
        :disabled="isLoading"
      >
        <span v-if="isLoading">
          <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
          Registering...
        </span>
        <span v-else>Register</span>
      </button>
      
      <div v-if="registerErrors.general" class="general-error">
        {{ registerErrors.general }}
      </div>
      
      <div class="social-login">
        <p>Or register with</p>
        <div class="social-buttons">
          <!-- First Row -->
          <div class="social-row">
            <button type="button" class="social-button google" @click="socialLogin('google')">
              <UIcon dynamic name="i-logos-google-icon" />
              <span>Google</span>
            </button>
            <button type="button" class="social-button facebook" @click="socialLogin('facebook')">
              <UIcon dynamic name="i-logos-facebook" />
              <span>Facebook</span>
            </button>
            <button type="button" class="social-button linkedin" @click="socialLogin('linkedin')">
              <UIcon dynamic name="i-logos-linkedin-icon" />
              <span>LinkedIn</span>
            </button>
          </div>
          <!-- Second Row -->
          <div class="social-row">
            <button type="button" class="social-button github" @click="socialLogin('github')">
              <UIcon dynamic name="i-mdi-github" />
              <span>GitHub</span>
            </button>
            <button type="button" class="social-button x-twitter" @click="socialLogin('x')">
              <UIcon dynamic name="i-simple-icons-x" />
              <span>X</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Forgot Password Link -->
      <div class="forgot-password-bottom">
        <button type="button" class="forgot-password-link" @click="switchMode('forgot-password')">
          Forgot your password?
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';

// Props
interface Props {
  userType?: 'vendor' | 'buyer' | 'admin' | 'superadmin' | null;
  initialMode?: 'login' | 'register' | 'forgot-password';
  showUserTypeSelection?: boolean;
  showForgotPassword?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  userType: null,
  initialMode: 'login',
  showUserTypeSelection: true,
  showForgotPassword: true
});

// Emits
const emit = defineEmits(['login-success', 'register-success', 'forgot-password', 'mode-change']);

// User types configuration
const userTypes = [
  {
    value: 'vendor',
    label: 'Vendor',
    description: 'Sell your products and services',
    icon: 'i-heroicons-building-storefront'
  },
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Purchase products and services',
    icon: 'i-heroicons-shopping-bag'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Manage platform operations',
    icon: 'i-heroicons-cog-6-tooth'
  },
  {
    value: 'superadmin',
    label: 'Super Admin',
    description: 'Full platform control',
    icon: 'i-heroicons-shield-check'
  }
];

// Form mode (login, register, or forgot-password)
const mode = ref(props.initialMode);
const selectedUserTypes = ref<string[]>(props.userType ? [props.userType] : []);

// Dropdown state
const isDropdownOpen = ref(false);

// Get selected types display text
const getSelectedTypesText = () => {
  if (selectedUserTypes.value.length === 0) return 'Select account types...';
  if (selectedUserTypes.value.length === 1) {
    const type = userTypes.find(t => t.value === selectedUserTypes.value[0]);
    return type?.label || '';
  }
  return `${selectedUserTypes.value.length} types selected`;
};

// Handle dropdown blur to close it
const handleDropdownBlur = (event: FocusEvent) => {
  // Small delay to allow checkbox clicks to register
  setTimeout(() => {
    const currentTarget = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    if (!relatedTarget || !currentTarget?.contains(relatedTarget)) {
      isDropdownOpen.value = false;
    }
  }, 150);
};

// Loading state
const isLoading = ref(false);

// Password visibility
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showConfirmPassword = ref(false);

// Switch mode function
const switchMode = (newMode: 'login' | 'register' | 'forgot-password') => {
  mode.value = newMode;
  emit('mode-change', newMode);
  
  // Reset all forms and errors when switching modes
  resetForms();
};

// Reset forms function
const resetForms = () => {
  // Reset login form
  Object.assign(loginForm, {
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Reset register form
  Object.assign(registerForm, {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  // Reset forgot password form
  Object.assign(forgotPasswordForm, {
    email: ''
  });
  
  // Reset all errors
  loginErrors.email = '';
  loginErrors.password = '';
  loginErrors.general = '';
  registerErrors.firstName = '';
  registerErrors.lastName = '';
  registerErrors.email = '';
  registerErrors.password = '';
  registerErrors.confirmPassword = '';
  registerErrors.acceptTerms = '';
  registerErrors.general = '';
  forgotPasswordErrors.email = '';
  forgotPasswordErrors.general = '';
  
  forgotPasswordSuccess.value = false;
};

// Login form data
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
});

// Login validation errors
const loginErrors = reactive({
  email: '',
  password: '',
  general: ''
});

// Register form data
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
});

// Register validation errors
const registerErrors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: '',
  userType: '',
  general: ''
});

// Forgot password form data
const forgotPasswordForm = reactive({
  email: ''
});

// Forgot password validation errors
const forgotPasswordErrors = reactive({
  email: '',
  general: ''
});

// Forgot password success state
const forgotPasswordSuccess = ref(false);

// Watch mode changes to reset success state
watch(mode, () => {
  forgotPasswordSuccess.value = false;
});

// Password strength checker
const passwordStrength = computed(() => {
  const password = registerForm.password;
  
  if (!password) {
    return {
      score: 0,
      message: '',
      color: '#ccc'
    };
  }
  
  let score = 0;
  let message = '';
  let color = '';
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Score interpretation
  if (score <= 1) {
    message = 'Weak';
    color = '#ff4d4f';
  } else if (score <= 3) {
    message = 'Medium';
    color = '#faad14';
  } else {
    message = 'Strong';
    color = '#52c41a';
  }
  
  return {
    score: Math.min(score, 4),
    message,
    color
  };
});

// Validate forgot password form
const validateForgotPasswordForm = () => {
  let isValid = true;
  
  // Reset errors
  forgotPasswordErrors.email = '';
  forgotPasswordErrors.general = '';
  
  // Email validation
  if (!forgotPasswordForm.email) {
    forgotPasswordErrors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordForm.email)) {
    forgotPasswordErrors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  return isValid;
};

// Validate login form
const validateLoginForm = () => {
  let isValid = true;
  
  // Reset errors
  loginErrors.email = '';
  loginErrors.password = '';
  loginErrors.general = '';
  
  // Email validation
  if (!loginForm.email) {
    loginErrors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    loginErrors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  // Password validation
  if (!loginForm.password) {
    loginErrors.password = 'Password is required';
    isValid = false;
  }
  
  return isValid;
};

// Validate register form
const validateRegisterForm = () => {
  let isValid = true;
  
  // Reset errors
  registerErrors.firstName = '';
  registerErrors.lastName = '';
  registerErrors.email = '';
  registerErrors.password = '';
  registerErrors.confirmPassword = '';
  registerErrors.acceptTerms = '';
  registerErrors.userType = '';
  registerErrors.general = '';
  
  // First name validation
  if (!registerForm.firstName.trim()) {
    registerErrors.firstName = 'First name is required';
    isValid = false;
  }
  
  // Last name validation
  if (!registerForm.lastName.trim()) {
    registerErrors.lastName = 'Last name is required';
    isValid = false;
  }
  
  // Email validation
  if (!registerForm.email) {
    registerErrors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    registerErrors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  // Password validation
  if (!registerForm.password) {
    registerErrors.password = 'Password is required';
    isValid = false;
  } else if (registerForm.password.length < 8) {
    registerErrors.password = 'Password must be at least 8 characters';
    isValid = false;
  }
  
  // Confirm password validation
  if (!registerForm.confirmPassword) {
    registerErrors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }
  
  // User type validation (only if user type selection is enabled)
  if (props.showUserTypeSelection && selectedUserTypes.value.length === 0) {
    registerErrors.userType = 'Please select at least one account type';
    isValid = false;
  }
  
  // Terms acceptance validation
  if (!registerForm.acceptTerms) {
    registerErrors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy';
    isValid = false;
  }
  
  return isValid;
};

// Login handler
const handleLogin = async () => {
  if (!validateLoginForm()) return;
  
  try {
    isLoading.value = true;
    
    // Here you would typically make an API call to your authentication endpoint
    // For now, we'll just simulate a successful login after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
        // After successful login
    emit('login-success', {
      email: loginForm.email,
      userTypes: selectedUserTypes.value.length > 0 ? selectedUserTypes.value : ['buyer'] // Default to buyer if no types selected
    });
    
    // Reset form and errors
    loginErrors.general = '';
  } catch (error) {
    console.error('Login error:', error);
    loginErrors.general = 'Invalid email or password. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Register handler
const handleRegister = async () => {
  if (!validateRegisterForm()) return;
  
  try {
    isLoading.value = true;
    
    // Here you would typically make an API call to your registration endpoint
    // For now, we'll just simulate a successful registration after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // After successful registration
    emit('register-success', {
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      userTypes: selectedUserTypes.value
    });
    
    // Reset form and errors
    registerErrors.general = '';
  } catch (error) {
    console.error('Registration error:', error);
    registerErrors.general = 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Forgot password handler
const handleForgotPassword = async () => {
  if (!validateForgotPasswordForm()) return;
  
  try {
    isLoading.value = true;
    
    // Here you would typically make an API call to your password reset endpoint
    // For now, we'll just simulate a successful request after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    forgotPasswordSuccess.value = true;
    forgotPasswordErrors.general = '';
    
    // Emit event
    emit('forgot-password', forgotPasswordForm.email);
    
  } catch (error) {
    console.error('Forgot password error:', error);
    forgotPasswordErrors.general = 'Failed to send reset link. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Original forgot password handler (for compatibility)
const handleForgotPasswordOld = () => {
  emit('forgot-password', loginForm.email);
};

// Social login handler
const socialLogin = (provider: string) => {
  // Here you would implement OAuth login for the given provider
  console.log(`Logging in with ${provider}`);
  
  isLoading.value = true;
  
  // In a real implementation, you would:
  // 1. Redirect to the OAuth provider's authentication page
  // 2. Handle the callback with authorization code
  // 3. Exchange the code for an access token
  // 4. Fetch user information and create/login the user
  
  // For demonstration, we'll simulate a successful login after a delay
  setTimeout(() => {
    isLoading.value = false;
    
    // After successful social login
    emit('login-success', {
      provider,
      // Mock user data that would come from the social provider
      firstName: provider === 'google' ? 'John' : 'Jane',
      lastName: 'Doe',
      email: `user@${provider}.com`,
      avatar: null,
      userTypes: selectedUserTypes.value.length > 0 ? selectedUserTypes.value : ['buyer']
    });
  }, 1000);
};

// Demo accounts — visible credentials for quick sign-in
interface DemoAccount {
  role: 'buyer' | 'vendor' | 'admin'
  label: string
  desc: string
  email: string
  password: string
}

const demoAccounts: DemoAccount[] = [
  { role: 'buyer', label: 'Buyer', desc: 'Discover & compare', email: 'buyer@moonmart.ai', password: 'buyer123' },
  { role: 'vendor', label: 'Vendor', desc: 'Manage listings', email: 'demo@moonmart.ai', password: 'demo123' },
  { role: 'admin', label: 'Admin', desc: 'Full access', email: 'admin@moonmart.ai', password: 'admin123' }
];

const useDemoAccount = async (d: DemoAccount) => {
  loginForm.email = d.email;
  loginForm.password = d.password;
  loginForm.rememberMe = true;
  try {
    const { login } = useAuth();
    isLoading.value = true;
    loginErrors.general = '';
    await login({ email: d.email, password: d.password, rememberMe: true });
    emit('login-success', { email: d.email, userTypes: [d.role] });
    await navigateTo('/dashboard');
  } catch (error: any) {
    loginErrors.general = error?.data?.statusMessage || error?.message || 'Unable to start demo session.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-form-container {
  width: 100%;
}

.user-type-selection {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.user-type-selection h3 {
  margin-bottom: var(--spacing-md);
  color: var(--mm-pearl);
  font-size: var(--fs-title-sm);
  font-weight: 600;
}

.user-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.user-type-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  background: var(--mm-s2);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.user-type-card:hover {
  border-color: var(--mm-gold);
  background-color: var(--mm-s3);
}

.user-type-card.active {
  border-color: var(--mm-gold);
  background-color: var(--mm-gold-soft);
}

.user-type-icon {
  font-size: var(--fs-title);
  color: var(--mm-gold);
  flex-shrink: 0;
}

.user-type-info h4 {
  margin: 0 0 2px 0;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--mm-pearl);
}

.user-type-info p {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--mm-slate);
  line-height: 1.3;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.forgot-password-header h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--mm-pearl);
  font-size: var(--fs-title);
  font-weight: 600;
}

.forgot-password-header p {
  margin: 0;
  color: var(--mm-slate);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--mm-sea-soft);
  border: 0.5px solid var(--mm-sea);
  color: var(--mm-seal);
  padding: var(--spacing-md);
  border-radius: var(--r-sm);
  text-align: center;
}

.success-message p {
  margin: 0;
  font-weight: 500;
}

.back-to-login {
  text-align: center;
  margin-top: var(--spacing-md);
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--mm-gold);
  font-size: var(--fs-sm);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--r-sm);
  transition: all 0.2s ease;
}

.auth-form-container .link-button:hover {
  background-color: var(--mm-gold-soft) !important;
  color: var(--mm-goldl) !important;
}

.form-tabs {
  display: flex;
  margin-bottom: var(--spacing-md);
  border-bottom: 0.5px solid var(--b1);
}

.form-tabs button {
  flex: 1;
  padding: var(--spacing-md);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--fs-base);
  font-weight: 500;
  color: var(--mm-slate);
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-form-container .form-tabs button:hover {
  color: var(--mm-gold) !important;
  background-color: var(--mm-s3) !important;
}

.form-tabs button.active {
  color: var(--mm-gold);
  border-bottom-color: var(--mm-gold);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--mm-silver);
}

input[type="text"],
input[type="email"],
input[type="password"] {
  padding: var(--spacing-md);
  background: var(--mm-s2);
  color: var(--mm-pearl);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: var(--fs-base);
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

/* User Type Dropdown Styling */
.user-type-dropdown {
  width: 100%;
  padding: var(--spacing-md);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: var(--fs-base);
  background-color: var(--mm-s2);
  color: var(--mm-pearl);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A8B5CC' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.user-type-dropdown:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

.user-type-dropdown.error {
  border-color: #dc2626;
}

.user-type-dropdown option {
  padding: 0.5rem;
}

.user-type-dropdown option {
  padding: 0.5rem;
}

.user-type-dropdown option {
  padding: 0.5rem;
}

/* Custom Dropdown with Checkboxes */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-toggle {
  width: 100%;
  padding: var(--spacing-md);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  background-color: var(--mm-s2);
  color: var(--mm-pearl);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fs-base);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
}

.dropdown-toggle:hover {
  border-color: var(--mm-gold);
}

.dropdown-toggle:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

.custom-dropdown.error .dropdown-toggle {
  border-color: #dc2626;
}

.selected-text {
  flex: 1;
  color: var(--mm-pearl);
}

.dropdown-toggle .selected-text:empty::before {
  content: "Select account types...";
  color: var(--mm-slate);
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: var(--mm-slate);
}

.custom-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-top: none;
  border-radius: 0 0 var(--r-sm) var(--r-sm);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 0.5px solid var(--b1);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: var(--mm-s3);
}

.checkbox-input {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--mm-gold);
}

.item-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.item-icon {
  font-size: var(--fs-body-lg);
  color: var(--mm-gold);
  flex-shrink: 0;
}

.item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-weight: 500;
  color: var(--mm-pearl);
  font-size: var(--fs-sm);
}

.item-description {
  font-size: var(--fs-caption);
  color: var(--mm-slate);
  line-height: 1.2;
}

.form-helper-text {
  font-size: var(--fs-sm);
  color: var(--mm-slate);
  margin: var(--spacing-xs) 0 0 0;
  line-height: 1.4;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--mm-slate);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: var(--mm-pearl);
}

.error-message {
  color: #dc2626;
  font-size: var(--fs-sm);
  margin-top: var(--spacing-xs);
  margin-bottom: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.checkbox-label {
  font-weight: normal;
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--mm-slate);
}

.forgot-password-link {
  background: none;
  border: none;
  color: var(--mm-gold);
  font-size: var(--fs-sm);
  cursor: pointer;
  padding: 0;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.forgot-password-bottom {
  text-align: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 0.5px solid var(--b1);
}

.submit-button {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--mm-gold);
  color: #0A0700;
  border: none;
  border-radius: var(--r-sm);
  font-size: var(--fs-base);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.auth-form-container .submit-button:hover {
  background-color: var(--mm-goldl) !important;
  color: #0A0700 !important;
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

.general-error {
  background-color: rgba(220, 38, 38, 0.1);
  border: 0.5px solid rgba(220, 38, 38, 0.4);
  color: #fca5a5;
  padding: var(--spacing-sm);
  border-radius: var(--r-sm);
  text-align: center;
}

.social-login {
  text-align: center;
  margin-top: var(--spacing-md);
}

.social-login p {
  color: var(--mm-slate);
  font-size: var(--fs-sm);
  margin-bottom: var(--spacing-md);
  position: relative;
}

.social-login p::before,
.social-login p::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 0.5px;
  background-color: var(--b1);
}

.social-login p::before {
  left: 0;
}

.social-login p::after {
  right: 0;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.social-row {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--r-sm);
  border: 0.5px solid var(--b2);
  background-color: var(--mm-s2);
  color: var(--mm-silver);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  flex: 1;
  max-width: 140px;
}

.social-button.google:hover {
  background-color: rgba(234, 67, 53, 0.12);
  border-color: rgba(234, 67, 53, 0.35);
}

.social-button.facebook:hover {
  background-color: rgba(66, 103, 178, 0.12);
  border-color: rgba(66, 103, 178, 0.35);
}

.social-button.linkedin:hover {
  background-color: rgba(0, 119, 181, 0.12);
  border-color: rgba(0, 119, 181, 0.35);
}

.social-button.github:hover {
  background-color: var(--mm-s3);
  border-color: var(--b2);
}

.social-button.x-twitter:hover {
  background-color: var(--mm-s3);
  border-color: var(--b2);
}

.password-strength {
  margin-top: var(--spacing-xs);
}

.strength-meter {
  height: 4px;
  background-color: var(--mm-s3);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  display: block;
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-text {
  display: block;
  font-size: var(--fs-sm);
  margin-top: 2px;
}

.form-check {
  margin-bottom: var(--spacing-sm);
}

@media (max-width: 768px) {
  .user-type-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .social-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .social-button {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .user-type-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-xs);
  }
  
  .user-type-info h4 {
    font-size: var(--fs-sm);
  }
  
  .user-type-info p {
    font-size: var(--fs-caption);
  }
}

/* Demo accounts box */
.demo-box {
  margin-top: 14px;
  padding: 12px 12px 10px;
  background: var(--mm-gold-soft);
  border: 0.5px solid var(--mm-gold);
  border-radius: 10px;
}
.demo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.demo-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--mm-gold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.demo-hint { font-size: 11px; color: var(--mm-slate); }
.demo-row-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  padding: 8px 10px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}
.demo-btn:hover:not(:disabled) {
  border-color: var(--mm-gold);
  box-shadow: 0 6px 14px -10px rgba(212, 168, 67, 0.4);
}
.demo-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.demo-btn__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.demo-btn__role {
  font-size: 13px;
  font-weight: 600;
  color: var(--mm-pearl);
}
.demo-btn__badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--mm-goldl);
  background: var(--mm-gold-soft);
  padding: 2px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.demo-btn__creds {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
}
.demo-btn__cred {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--mm-slate);
}
.demo-btn__cred code {
  font-family: var(--f-mon);
  font-size: 11.5px;
  color: var(--mm-pearl);
  background: transparent;
  padding: 0;
}
</style>
