<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="container">
      <div class="navbar-content">
        <!-- Left: Logo -->
        <div class="logo">
          <NuxtLink to="/" aria-label="SaaSWorld home">
            <SaasworldLogo class="logo-icon" />
            <span class="logo-text">SaaS<span class="logo-text-accent">World</span></span>
          </NuxtLink>
        </div>

        <!-- Center: Primary navigation -->
        <div class="nav-links" :class="{ 'show': isMobileMenuOpen }">
          <ul>
            <li class="nav-item-categories">
              <CategoriesLauncher trigger-label="Categories" />
            </li>
            <li v-for="item in navItems" :key="item.label">
              <NuxtLink :to="item.path" :class="['nav-item', { active: currentPath === item.path }]">
                {{ item.label }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/list-product" class="nav-item">For Vendors</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/pricing" class="nav-item">Pricing</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Right: Utility + Auth -->
        <div class="auth-buttons">
          <!-- Search trigger -->
          <button
            type="button"
            class="nav-utility-btn"
            aria-label="Search"
            @click="triggerGlobalSearch"
          >
            <UIcon dynamic name="i-heroicons-magnifying-glass" />
          </button>

          <template v-if="!isAuthenticated">
            <!-- Divider -->
            <span class="nav-divider" aria-hidden="true"></span>
            <button @click="openSignInModal" class="btn-signin">Sign in</button>
            <button @click="openSignUpModal" class="btn-signup">
              Get started
              <UIcon dynamic name="i-heroicons-arrow-right" class="btn-icon" />
            </button>
          </template>
          <template v-if="isAuthenticated">
            <div class="user-menu">
              <button @click="toggleUserDropdown" class="user-menu-button">
                <div class="user-avatar">
                  <span v-if="!currentUser?.avatar">{{ userInitials }}</span>
                  <img v-else :src="currentUser.avatar" :alt="currentUser.fullName" />
                </div>
                <span class="user-name">{{ currentUser?.firstName || 'User' }}</span>
                <UIcon dynamic name="i-heroicons-chevron-down" :class="{ 'rotate': isUserDropdownOpen }" />
              </button>
              
              <!-- User Dropdown Menu -->
              <div class="dropdown-menu user-dropdown" v-if="isUserDropdownOpen">
                <NuxtLink to="/dashboard" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-squares-2x2" class="dropdown-item-icon" />
                  <span>Dashboard</span>
                </NuxtLink>
                <NuxtLink to="/settings" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-cog-6-tooth" class="dropdown-item-icon" />
                  <span>Settings</span>
                </NuxtLink>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-arrow-right-on-rectangle" class="dropdown-item-icon" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Mobile menu button -->
        <button class="mobile-menu-button" @click="toggleMobileMenu" aria-label="Menu">
          <UIcon dynamic :name="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" />
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" :class="{ 'show': isMobileMenuOpen }" @click="toggleMobileMenu"></div>
  </nav>
  
  <!-- Categories Drawer (legacy inline markup removed — now handled by CategoriesLauncher in navbar) -->

  <!-- Sign Up Modal -->
  <div class="signup-modal" :class="{ 'open': showSignUpModal }">
    <div class="modal-overlay" @click="closeSignUpModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isForgotPasswordMode ? 'Forgot Password' : (isLoginMode ? 'Welcome Back' : 'Create Your Account') }}
        </h2>
        <button @click="closeSignUpModal" class="modal-close">
          <UIcon dynamic name="i-heroicons-x-mark" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Forgot Password Form -->
        <form v-if="isForgotPasswordMode" @submit.prevent="handleSendResetEmail" class="forgot-password-form">
          <div class="forgot-password-header">
            <h3 class="form-title">Reset Your Password</h3>
            <p class="form-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
          </div>
          
          <div class="form-group">
            <label for="resetEmail" class="form-label">Email Address</label>
            <input 
              v-model="forgotPasswordForm.email"
              type="email" 
              id="resetEmail"
              class="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <button type="submit" class="submit-button" :disabled="!forgotPasswordForm.email || isSendingResetEmail">
            <span v-if="!isSendingResetEmail">Send Reset Link</span>
            <span v-else class="loading-text">
              <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
              Sending...
            </span>
          </button>
          
          <div class="back-to-login">
            <button type="button" @click="backToLogin" class="back-link">
              <UIcon dynamic name="i-heroicons-arrow-left" class="back-icon" />
              Back to Sign In
            </button>
          </div>
        </form>

        <!-- Login Form -->
        <form v-else-if="isLoginMode" @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="loginEmail" class="form-label">Email Address</label>
            <input 
              v-model="loginForm.email"
              type="email" 
              id="loginEmail"
              class="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="loginPassword" class="form-label">Password</label>
            <input 
              v-model="loginForm.password"
              type="password" 
              id="loginPassword"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div class="form-group remember-forgot">
            <label class="checkbox-label">
              <input 
                v-model="loginForm.rememberMe"
                type="checkbox" 
                class="checkbox-input"
              />
              <span class="checkbox-text">Remember me</span>
            </label>
            <button type="button" @click="showForgotPasswordForm" class="forgot-link">Forgot password?</button>
          </div>
          
          <button type="submit" class="submit-button" :disabled="!isLoginFormValid">
            <span v-if="!isLoggingIn">Sign In</span>
            <span v-else class="loading-text">
              <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
              Signing In...
            </span>
          </button>

          <!-- Footer before social options -->
          <div v-if="isLoginMode" class="form-footer">
            <p class="signin-text">
              Don't have an account?
              <button @click="toggleAuthMode" class="signin-link">
                Sign Up
              </button>
            </p>
          </div>

          <!-- Social Login Options -->
          <div class="social-divider">
            <span class="divider-line"></span>
            <span class="divider-text">or continue with</span>
            <span class="divider-line"></span>
          </div>

          <div class="social-buttons social-buttons-2-rows">
            <div class="social-row">
              <button type="button" @click="handleSocialLogin('google')" class="social-button google">
                <UIcon dynamic name="i-logos-google-icon" class="social-icon" />
                <span>Google</span>
              </button>
              <button type="button" @click="handleSocialLogin('facebook')" class="social-button facebook">
                <UIcon dynamic name="i-logos-facebook" class="social-icon" />
                <span>Facebook</span>
              </button>
              <button type="button" @click="handleSocialLogin('github')" class="social-button github">
                <UIcon dynamic name="i-logos-github-icon" class="social-icon" />
                <span>GitHub</span>
              </button>
            </div>
            <div class="social-row">
              <button type="button" @click="handleSocialLogin('linkedin')" class="social-button linkedin">
                <UIcon dynamic name="i-logos-linkedin-icon" class="social-icon" />
                <span>LinkedIn</span>
              </button>
              <button type="button" @click="handleSocialLogin('x')" class="social-button x">
                <UIcon dynamic name="i-simple-icons-x" class="social-icon" />
                <span>X</span>
              </button>
            </div>
          </div>
        </form>

        <!-- Sign Up Form -->
        <form v-else @submit.prevent="handleSignUp" class="signup-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <input 
                v-model="signUpForm.firstName"
                type="text" 
                id="firstName"
                class="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <input 
                v-model="signUpForm.lastName"
                type="text" 
                id="lastName"
                class="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input 
              v-model="signUpForm.email"
              type="email" 
              id="email"
              class="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                v-model="signUpForm.password"
                type="password" 
                id="password"
                class="form-input"
                placeholder="Create a strong password"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input 
                v-model="signUpForm.confirmPassword"
                type="password" 
                id="confirmPassword"
                class="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                v-model="signUpForm.agreeToTerms"
                type="checkbox" 
                class="checkbox-input"
                required
              />
              <span class="checkbox-text">
                I agree to the <a href="/terms" target="_blank" class="terms-link">Terms of Service</a> 
                and <a href="/privacy" target="_blank" class="terms-link">Privacy Policy</a>
              </span>
            </label>
          </div>
          
          <button type="submit" class="submit-button" :disabled="!isSignUpFormValid">
            <span v-if="!isSigningUp">Create Account</span>
            <span v-else class="loading-text">
              <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
              Creating Account...
            </span>
          </button>

          <!-- Footer before social options -->
          <div v-if="!isLoginMode" class="form-footer">
            <p class="signin-text">
              Already have an account?
              <button @click="toggleAuthMode" class="signin-link">
                Sign In
              </button>
            </p>
          </div>

          <!-- Social Sign Up Options -->
          <div class="social-divider">
            <span class="divider-line"></span>
            <span class="divider-text">or continue with</span>
            <span class="divider-line"></span>
          </div>

          <div class="social-buttons social-buttons-2-rows">
            <div class="social-row">
              <button type="button" @click="handleSocialLogin('google')" class="social-button google">
                <UIcon dynamic name="i-logos-google-icon" class="social-icon" />
                <span>Google</span>
              </button>
              <button type="button" @click="handleSocialLogin('facebook')" class="social-button facebook">
                <UIcon dynamic name="i-logos-facebook" class="social-icon" />
                <span>Facebook</span>
              </button>
              <button type="button" @click="handleSocialLogin('github')" class="social-button github">
                <UIcon dynamic name="i-logos-github-icon" class="social-icon" />
                <span>GitHub</span>
              </button>
            </div>
            <div class="social-row">
              <button type="button" @click="handleSocialLogin('linkedin')" class="social-button linkedin">
                <UIcon dynamic name="i-logos-linkedin-icon" class="social-icon" />
                <span>LinkedIn</span>
              </button>
              <button type="button" @click="handleSocialLogin('x')" class="social-button x">
                <UIcon dynamic name="i-simple-icons-x" class="social-icon" />
                <span>X</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalAuth } from '~/composables/useGlobalAuth';

