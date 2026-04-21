<!-- Header component for SaaSWorld -->
<template>
  <header class="header" :class="{ 'header-scrolled': isScrolled }">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <NuxtLink to="/">
            <SaasworldLogo class="logo-icon" />
            <span class="logo-text">SaaSWorld</span>
          </NuxtLink>
        </div>
        
        <!-- Navigation -->
        <nav class="nav-desktop">
          <ul>
            <li v-for="item in navItems" :key="item.label">
              <NuxtLink :to="item.path" :class="{ active: currentPath === item.path }">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        
        <!-- Auth Buttons -->
        <div class="auth-buttons">
          <NuxtLink to="/login" class="btn-login">Login</NuxtLink>
          <NuxtLink to="/signup" class="btn btn-primary">Sign Up</NuxtLink>
        </div>
        
        <!-- Mobile Menu Toggle -->
        <button class="menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
          <UIcon dynamic :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" />
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      <div class="mobile-nav" v-if="isMobileMenuOpen">
        <nav>
          <ul>
            <li v-for="item in navItems" :key="item.label">
              <NuxtLink :to="item.path" :class="{ active: currentPath === item.path }">
                {{ item.label }}
              </NuxtLink>
            </li>
            <li class="mobile-auth">
              <NuxtLink to="/login">Login</NuxtLink>
            </li>
            <li class="mobile-auth">
              <NuxtLink to="/signup" class="btn btn-primary">Sign Up</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

// Navigation items
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Solutions', path: '/solutions' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

// Get current path
const route = useRoute();
const currentPath = computed(() => route.path);

// Mobile menu state
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  
  // Prevent scrolling when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Header scroll effect
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Component lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check initial state
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  
  // Reset overflow in case component unmounts with menu open
  document.body.style.overflow = '';
});
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: transparent;
  transition: all var(--transition-normal);
  padding: var(--spacing-md) 0;
}

.header-scrolled {
  background-color: var(--light-color);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-sm) 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
}

.logo a {
  display: flex;
  align-items: center;
  color: var(--dark-color);
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  margin-right: var(--spacing-xs);
}

.nav-desktop ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-desktop li {
  margin: 0 var(--spacing-md);
}

.nav-desktop a {
  color: var(--text-primary);
  font-weight: 500;
  padding: var(--spacing-xs) 0;
  position: relative;
}

.nav-desktop a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width var(--transition-normal);
}

.nav-desktop a:hover::after,
.nav-desktop a.active::after {
  width: 100%;
}

.auth-buttons {
  display: flex;
  align-items: center;
}

.btn-login {
  margin-right: var(--spacing-md);
  color: var(--text-primary);
  font-weight: 500;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.mobile-nav {
  display: none;
  padding: var(--spacing-md);
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-sm);
  box-shadow: var(--shadow-md);
}

.mobile-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav li {
  margin: var(--spacing-md) 0;
}

.mobile-nav a {
  color: var(--text-primary);
  font-weight: 500;
  display: block;
}

.mobile-auth {
  margin-top: var(--spacing-lg);
}

@media (max-width: 992px) {
  .nav-desktop,
  .auth-buttons {
    display: none;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .mobile-nav {
    display: block;
  }
}
</style>
