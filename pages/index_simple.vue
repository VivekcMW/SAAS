<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Empower your business with our <span class="highlight">Saasworld.club</span> platform</h1>
          <p class="hero-subtitle">The Saasworld.club is a digital marketplace for web applications that provides a wide range of apps that can be searched on the need of users and helps to make decisions for small and medium businesses, that can be used by multiple personas and businesses.</p>
          
          <!-- Search row -->
          <div class="search-row">
            <div class="search-container">
              <input type="text" placeholder="Search for startups, investment opportunities, or software solutions..." class="search-input">
              <button class="search-btn" @click="handleSearch">
                <UIcon name="i-heroicons-magnifying-glass" dynamic />
                <span>Search</span>
              </button>
            </div>
            <button class="category-btn" @click="handleCategoryClick" title="Browse Categories">
              <UIcon name="i-heroicons-squares-2x2" dynamic />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Integrations Section -->
    <section class="integrations-section">
      <div class="container">
        <div class="integrations-header">
          <h2>Trusted by leading companies worldwide</h2>
          <p>Join thousands of businesses using our platform</p>
        </div>
        <div class="integrations-logos" @mouseleave="resetLogos">
          <div 
            v-for="(logo, index) in integrationLogos" 
            :key="logo.name" 
            class="logo-item" 
            @mouseenter="handleLogoHover(index)"
          >
            <div class="logo-tooltip">{{ logo.name }}</div>
            <img :src="logo.src" :alt="logo.name" :class="{ 'highlighted': highlightedLogo === index }" />
          </div>
        </div>
        <div class="integrations-footer">
          <p class="integration-note">...and many more available on our integrations page.</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Global categories menu composable for cross-component communication
const { openCategoriesDrawer } = useCategoriesMenu();

// Debug function to test if category button is being clicked
const handleCategoryClick = () => {
  console.log('Category button clicked!');
  openCategoriesDrawer();
};

// Handle search functionality
const handleSearch = () => {
  console.log('Search functionality');
  // Add search logic here
};

// Integration logos data
const integrationLogos = ref([
  { name: 'Slack', src: '/assets/images/integrations/slack.svg' },
  { name: 'Zoom', src: '/assets/images/integrations/zoom.svg' },
  { name: 'Notion', src: '/assets/images/integrations/notion.svg' },
  { name: 'Figma', src: '/assets/images/integrations/figma.svg' },
  { name: 'Shopify', src: '/assets/images/integrations/shopify.svg' },
  { name: 'HubSpot', src: '/assets/images/integrations/hubspot.svg' },
  { name: 'Salesforce', src: '/assets/images/integrations/salesforce.svg' },
  { name: 'Stripe', src: '/assets/images/integrations/stripe.svg' }
]);

const highlightedLogo = ref(-1);

// Logo hover effects
const handleLogoHover = (index: number) => {
  highlightedLogo.value = index;
};

const resetLogos = () => {
  highlightedLogo.value = -1;
};
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: calc(var(--spacing-xxl) * 2) 0;
  background: linear-gradient(135deg, var(--bg-gray) 0%, #fff 100%);
  position: relative;
  overflow: visible;
  text-align: center;
  z-index: 1; /* Base z-index for hero section */
}

.hero-section .container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 3.25rem;
  line-height: 1.2;
  margin-bottom: var(--spacing-lg);
}

.highlight {
  color: var(--primary-color);
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  height: 10px;
  background-color: var(--secondary-color);
  z-index: -1;
  opacity: 0.5;
}

.hero-subtitle {
  font-size: 1.125rem;
  font-weight: 300;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.search-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  margin-bottom: var(--spacing-xl);
}

.search-container {
  display: flex;
  position: relative;
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-md);
  background-color: var(--light-color);
  overflow: hidden;
  border: 1px solid var(--color-gray-200);
  width: 100%;
  max-width: 700px;
}

.search-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: var(--primary-dark);
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: var(--light-color);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.category-btn:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
}

/* Integrations Section */
.integrations-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--bg-light);
}

.integrations-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.integrations-header h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.integrations-header p {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.integrations-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.logo-item {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-item:hover {
  transform: translateY(-5px);
}

.logo-item img {
  height: 40px;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.logo-item img.highlighted,
.logo-item:hover img {
  filter: grayscale(0%);
  opacity: 1;
}

.logo-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--text-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.logo-item:hover .logo-tooltip {
  opacity: 1;
  visibility: visible;
}

.integrations-footer {
  text-align: center;
}

.integration-note {
  color: var(--text-tertiary);
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .search-row {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .search-container {
    max-width: 100%;
  }
  
  .integrations-logos {
    gap: var(--spacing-md);
  }
  
  .logo-item img {
    height: 32px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .search-btn span {
    display: none;
  }
}
</style>