import { allCategories, categoryGroups, getCategoriesByGroup } from '~/utils/categories';

const route = useRoute();

// Navigation items
const navItems = [
  { label: 'Marketplace', path: '/marketplace' },
  // { label: 'Contact', path: '/contact' }
];

// Categories drawer state - using global composable
const { isCategoriesDrawerOpen, openCategoriesDrawer: openDrawer, closeCategoriesDrawer: closeDrawer } = useCategoriesMenu();

// Debug watcher to see state changes
watch(isCategoriesDrawerOpen, (newValue) => {
  console.log('Navbar: isCategoriesDrawerOpen changed to:', newValue);
});

const selectedCategory = ref<string | null>(null);
const selectedCategoryGroup = ref<string | null>(null);
const searchQuery = ref('');
const selectedSubcategories = ref<string[]>([]);

// Use the centralized category system - import categoryGroups directly
const categories = computed(() => {
  return categoryGroups.map(group => ({
    id: group.id,
    name: group.name,
    icon: group.icon,
    columns: [getCategoriesByGroup(group.id).map(cat => ({
      name: cat.name,
      path: `/marketplace/category/${cat.id}`
    }))]
  }));
});

// Categories functionality
const openCategoriesDrawer = () => {
  openDrawer();
  selectedCategoryGroup.value = null; // Reset selection when opening
  document.body.style.overflow = 'hidden';
};

