<!-- Footer component for SaaSWorld -->
<template>
  <footer class="footer">
    <div class="container">
      <!-- Top grid: brand + link columns -->
      <div class="footer-top">
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo">
            <SaasworldLogo class="logo-icon" />
            <span>SaaS<span class="logo-accent">World</span></span>
          </NuxtLink>
          <p class="brand-description">
            The global software marketplace — compare, shortlist and deploy SaaS tools built for every team.
          </p>

          <!-- Newsletter -->
          <form class="newsletter" @submit.prevent>
            <label for="footer-email" class="newsletter-label">Get the weekly SaaS brief</label>
            <div class="newsletter-field">
              <input id="footer-email" type="email" placeholder="you@company.com" class="newsletter-input" />
              <button type="submit" class="newsletter-submit" aria-label="Subscribe">
                <UIcon dynamic name="i-heroicons-arrow-right" />
              </button>
            </div>
            <p class="newsletter-note">One short email on Fridays. Unsubscribe anytime.</p>
          </form>

          <div class="social-links">
            <a href="#" aria-label="Twitter"><UIcon dynamic name="i-simple-icons-twitter" /></a>
            <a href="#" aria-label="LinkedIn"><UIcon dynamic name="i-simple-icons-linkedin" /></a>
            <a href="#" aria-label="Facebook"><UIcon dynamic name="i-simple-icons-facebook" /></a>
            <a href="#" aria-label="Instagram"><UIcon dynamic name="i-simple-icons-instagram" /></a>
            <a href="#" aria-label="YouTube"><UIcon dynamic name="i-simple-icons-youtube" /></a>
          </div>
        </div>

        <div class="footer-links">
          <div class="footer-links-column">
            <h3>Product</h3>
            <ul>
              <li><NuxtLink to="/marketplace">Marketplace</NuxtLink></li>
              <li><NuxtLink to="/features">Features</NuxtLink></li>
              <li><NuxtLink to="/integrations">Integrations</NuxtLink></li>
              <li><NuxtLink to="/changelog">Changelog</NuxtLink></li>
              <li><NuxtLink to="/roadmap">Roadmap</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h3>Vendors</h3>
            <ul>
              <li><NuxtLink to="/list-product">List your product</NuxtLink></li>
              <li><NuxtLink to="/pricing">Pricing</NuxtLink></li>
              <li><NuxtLink to="/partners">Partner program</NuxtLink></li>
              <li><NuxtLink to="/ads">Advertise</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h3>Resources</h3>
            <ul>
              <li><NuxtLink to="/blog">Blog</NuxtLink></li>
              <li><NuxtLink to="/documentation">Documentation</NuxtLink></li>
              <li><NuxtLink to="/guides">Guides</NuxtLink></li>
              <li><NuxtLink to="/help">Help center</NuxtLink></li>
              <li><NuxtLink to="/community">Community</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h3>Company</h3>
            <ul>
              <li><NuxtLink to="/about">About</NuxtLink></li>
              <li><NuxtLink to="/careers">Careers <span class="pill-soft">We're hiring</span></NuxtLink></li>
              <li><NuxtLink to="/contact">Contact</NuxtLink></li>
              <li><NuxtLink to="/press">Press</NuxtLink></li>
              <li>
                <NuxtLink to="/status" class="status-link">
                  <span class="status-dot" aria-hidden="true"></span>
                  All systems normal
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- SEO categories (hidden visually, crawlable) -->
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
                <NuxtLink :to="`/marketplace/category/${category.id}`">{{ category.name }}</NuxtLink>
              </h4>
              <span class="category-count">{{ getTotalToolsCount(category) }} tools</span>
            </div>
            <ul class="category-links">
              <li v-for="(subcategory, index) in getTopSubcategories(category)" :key="index">
                <NuxtLink :to="subcategory.path">{{ subcategory.name }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <p class="copyright">&copy; {{ new Date().getFullYear() }} SaaSWorld, Inc. All rights reserved.</p>
          <nav class="legal-links" aria-label="Legal">
            <NuxtLink to="/terms">Terms</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/privacy">Privacy</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/cookies">Cookies</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/licenses">Licenses</NuxtLink>
          </nav>
        </div>
        <div class="footer-bottom-right">
          <div class="language-selector">
            <UIcon dynamic name="i-heroicons-globe-alt" class="globe-icon" />
            <select v-model="currentLanguage" aria-label="Language">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
            <UIcon dynamic name="i-heroicons-chevron-down" class="select-chevron" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
</script>

<style scoped>
/* ───────────────────────────────────────────────────────────
   SaaSWorld Footer — light, theme-aligned
   ─────────────────────────────────────────────────────────── */
.footer {
  background-color: #FAFAF9;
  color: var(--sw-text-muted);
  padding: 72px 0 28px;
  border-top: 1px solid #E7E5E4;
  font-family: var(--font-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Top grid: brand + 4 link columns ───────────────────── */
.footer-top {
  display: grid;
  grid-template-columns: 1.4fr repeat(4, 1fr);
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid #E7E5E4;
}

/* Brand column */
.footer-brand { min-width: 0; }

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--sw-text);
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 14px;
}
.logo-icon { width: 32px; height: 32px; flex-shrink: 0; }
.logo-accent { color: var(--sw-primary); }

.brand-description {
  color: var(--sw-text-muted);
  font-size: 0.9375rem;
  line-height: 1.55;
  margin: 0 0 24px;
  max-width: 340px;
}

/* Newsletter */
.newsletter {
  margin-bottom: 24px;
  max-width: 340px;
}
.newsletter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--sw-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.newsletter-field {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #D6D3D1;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.newsletter-field:focus-within {
  border-color: var(--sw-primary);
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.12);
}
.newsletter-input {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 10px 12px;
  font-size: 0.875rem;
  font-family: var(--font-primary);
  color: var(--sw-text);
  outline: none;
  min-width: 0;
}
.newsletter-input::placeholder { color: var(--sw-text-subtle); }
.newsletter-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  background: var(--sw-primary);
  color: #fff;
  border: 0;
  cursor: pointer;
  transition: background 0.15s ease;
}
.newsletter-submit:hover { background: var(--sw-primary-hover); }
.newsletter-submit :deep(.nuxt-icon),
.newsletter-submit svg { width: 16px; height: 16px; }
.newsletter-note {
  margin: 8px 0 0;
  font-size: 0.75rem;
  color: var(--sw-text-subtle);
}

