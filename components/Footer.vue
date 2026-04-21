<!-- Footer component for SaaSWorld -->
<template>
  <footer class="footer">
    <div class="container">
      <!-- Footer Top Section -->
      <div class="footer-top">
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo">
            <SaasworldLogo class="logo-icon" />
            <span>SaaSWorld</span>
          </NuxtLink>
          <p class="brand-description">
            Unlock the full potential of your business with our powerful SaaS platform. Streamline workflows, increase productivity, and drive growth.
          </p>
          <div class="social-links">
            <a href="#" aria-label="Follow us on Twitter">
              <UIcon dynamic name="i-simple-icons-twitter" />
            </a>
            <a href="#" aria-label="Follow us on Facebook">
              <UIcon dynamic name="i-simple-icons-facebook" />
            </a>
            <a href="#" aria-label="Follow us on LinkedIn">
              <UIcon dynamic name="i-simple-icons-linkedin" />
            </a>
            <a href="#" aria-label="Follow us on Instagram">
              <UIcon dynamic name="i-simple-icons-instagram" />
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="footer-links-column">
            <h3>Product</h3>
            <ul>
              <li><NuxtLink to="/features">Features</NuxtLink></li>
              <li><NuxtLink to="/integrations">Integrations</NuxtLink></li>
              <li><NuxtLink to="/changelog">Changelog</NuxtLink></li>
              <li><NuxtLink to="/roadmap">Roadmap</NuxtLink></li>
            </ul>
          </div>
          
          <div class="footer-links-column">
            <h3>Resources</h3>
            <ul>
              <li><NuxtLink to="/blog">Blog</NuxtLink></li>
              <li><NuxtLink to="/documentation">Documentation</NuxtLink></li>
              <li><NuxtLink to="/guides">Guides</NuxtLink></li>
              <li><NuxtLink to="/help">Help Center</NuxtLink></li>
              <li><NuxtLink to="/community">Community</NuxtLink></li>
            </ul>
          </div>
          
          <div class="footer-links-column">
            <h3>Company</h3>
            <ul>
              <li><NuxtLink to="/about">About</NuxtLink></li>
              <li><NuxtLink to="/careers">Careers</NuxtLink></li>
              <li><NuxtLink to="/contact">Contact</NuxtLink></li>
              <li><NuxtLink to="/partners">Partners</NuxtLink></li>
              <li><NuxtLink to="/press">Press</NuxtLink></li>
              <li><NuxtLink to="/status" class="status-link">
                Status
              </NuxtLink></li>
            </ul>
          </div>
          
          <div class="footer-links-column">
            <h3>Legal</h3>
            <ul>
              <li><NuxtLink to="/terms">Terms</NuxtLink></li>
              <li><NuxtLink to="/privacy">Privacy</NuxtLink></li>
              <li><NuxtLink to="/cookies">Cookies</NuxtLink></li>
              <li><NuxtLink to="/licenses">Licenses</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Categories Section for SEO - Hidden from UI but crawlable -->
      <div class="footer-categories seo-hidden">
        <div class="footer-categories-header">
          <h3>Browse by Category</h3>
          <p>Discover thousands of applications across all business categories</p>
        </div>
        
        <div class="categories-grid">
          <div v-for="category in footerCategories" :key="category.id" class="category-section">
            <div class="category-header">
              <UIcon dynamic :name="category.icon" class="category-icon" />
              <h4>
                <NuxtLink :to="`/marketplace/category/${category.id}`" class="category-title-link">
                  {{ category.name }}
                </NuxtLink>
              </h4>
              <span class="category-count">{{ getTotalToolsCount(category) }} tools</span>
            </div>
            
            <ul class="category-links">
              <li v-for="(subcategory, index) in getTopSubcategories(category)" :key="index">
                <NuxtLink :to="subcategory.path" class="subcategory-link">
                  {{ subcategory.name }}
                </NuxtLink>
              </li>
            </ul>
            
            <div class="category-footer" v-if="getRemainingCount(category) > 0">
              <NuxtLink :to="`/marketplace/category/${category.id}`" class="view-all-link">
                View all {{ getTotalToolsCount(category) }} tools
                <UIcon name="i-heroicons-arrow-right" class="arrow-icon" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer Bottom Section -->
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} SaaSWorld. All rights reserved.</p>
        <div class="footer-right">
          <div class="language-selector">
            <UIcon dynamic name="i-heroicons-globe-alt" class="globe-icon" />
            <select v-model="currentLanguage">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Subcategory {
  name: string;
  path: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  columns: Subcategory[][];
}

const currentLanguage = ref('en');