const closeCategoriesDrawer = () => {
  closeDrawer();
  selectedCategoryGroup.value = null;
  document.body.style.overflow = '';
};

// Get total subcategories using centralized system  
const getTotalSubcategories = () => {
  return allCategories.length;
};

// Get selected group data
const getSelectedGroupData = () => {
  return categoryGroups.find(group => group.id === selectedCategoryGroup.value);
};

// Get categories for selected group
const getSelectedGroupCategories = () => {
  if (!selectedCategoryGroup.value) return [];
  return getCategoriesByGroup(selectedCategoryGroup.value);
};

// Search functionality - updated to include group information
const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase();
  const results: any[] = [];
  
  allCategories.forEach(category => {
    if (category.name.toLowerCase().includes(query)) {
      const group = categoryGroups.find(g => g.id === category.group);
      results.push({
        id: category.id,
        name: category.name,
        path: `/marketplace/category/${category.id}`,
        groupName: group?.name || category.group
      });
    }
  });
  
  return results;
});

const selectedCategoryData = computed(() => {
  return categoryGroups.find(group => group.id === selectedCategoryGroup.value);
});

// Current path for active link styling
const currentPath = computed(() => route.path);

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Auth modal state
const showAuthModal = ref(false);
const showSignUpModal = ref(false);
const isSigningUp = ref(false);
const isLoginMode = ref(false);
const isLoggingIn = ref(false);
const isForgotPasswordMode = ref(false);
const isSendingResetEmail = ref(false);

// Sign up form data
const signUpForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
});

// Login form data
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
});

// Forgot password form data
const forgotPasswordForm = ref({
  email: ''
});

// Real cookie-based auth (single source of truth)
const { isAuthenticated, currentUser, handleLogout: authLogout } = useAuth();
// Keep legacy modal helpers available for any legacy callers, but do not drive state from them
const { openRegister, openLogin } = useGlobalAuth();

// User dropdown state
const isUserDropdownOpen = ref(false);

// Scroll state
const isScrolled = ref(false);