/* Social */
.social-links {
  display: flex;
  gap: 8px;
}
.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #fff;
  border: 1px solid #E7E5E4;
  border-radius: 6px;
  color: var(--sw-text-muted);
  text-decoration: none;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}
.social-links a:hover {
  color: var(--sw-primary);
  border-color: var(--sw-primary);
  transform: translateY(-1px);
}
.social-links :deep(.nuxt-icon),
.social-links svg { width: 16px; height: 16px; }

/* ── Link columns ──────────────────────────────────────── */
.footer-links {
  display: contents; /* let the outer grid position each column */
}

.footer-links-column h3 {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--sw-text);
  margin: 4px 0 16px;
}
.footer-links-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer-links-column li { margin-bottom: 10px; }
.footer-links-column a {
  color: var(--sw-text-muted);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.footer-links-column a:hover { color: var(--sw-primary); }

/* Soft "we're hiring" pill */
.pill-soft {
  display: inline-block;
  padding: 1px 7px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #047857;
  background: #D1FAE5;
  border-radius: 4px;
  line-height: 1.4;
}

/* Status row */
.status-link {
  display: inline-flex !important;
  align-items: center;
  gap: 8px !important;
}
.status-dot {
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  flex-shrink: 0;
}

/* ── SEO hidden categories ─────────────────────────────── */
.seo-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* ── Bottom bar ────────────────────────────────────────── */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 24px;
  flex-wrap: wrap;
}
.footer-bottom-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.copyright {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--sw-text-subtle);
}
.legal-links {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8125rem;
}
.legal-links a {
  color: var(--sw-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}
.legal-links a:hover { color: var(--sw-primary); }
.legal-dot { color: var(--sw-text-subtle); opacity: 0.5; }

/* Language selector */
.language-selector {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #E7E5E4;
  border-radius: 6px;
  padding: 6px 10px 6px 12px;
  position: relative;
  transition: border-color 0.15s ease;
}
.language-selector:hover { border-color: #D6D3D1; }
.globe-icon {
  width: 14px;
  height: 14px;
  color: var(--sw-text-subtle);
}
.language-selector select {
  background: transparent;
  color: var(--sw-text);
  border: 0;
  cursor: pointer;
  font-family: var(--font-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0 18px 0 0;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}
.select-chevron {
  position: absolute;
  right: 10px;
  width: 12px;
  height: 12px;
  color: var(--sw-text-subtle);
  pointer-events: none;
}

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 1024px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }
  .footer-brand { grid-column: 1 / -1; }
  .footer-links { display: contents; }
}

@media (max-width: 640px) {
  .footer { padding: 48px 0 24px; }
  .footer-top {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-bottom: 32px;
  }
  .footer-brand { grid-column: auto; }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .footer-bottom-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