// Comprehensive categories data for SEO
const footerCategories = ref<Category[]>([
  {
    id: 'work-productivity',
    name: 'Work & Productivity',
    icon: 'i-heroicons-clipboard-document-check',
    columns: [
      [
        { name: 'AI Notetakers', path: '/marketplace/category/ai-notetakers' },
        { name: 'Calendar Apps', path: '/marketplace/category/calendars' },
        { name: 'Project Management', path: '/marketplace/category/project-management' },
        { name: 'Team Collaboration', path: '/marketplace/category/team-collaboration' },
        { name: 'Time Tracking Apps', path: '/marketplace/category/time-tracking' },
        { name: 'Task Management', path: '/marketplace/category/task-management' },
        { name: 'Meeting Software', path: '/marketplace/category/meetings' },
        { name: 'File Storage & Sharing', path: '/marketplace/category/file-storage' }
      ]
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    icon: 'i-heroicons-megaphone',
    columns: [
      [
        { name: 'CRM Software', path: '/marketplace/category/crm' },
        { name: 'Email Marketing', path: '/marketplace/category/email-marketing' },
        { name: 'Marketing Automation', path: '/marketplace/category/marketing-automation' },
        { name: 'Social Media Management', path: '/marketplace/category/social-media-management' },
        { name: 'Lead Generation Software', path: '/marketplace/category/lead-generation' },
        { name: 'SEO Tools', path: '/marketplace/category/best-seo-tools' },
        { name: 'Content Marketing', path: '/marketplace/category/content-marketing' },
        { name: 'Sales Enablement', path: '/marketplace/category/sales-enablement' }
      ]
    ]
  },
  {
    id: 'engineering-development',
    name: 'Engineering & Development',
    icon: 'i-heroicons-wrench-screwdriver',
    columns: [
      [
        { name: 'AI Coding Assistants', path: '/marketplace/category/ai-coding' },
        { name: 'Code Editors', path: '/marketplace/category/code-editors' },
        { name: 'DevOps Tools', path: '/marketplace/category/devops-tools' },
        { name: 'Testing & QA Software', path: '/marketplace/category/testing-and-qa' },
        { name: 'Databases & Backend', path: '/marketplace/category/databases-and-backend' },
        { name: 'API Management', path: '/marketplace/category/api-management' },
        { name: 'No-Code Platforms', path: '/marketplace/category/no-code-platforms' },
        { name: 'Web Hosting Services', path: '/marketplace/category/web-hosting' }
      ]
    ]
  },
  {
    id: 'design',
    name: 'Design & Creative',
    icon: 'i-heroicons-pencil-square',
    columns: [
      [
        { name: 'UI/UX Design Tools', path: '/marketplace/category/ui-ux-design' },
        { name: 'Graphic Design', path: '/marketplace/category/graphic-design' },
        { name: 'Video Editing', path: '/marketplace/category/video-editing' },
        { name: 'Photo Editing', path: '/marketplace/category/photo-editing' },
        { name: 'Prototyping Tools', path: '/marketplace/category/prototyping' },
        { name: 'Icon Libraries', path: '/marketplace/category/icons' },
        { name: 'Wireframing', path: '/marketplace/category/wireframing' },
        { name: 'Design System Tools', path: '/marketplace/category/design-systems' }
      ]
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'i-heroicons-currency-dollar',
    columns: [
      [
        { name: 'Accounting Software', path: '/marketplace/category/accounting' },
        { name: 'Budgeting Apps', path: '/marketplace/category/budgeting-and-expense-tracking' },
        { name: 'Invoicing Tools', path: '/marketplace/category/invoicing-tools' },
        { name: 'Payment Processors', path: '/marketplace/category/payment-processors' },
        { name: 'Financial Planning', path: '/marketplace/category/financial-planning' },
        { name: 'Expense Management', path: '/marketplace/category/expense-management' },
        { name: 'Payroll Software', path: '/marketplace/category/payroll' },
        { name: 'Tax Preparation', path: '/marketplace/category/tax-preparation' }
      ]
    ]
  },
  {
    id: 'ai',
    name: 'AI',
    icon: 'i-heroicons-cpu-chip',
    columns: [
      [
        { name: 'AI Writing Tools', path: '/marketplace/category/ai-writing' },
        { name: 'AI Image Generators', path: '/marketplace/category/ai-image-generators' },
        { name: 'Machine Learning', path: '/marketplace/category/machine-learning' },
        { name: 'Natural Language Processing', path: '/marketplace/category/nlp' },
        { name: 'AI Automation', path: '/marketplace/category/ai-automation' },
        { name: 'Speech Recognition', path: '/marketplace/category/speech-recognition' },
        { name: 'Computer Vision', path: '/marketplace/category/computer-vision' },
        { name: 'AI Model Management', path: '/marketplace/category/ai-model-management' }
      ]
    ]
  },
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    icon: 'i-heroicons-heart',
    columns: [
      [
        { name: 'Activity Tracking', path: '/marketplace/category/activity-tracking' },
        { name: 'Fitness Apps', path: '/marketplace/category/fitness-apps' },
        { name: 'Mental Health Apps', path: '/marketplace/category/mental-health' },
        { name: 'Nutrition Apps', path: '/marketplace/category/nutrition' },
        { name: 'Meditation Apps', path: '/marketplace/category/meditation' },
        { name: 'Health Insurance', path: '/marketplace/category/health-insurance' },
        { name: 'Telemedicine', path: '/marketplace/category/telemedicine' },
        { name: 'Medical Practice', path: '/marketplace/category/medical-practice' }
      ]
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: 'i-heroicons-shopping-cart',
    columns: [
      [
        { name: 'E-commerce Platforms', path: '/marketplace/category/ecommerce-platforms' },
        { name: 'Shopify Apps', path: '/marketplace/category/shopify-apps' },
        { name: 'Marketplace Sites', path: '/marketplace/category/marketplace' },
        { name: 'Point of Sale Systems', path: '/marketplace/category/pos-systems' },
        { name: 'Inventory Management', path: '/marketplace/category/inventory-management' },
        { name: 'Shipping Software', path: '/marketplace/category/shipping' },
        { name: 'Customer Reviews', path: '/marketplace/category/customer-reviews' },
        { name: 'Dropshipping Tools', path: '/marketplace/category/dropshipping' }
      ]
    ]
  },
  {
    id: 'education-learning',
    name: 'Education & Learning',
    icon: 'i-heroicons-academic-cap',
    columns: [
      [
        { name: 'Online Learning Platforms', path: '/marketplace/category/online-learning-platforms' },
        { name: 'Learning Management Systems', path: '/marketplace/category/lms' },
        { name: 'Course Creation Tools', path: '/marketplace/category/course-creation' },
        { name: 'Language Learning', path: '/marketplace/category/language-learning' },
        { name: 'Student Information Systems', path: '/marketplace/category/student-information' },
        { name: 'Educational Games', path: '/marketplace/category/educational-games' },
        { name: 'Virtual Classroom', path: '/marketplace/category/virtual-classroom' },
        { name: 'Academic Writing', path: '/marketplace/category/academic-writing' }
      ]
    ]
  },
  {
    id: 'social-community',
    name: 'Social & Community',
    icon: 'i-heroicons-chat-bubble-left-right',
    columns: [
      [
        { name: 'Social Networking', path: '/marketplace/category/social-networking' },
        { name: 'Community Management', path: '/marketplace/category/community-management' },
        { name: 'Messaging Apps', path: '/marketplace/category/messaging-apps' },
        { name: 'Video Conferencing', path: '/marketplace/category/video-conferencing' },
        { name: 'Event Management', path: '/marketplace/category/events' },
        { name: 'Forum Software', path: '/marketplace/category/forums' },
        { name: 'Social Media Scheduling', path: '/marketplace/category/social-media-scheduling' },
        { name: 'Newsletter Platforms', path: '/marketplace/category/newsletter-platforms' }
      ]
    ]
  },
  {
    id: 'platforms',
    name: 'Platforms',
    icon: 'i-heroicons-building-office',
    columns: [
      [
        { name: 'Cloud Computing Platforms', path: '/marketplace/category/cloud-computing-platforms' },
        { name: 'Integration Platforms', path: '/marketplace/category/integration-platforms' },
        { name: 'Workflow Platforms', path: '/marketplace/category/workflow-platforms' },
        { name: 'Communication Platforms', path: '/marketplace/category/communication-platforms' },
        { name: 'Analytics Platforms', path: '/marketplace/category/analytics-platforms' },
        { name: 'Security Platforms', path: '/marketplace/category/security-platforms' },
        { name: 'Data Platforms', path: '/marketplace/category/data-platforms' },
        { name: 'Mobile Platforms', path: '/marketplace/category/mobile-platforms' }
      ]
    ]
  }
]);

// Helper functions
const getTotalToolsCount = (category: Category): number => {
  return category.columns.flat().length;
};

const getTopSubcategories = (category: Category): Subcategory[] => {
  const allSubcategories = category.columns.flat();
  return allSubcategories.slice(0, 8); // Show top 8 subcategories
};

const getRemainingCount = (category: Category): number => {
  const total = getTotalToolsCount(category);
  const showing = Math.min(8, total);
  return total - showing;
};
</script>

<style scoped>
.footer {
  background-color: var(--dark-color);
  color: var(--light-color);
  padding: var(--spacing-xl) 0;
}

.footer-top {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: var(--spacing-xl);
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  color: var(--light-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  text-decoration: none;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  margin-right: var(--spacing-xs);
}

.brand-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  color: var(--light-color);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.social-links a:hover {
  background-color: var(--primary-color);
  transform: translateY(-3px);
}

.social-links svg {
  width: 18px;
  height: 18px;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-top: 1rem;
}

.footer-links-column h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--light-color);
  padding-bottom: 10px;
  position: relative;
}

.footer-links-column h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 30px;
  background-color: var(--primary-color);
}

