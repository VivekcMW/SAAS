<template>
  <div class="reviews-container">
    <!-- Sentiment Overview -->
    <div class="sentiment-overview">
      <div class="sentiment-card positive">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-face-smile" />
        </div>
        <div class="sentiment-info">
          <h4>Positive</h4>
          <span class="sentiment-count">{{ sentimentData.positive }}%</span>
        </div>
      </div>
      
      <div class="sentiment-card neutral">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-face-frown" />
        </div>
        <div class="sentiment-info">
          <h4>Neutral</h4>
          <span class="sentiment-count">{{ sentimentData.neutral }}%</span>
        </div>
      </div>
      
      <div class="sentiment-card negative">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-exclamation-triangle" />
        </div>
        <div class="sentiment-info">
          <h4>Negative</h4>
          <span class="sentiment-count">{{ sentimentData.negative }}%</span>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
      <div class="reviews-header">
        <h3>Recent Reviews</h3>
        <div class="filter-controls">
          <select v-model="selectedSentiment" class="sentiment-filter">
            <option value="all">All Reviews</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>
      
      <div class="reviews-content">
        <div 
          v-for="review in filteredReviews" 
          :key="review.id"
          class="review-item"
          :class="review.sentiment"
        >
          <div class="review-header">
            <div class="reviewer-info">
              <div class="reviewer-avatar">
                <img :src="review.avatar" :alt="review.name" >
              </div>
              <div class="reviewer-details">
                <h5 class="reviewer-name">{{ review.name }}</h5>
                <div class="review-meta">
                  <span class="review-product">{{ review.product }}</span>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
              </div>
            </div>
            <div class="review-rating">
              <div class="stars">
                <UIcon 
                  v-for="star in 5" 
                  :key="star"
                  dynamic 
                  :name="star <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'" 
                  :class="star <= review.rating ? 'star-filled' : 'star-empty'"
                />
              </div>
              <span class="rating-text">{{ review.rating }}/5</span>
            </div>
          </div>
          
          <div class="review-content">
            <p class="review-text">{{ review.comment }}</p>
          </div>
          
          <div class="review-footer">
            <div class="sentiment-badge" :class="review.sentiment">
              <UIcon 
                dynamic 
                :name="getSentimentIcon(review.sentiment)" 
              />
              <span>{{ review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1) }}</span>
            </div>
            <div class="review-location">
              <UIcon dynamic name="i-heroicons-map-pin" />
              <span>{{ review.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Sentiment Analytics -->
    <div class="sentiment-analytics">
      <h3>Global Sentiment Trends</h3>
      <div class="analytics-grid">
        <div class="trend-card">
          <h4>Most Praised Features</h4>
          <div class="feature-list">
            <div 
              v-for="feature in topFeatures" 
              :key="feature.name"
              class="feature-item"
            >
              <span class="feature-name">{{ feature.name }}</span>
              <div class="feature-bar">
                <div 
                  class="feature-progress" 
                  :style="{ width: feature.percentage + '%' }"
                />
              </div>
              <span class="feature-percentage">{{ feature.percentage }}%</span>
            </div>
          </div>
        </div>
        
        <div class="trend-card">
          <h4>Common Issues</h4>
          <div class="issues-list">
            <div 
              v-for="issue in commonIssues" 
              :key="issue.name"
              class="issue-item"
            >
              <span class="issue-name">{{ issue.name }}</span>
              <div class="issue-bar">
                <div 
                  class="issue-progress" 
                  :style="{ width: issue.percentage + '%' }"
                />
              </div>
              <span class="issue-percentage">{{ issue.percentage }}%</span>
            </div>
          </div>
        </div>
        
        <div class="trend-card regional-sentiment">
          <h4>Regional Sentiment</h4>
          <div class="regional-list">
            <div 
              v-for="region in regionalSentiment" 
              :key="region.region"
              class="regional-item"
            >
              <span class="region-flag">{{ region.flag }}</span>
              <span class="region-name">{{ region.region }}</span>
              <div class="region-sentiment" :class="region.sentiment">
                <UIcon 
                  dynamic 
                  :name="getSentimentIcon(region.sentiment)" 
                />
                <span>{{ region.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
defineProps({
  reviews: {
    type: Array,
    default: () => []
  }
});

// State
const selectedSentiment = ref('all');

// Mock data for reviews and sentiment analysis
const reviewsData = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    product: 'TaskFlow Pro',
    rating: 5,
    comment: 'This productivity app has completely transformed how I manage my daily tasks. The interface is intuitive and the features are exactly what I needed.',
    sentiment: 'positive',
    date: '2024-01-22T14:30:00Z',
    location: 'New York, USA'
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    product: 'Analytics Hub',
    rating: 4,
    comment: 'Great analytics tool with comprehensive reporting features. Could use some improvements in the mobile experience.',
    sentiment: 'positive',
    date: '2024-01-21T16:45:00Z',
    location: 'Toronto, Canada'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    product: 'Design Studio',
    rating: 3,
    comment: 'The design tools are okay, but I expected more advanced features. The learning curve is steeper than anticipated.',
    sentiment: 'neutral',
    date: '2024-01-20T10:15:00Z',
    location: 'London, UK'
  },
  {
    id: 4,
    name: 'David Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    product: 'TaskFlow Pro',
    rating: 2,
    comment: 'The app crashes frequently and syncing issues make it unreliable. Customer support has been slow to respond.',
    sentiment: 'negative',
    date: '2024-01-19T09:30:00Z',
    location: 'Madrid, Spain'
  },
  {
    id: 5,
    name: 'Lisa Zhang',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    product: 'Analytics Hub',
    rating: 5,
    comment: 'Excellent data visualization capabilities. The custom dashboard feature is a game-changer for our team.',
    sentiment: 'positive',
    date: '2024-01-18T13:20:00Z',
    location: 'Singapore'
  },
  {
    id: 6,
    name: 'James Thompson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    product: 'Design Studio',
    rating: 4,
    comment: 'Solid design platform with good collaboration features. The template library could be more extensive.',
    sentiment: 'positive',
    date: '2024-01-17T11:45:00Z',
    location: 'Sydney, Australia'
  }
]);

// Sentiment data
const sentimentData = ref({
  positive: 67,
  neutral: 18,
  negative: 15
});

// Top features data
const topFeatures = ref([
  { name: 'User Interface', percentage: 85 },
  { name: 'Performance', percentage: 78 },
  { name: 'Customer Support', percentage: 72 },
  { name: 'Feature Set', percentage: 69 }
]);

// Common issues data
const commonIssues = ref([
  { name: 'Sync Problems', percentage: 32 },
  { name: 'Mobile Experience', percentage: 28 },
  { name: 'Loading Speed', percentage: 24 },
  { name: 'Documentation', percentage: 19 }
]);

// Regional sentiment data
const regionalSentiment = ref([
  { region: 'North America', flag: '🇺🇸', sentiment: 'positive', score: 72 },
  { region: 'Europe', flag: '🇪🇺', sentiment: 'positive', score: 68 },
  { region: 'Asia Pacific', flag: '🌏', sentiment: 'positive', score: 75 },
  { region: 'South America', flag: '🇧🇷', sentiment: 'neutral', score: 58 },
  { region: 'Africa', flag: '🌍', sentiment: 'positive', score: 63 }
]);

// Computed properties
const filteredReviews = computed(() => {
  if (selectedSentiment.value === 'all') {
    return reviewsData.value;
  }
  return reviewsData.value.filter(review => review.sentiment === selectedSentiment.value);
});

// Helper functions
const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'i-heroicons-face-smile';
    case 'negative':
      return 'i-heroicons-face-frown';
    default:
      return 'i-heroicons-minus';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};
