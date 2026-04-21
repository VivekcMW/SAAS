<template>
  <section class="app-hero">
    <div class="container">
      <div class="hero-content">
        <div class="app-header">
          <div class="app-logo">
            <img :src="app.logo" :alt="app.name + ' logo'" @error="handleImageError" />
          </div>
          <div class="app-info">
            <h1 class="app-title">{{ app.name }}</h1>
            <p class="app-provider">by {{ app.provider }}</p>
            <div class="app-meta">
              <div class="app-rating">
                <div class="stars">
                  <i v-for="n in 5" :key="n"
                    class="fas fa-star"
                    :class="{ 'filled': n <= Math.floor(app.rating) }"
                  ></i>
                  <span class="rating-score">{{ app.rating.toFixed(1) }}</span>
                </div>
                <span class="rating-count">({{ app.reviewCount }} reviews)</span>
              </div>
              <div class="app-categories">
                <span v-for="category in app.categories" :key="category" class="category-tag">
                  {{ category }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="hero-actions">
          <div class="action-buttons">
            <button class="btn btn-primary btn-lg get-started">
              <i class="fas fa-rocket"></i>
              Get Started
            </button>
            <button 
              class="btn btn-outline btn-lg favorite"
              :class="{ 'is-favorite': isFavorite }"
              @click="toggleFavorite"
            >
              <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
              {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
            </button>
          </div>
          <div class="pricing-badge" :class="app.pricingType">
            <span v-if="app.pricingType === 'free'">Free</span>
            <span v-else-if="app.pricingType === 'paid'">From ${{ app.startingPrice }}/mo</span>
            <span v-else>Contact for Pricing</span>
          </div>
        </div>

        <div class="app-description">
          <p>{{ app.description }}</p>
        </div>
        
        <div class="quick-stats">
          <div class="stat-item">
            <i class="fas fa-calendar"></i>
            <div class="stat-info">
              <span class="stat-value">{{ formatDate(app.launchDate) }}</span>
              <span class="stat-label">Launch Date</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(app.userCount) }}+</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-building"></i>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(app.companyCount) }}+</span>
              <span class="stat-label">Companies</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-code-branch"></i>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(app.integrationCount) }}</span>
              <span class="stat-label">Integrations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface AppDetails {
  id: string;
  name: string;
  provider: string;
  logo: string;
  description: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  pricingType: 'free' | 'paid' | 'custom';
  startingPrice?: number;
  launchDate: string;
  userCount: number;
  companyCount: number;
  integrationCount: number;
}

interface Props {
  app: AppDetails;
}

const props = defineProps<Props>();
const isFavorite = ref(false);

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/images/placeholder-app-logo.svg';
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Emit event for parent component to handle
  emit('toggleFavorite', isFavorite.value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: num > 9999 ? "compact" : "standard",
    compactDisplay: "short"
  }).format(num);
};

const emit = defineEmits<{
  (e: 'toggleFavorite', value: boolean): void
}>();
</script>

<style scoped>
.app-hero {
  padding: 3rem 0;
  background: linear-gradient(to bottom, rgba(249, 250, 251, 0.8), white);
  border-bottom: 1px solid #e5e7eb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.app-logo {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.app-info {
  flex: 1;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #111827;
}

.app-provider {
  font-size: 1.1rem;
  color: #4b5563;
  margin: 0 0 1rem;
}

.app-meta {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stars i {
  color: #d1d5db;
}

.stars i.filled {
  color: #fbbf24;
}

.rating-score {
  font-weight: 600;
  margin-left: 0.5rem;
  color: #111827;
}

.rating-count {
  color: #6b7280;
  font-size: 0.9rem;
}

.app-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #2563eb;
  border: 2px solid #2563eb;
}

.btn-outline:hover {
  background: rgba(37, 99, 235, 0.05);
  transform: translateY(-1px);
}

.btn-outline.is-favorite {
  background: #2563eb;
  color: white;
}

.pricing-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

.pricing-badge.free {
  background: #dcfce7;
  color: #15803d;
}

.pricing-badge.paid {
  background: #dbeafe;
  color: #1e40af;
}

.pricing-badge.custom {
  background: #fef3c7;
  color: #92400e;
}

.app-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
  max-width: 800px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 2rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.stat-item i {
  font-size: 1.5rem;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  padding: 1rem;
  border-radius: 10px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .app-hero {
    padding: 2rem 0;
  }

  .app-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    text-align: center;
  }

  .app-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }

  .app-title {
    font-size: 2rem;
  }
}
</style>