.footer-links-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links-column li {
  margin-bottom: var(--spacing-sm);
  position: relative;
}

.footer-links-column a {
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  text-decoration: none;
  display: inline-block;
  padding: 3px 0;
}

.footer-links-column a:hover {
  color: var(--light-color);
}

.status-link {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  color: #10B981;
  font-size: 0.875rem;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-input);
  padding: 6px 12px;
}

.globe-icon {
  color: var(--text-secondary);
}

.language-selector select {
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  padding-right: 12px;
  appearance: none;
  outline: none;
}

/* SEO Hidden Section - Hidden from UI but crawlable by search engines */
.seo-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Alternative approach using visibility (uncomment if preferred) */
/*
.seo-hidden {
  visibility: hidden;
  height: 0;
  overflow: hidden;
  position: relative;
}
*/

/* Footer Categories Styles - Compact Design */
.footer-categories {
  padding: var(--spacing-lg) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: var(--spacing-lg) 0;
}

.footer-categories-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.footer-categories-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--light-color);
  margin-bottom: var(--spacing-xs);
}

.footer-categories-header p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  max-width: 500px;
  margin: 0 auto;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.category-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  min-height: 50px;
}

.category-section:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
  min-width: 200px;
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.category-icon {
  font-size: 1rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.category-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.category-title-link {
  color: var(--light-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.category-title-link:hover {
  color: var(--primary-color);
}

.category-count {
  font-size: 0.7rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
  margin-left: var(--spacing-xs);
}

.category-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  flex: 1;
  align-items: center;
}

.category-links li {
  margin: 0;
}

.subcategory-link {
  display: inline-block;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  position: relative;
}

.subcategory-link::after {
  content: '•';
  color: rgba(255, 255, 255, 0.3);
  margin-left: var(--spacing-sm);
  font-size: 0.6rem;
}

.category-links li:last-child .subcategory-link::after {
  display: none;
}

.subcategory-link:hover {
  color: var(--light-color);
  background: rgba(255, 255, 255, 0.05);
}

.category-footer {
  flex-shrink: 0;
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.view-all-link:hover {
  color: var(--light-color);
  background: rgba(255, 255, 255, 0.05);
}

.arrow-icon {
  font-size: 0.7rem;
  transition: transform 0.2s ease;
}

.view-all-link:hover .arrow-icon {
  transform: translateX(2px);
}

@media (max-width: 992px) {
  .footer-top {
    grid-template-columns: 1fr;
  }
  
  .footer-brand {
    max-width: 100%;
    margin-bottom: var(--spacing-xl);
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer-categories {
    padding: var(--spacing-md) 0;
  }
  
  .footer-categories-header h3 {
    font-size: 1.125rem;
  }
  
  .category-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    min-height: auto;
    padding: var(--spacing-sm);
  }
  
  .category-header {
    min-width: auto;
  }
  
  .category-links {
    width: 100%;
  }
  
  .category-footer {
    align-self: flex-end;
  }
}

@media (max-width: 576px) {
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .footer-links-column {
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .footer-links-column:last-child {
    border-bottom: none;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .footer-categories {
    padding: var(--spacing-sm) 0;
  }
  
  .footer-categories-header h3 {
    font-size: 1rem;
  }
  
  .footer-categories-header p {
    font-size: 0.8rem;
  }
  
  .category-section {
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: var(--spacing-xs);
  }
  
  .category-header {
    gap: var(--spacing-xs);
  }
  
  .category-header h4 {
    font-size: 0.85rem;
  }
  
  .category-count {
    font-size: 0.65rem;
    padding: 1px 4px;
  }
  
  .subcategory-link {
    font-size: 0.75rem;
    padding: 2px 6px;
  }
  
  .view-all-link {
    font-size: 0.7rem;
    padding: 2px 6px;
  }
  
  .category-links {
    gap: 4px;
  }
}
</style>
