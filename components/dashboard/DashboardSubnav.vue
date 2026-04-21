<template>
  <nav class="dashboard-subnav">
    <div class="container">
      <div class="subnav-content">
        <!-- Dashboard Navigation Tabs -->
        <div class="dashboard-nav">
          <div class="nav-tabs">
            <NuxtLink 
              v-for="tab in dashboardTabs" 
              :key="tab.path"
              :to="tab.path" 
              class="nav-tab"
              :class="{ active: isTabActive(tab.path) }"
            >
              <UIcon dynamic :name="tab.icon" class="tab-icon" />
              <span class="tab-label">{{ tab.label }}</span>
              <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
            </NuxtLink>
          </div>
          
          <!-- Action Buttons -->
          <div class="nav-actions">
            <!-- View Toggle -->
            <div class="view-toggle" v-if="showViewToggle">
              <button 
                class="toggle-btn"
                :class="{ active: currentView === 'grid' }"
                @click="$emit('changeView', 'grid')"
                title="Grid View"
              >
                <UIcon dynamic name="i-heroicons-squares-2x2" />
              </button>
              <button 
                class="toggle-btn"
                :class="{ active: currentView === 'list' }"
                @click="$emit('changeView', 'list')"
                title="List View"
              >
                <UIcon dynamic name="i-heroicons-list-bullet" />
              </button>
            </div>
            
            <!-- User Menu -->
            <div class="user-menu-dropdown" ref="userDropdown">
              <button 
                class="user-menu-button"
                @click="toggleUserDropdown"
                title="User Menu"
              >
                <div class="user-avatar">
                  <span v-if="!currentUser?.avatar">{{ userInitials }}</span>
                  <img v-else :src="currentUser.avatar" :alt="currentUser.fullName" />
                </div>
                <span class="user-name">{{ currentUser?.firstName || 'User' }}</span>
                <UIcon dynamic name="i-heroicons-chevron-down" class="dropdown-arrow" :class="{ 'rotate': showUserDropdown }" />
              </button>
              
              <div v-if="showUserDropdown" class="dropdown-menu user-menu">
                <!-- User Profile Section -->
                <div class="user-profile-section">
                  <div class="user-avatar-large">
                    <span v-if="!currentUser?.avatar">{{ userInitials }}</span>
                    <img v-else :src="currentUser.avatar" :alt="currentUser.fullName" />
                  </div>
                  <div class="user-details">
                    <div class="user-name-full">{{ currentUser?.fullName || 'User' }}</div>
                    <div class="user-email">{{ currentUser?.email || 'user@example.com' }}</div>
                    <div class="user-plan">{{ currentUser?.plan || 'Pro Plan' }}</div>
                  </div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <!-- Navigation Options -->
                <NuxtLink to="/dashboard/user-management" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-users" />
                  <span>User Management</span>
                </NuxtLink>
                
                <NuxtLink to="/dashboard/profile" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-user-circle" />
                  <span>Profile Management</span>
                </NuxtLink>
                
                <NuxtLink to="/dashboard/billing" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-credit-card" />
                  <span>Subscriptions</span>
                </NuxtLink>
                
                <NuxtLink to="/dashboard/documents" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-document-text" />
                  <span>Documents</span>
                </NuxtLink>
                
                <div class="dropdown-divider"></div>
                
                <!-- Site Navigation -->
                <NuxtLink to="/" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-home" />
                  <span>Back to Site</span>
                </NuxtLink>
                
                <NuxtLink to="/dashboard/settings" class="dropdown-item">
                  <UIcon dynamic name="i-heroicons-cog-6-tooth" />
                  <span>Settings</span>
                </NuxtLink>
                
                <div class="dropdown-divider"></div>
                
                <!-- Logout -->
                <button class="dropdown-item logout-item" @click="handleLogout">
                  <UIcon dynamic name="i-heroicons-arrow-right-on-rectangle" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalViews: 12540,
      revenue: 3850,
      products: 3
    })
  },
  showViewToggle: {
    type: Boolean,
    default: false
  },
  currentView: {
    type: String,
    default: 'grid'
  }
});