</script>

<style scoped>
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Sentiment Overview */
.sentiment-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.sentiment-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  background: white;
  border: 2px solid transparent;
}

.sentiment-card.positive {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.sentiment-card.neutral {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.sentiment-card.negative {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.sentiment-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.sentiment-card.positive .sentiment-icon {
  background: #10b981;
  color: white;
}

.sentiment-card.neutral .sentiment-icon {
  background: #f59e0b;
  color: white;
}

.sentiment-card.negative .sentiment-icon {
  background: #ef4444;
  color: white;
}

.sentiment-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sentiment-count {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Reviews List */
.reviews-list {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.reviews-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reviews-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sentiment-filter {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.reviews-content {
  max-height: 500px;
  overflow-y: auto;
}

.review-item {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-100);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.reviewer-info {
  display: flex;
  gap: var(--spacing-sm);
}

.reviewer-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.review-meta {
  display: flex;
  gap: var(--spacing-xs);
  font-size: 12px;
  color: var(--text-secondary);
}

.review-meta span:not(:last-child)::after {
  content: '•';
  margin-left: var(--spacing-xs);
}

.review-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stars {
  display: flex;
  gap: 2px;
}

.star-filled {
  color: #fbbf24;
}

.star-empty {
  color: #d1d5db;
}

.rating-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.review-text {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.sentiment-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.sentiment-badge.positive {
  background: #ecfdf5;
  color: #065f46;
}

.sentiment-badge.neutral {
  background: #fffbeb;
  color: #92400e;
}

.sentiment-badge.negative {
  background: #fef2f2;
  color: #991b1b;
}

.review-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  color: var(--text-secondary);
}

/* Sentiment Analytics */
.sentiment-analytics {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: var(--spacing-lg);
}

.sentiment-analytics h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-lg);
}

.trend-card {
  background: #f8fafc;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.trend-card h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-list,
.issues-list,
.regional-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.feature-item,
.issue-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.feature-name,
.issue-name {
  font-size: 13px;
  color: var(--text-primary);
  min-width: 80px;
  flex-shrink: 0;
}

.feature-bar,
.issue-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.feature-progress {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
}

.issue-progress {
  height: 100%;
  background: #ef4444;
  border-radius: 3px;
}

.feature-percentage,
.issue-percentage {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

.regional-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.region-flag {
  font-size: 16px;
}

.region-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.region-sentiment {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  font-weight: 500;
}

.region-sentiment.positive {
  color: #065f46;
}

.region-sentiment.neutral {
  color: #92400e;
}

.region-sentiment.negative {
  color: #991b1b;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .analytics-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .regional-sentiment {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .sentiment-overview {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .reviews-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
  
  .review-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .review-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}
</style>
