<template>
  <section class="app-hero">
    <div class="container">
      <div class="hero-content">
        <div class="app-header">
          <div class="app-logo">
            <img :src="app.logo" :alt="app.name + ' logo'" @error="handleImageError" >
          </div>
          <div class="app-info">
            <h1 class="app-title">{{ app.name }}</h1>
            <p class="app-provider">by {{ app.provider }}</p>
            <div class="app-meta">
              <div class="app-rating">
                <div class="stars">
                  <i
v-for="n in 5" :key="n"
                    class="fas fa-star"
                    :class="{ 'filled': n <= Math.floor(app.rating) }"
                  />
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
              <i class="fas fa-rocket"/>
              Get Started
            </button>
            <button 
              class="btn btn-outline btn-lg favorite"
              :class="{ 'is-favorite': isFavorite }"
              @click="toggleFavorite"
            >
              <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'"/>
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
            <i class="fas fa-calendar"/>
            <div class="stat-info">
              <span class="stat-value">{{ formatDate(app.launchDate) }}</span>
              <span class="stat-label">Launch Date</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-users"/>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(app.userCount) }}+</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-building"/>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(app.companyCount) }}+</span>
              <span class="stat-label">Companies</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-code-branch"/>
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

defineProps<Props>();
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
  background: var(--mm-bg);
  border-bottom: .5px solid var(--b1);
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
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--mm-s2);
  box-shadow: var(--shadow-sm);
  border: .5px solid var(--b2);
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
  color: var(--mm-pearl);
}

.app-provider {
  font-size: 1.1rem;
  color: var(--mm-silver);
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
  color: var(--b3);
}

.stars i.filled {
  color: var(--mm-gold);
}

.rating-score {
  font-weight: 600;
  margin-left: 0.5rem;
  color: var(--mm-pearl);
}

.rating-count {
  color: var(--mm-slate);
  font-size: 0.9rem;
}

.app-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  background: var(--mm-s3);
  color: var(--mm-silver);
  border-radius: var(--r-full);
  font-size: var(--t-sm);
  font-weight: 500;
  border: .5px solid var(--b1);
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
  border-radius: var(--r-full);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: var(--mm-gold);
  color: #0A0700;
  border: none;
}

.btn-primary:hover {
  background: var(--mm-goldl);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--mm-gold);
  border: .5px solid var(--mm-gold);
}

.btn-outline:hover {
  background: var(--mm-gold-soft);
  transform: translateY(-1px);
}

.btn-outline.is-favorite {
  background: var(--mm-gold);
  color: #0A0700;
}

.pricing-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--r-full);
  font-weight: 600;
  font-size: 1.1rem;
}

.pricing-badge.free {
  background: var(--mm-sea-soft);
  color: var(--mm-seal);
  border: .5px solid var(--mm-sea);
}

.pricing-badge.paid {
  background: var(--mm-blue-soft);
  color: var(--mm-bluel);
  border: .5px solid var(--mm-blue);
}

.pricing-badge.custom {
  background: var(--mm-gold-soft);
  color: var(--mm-goldl);
  border: .5px solid var(--mm-gold);
}

.app-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--mm-silver);
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
  background: var(--mm-s2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  border: .5px solid var(--b1);
}

.stat-item i {
  font-size: 1.5rem;
  color: var(--mm-goldl);
  background: var(--mm-gold-soft);
  padding: 1rem;
  border-radius: var(--r-md);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--mm-pearl);
}

.stat-label {
  font-size: var(--t-sm);
  color: var(--mm-slate);
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
