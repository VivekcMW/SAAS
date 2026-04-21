<template>
  <div class="dashboard-overview">
    <!-- Dashboard Main Content -->
    <DashboardMain :user="currentUser" @logout="handleLogout" />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

// Use auth composable
const { isAuthenticated, currentUser, handleLogout, isLoading } = useAuth();

// Meta tags for the dashboard overview page
useHead({
  title: 'Dashboard Overview - SaaSWorld',
  meta: [
    { name: 'description', content: 'View your dashboard overview with analytics, metrics, and recent activity on SaaSWorld' }
  ]
});

// Redirect if not authenticated (only after loading is complete)
watchEffect(() => {
  if (!isLoading.value && !isAuthenticated.value) {
    console.log('Dashboard overview: User not authenticated, redirecting to login')
    navigateTo('/login');
  }
});
</script>

<style scoped>
.dashboard-overview {
  background-color: #ffffff;
  min-height: 100vh;
  /* Fixed spacing to prevent content hiding behind subnav */
  /* Accounts for main navbar (72px) + subnav height (72px) = 144px */
  margin-top: 144px;
  padding: var(--spacing-lg);
}

.dashboard-overview :deep(.dashboard-main) {
  background-color: transparent;
  padding-top: 0;
  flex: none; /* Don't flex, just contain content */
}

.dashboard-overview :deep(.dashboard-content) {
  padding: 0; /* Remove padding, we handle it at this level */
}

.dashboard-overview :deep(.container) {
  max-width: 100%;
  margin: 0;
  padding: 0 var(--spacing-lg);
}

/* Full width geographic section */
.dashboard-overview :deep(.full-width-section) {
  width: 100%;
  margin: var(--spacing-xl) 0;
  padding: 0;
}

.dashboard-overview :deep(.geo-row) {
  display: grid;
  grid-template-columns: 7fr 3fr; /* 70/30 split for better utilization */
  gap: var(--spacing-xl);
  width: 100%;
  padding: 0 var(--spacing-lg);
}

/* Standardized thin border radius for all cards */
.dashboard-overview :deep(.card),
.dashboard-overview :deep(.analytics-card),
.dashboard-overview :deep(.metrics-card),
.dashboard-overview :deep(.overview-card) {
  border-radius: 6px;
}

/* Ensure cards are properly aligned */
.dashboard-overview :deep(.overview-layout) {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
  align-items: start;
  margin-bottom: var(--spacing-2xl);
}

.dashboard-overview :deep(.analytics-container) {
  height: 100%;
  max-height: 100%; /* Prevent height overflow */
}

.dashboard-overview :deep(.metrics-container) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--spacing-lg);
  height: 450px; /* Updated to match new analytics card height */
  max-width: none; /* Remove width constraint for full width */
  width: 100%; /* Ensure full width utilization */
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .dashboard-overview :deep(.overview-layout) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .dashboard-overview :deep(.metrics-container) {
    grid-template-columns: 1fr 1fr;
    max-width: none;
    height: auto;
  }
  
  .dashboard-overview :deep(.geo-row) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .dashboard-overview {
    /* Fixed mobile spacing to prevent content hiding behind subnav */
    /* Accounts for mobile navbar (64px) + subnav height (72px) = 136px */
    margin-top: 136px;
    padding: var(--spacing-md);
  }
  
  .dashboard-overview :deep(.container) {
    padding: 0 var(--spacing-md);
  }
  
  .dashboard-overview :deep(.overview-layout) {
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }
  
  .dashboard-overview :deep(.metrics-container) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    height: 380px; /* Updated to match mobile analytics card height */
  }
  
  .dashboard-overview :deep(.geo-row) {
    padding: 0 var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .dashboard-overview {
    padding: var(--spacing-sm);
    margin-top: 130px;
  }
  
  .dashboard-overview :deep(.container) {
    padding: 0 var(--spacing-sm);
  }
  
  .dashboard-overview :deep(.metrics-container) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    gap: var(--spacing-sm);
    height: auto;
  }
  
  .dashboard-overview :deep(.geo-row) {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-md);
  }
}
</style>
