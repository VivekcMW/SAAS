<template>
  <header class="dashboard-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo and Navigation -->
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <UIcon dynamic name="i-heroicons-squares-2x2" />
            <span>SaaSWorld</span>
          </NuxtLink>
          
          <nav class="main-nav">
            <NuxtLink to="/dashboard" class="nav-link" active-class="active">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/marketplace" class="nav-link">
              Marketplace
            </NuxtLink>
            <NuxtLink to="/list-product" class="nav-link">
              List Product
            </NuxtLink>
          </nav>
        </div>

        <!-- User Menu -->
        <div class="header-right">
          <!-- Notifications -->
          <div class="notification-bell" @click="toggleNotifications">
            <UIcon dynamic name="i-heroicons-bell" />
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </div>

          <!-- User Profile -->
          <div class="user-profile" @click="toggleUserMenu">
            <img :src="user.avatar || defaultAvatar" :alt="user.name" class="user-avatar" />
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role || 'Developer' }}</span>
            </div>
            <UIcon dynamic name="i-heroicons-chevron-down" class="dropdown-icon" />
          </div>

          <!-- User Dropdown Menu -->
          <div v-if="showUserMenu" class="user-dropdown" @click.stop>
            <div class="dropdown-header">
              <img :src="user.avatar || defaultAvatar" :alt="user.name" class="dropdown-avatar" />
              <div class="dropdown-user-info">
                <div class="dropdown-name">{{ user.name }}</div>
                <div class="dropdown-email">{{ user.email }}</div>
              </div>
            </div>
            
            <div class="dropdown-divider"></div>
            
            <NuxtLink to="/settings" class="dropdown-item">
              <UIcon dynamic name="i-heroicons-cog-6-tooth" />
              Settings
            </NuxtLink>
            
            <NuxtLink to="/help" class="dropdown-item">
              <UIcon dynamic name="i-heroicons-question-mark-circle" />
              Help & Support
            </NuxtLink>
            
            <div class="dropdown-divider"></div>
            
            <button @click="handleLogout" class="dropdown-item logout">
              <UIcon dynamic name="i-heroicons-arrow-right-on-rectangle" />
              Sign Out
            </button>
          </div>

          <!-- Notifications Dropdown -->
          <div v-if="showNotifications" class="notifications-dropdown" @click.stop>
            <div class="dropdown-header">
              <h3>Notifications</h3>
              <button @click="markAllAsRead" class="mark-all-read">
                Mark all as read
              </button>
            </div>
            
            <div class="notifications-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
              >
                <div class="notification-icon">
                  <UIcon dynamic :name="notification.icon" />
                </div>
                <div class="notification-content">
                  <p class="notification-message">{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                </div>
              </div>
              
              <div v-if="notifications.length === 0" class="no-notifications">
                <UIcon dynamic name="i-heroicons-bell-slash" />
                <p>No new notifications</p>
              </div>
            </div>
            
            <div class="dropdown-footer">
              <NuxtLink to="/notifications" class="view-all-link">
                View all notifications
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside to close dropdowns -->
    <div 
      v-if="showUserMenu || showNotifications" 
      class="dropdown-overlay" 
      @click="closeDropdowns"
    ></div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['logout']);

// State
const showUserMenu = ref(false);
const showNotifications = ref(false);
const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';

// Mock notifications
const notifications = ref([
  {
    id: 1,
    message: 'Your product "TaskFlow Pro" received 25 new views',
    timestamp: new Date(Date.now() - 300000),
    icon: 'i-heroicons-eye',
    read: false
  },
  {
    id: 2,
    message: 'Design Studio has been approved for marketplace',
    timestamp: new Date(Date.now() - 3600000),
    icon: 'i-heroicons-check-circle',
    read: false
  },
  {
    id: 3,
    message: 'New review received for Analytics Hub',
    timestamp: new Date(Date.now() - 7200000),
    icon: 'i-heroicons-star',
    read: true
  },
  {
    id: 4,
    message: 'Payment of $450 has been processed',
    timestamp: new Date(Date.now() - 86400000),
    icon: 'i-heroicons-currency-dollar',
    read: true
  }
]);

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showNotifications.value = false;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false;
};

const closeDropdowns = () => {
  showUserMenu.value = false;
  showNotifications.value = false;
};

const handleLogout = () => {
  emit('logout');
  closeDropdowns();
};

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};

const formatTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeDropdowns();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.dashboard-header {
  background: white;
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.25rem;
}

.main-nav {
  display: flex;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
  background: var(--primary-color-light);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
}

.notification-bell {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-bell:hover {
  background: var(--color-gray-200);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-profile:hover {
  background: var(--bg-light);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.dropdown-icon {
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.user-dropdown,
.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--color-gray-200);
  min-width: 280px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  flex: 1;
}

.dropdown-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.dropdown-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-gray-200);
  margin: var(--spacing-xs) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: var(--bg-light);
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

.notifications-dropdown .dropdown-header {
  justify-content: space-between;
}

.notifications-dropdown .dropdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.mark-all-read {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.85rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: background 0.2s ease;
}

.mark-all-read:hover {
  background: var(--primary-color-light);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-100);
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: var(--bg-light);
}

.notification-item.unread {
  background: #f0f9ff;
  border-left: 3px solid var(--primary-color);
}

.notification-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-light);
  border-radius: 50%;
  color: var(--primary-color);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-message {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.no-notifications {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.no-notifications svg {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.dropdown-footer {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  text-align: center;
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 var(--spacing-md);
  }
  
  .main-nav {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .user-dropdown,
  .notifications-dropdown {
    right: var(--spacing-md);
    left: var(--spacing-md);
    min-width: auto;
  }
}
</style>