// Computed properties
const userInitials = computed(() => {
  if (!currentUser.value?.firstName && !currentUser.value?.lastName) return '?';
  
  const firstInitial = currentUser.value.firstName ? currentUser.value.firstName.charAt(0) : '';
  const lastInitial = currentUser.value.lastName ? currentUser.value.lastName.charAt(0) : '';
  
  return (firstInitial + lastInitial).toUpperCase();
});

// Sign up form validation
const isSignUpFormValid = computed(() => {
  return signUpForm.value.firstName.trim() &&
         signUpForm.value.lastName.trim() &&
         signUpForm.value.email.trim() &&
         signUpForm.value.password.length >= 6 &&
         signUpForm.value.password === signUpForm.value.confirmPassword &&
         signUpForm.value.agreeToTerms;
});

// Login form validation
const isLoginFormValid = computed(() => {
  return loginForm.value.email.trim() &&
         loginForm.value.password.length >= 6;
});

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  
  // Prevent scrolling when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Toggle user dropdown
const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

// Open auth modal
const openAuthModal = () => {
  showAuthModal.value = true;
};

// Navigate to real auth pages (cookie-based flow)
const openSignUpModal = () => {
  navigateTo('/signup');
};

const openSignInModal = () => {
  navigateTo('/login');
};

// Trigger global search (dispatches event picked up by GlobalSearch component)
const triggerGlobalSearch = () => {
  if (import.meta.client) {
    window.dispatchEvent(new CustomEvent('open-global-search'));
  }
};

// Close sign up modal
const closeSignUpModal = () => {
  showSignUpModal.value = false;
  isLoginMode.value = false;
  isForgotPasswordMode.value = false;
  resetSignUpForm();
  resetLoginForm();
  resetForgotPasswordForm();
  document.body.style.overflow = '';
};

// Reset sign up form
const resetSignUpForm = () => {
  signUpForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  };
  isSigningUp.value = false;
};

// Reset login form
const resetLoginForm = () => {
  loginForm.value = {
    email: '',
    password: '',
    rememberMe: false
  };
  isLoggingIn.value = false;
};

// Reset forgot password form
const resetForgotPasswordForm = () => {
  forgotPasswordForm.value = {
    email: ''
  };
  isSendingResetEmail.value = false;
};

// Toggle between login and signup modes
const toggleAuthMode = () => {
  isLoginMode.value = !isLoginMode.value;
  isForgotPasswordMode.value = false;
  resetSignUpForm();
  resetLoginForm();
  resetForgotPasswordForm();
};

// Show forgot password form
const showForgotPasswordForm = () => {
  isForgotPasswordMode.value = true;
  isLoginMode.value = false;
  resetForgotPasswordForm();
};

// Back to login from forgot password
const backToLogin = () => {
  isForgotPasswordMode.value = false;
  isLoginMode.value = true;
  resetForgotPasswordForm();
};

// Handle scroll for navbar appearance
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Handle login form submission
const handleLogin = async () => {
  if (!isLoginFormValid.value) return;
  
  try {
    isLoggingIn.value = true;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would make an API call here
    const userData = {
      id: Date.now().toString(),
      firstName: loginForm.value.email.split('@')[0], // Simple firstname from email
      lastName: 'User',
      email: loginForm.value.email,
      fullName: `${loginForm.value.email.split('@')[0]} User`
    };
    
    // Set user as authenticated
    handleUserLogin(userData);
    
    // Close modal
    closeSignUpModal();
    
    // Show success message
    console.log('Logged in successfully!');
    
  } catch (error) {
    console.error('Login error:', error);
    // Handle error (show error message)
  } finally {
    isLoggingIn.value = false;
  }
};

// Handle forgot password (send reset email)
const handleSendResetEmail = async () => {
  if (!forgotPasswordForm.value.email) {
    alert('Please enter your email address');
    return;
  }

  isSendingResetEmail.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    alert(`Password reset link has been sent to ${forgotPasswordForm.value.email}`);
    
    // Go back to login
    backToLogin();
    
  } catch (error) {
    console.error('Reset email error:', error);
    alert('Failed to send reset email. Please try again.');
  } finally {
    isSendingResetEmail.value = false;
  }
};

