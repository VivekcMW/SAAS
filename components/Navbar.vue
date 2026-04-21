<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <div class="logo">
          <NuxtLink to="/">
            <SaasworldLogo class="logo-icon" />
            <span class="logo-text">SaaSWorld</span>
          </NuxtLink>
        </div>
        
        <!-- Navigation Links -->
        <div class="nav-links" :class="{ 'show': isMobileMenuOpen }">
          <ul>
            <li v-for="item in navItems" :key="item.label">
              <NuxtLink :to="item.path" :class="{ active: currentPath === item.path }">
                {{ item.label }}
              </NuxtLink>
            </li>
            <li>
              <button @click="openCategoriesDrawer" class="nav-link-button categories-button">
                <UIcon dynamic name="i-heroicons-squares-2x2" class="categories-icon" />
                Categories
              </button>
            </li>
          </ul>
        </div>
        
        <!-- Auth Buttons and Dropdown -->
        <div class="auth-buttons">
          <!-- Conditional rendering based on auth state -->
          <template v-if="!isAuthenticated">
            <NuxtLink to="/list-product" class="nav-link-button list-app-button">List your application</NuxtLink>
            <button @click="openSignUpModal" class="nav-link-button signup-button">Sign Up</button>
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
        <button class="mobile-menu-button" @click="toggleMobileMenu">
          <UIcon dynamic name="i-heroicons-bars-3" />
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" :class="{ 'show': isMobileMenuOpen }" @click="toggleMobileMenu"></div>
  </nav>
  
  <!-- Categories Drawer -->
  <div class="categories-drawer" :class="{ 'open': isCategoriesDrawerOpen }">
    <div class="drawer-overlay" @click="closeCategoriesDrawer"></div>
    <div class="drawer-content">
      <div class="drawer-header">
        <div class="drawer-header-content">
          <div class="drawer-title-section">
            <h2 class="drawer-title">Browse Categories</h2>
            <p class="drawer-subtitle">Discover {{ categoryGroups.length }} groups with {{ getTotalSubcategories() }} categories</p>
          </div>
          <button @click="closeCategoriesDrawer" class="drawer-close">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        
        <!-- Search -->
        <div class="drawer-search">
          <div class="search-input-wrapper">
            <UIcon dynamic name="i-heroicons-magnifying-glass" class="search-icon" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search categories..." 
              class="search-input"
            />
          </div>
        </div>
      </div>
      
      <div class="drawer-body">
        <!-- Search Results -->
        <div v-if="searchQuery && searchResults.length > 0" class="search-results-container">
          <h3 class="search-results-title">Search Results</h3>
          <div class="search-results-grid">
            <NuxtLink 
              v-for="result in searchResults.slice(0, 20)" 
              :key="result.path"
              :to="result.path"
              class="search-result-item"
              @click="closeCategoriesDrawer"
            >
              <span class="result-name">{{ result.name }}</span>
              <span class="result-group">{{ result.groupName }}</span>
            </NuxtLink>
          </div>
        </div>
        
        <!-- No Search Results -->
        <div v-else-if="searchQuery && searchResults.length === 0" class="no-results">
          <UIcon dynamic name="i-heroicons-magnifying-glass" class="no-results-icon" />
          <p class="no-results-text">No categories found for "{{ searchQuery }}"</p>
        </div>
        
        <!-- Categories Layout -->
        <div v-else class="categories-layout">
          <!-- Left Sidebar - Category Groups -->
          <div class="category-groups-sidebar">
            <h3 class="sidebar-title">Category Groups</h3>
            <div class="category-groups-list">
              <button
                v-for="group in categoryGroups.filter(g => g.id !== 'all')"
                :key="group.id"
                @click="selectedCategoryGroup = group.id"
                class="category-group-item"
                :class="{ 'active': selectedCategoryGroup === group.id }"
              >
                <div class="group-icon">
                  <UIcon :name="group.icon" />
                </div>
                <div class="group-info">
                  <span class="group-name">{{ group.name }}</span>
                  <span class="group-count">{{ group.count }} categories</span>
                </div>
                <UIcon 
                  dynamic 
                  name="i-heroicons-chevron-right" 
                  class="chevron-right"
                />
              </button>
            </div>
          </div>
          
          <!-- Right Content - Subcategories -->
          <div class="subcategories-content">
            <div v-if="!selectedCategoryGroup" class="no-group-selected">
              <div class="no-selection-icon">
                <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
              </div>
              <h3 class="no-selection-title">Select a Category Group</h3>
              <p class="no-selection-text">Choose a category group from the left to browse its categories</p>
            </div>
            
            <div v-else class="selected-group-content">
              <div class="group-header">
                <div class="group-header-icon">
                  <UIcon :name="getSelectedGroupData()?.icon" />
                </div>
                <div class="group-header-info">
                  <h3 class="selected-group-title">{{ getSelectedGroupData()?.name }}</h3>
                  <p class="selected-group-subtitle">{{ getSelectedGroupCategories().length }} categories</p>
                </div>
              </div>
              
              <div class="subcategories-list">
                <NuxtLink
                  v-for="category in getSelectedGroupCategories()"
                  :key="category.id"
                  :to="`/marketplace/category/${category.id}`"
                  class="subcategory-card"
                  @click="closeCategoriesDrawer"
                >
                  <div class="subcategory-icon">
                    <UIcon :name="category.icon" />
                  </div>
                  <div class="subcategory-info">
                    <h4 class="subcategory-name">{{ category.name }}</h4>
                    <p class="subcategory-description">Browse {{ category.name.toLowerCase() }}</p>
                  </div>
                  <UIcon 
                    dynamic 
                    name="i-heroicons-arrow-right" 
                    class="subcategory-arrow"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
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

