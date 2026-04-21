<template>
  <div class="activity-container">
    <div v-if="activities.length === 0" class="empty-state">
      <div class="empty-icon">
        <UIcon dynamic name="i-heroicons-clock" />
      </div>
      <h4>No recent activity</h4>
      <p>Your recent activities will appear here</p>
    </div>

    <div v-else class="activity-cards-row">
      <div 
        v-for="activity in displayedActivities" 
        :key="activity.id"
        class="activity-card"
        :class="getActivityClass(activity.type)"
        @click="viewActivity(activity)"
      >
        <div class="card-header">
          <div class="activity-icon" :class="activity.type">
            <UIcon dynamic :name="activity.icon" />
          </div>
          <div class="activity-type">{{ getActivityTypeLabel(activity.type) }}</div>
        </div>
        
        <div class="card-body">
          <div class="activity-message">{{ activity.message }}</div>
        </div>
        
        <div class="card-footer">
          <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          <div class="view-detail">
            <UIcon dynamic name="i-heroicons-arrow-right" />
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div v-if="activities.length > 5" class="navigation-controls">
      <button 
        class="nav-btn"
        :disabled="currentPage === 0"
        @click="previousPage"
        title="Previous"
      >
        <UIcon dynamic name="i-heroicons-chevron-left" />
      </button>
      
      <div class="page-indicator">
        <span class="current-range">
          {{ (currentPage * 5) + 1 }}-{{ Math.min((currentPage + 1) * 5, activities.length) }}
        </span>
        <span class="total">of {{ activities.length }}</span>
      </div>
      
      <button 
        class="nav-btn"
        :disabled="(currentPage + 1) * 5 >= activities.length"
        @click="nextPage"
        title="Next"
      >
        <UIcon dynamic name="i-heroicons-chevron-right" />
      </button>
    </div>

    <!-- View All Activities Link -->
    <div class="view-all-section">
      <NuxtLink to="/dashboard/activities" class="view-all-link">
        View All Activities
        <UIcon dynamic name="i-heroicons-arrow-right" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  activities: {
    type: Array as () => Array<{
      id: number;
      type: string;
      message: string;
      timestamp: string;
      icon: string;
    }>,
    required: true
  }
});

const emit = defineEmits(['loadMore', 'viewActivity']);

// State
const hasMore = ref(true); // Would be determined by API response
const currentPage = ref(0);
const itemsPerRow = ref(5); // Show 5 cards in vertical layout

// Computed
const displayedActivities = computed(() => {
  const start = currentPage.value * 5; // Show 5 cards total in vertical line
  const end = start + 5;
  return props.activities.slice(start, end);
});

// Methods
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const getActivityClass = (type: string) => {
  return `activity-${type.replace('_', '-')}`;
};

const getActivityTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    'product_view': 'Product View',
    'product_approved': 'Approved',
    'new_review': 'New Review',
    'payment': 'Payment',
    'user_signup': 'New User',
    'subscription': 'Subscription'
  };
  return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if ((currentPage.value + 1) * 5 < props.activities.length) {
    currentPage.value++;
  }
};

const viewActivity = (activity: any) => {
  emit('viewActivity', activity);
  
  // Navigate based on activity type
  switch (activity.type) {
    case 'product_view':
    case 'product_approved':
    case 'new_review':
      // Navigate to product details
      break;
    case 'payment':
      // Navigate to payments/billing
      navigateTo('/dashboard/billing');
      break;
    default:
      console.log('View activity:', activity);
  }
};

const loadMore = () => {
  emit('loadMore');
};
</script>

<style scoped>
.dashboard-activity {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.activity-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #2563eb;
}

.activity-container {
  padding: 0;
  width: 100%;
}

.activity-cards-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
  padding: 0 20px;
}

.activity-card {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  cursor: pointer;
}

.activity-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.activity-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-product-view .activity-icon { background: #10b981; }
.activity-product-approved .activity-icon { background: #3b82f6; }
.activity-new-review .activity-icon { background: #f59e0b; }
.activity-payment .activity-icon { background: #8b5cf6; }
.activity-user-signup .activity-icon { background: #ef4444; }
.activity-subscription .activity-icon { background: #06b6d4; }

.activity-type {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-body {
  margin-bottom: 12px;
}

.activity-message {
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

.view-detail {
  font-size: 12px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.view-detail:hover {
  color: #2563eb;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 20px;
}

.nav-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.nav-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-range {
  font-weight: 500;
  color: #374151;
}

.total {
  color: #9ca3af;
}

.view-all-section {
  text-align: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.view-all-link:hover {
  color: #2563eb;
  gap: 8px;
}

.activity-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.nav-button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  transition: background-color 0.2s;
}

.dot.active {
  background: #3b82f6;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .activity-cards-row {
    gap: 10px;
    padding: 0 16px;
  }
  
  .activity-container {
    padding: 0;
  }
  
  .activity-card {
    width: 100%;
    padding: 12px;
  }
  
  .navigation-controls {
    padding: 0 16px;
  }
  
  .view-all-section {
    padding: 12px 16px;
  }
}
</style>
