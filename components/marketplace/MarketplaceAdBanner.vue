<template>
  <div v-if="banner" class="ad-banner" :class="{ 
    'ad-banner-top': position === 'top',
    'ad-banner-middle': position === 'middle',
    'ad-banner-sidebar': position === 'sidebar'
  }" @click="handleBannerClick">
    <div class="banner-wrapper" :style="getBannerStyle">
      <div class="banner-image-container" v-if="banner.imageUrl && !imageError">
        <img 
          :src="banner.imageUrl" 
          :alt="banner.title" 
          class="banner-image" 
          @error="handleImageError" 
        />
      </div>
      
      <div class="banner-content" :class="{'full-width': !banner.imageUrl || imageError}">
        <div class="banner-header">
          <span v-if="banner.sponsoredTag" class="sponsored-tag">
            <UIcon name="i-heroicons-sparkles" dynamic  class="sponsored-icon" /> Sponsored
          </span>
        </div>
        <h3 class="banner-title">{{ banner.title }}</h3>
        <p v-if="banner.description" class="banner-description">{{ banner.description }}</p>
        
        <div v-if="banner.ctaText" class="banner-cta">
          <button class="btn btn-primary">{{ banner.ctaText }}</button>
        </div>
      </div>
      
      <div v-if="showCloseButton" class="banner-close" @click.stop="closeBanner">
        <UIcon name="i-heroicons-x-mark" dynamic  />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Types
interface BannerData {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  sponsoredTag?: boolean;
  ctaText?: string;
  ctaUrl: string;
  type: 'image' | 'text' | 'both';
}

interface AdBannerProps {
  position: 'top' | 'middle' | 'sidebar';
  type?: 'image' | 'text' | 'both';
}

// Props
const props = withDefaults(defineProps<AdBannerProps>(), {
  position: 'top',
  type: 'both'
});

// State
const banner = ref<BannerData | null>(null);
const dismissed = ref(false);
const imageError = ref(false);

// Computed properties
const showContent = computed(() => {
  return (banner.value?.type !== 'image') || imageError.value;
});

const showCloseButton = computed(() => {
  return props.position === 'top' || props.position === 'middle';
});

const getBannerStyle = computed(() => {
  if (!banner.value) return {};
  
  const style: Record<string, string> = {};
  
  if (banner.value.backgroundColor) {
    style.backgroundColor = banner.value.backgroundColor;
  }
  
  if (banner.value.textColor) {
    style.color = banner.value.textColor;
  }
  
  return style;
});

// Methods
const fetchBanner = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check localStorage for dismissed banners
  const dismissedBanners = localStorage.getItem('dismissed-banners');
  const dismissedIds = dismissedBanners ? JSON.parse(dismissedBanners) : [];
  
  // Mock data - in a real application, this would be fetched from an API
  const mockBanners: BannerData[] = [
    {
      id: 'banner-001',
      title: 'Try Salesforce CRM for free',
      description: 'Get your team on board with the #1 rated CRM solution. 30-day free trial, no credit card required.',
      imageUrl: '/assets/images/integrations/salesforce.svg',
      backgroundColor: '#f0f8ff',
      textColor: '#333333',
      sponsoredTag: true,
      ctaText: 'Start Free Trial',
      ctaUrl: '/marketplace/app/app-001',
      type: 'both'
    },
    {
      id: 'banner-002',
      title: 'Need help selecting the right tools?',
      description: 'Book a free consultation with our solution experts.',
      backgroundColor: '#2c3e50',
      textColor: '#ffffff',
      sponsoredTag: false,
      ctaText: 'Book Now',
      ctaUrl: '/consultation',
      type: 'text'
    },
    {
      id: 'banner-003',
      title: 'New: Stripe Payment Solutions',
      imageUrl: '/assets/images/integrations/stripe.svg',
      backgroundColor: '#f9f9f9',
      textColor: '#333333',
      sponsoredTag: true,
      ctaText: 'Learn More',
      ctaUrl: '/marketplace/app/app-007',
      type: 'both'
    },
    {
      id: 'banner-004',
      title: 'Microsoft Teams Integration',
      description: 'Connect your SaaSWorld account with Microsoft Teams for seamless collaboration.',
      imageUrl: '/assets/images/integrations/microsoft.svg',
      backgroundColor: '#E6F2FF',
      textColor: '#333333',
      sponsoredTag: true,
      ctaText: 'Connect Now',
      ctaUrl: '/marketplace/app/app-012',
      type: 'both'
    },
    {
      id: 'banner-005',
      title: 'Boost Productivity with Asana',
      description: 'Organize, track, and manage your team\'s work with the leading project management tool.',
      imageUrl: '/assets/images/integrations/asana.svg',
      backgroundColor: '#FFF3F0',
      textColor: '#333333',
      sponsoredTag: true,
      ctaText: 'Get Started',
      ctaUrl: '/marketplace/app/app-002',
      type: 'both'
    }
  ];
  
  // Filter out dismissed banners and select one based on position
  const availableBanners = mockBanners.filter(b => !dismissedIds.includes(b.id));
  
  if (availableBanners.length === 0) return;
  
  // Simple selection logic based on position
  // In a real app, this would consider more factors like user preferences, targeting rules, etc.
  switch(props.position) {
    case 'top':
      banner.value = availableBanners.find(b => b.type === 'both' || b.type === 'image') || availableBanners[0];
      break;
    case 'middle':
      banner.value = availableBanners.find(b => b.sponsoredTag) || availableBanners[0];
      break;
    case 'sidebar':
      banner.value = availableBanners.find(b => b.type === 'text' || b.type === 'both') || availableBanners[0];
      break;
    default:
      banner.value = availableBanners[0];
  }
};