const emit = defineEmits([
  'changeView'
]);

const route = useRoute();

// Dashboard navigation tabs
const dashboardTabs = computed(() => [
  {
    path: '/dashboard/overview',
    label: 'Overview',
    icon: 'i-heroicons-home',
    exact: true
  },
  {
    path: '/dashboard/products',
    label: 'Products',
    icon: 'i-heroicons-squares-2x2',
    badge: props.stats.products > 0 ? props.stats.products : null
  },
  {
    path: '/dashboard/analytics',
    label: 'Analytics',
    icon: 'i-heroicons-chart-bar'
  },
  {
    path: '/dashboard/reviews',
    label: 'Reviews',
    icon: 'i-heroicons-star'
  },
  {
    path: '/dashboard/enquiries',
    label: 'Enquiries',
    icon: 'i-heroicons-envelope'
  }
]);

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const isTabActive = (tabPath: string) => {
  if (tabPath === '/dashboard') {
    return route.path === '/dashboard';
  }
  return route.path.startsWith(tabPath);
};

// User menu functionality
const showUserDropdown = ref(false);
const userDropdown = ref<HTMLElement | null>(null);

// Auth integration
const { currentUser, handleLogout: authLogout } = useAuth();

const userInitials = computed(() => {
  if (currentUser.value?.fullName) {
    return currentUser.value.fullName
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase();
  }
  if (currentUser.value?.firstName && currentUser.value?.lastName) {
    return `${currentUser.value.firstName[0]}${currentUser.value.lastName[0]}`.toUpperCase();
  }
  if (currentUser.value?.firstName) {
    return currentUser.value.firstName[0].toUpperCase();
  }
  return 'U';
});

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value;
};

const handleLogout = async () => {
  authLogout();
  await navigateTo('/');
  showUserDropdown.value = false;
};

const closeUserDropdown = (event: Event) => {
  const target = event.target as HTMLElement;
  if (userDropdown.value && !userDropdown.value.contains(target)) {
    showUserDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeUserDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserDropdown);
});
</script>

<style scoped>
/* 
 * ⚠️ ULTIMATE SUBNAV POSITIONING SOLUTION ⚠️
 * 
 * CRITICAL: This subnav MUST remain fixed at the top under the main navbar.
 * Using position: fixed for maximum reliability instead of sticky.
 * 
 * LAYOUT HIERARCHY:
 * 1. Main Navbar: position: fixed, top: 0, z-index: 2000
 * 2. DashboardSubnav: position: fixed, top: 72px, z-index: 1500
 * 3. Page Content: padding-top: 144px (72px navbar + 72px subnav)
 * 
 * This solution prevents ANY interference from parent layouts or page styles!
 */
.dashboard-subnav {
  /* CRITICAL: Use fixed positioning for ultimate control */
  position: fixed !important;
  top: 72px !important; /* Always 72px from top (navbar height) */
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1500 !important; /* Below navbar (2000) but above all content */
  
  /* Visual styling */
  background: white !important;
  border-bottom: 1px solid #e5e7eb !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  
  /* Prevent any margin/padding interference */
  margin: 0 !important;
  padding: 0 !important;
  
  /* Performance optimizations */
  transform: translateZ(0) !important;
  will-change: transform !important;
  
  /* Force block display */
  display: block !important;
  
  /* Ensure it doesn't get hidden by overflow */
  visibility: visible !important;
  opacity: 1 !important;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.subnav-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) 0;
}

/* Dashboard Navigation Styles */

.dashboard-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-tabs {
  display: flex;
  gap: 0;
  border-radius: var(--border-radius-lg);
  background: var(--bg-light);
  padding: 4px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--fs-sm);
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.nav-tab:hover {
  color: var(--primary-color);
  background: rgba(59, 130, 246, 0.1);
}