// Handle social media login/signup
const handleSocialLogin = async (provider: string) => {
  try {
    console.log(`Initiating ${provider} authentication...`);
    
    // In a real app, you would:
    // 1. Redirect to the social provider's OAuth URL
    // 2. Handle the callback with authorization code
    // 3. Exchange code for access token
    // 4. Get user profile data
    // 5. Create or login user in your system
    
    // Simulate social login process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock user data based on provider
    const mockUserData = {
      google: { 
        name: 'John Doe', 
        email: 'john.doe@gmail.com', 
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google'
      },
      facebook: { 
        name: 'Jane Smith', 
        email: 'jane.smith@facebook.com', 
        avatar: 'https://graph.facebook.com/me/picture',
        provider: 'facebook'
      },
      github: { 
        name: 'Dev User', 
        email: 'dev.user@github.com', 
        avatar: 'https://github.com/identicons/sample.png',
        provider: 'github'
      },
      linkedin: { 
        name: 'Pro User', 
        email: 'pro.user@linkedin.com', 
        avatar: 'https://media.licdn.com/dms/image/sample',
        provider: 'linkedin'
      },
      x: { 
        name: 'X User', 
        email: 'x.user@x.com', 
        avatar: 'https://pbs.twimg.com/profile_images/sample',
        provider: 'x'
      }
    };
    
    const userData = mockUserData[provider as keyof typeof mockUserData];
    
    if (userData) {
      // Set user as authenticated
      handleUserLogin(userData);
      
      // Close modal
      closeSignUpModal();
      
      // Show success message
      console.log(`Successfully authenticated with ${provider}!`);
    }
    
  } catch (error) {
    console.error(`${provider} authentication error:`, error);
    alert(`Failed to authenticate with ${provider}. Please try again.`);
  }
};

// Handle login event (legacy modal path — kept as a no-op; auth happens on /login page now)
const handleUserLogin = (_userData: any) => {
  // Real login flow lives at /login. Modal-based login was removed to avoid dual auth state.
  navigateTo('/login');
};

// Handle sign up form submission
const handleSignUp = async () => {
  if (!isSignUpFormValid.value) return;
  
  try {
    isSigningUp.value = true;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you would make an API call here
    const userData = {
      id: Date.now().toString(),
      firstName: signUpForm.value.firstName,
      lastName: signUpForm.value.lastName,
      email: signUpForm.value.email,
      fullName: `${signUpForm.value.firstName} ${signUpForm.value.lastName}`
    };
    
    // Set user as authenticated
    handleUserLogin(userData);
    
    // Close modal
    closeSignUpModal();
    
    // Show success message (you can implement toast notifications)
    console.log('Account created successfully!');
    
  } catch (error) {
    console.error('Sign up error:', error);
    // Handle error (show error message)
  } finally {
    isSigningUp.value = false;
  }
};

// Switch to sign in (you can implement this later)
const switchToSignIn = () => {
  toggleAuthMode();
  console.log('Switch to sign in');
};

// Social sign up methods
const signUpWithGoogle = () => {
  console.log('Sign up with Google');
  // Implement Google OAuth
};

const signUpWithGitHub = () => {
  console.log('Sign up with GitHub');
  // Implement GitHub OAuth
};

// Handle logout (awaits server cookie clear before navigating)
const handleLogout = async () => {
  isUserDropdownOpen.value = false;
  await authLogout();
  await navigateTo('/');
};

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  
  // Close user dropdown if clicking outside
  if (isUserDropdownOpen.value && !target.closest('.user-menu')) {
    isUserDropdownOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', handleClickOutside);
  
  // Check if user is already authenticated (from localStorage, session, etc.)
  // This is where you'd check for existing auth tokens
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   // Validate token and set user state
  //   validateAndSetUser(token);
  // }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClickOutside);
});

// Close mobile menu and categories drawer when route changes
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
  closeDrawer();
  showSignUpModal.value = false;
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Navbar styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border-bottom: 1px solid #E5E7EB;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.navbar-scrolled {
  border-bottom-color: #E5E7EB;
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.04), 0 4px 12px -6px rgba(17, 24, 39, 0.08);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 2vw, 1.5rem);
  width: 100%;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 1.5rem;
}

/* ── Logo ───────────────────────────────────────────── */
.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--sw-text);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text { white-space: nowrap; }
.logo-text-accent { color: var(--sw-primary); }

/* ── Nav links (center) ─────────────────────────────── */
.nav-links {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-links ul {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--sw-text-muted);
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 0.9375rem;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--sw-text);
  background: rgba(17, 24, 39, 0.04);
}

.nav-item.active {
  color: var(--sw-text);
  background: rgba(17, 24, 39, 0.04);
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
  width: 16px;
  height: 16px;
  color: var(--sw-text-subtle);
}