const handleBannerClick = () => {
  // In a real app, you'd track this click and then navigate
  if (banner.value) {
    // Track banner click
    console.log('Banner clicked:', banner.value.id);
    
    // Navigate to the target URL
    window.location.href = banner.value.ctaUrl;
  }
};

const closeBanner = () => {
  if (!banner.value) return;
  
  // Store the dismissed banner ID in localStorage
  const dismissedBanners = localStorage.getItem('dismissed-banners');
  let dismissedIds = dismissedBanners ? JSON.parse(dismissedBanners) : [];
  
  dismissedIds.push(banner.value.id);
  localStorage.setItem('dismissed-banners', JSON.stringify(dismissedIds));
  
  // Remove the banner from view
  banner.value = null;
};

// Handle image loading errors
const handleImageError = () => {
  console.log('Banner image failed to load:', banner.value?.imageUrl);
  imageError.value = true;
  
  if (banner.value) {
    // Try to find a matching integration SVG
    const bannerNameLower = banner.value.title.toLowerCase();
    
    // Check if there's a matching integration icon available
    const integrationIcons = [
      'salesforce', 'slack', 'google', 'microsoft', 'zoom', 'dropbox', 'github', 
      'asana', 'zapier', 'trello', 'jira', 'hubspot', 'mailchimp', 'stripe', 
      'zendesk', 'aws', 'docusign', 'quickbooks', 'linkedin'
    ];
    
    // Try to match banner title to available icons
    for (const icon of integrationIcons) {
      if (bannerNameLower.includes(icon)) {
        banner.value.imageUrl = `/assets/images/integrations/${icon}.svg`;
        // Reset the error state to allow the new image to render
        imageError.value = false;
        return;
      }
    }
    
    // If we couldn't find a matching icon, we'll use a generic one
    // or leave it as text-only (which is handled by the template)
    if (bannerNameLower.includes('crm')) {
      banner.value.imageUrl = `/assets/images/integrations/salesforce.svg`;
      imageError.value = false;
    } else if (bannerNameLower.includes('payment')) {
      banner.value.imageUrl = `/assets/images/integrations/stripe.svg`;
      imageError.value = false;
    } else if (bannerNameLower.includes('communication') || bannerNameLower.includes('meeting')) {
      banner.value.imageUrl = `/assets/images/integrations/zoom.svg`;
      imageError.value = false;
    } else if (bannerNameLower.includes('document') || bannerNameLower.includes('sign')) {
      banner.value.imageUrl = `/assets/images/integrations/docusign.svg`;
      imageError.value = false;
    } else {
      // Use a generic integration icon as last resort
      banner.value.imageUrl = `/assets/images/integrations/integration-support.svg`;
      imageError.value = false;
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchBanner();
});
</script>

<style scoped>
.ad-banner {
  margin: var(--spacing-xl) 0;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--color-gray-200);
  position: relative;
}

.ad-banner:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-primary-light);
}

.ad-banner-top {
  margin-bottom: var(--spacing-xl);
  margin-top: 0;
}

.ad-banner-middle {
  margin: var(--spacing-xxl) 0;
}

.ad-banner-sidebar {
  margin: 0;
  height: 100%;
}

.banner-wrapper {
  position: relative;
  display: flex;
  background-color: var(--color-gray-100);
  min-height: 160px;
  height: 100%;
  gap: var(--spacing-lg);
}

.banner-image-container {
  width: 35%;
  min-width: 150px;
  max-width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: var(--spacing-xl);
  background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.5) 100%);
  border-right: 1px solid var(--color-gray-200);
}

.banner-image {
  width: 100%;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.ad-banner:hover .banner-image {
  transform: scale(1.08);
}

.banner-content {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.ad-banner-top .banner-content,
.ad-banner-middle .banner-content {
  position: relative; /* Changed from absolute for better layout */
}

.ad-banner-sidebar .banner-content {
  padding: var(--spacing-md);
}

.banner-content.full-width {
  width: 100%;
}

.sponsored-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--color-gray-700);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-sm);
  width: fit-content;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sponsored-icon {
  margin-right: 0.1rem;
}

.banner-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-dark);
  line-height: 1.3;
}

.banner-description {
  margin-bottom: var(--spacing-lg);
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-gray-700);
  max-width: 90%;
}

.banner-cta {
  margin-top: auto;
}

.btn {
  font-size: 0.95rem;
  padding: 0.5rem 1.2rem;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  border: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.banner-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-close:hover {
  background-color: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

/* Image-only banner */
.ad-banner .banner-wrapper[style*="background-color"] {
  min-height: 140px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .banner-wrapper {
    flex-direction: column;
    min-height: auto;
  }
  
  .banner-image-container {
    width: 100%;
    max-width: 100%;
    min-height: 140px;
    padding: var(--spacing-lg);
    border-right: none;
    border-bottom: 1px solid var(--color-gray-200);
  }
  
  .banner-title {
    font-size: 1.2rem;
  }
  
  .banner-description {
    font-size: 0.85rem;
    max-width: 100%;
  }
  
  .ad-banner-top .banner-content,
  .ad-banner-middle .banner-content {
    padding: var(--spacing-lg);
  }
  
  .banner-close {
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .banner-content {
    padding: var(--spacing-md);
  }
  
  .banner-image-container {
    min-height: 120px;
    padding: var(--spacing-md);
  }
  
  .banner-title {
    font-size: 1.1rem;
  }
}
</style>
