<template>
  <nav class="app-website-navbar" :class="{ 'scrolled': isScrolled }">
    <div class="navbar-container">
      <!-- App Logo and Name -->
      <div class="navbar-brand">
        <img v-if="app?.logo" :src="app.logo" :alt="`${app.name} logo`" class="app-logo">
        <span class="app-name">{{ app?.name || 'App Website' }}</span>
      </div>

      <!-- Desktop Navigation Menu -->
      <div class="navbar-menu desktop-menu">
        <a 
          v-for="item in navigationItems" 
          :key="item.id"
          :href="`#${item.id}`"
          class="nav-link"
          :class="{ 'active': activeSection === item.id }"
          @click="scrollToSection(item.id)"
        >
          <Icon :name="item.icon" class="nav-icon" />
          {{ item.label }}
        </a>
      </div>

      <!-- Mobile Menu Toggle -->
      <button 
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :class="{ 'active': isMobileMenuOpen }"
      >
        <Icon name="i-heroicons-bars-3" v-if="!isMobileMenuOpen" />
        <Icon name="i-heroicons-x-mark" v-else />
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-menu" :class="{ 'open': isMobileMenuOpen }">
      <a 
        v-for="item in navigationItems" 
        :key="item.id"
        :href="`#${item.id}`"
        class="mobile-nav-link"
        :class="{ 'active': activeSection === item.id }"
        @click="scrollToSection(item.id, true)"
      >
        <Icon :name="item.icon" class="nav-icon" />
        {{ item.label }}
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

interface App {
  id: string;
  name: string;
  logo: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

// Props
interface Props {
  app?: App | null;
}

const props = defineProps<Props>();

// State
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const activeSection = ref('home');

// Navigation items
const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: 'i-heroicons-home' },
  { id: 'features', label: 'Features', icon: 'i-heroicons-squares-2x2' },
  { id: 'pricing', label: 'Pricing', icon: 'i-heroicons-currency-dollar' },
  { id: 'integrations', label: 'Integrations', icon: 'i-heroicons-arrows-right-left' },
  { id: 'enquiry', label: 'Enquiry', icon: 'i-heroicons-envelope' }
];

// Methods
const scrollToSection = (sectionId: string, closeMobile = false) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const navbarHeight = 80; // Account for fixed navbar height
    const elementPosition = element.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
  
  if (closeMobile) {
    isMobileMenuOpen.value = false;
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleScroll = () => {
  // Update scrolled state
  isScrolled.value = window.scrollY > 50;
  
  // Update active section based on scroll position
  const sections = navigationItems.map(item => item.id);
  const navbarHeight = 80;
  
  for (const sectionId of sections) {
    const element = document.getElementById(sectionId);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= navbarHeight && rect.bottom >= navbarHeight) {
        activeSection.value = sectionId;
        break;
      }
    }
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.app-website-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.app-website-navbar.scrolled {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

/* Brand */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #111827;
}

.app-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* Desktop Menu */
.desktop-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

.nav-link.active {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

.nav-icon {
  width: 18px;
  height: 18px;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111827;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu.open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .desktop-menu {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .app-name {
    font-size: 1.1rem;
  }

  .app-logo {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    height: 70px;
  }

  .app-name {
    font-size: 1rem;
  }
}
</style>