.nav-chevron {
  font-size: 0.875rem;
  width: 14px;
  height: 14px;
  color: var(--sw-text-subtle);
  transition: transform 0.15s ease;
}

.nav-item-dropdown:hover .nav-chevron { transform: translateY(1px); }

/* ── Auth / Utility (right) ─────────────────────────── */
.auth-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.nav-utility-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--sw-text-muted);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.nav-utility-btn:hover {
  color: var(--sw-text);
  background: rgba(17, 24, 39, 0.04);
}

.nav-utility-btn :deep(svg),
.nav-utility-btn :deep(.nuxt-icon) {
  width: 18px;
  height: 18px;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: rgba(17, 24, 39, 0.12);
  margin: 0 6px;
}

/* Secondary auth — ghost text link */
.btn-signin {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--sw-text);
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.btn-signin:hover {
  background: rgba(17, 24, 39, 0.04);
}

/* Primary auth — the ONE orange CTA */
.btn-signup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--sw-primary);
  border: 1px solid var(--sw-primary);
  color: #fff;
  font-family: var(--font-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(255, 136, 56, 0.2), 0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

.btn-signup:hover {
  background: var(--sw-primary-hover);
  border-color: var(--sw-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 136, 56, 0.28), 0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

.btn-signup:active { transform: translateY(0); }

.btn-icon {
  width: 14px;
  height: 14px;
  font-size: 14px;
}

/* Mobile hide/show */
@media (max-width: 1024px) {
  /* Trim the lower-priority nav items to keep CTAs visible */
  .nav-links:not(.show) li:nth-child(3),
  .nav-links:not(.show) li:nth-child(4) { display: none; }
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.show {
    display: flex;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: #fff;
    border-bottom: 1px solid rgba(17, 24, 39, 0.08);
    padding: 16px;
    z-index: 999;
  }
  .nav-links.show ul {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 2px;
  }
  .nav-links.show .nav-item {
    width: 100%;
    justify-content: flex-start;
    padding: 12px;
  }
  .btn-signin { display: none; }
  .nav-divider { display: none; }
}

@media (max-width: 560px) {
  .logo-text { display: none; }
  .btn-signup {
    padding: 8px 12px;
  }
  .btn-signup .btn-icon { display: none; }
}

.btn {
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.btn-outline {
  color: #007bff;
  border-color: #007bff;
  background: transparent;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

/* User menu */
.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.user-menu-button:hover {
  background: #f8f9fa;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--fs-sm);
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: #1a1a1a;
}

.rotate {
  transform: rotate(180deg);
}

/* User dropdown */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #1a1a1a;
  text-decoration: none;
  transition: background 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item-icon {
  width: 1rem;
  height: 1rem;
  color: #666;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 0.5rem 0;
}

/* Mobile menu button */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
  align-items: center;
}

.mobile-menu-button:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.mobile-menu-button svg {
  width: 24px;
  height: 24px;
}

/* Mobile menu overlay */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* Categories drawer */
.categories-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  pointer-events: none;
  transition: all 0.3s ease;
}

.categories-drawer.open {
  pointer-events: auto;
}

.drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.categories-drawer.open .drawer-overlay {
  opacity: 1;
}

.drawer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.categories-drawer.open .drawer-content {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.drawer-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.drawer-title {
  font-size: var(--fs-title);
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}

.drawer-subtitle {
  color: #666;
  margin: 0.25rem 0 0 0;
  font-size: var(--fs-sm);
}

.drawer-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.drawer-close:hover {
  background: #e9ecef;
  color: #333;
}

.drawer-search {
  margin-top: 1rem;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  width: 1rem;
  height: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: var(--fs-sm);
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Search results */
.search-results-container {
  width: 100%;
}

.search-results-title {
  font-size: var(--fs-body-lg);
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.search-result-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.02);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: var(--fs-sm);
}

.result-group {
  font-size: var(--fs-caption);
  color: #666;
  margin-top: 0.25rem;
}

/* No results */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
}

.no-results-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.no-results-text {
  margin: 0;
  font-size: var(--fs-base);
}

/* Categories Layout */
.categories-layout {
  display: flex;
  height: 500px;
  gap: 0;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

/* Left Sidebar - Category Groups */
.category-groups-sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: var(--fs-base);
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.category-groups-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.category-group-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  gap: 0.75rem;
}

.category-group-item:hover {
  background: rgba(0, 123, 255, 0.08);
}

.category-group-item.active {
  background: #007bff;
  color: white;
}

.category-group-item.active .group-icon,
.category-group-item.active .group-info,
.category-group-item.active .chevron-right {
  color: white;
}

.group-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #007bff;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.group-name {
  font-weight: 500;
  font-size: var(--fs-sm);
  color: #1a1a1a;
  line-height: 1.3;
}

.group-count {
  font-size: var(--fs-caption);
  color: #666;
}

.chevron-right {
  width: 1rem;
  height: 1rem;
  color: #666;
  flex-shrink: 0;
}

/* Right Content - Subcategories */
.subcategories-content {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.no-group-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.no-selection-icon {
  width: 4rem;
  height: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-selection-title {
  font-size: var(--fs-title-sm);
  font-weight: 600;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.no-selection-text {
  color: #999;
  margin: 0;
}

.selected-group-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.group-header-icon {
  width: 2rem;
  height: 2rem;
  color: #007bff;
  flex-shrink: 0;
}

.group-header-info {
  flex: 1;
}

.selected-group-title {
  font-size: var(--fs-body-lg);
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.selected-group-subtitle {
  font-size: var(--fs-sm);
  color: #666;
  margin: 0;
}

.subcategories-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.subcategory-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.subcategory-card:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.02);
  transform: translateX(4px);
}

.subcategory-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #007bff;
  flex-shrink: 0;
}

.subcategory-info {
  flex: 1;
}

.subcategory-name {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 0.125rem 0;
}

.subcategory-description {
  font-size: var(--fs-caption);
  color: #666;
  margin: 0;
}

.subcategory-arrow {
  width: 1rem;
  height: 1rem;
  color: #ccc;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.subcategory-card:hover .subcategory-arrow {
  color: #007bff;
  transform: translateX(2px);
}

/* Mobile responsiveness */
/* Tablet and small desktop */
@media (max-width: 1024px) {
  .container {
    padding: 0 1rem;
  }
  
  .nav-links ul {
    gap: 1rem;
  }
  
  .nav-link-button {
    padding: 0.5rem 0.75rem;
    font-size: var(--fs-sm);
  }
  
  .user-name {
    display: none;
  }
}

/* Tablet */
@media (max-width: 768px) {
  .navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .navbar-content {
    justify-content: space-between;
  }
  
  .nav-links {
    position: fixed;
    top: 4rem;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 999;
    overflow-y: auto;
  }

  .nav-links.show {
    transform: translateX(0);
  }

  .nav-links ul {
    flex-direction: column;
    padding: 2rem 1.5rem;
    gap: 1.5rem;
    height: 100%;
  }
  
  .nav-links li {
    width: 100%;
  }
  
  .nav-links a,
  .nav-links button {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem;
    border-radius: 8px;
    font-size: var(--fs-body-lg);
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }
  
  .nav-links a:hover,
  .nav-links button:hover {
    background-color: #f8f9fa;
    border-color: #e9ecef;
  }

  .mobile-menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }
  
  .mobile-menu-button:hover {
    background-color: #f8f9fa;
  }

  .mobile-menu-overlay {
    display: block;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .mobile-menu-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .auth-buttons {
    gap: 0.5rem;
  }
  
  .auth-buttons .nav-link-button {
    padding: 0.5rem;
    min-width: 44px;
    height: 44px;
  }

  .drawer-content {
    width: 95%;
    max-width: 95%;
    max-height: 85vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .categories-drawer.open .drawer-content {
    transform: translate(-50%, -50%);
  }

  /* Mobile categories layout */
  .categories-layout {
    flex-direction: column;
    height: auto;
    max-height: 400px;
  }

  .category-groups-sidebar {
    width: 100%;
    max-height: 150px;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .category-groups-list {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .category-group-item {
    flex-shrink: 0;
    min-width: 180px;
    flex-direction: column;
    text-align: center;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }

  .category-group-item.active {
    border-color: #007bff;
  }

  .group-icon {
    margin-bottom: 0.25rem;
  }

  .chevron-right {
    display: none;
  }

  .subcategories-content {
    max-height: 250px;
  }

  .search-results-grid {
    grid-template-columns: 1fr;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .navbar-content {
    gap: 0.5rem;
  }

  .logo-text {
    display: none;
  }
  
  .mobile-menu-button {
    width: 40px;
    height: 40px;
  }
  
  .nav-links ul {
    padding: 1.5rem 1rem;
    gap: 1rem;
  }
  
  .nav-links a,
  .nav-links button {
    padding: 0.875rem;
    font-size: var(--fs-base);
  }
  
  .auth-buttons .nav-link-button {
    min-width: 40px;
    height: 40px;
    padding: 0.375rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .drawer-content {
    width: 98%;
    max-width: 98%;
    padding: 1rem;
  }

  .categories-layout {
    max-height: 350px;
  }

  .category-groups-sidebar {
    max-height: 120px;
  }

  .category-group-item {
    min-width: 140px;
    padding: 0.5rem;
  }
}

/* Extra small mobile */
@media (max-width: 360px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .navbar {
    padding: 0.5rem 0;
  }
  
  .nav-links ul {
    padding: 1rem 0.75rem;
  }
  
  .nav-links a,
  .nav-links button {
    padding: 0.75rem;
    font-size: var(--fs-sm);
  }
  
  .drawer-content {
    padding: 0.75rem;
  }
  
  .auth-buttons .nav-link-button {
    min-width: 36px;
    height: 36px;
    padding: 0.25rem;
  }
  
  .group-name {
    font-size: var(--fs-sm);
  }

  .group-count {
    font-size: var(--fs-caption);
  }

  .subcategories-content {
    max-height: 200px;
  }

  .subcategory-card {
    padding: 0.75rem;
  }

  .subcategory-name {
    font-size: var(--fs-sm);
  }
}

/* Sign Up Modal */
.signup-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  pointer-events: none;
  transition: all 0.3s ease;
}

.signup-modal.open {
  pointer-events: auto;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.signup-modal.open .modal-overlay {
  opacity: 1;
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  width: 90%;
  max-width: 650px;
  height: auto;
  max-height: 85vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.signup-modal.open .modal-content {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-title {
  font-size: var(--fs-title);
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.modal-close:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  flex: 1;
  overflow: visible;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 1rem;
}

.forgot-password-header .form-title {
  font-size: var(--fs-title);
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.forgot-password-header .form-subtitle {
  color: #6b7280;
  font-size: var(--fs-base);
  line-height: 1.5;
  margin: 0;
}

.back-to-login {
  text-align: center;
  margin-top: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
  background: none;
  border: none;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: color 0.2s;
}

.back-link:hover {
  color: #4f46e5;
}

.back-icon {
  width: 1rem;
  height: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.remember-forgot {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-weight: 500;
  color: #1a1a1a;
  font-size: var(--fs-sm);
}

.form-input {
  padding: 0.875rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: var(--fs-base);
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:invalid {
  border-color: #dc3545;
}

.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: var(--fs-sm);
  line-height: var(--lh-ui);
}

.checkbox-input {
  margin: 0;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-text {
  color: #666;
}

.terms-link {
  color: #007bff;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.forgot-link {
  color: #007bff;
  background: none;
  border: none;
  text-decoration: none;
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.forgot-link:hover {
  text-decoration: underline;
}

.submit-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.submit-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-icon {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Social Login Styles */
.social-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e9ecef;
}

.divider-text {
  color: #6b7280;
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-buttons-2-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.social-row:last-child {
  grid-template-columns: 1fr 1fr;
  justify-content: center;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.social-button:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-1px);
}

.social-button.google:hover {
  border-color: #4285f4;
  color: #4285f4;
}

.social-button.facebook:hover {
  border-color: #1877f2;
  color: #1877f2;
}

.social-button.github:hover {
  border-color: #333;
  color: #333;
}

.social-button.linkedin:hover {
  border-color: #0077b5;
  color: #0077b5;
}

.social-button.x:hover {
  border-color: #000;
  color: #000;
}

.social-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.modal-footer {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.form-footer {
  text-align: center;
  margin: 1rem 0;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.signin-text {
  color: #666;
  margin: 0;
  font-size: var(--fs-sm);
}

.signin-link {
  color: #007bff;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
}

.signin-link:hover {
  text-decoration: underline;
}

.social-signup {
  margin-top: 1.5rem;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e9ecef;
}

.divider-text {
  padding: 0 1rem;
  color: #666;
  font-size: var(--fs-sm);
  background: white;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: var(--fs-sm);
}

.social-button:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.02);
}

.social-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.google-button {
  color: #4285f4;
}

.github-button {
  color: #333;
}

/* Mobile responsiveness for modal */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 95%;
    max-height: 85vh;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-title {
    font-size: var(--fs-title-sm);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .social-buttons {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .social-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .social-row:last-child {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98%;
    max-width: 98%;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .signup-form, .login-form, .forgot-password-form {
    gap: 1rem;
  }
}
</style>