import { allCategories, categoryGroups, getCategoriesByGroup, searchCategories } from '~/utils/categories';

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

// Use global auth state
const {
  authState,
  openRegister,
  openLogin,
  logout: globalLogout
} = useGlobalAuth();

// User authentication state (using global auth)
const isAuthenticated = computed(() => authState.isAuthenticated);
const currentUser = computed(() => authState.user);

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

// Open sign up modal
const openSignUpModal = () => {
  // Use global auth system instead
  const { openRegister } = useGlobalAuth();
  openRegister();
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

// Handle login event (renamed to avoid conflict)
const handleUserLogin = (userData: any) => {
  // In a real app, you would store the user data in a state management solution
  // and set the authentication token in localStorage/cookies
  currentUser.value = userData;
  isAuthenticated.value = true;
  
  // You might also want to redirect to a dashboard or home page
  // (Handled by your router)
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

// Handle logout
const handleLogout = () => {
  // Use global logout function
  globalLogout();
  isUserDropdownOpen.value = false;
  
  // Redirect to home page
  navigateTo('/');
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.navbar-scrolled {
  background: rgba(255, 255, 255, 0.98);
  border-bottom-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(0.75rem, 2vw, 2rem);
  width: 100%;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: clamp(3.5rem, 4vw, 4rem);
  gap: 1rem;
}

/* Logo styles */
.logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: var(--fs-title-sm);
  text-decoration: none;
  color: #1a1a1a;
  min-width: 0;
  flex-shrink: 0;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  gap: 0.5rem;
}

.logo-icon {
  width: clamp(28px, 4vw, 32px);
  height: clamp(28px, 4vw, 32px);
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
}

.logo-text {
  color: #1a1a1a;
}

/* Navigation links */
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
  gap: clamp(1rem, 3vw, 2rem);
  flex-wrap: wrap;
}

.nav-links li {
  flex-shrink: 0;
}

.nav-links a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 6px;
  transition: color 0.2s ease;
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.active {
  color: #007bff;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.nav-links a:hover {
  color: #007bff;
}

.nav-links a.active {
  color: #007bff;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
}

.nav-link-button {
  background: none;
  border: none;
  color: #666;
  font-weight: 500;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-link-button:hover:not(.list-app-button):not(.categories-button):not(.signup-button) {
  color: var(--sw-primary);
  background: var(--sw-primary-soft);
}

.categories-button {
  background: #ff6b35;
  border: 1px solid #ff6b35;
  color: white;
}

.categories-button:hover {
  background: #e55a2b;
  border-color: #e55a2b;
  color: white;
}

.categories-icon {
  width: 1rem;
  height: 1rem;
}

.nav-link-button.list-app-button {
  background: transparent !important;
  border: 2px solid var(--sw-primary);
  color: var(--sw-primary) !important;
  font-weight: 600;
}

.nav-link-button.list-app-button:hover {
  background: var(--sw-primary-soft) !important;
  border-color: var(--sw-primary) !important;
  color: var(--sw-primary) !important;
}

.signup-button {
  background: var(--sw-primary);
  border: 2px solid var(--sw-primary);
  color: white !important;
  font-weight: 600;
  text-decoration: none;
}

.signup-button:hover {
  background: var(--sw-primary-hover);
  border-color: var(--sw-primary-hover);
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 136, 56, 0.28);
}

/* Auth buttons */
.auth-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(0.5rem, 2vw, 1rem);
  flex-shrink: 0;
  margin-left: auto;
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