.nav-tab.active {
  color: var(--primary-color);
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-icon {
  font-size: var(--fs-base);
}

.tab-badge {
  background: var(--primary-color);
  color: white;
  font-size: var(--fs-caption);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.view-toggle {
  display: flex;
  background: var(--bg-light);
  border-radius: var(--border-radius-md);
  padding: 2px;
  border: 1px solid var(--color-gray-200);
}

.toggle-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.toggle-btn:hover {
  color: var(--primary-color);
}

.toggle-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--fs-base);
  z-index: 1;
}

.search-input {
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  font-size: var(--fs-sm);
  width: 240px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  width: 280px;
}

/* User Menu Styles */
.user-menu-dropdown {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-light); /* Match nav-tabs background */
  border: 1px solid transparent;
  border-radius: var(--border-radius-lg); /* Match nav-tabs border radius */
  color: var(--text-primary);
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* Subtle shadow like nav-tabs */
}

.user-menu-button:hover {
  background: white; /* Match nav-tab active state */
  border-color: transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Enhanced shadow on hover */
  color: var(--primary-color); /* Primary color on hover */
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%); /* Gradient background */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-caption);
  font-weight: 600;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  transition: all 0.2s ease; /* Smooth transitions */
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  width: 1rem;
  height: 1rem;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.user-menu {
  min-width: 280px;
  max-width: 320px;
  padding: 0;
  overflow: hidden;
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius-lg); /* Match button border radius */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1); /* Enhanced shadow */
  z-index: 100;
  backdrop-filter: blur(10px); /* Modern blur effect */
  animation: dropdownFadeIn 0.2s ease-out; /* Smooth entrance animation */
}

/* Dropdown animation */
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* User Profile Section */
.user-profile-section {
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-body-lg);
  font-weight: 700;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name-full {
  font-size: var(--fs-base);
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: var(--fs-caption);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: var(--fs-micro);
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  display: inline-block;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.05em;
}

/* Enhanced Dropdown Items */
.user-menu .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: var(--text-primary);
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  text-decoration: none;
  border-radius: 0; /* Remove border radius for seamless hover */
  position: relative;
}

.user-menu .dropdown-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
  transform: scaleY(0);
  transition: transform 0.2s ease;
  border-radius: 0 2px 2px 0;
}

.user-menu .dropdown-item:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%); /* Subtle gradient background */
  color: var(--primary-color);
  transform: translateX(2px); /* Subtle slide effect */
}

.user-menu .dropdown-item:hover::before {
  transform: scaleY(1); /* Show accent bar on hover */
}

.user-menu .dropdown-item svg {
  width: 1.125rem;
  height: 1.125rem;
  color: #64748b;
  transition: color 0.2s ease;
}

.user-menu .dropdown-item:hover svg {
  color: var(--primary-color);
}

.user-menu .logout-item {
  color: #dc2626;
  margin-top: 0.25rem; /* Extra spacing above logout */
}

.user-menu .logout-item::before {
  background: #dc2626; /* Red accent bar for logout */
}

.user-menu .logout-item:hover {
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%); /* Red tinted background */
  color: #dc2626;
  transform: translateX(2px);
}

.user-menu .logout-item svg {
  color: #dc2626;
}

.user-menu .dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%); /* Gradient divider */
  margin: 0.5rem 1rem; /* Inset margins for better visual separation */
  border: none;
}

@media (max-width: 1200px) {
  .subnav-content {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 768px) {
  .dashboard-subnav {
    /* CRITICAL: Mobile navbar is 64px high */
    top: 64px !important;
    /* Maintain all other fixed positioning properties */
    position: fixed !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    z-index: 1500 !important;
    background: white !important;
    transform: translateZ(0) !important;
  }
  
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .dashboard-nav {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .nav-tabs {
    overflow-x: auto;
    padding: 2px;
  }
  
  .nav-tab {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--fs-sm);
  }
  
  .tab-label {
    display: none;
  }
  
  .nav-actions {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .search-input {
    width: 200px;
  }
  
  .search-input:focus {
    width: 220px;
  }
  
  .btn-label {
    display: none;
  }
}

@media (max-width: 640px) {
  .search-input {
    width: 160px;
  }
  
  .search-input:focus {
    width: 180px;
  }
}
</style>
