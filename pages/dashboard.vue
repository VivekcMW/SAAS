<template>
  <div class="dashboard-page">
    <DashboardAuth v-if="!isAuthenticated" />
    <div v-else class="dashboard-layout">
      <!-- Dashboard Sub-navbar -->
      <DashboardSubnav 
        :stats="dashboardStats"
        :show-view-toggle="showViewToggle"
        :current-view="currentView"
        @changeView="handleViewChange"
        @addProduct="handleAddProduct"
        @createReport="handleCreateReport"
        @scheduleDemo="handleScheduleDemo"
        @exportData="handleExportData"
      />
      
      <!-- Dashboard Pages Content -->
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Use auth composable
const { isAuthenticated, currentUser, handleLogout } = useAuth();

// Redirect to overview if at root dashboard
const route = useRoute();
if (route.path === '/dashboard') {
  await navigateTo('/dashboard/overview');
}

// Meta tags for the dashboard page
useHead({
  title: 'Dashboard - SaaSWorld',
  meta: [
    { name: 'description', content: 'Manage your products, view analytics, and track performance on SaaSWorld' }
  ]
});

// Dashboard UI state
const currentView = ref('grid');
const filtersActive = ref(false);
const showViewToggle = ref(false);

// Dashboard stats (would typically come from API)
const dashboardStats = ref({
  totalViews: 12540,
  revenue: 3850,
  products: 3
});

// Dashboard UI handlers
const handleViewChange = (view: string) => {
  currentView.value = view;
};

const handleToggleFilters = () => {
  filtersActive.value = !filtersActive.value;
};

const handleSearch = (query: string) => {
  console.log('Search query:', query);
  // Implement search functionality
};

const handleAddProduct = () => {
  navigateTo('/list-product');
};

const handleCreateReport = () => {
  console.log('Create report functionality');
  // Implement report creation
};

const handleScheduleDemo = () => {
  console.log('Schedule demo functionality');
  // Implement demo scheduling
};

const handleExportData = () => {
  console.log('Export data functionality');
  // Implement data export
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f8fafc;
  /* Account for default layout margin-top from layouts/default.vue */
  margin-top: -72px !important; /* Counteract the default layout margin */
}

.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* Ensure proper stacking context for fixed subnav */
  position: relative;
  overflow-x: hidden; /* Prevent horizontal scroll */
  /* Add padding to account for fixed navbar + subnav */
  padding-top: 72px; /* Space for fixed navbar */
}

/* 
 * ⚠️ CRITICAL: FIXED SUBNAV POSITIONING ENFORCEMENT ⚠️
 * 
 * Since the subnav is now position: fixed, ensure it never gets overridden
 */
.dashboard-layout :deep(.dashboard-subnav) {
  position: fixed !important;
  top: 72px !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1500 !important;
  background: white !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Mobile responsive positioning */
@media (max-width: 768px) {
  .dashboard-page {
    margin-top: -64px !important; /* Counteract mobile default layout margin */
  }

  .dashboard-layout {
    padding-top: 64px; /* Space for mobile fixed navbar */
  }

  .dashboard-layout :deep(.dashboard-subnav) {
    top: 64px !important;
  }
}
</style>
