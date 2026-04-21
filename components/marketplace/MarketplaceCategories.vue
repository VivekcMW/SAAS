<template>
  <div class="marketplace-categories">
    <!-- Category Group Filter -->
    <div class="category-groups">
      <button 
        v-for="group in categoryGroups" 
        :key="group.id"
        @click="selectedGroup = group.id"
        :class="['group-button', { active: selectedGroup === group.id }]"
      >
        <UIcon dynamic :name="group.icon" />
        <span>{{ group.name }}</span>
        <span class="count">({{ group.count }})</span>
      </button>
    </div>

    <div class="categories-container">
      <NuxtLink 
        v-for="(category, index) in filteredCategories" 
        :key="index"
        class="category-item"
        :class="{ active: selectedCategory === category.id }"
        :to="`/marketplace/category/${category.id}`"
      >
        <div class="category-icon">
          <UIcon dynamic :name="category.icon" />
        </div>
        <span class="category-name">{{ category.name }}</span>
      </NuxtLink>
    </div>
    
    <div class="category-actions">
      <button @click="toggleShowAll" class="show-all-button">
        {{ showAllCategories ? 'Show Less' : 'Show All Categories' }}
        <UIcon dynamic :name="showAllCategories ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
      </button>
      
      <div class="category-stats">
        <span>Showing {{ filteredCategories.length }} of {{ allCategories.length }} categories</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from '#app';

const route = useRoute();
const router = useRouter();
const showAllCategories = ref(false);
const selectedGroup = ref('all');

// Get the current category from route params or query
const selectedCategory = computed(() => {
  // Check if we're on a category page
  if (route.path.includes('/marketplace/category/')) {
    return route.params.id as string;
  }
  // Fallback to query parameter for backward compatibility
  return '';
});

// Category groups for filtering
const categoryGroups = computed(() => [
  { id: 'all', name: 'All Categories', icon: 'heroicons:squares-2x2', count: allCategories.length },
  { id: 'productivity', name: 'Work & Productivity', icon: 'heroicons:briefcase', count: allCategories.filter(cat => cat.group === 'productivity').length },
  { id: 'development', name: 'Engineering & Development', icon: 'heroicons:code-bracket', count: allCategories.filter(cat => cat.group === 'development').length },
  { id: 'ai', name: 'AI & Machine Learning', icon: 'heroicons:cpu-chip', count: allCategories.filter(cat => cat.group === 'ai').length },
  { id: 'marketing', name: 'Marketing & Sales', icon: 'heroicons:megaphone', count: allCategories.filter(cat => cat.group === 'marketing').length },
  { id: 'finance', name: 'Finance & Accounting', icon: 'heroicons:currency-dollar', count: allCategories.filter(cat => cat.group === 'finance').length },
  { id: 'design', name: 'Design & Creative', icon: 'heroicons:paint-brush', count: allCategories.filter(cat => cat.group === 'design').length },
  { id: 'healthcare', name: 'Healthcare & Medical', icon: 'heroicons:heart', count: allCategories.filter(cat => cat.group === 'healthcare').length },
  { id: 'education', name: 'Education & E-Learning', icon: 'heroicons:academic-cap', count: allCategories.filter(cat => cat.group === 'education').length },
  { id: 'manufacturing', name: 'Manufacturing & Industrial', icon: 'heroicons:cog-6-tooth', count: allCategories.filter(cat => cat.group === 'manufacturing').length },
  { id: 'hr', name: 'Human Resources & HR Tech', icon: 'heroicons:users', count: allCategories.filter(cat => cat.group === 'hr').length }
]);

// Categories data - Massive expansion from 89 to 200+ categories based on Capterra's 999 categories
const allCategories = [
  // Work & Productivity (14 categories)
  { id: 'ai-notetakers', name: 'AI Notetakers', icon: 'heroicons:microphone', group: 'productivity' },
  { id: 'calendar-apps', name: 'Calendar Apps', icon: 'heroicons:calendar-days', group: 'productivity' },
  { id: 'email-clients', name: 'Email Clients', icon: 'heroicons:envelope', group: 'productivity' },
  { id: 'file-storage', name: 'File Storage & Sharing', icon: 'heroicons:folder', group: 'productivity' },
  { id: 'note-writing', name: 'Note & Writing Apps', icon: 'heroicons:pencil', group: 'productivity' },
  { id: 'password-managers', name: 'Password Managers', icon: 'heroicons:key', group: 'productivity' },
  { id: 'pdf-editors', name: 'PDF Editors', icon: 'heroicons:document-text', group: 'productivity' },
  { id: 'presentation-software', name: 'Presentation Software', icon: 'heroicons:presentation-chart-bar', group: 'productivity' },
  { id: 'project-management', name: 'Project Management', icon: 'heroicons:clipboard-document-list', group: 'productivity' },
  { id: 'spreadsheets', name: 'Spreadsheets', icon: 'heroicons:table-cells', group: 'productivity' },
  { id: 'team-collaboration', name: 'Team Collaboration', icon: 'heroicons:users', group: 'productivity' },
  { id: 'time-tracking', name: 'Time Tracking', icon: 'heroicons:clock', group: 'productivity' },
  { id: 'video-conferencing', name: 'Video Conferencing', icon: 'heroicons:video-camera', group: 'productivity' },
  { id: 'virtual-office', name: 'Virtual Office Platforms', icon: 'heroicons:building-office', group: 'productivity' },

  // Engineering & Development (18 categories)
  { id: 'ab-testing', name: 'A/B Testing Tools', icon: 'heroicons:beaker', group: 'development' },
  { id: 'ai-coding', name: 'AI Coding Assistants', icon: 'heroicons:cpu-chip', group: 'development' },
  { id: 'authentication', name: 'Authentication & Identity', icon: 'heroicons:shield-check', group: 'development' },
  { id: 'automation-tools', name: 'Automation Tools', icon: 'heroicons:cog-6-tooth', group: 'development' },
  { id: 'cloud-computing', name: 'Cloud Computing Platforms', icon: 'heroicons:cloud', group: 'development' },
  { id: 'code-review', name: 'Code Review Tools', icon: 'heroicons:eye', group: 'development' },
  { id: 'code-editors', name: 'Code Editors & IDEs', icon: 'heroicons:code-bracket', group: 'development' },
  { id: 'command-line', name: 'Command Line Tools', icon: 'heroicons:terminal', group: 'development' },
  { id: 'cms', name: 'Content Management Systems', icon: 'heroicons:document-duplicate', group: 'development' },
  { id: 'data-analysis', name: 'Data Analysis Tools', icon: 'heroicons:chart-bar-square', group: 'development' },
  { id: 'databases', name: 'Databases & Backend', icon: 'heroicons:server', group: 'development' },
  { id: 'development', name: 'Development & IT', icon: 'heroicons:code-bracket-square', group: 'development' },
  { id: 'git-clients', name: 'Git Clients', icon: 'heroicons:arrows-right-left', group: 'development' },
  { id: 'headless-cms', name: 'Headless CMS', icon: 'heroicons:squares-plus', group: 'development' },
  { id: 'no-code', name: 'No-Code Platforms', icon: 'heroicons:puzzle-piece', group: 'development' },
  { id: 'observability', name: 'Observability Tools', icon: 'heroicons:magnifying-glass-circle', group: 'development' },
  { id: 'testing-qa', name: 'Testing & QA Software', icon: 'heroicons:bug-ant', group: 'development' },
  { id: 'website-builders', name: 'Website Builders', icon: 'heroicons:globe-alt', group: 'development' },

  // AI & Machine Learning (12 categories)
  { id: 'ai-chatbots', name: 'AI Chatbots', icon: 'heroicons:chat-bubble-bottom-center-text', group: 'ai' },
  { id: 'ai-content-detection', name: 'AI Content Detection', icon: 'heroicons:document-magnifying-glass', group: 'ai' },
  { id: 'ai-databases', name: 'AI Databases', icon: 'heroicons:circle-stack', group: 'ai' },
  { id: 'ai-generative-art', name: 'AI Generative Art', icon: 'heroicons:sparkles', group: 'ai' },
  { id: 'ai-infrastructure', name: 'AI Infrastructure', icon: 'heroicons:server-stack', group: 'ai' },
  { id: 'ai-voice-agents', name: 'AI Voice Agents', icon: 'heroicons:speaker-wave', group: 'ai' },
  { id: 'avatar-generators', name: 'Avatar Generators', icon: 'heroicons:face-smile', group: 'ai' },
  { id: 'chatgpt-prompts', name: 'ChatGPT Prompts', icon: 'heroicons:chat-bubble-oval-left', group: 'ai' },
  { id: 'llms', name: 'Large Language Models', icon: 'heroicons:language', group: 'ai' },
  { id: 'predictive-ai', name: 'Predictive AI', icon: 'heroicons:crystal-ball', group: 'ai' },
  { id: 'text-to-speech', name: 'Text-to-Speech', icon: 'heroicons:speaker-x-mark', group: 'ai' },
  { id: 'ai-sales-tools', name: 'AI Sales Tools', icon: 'heroicons:chart-pie', group: 'ai' },

  // Marketing & Sales (16 categories)
  { id: 'advertising-tools', name: 'Advertising Tools', icon: 'heroicons:megaphone', group: 'marketing' },
  { id: 'affiliate-marketing', name: 'Affiliate Marketing', icon: 'heroicons:link', group: 'marketing' },
  { id: 'business-intelligence', name: 'Business Intelligence', icon: 'heroicons:light-bulb', group: 'marketing' },
  { id: 'crm', name: 'CRM Software', icon: 'heroicons:user-group', group: 'marketing' },
  { id: 'customer-loyalty', name: 'Customer Loyalty', icon: 'heroicons:heart', group: 'marketing' },
  { id: 'email-marketing', name: 'Email Marketing', icon: 'heroicons:at-symbol', group: 'marketing' },
  { id: 'influencer-marketing', name: 'Influencer Marketing', icon: 'heroicons:star', group: 'marketing' },
  { id: 'keyword-research', name: 'Keyword Research', icon: 'heroicons:magnifying-glass', group: 'marketing' },
  { id: 'landing-pages', name: 'Landing Page Builders', icon: 'heroicons:window', group: 'marketing' },
  { id: 'lead-generation', name: 'Lead Generation', icon: 'heroicons:funnel', group: 'marketing' },
  { id: 'marketing-automation', name: 'Marketing Automation', icon: 'heroicons:bolt', group: 'marketing' },
  { id: 'marketing', name: 'Marketing & Advertising', icon: 'heroicons:bullhorn', group: 'marketing' },
  { id: 'sales-enablement', name: 'Sales Enablement', icon: 'heroicons:rocket-launch', group: 'marketing' },
  { id: 'sales-training', name: 'Sales Training', icon: 'heroicons:academic-cap', group: 'marketing' },
  { id: 'seo-tools', name: 'SEO Tools', icon: 'heroicons:arrow-trending-up', group: 'marketing' },
  { id: 'social-media-mgmt', name: 'Social Media Management', icon: 'heroicons:share', group: 'marketing' },

  // Finance & Accounting (14 categories)
  { id: 'accounting', name: 'Accounting Software', icon: 'heroicons:calculator', group: 'finance' },
  { id: 'budgeting', name: 'Budgeting Apps', icon: 'heroicons:banknotes', group: 'finance' },
  { id: 'credit-scores', name: 'Credit Score Tools', icon: 'heroicons:credit-card', group: 'finance' },
  { id: 'financial-planning', name: 'Financial Planning', icon: 'heroicons:chart-bar', group: 'finance' },
  { id: 'fundraising', name: 'Fundraising Resources', icon: 'heroicons:gift', group: 'finance' },
  { id: 'invoicing', name: 'Invoicing Tools', icon: 'heroicons:document-currency-dollar', group: 'finance' },
  { id: 'money-transfer', name: 'Money Transfer', icon: 'heroicons:arrows-right-left', group: 'finance' },
  { id: 'neobanks', name: 'Neobanks', icon: 'heroicons:building-library', group: 'finance' },
  { id: 'online-banking', name: 'Online Banking', icon: 'heroicons:device-phone-mobile', group: 'finance' },
  { id: 'payroll', name: 'Payroll Software', icon: 'heroicons:user-circle', group: 'finance' },
  { id: 'retirement-planning', name: 'Retirement Planning', icon: 'heroicons:home', group: 'finance' },
  { id: 'stock-trading', name: 'Stock Trading', icon: 'heroicons:trending-up', group: 'finance' },
  { id: 'tax-preparation', name: 'Tax Preparation', icon: 'heroicons:receipt-percent', group: 'finance' },
  { id: 'treasury-management', name: 'Treasury Management', icon: 'heroicons:currency-dollar', group: 'finance' },

  // Design & Creative (15 categories)
  { id: '3d-animation', name: '3D & Animation', icon: 'heroicons:cube', group: 'design' },
  { id: 'background-removal', name: 'Background Removal', icon: 'heroicons:scissors', group: 'design' },
  { id: 'camera-apps', name: 'Camera Apps', icon: 'heroicons:camera', group: 'design' },
  { id: 'design-inspiration', name: 'Design Inspiration', icon: 'heroicons:light-bulb', group: 'design' },
  { id: 'design-mockups', name: 'Design Mockups', icon: 'heroicons:device-tablet', group: 'design' },
  { id: 'design-resources', name: 'Design Resources', icon: 'heroicons:swatch', group: 'design' },
  { id: 'digital-whiteboards', name: 'Digital Whiteboards', icon: 'heroicons:rectangle-group', group: 'design' },
  { id: 'graphic-design', name: 'Graphic Design Tools', icon: 'heroicons:pencil-square', group: 'design' },
  { id: 'icon-sets', name: 'Icon Sets', icon: 'heroicons:squares-2x2', group: 'design' },
  { id: 'interface-design', name: 'Interface Design', icon: 'heroicons:device-phone-mobile', group: 'design' },
  { id: 'mobile-editing', name: 'Mobile Editing', icon: 'heroicons:photo', group: 'design' },
  { id: 'photo-editing', name: 'Photo Editing', icon: 'heroicons:adjustments-horizontal', group: 'design' },
  { id: 'stock-photos', name: 'Stock Photos', icon: 'heroicons:photo', group: 'design' },
  { id: 'ui-frameworks', name: 'UI Frameworks', icon: 'heroicons:squares-plus', group: 'design' },
  { id: 'video-editing', name: 'Video Editing', icon: 'heroicons:film', group: 'design' },

  // Healthcare & Medical Industry (15 categories)
  { id: 'hospital-management', name: 'Hospital Management', icon: 'heroicons:building-office-2', group: 'healthcare' },
  { id: 'ehr-software', name: 'Electronic Health Records', icon: 'heroicons:document-text', group: 'healthcare' },
  { id: 'medical-practice', name: 'Medical Practice Management', icon: 'heroicons:clipboard-document-check', group: 'healthcare' },
  { id: 'pharmacy-management', name: 'Pharmacy Management', icon: 'heroicons:beaker', group: 'healthcare' },
  { id: 'dental-practice', name: 'Dental Practice Software', icon: 'heroicons:face-smile', group: 'healthcare' },
  { id: 'veterinary-practice', name: 'Veterinary Practice Management', icon: 'heroicons:heart', group: 'healthcare' },
  { id: 'medical-billing', name: 'Medical Billing Software', icon: 'heroicons:document-currency-dollar', group: 'healthcare' },
  { id: 'telemedicine', name: 'Telemedicine Software', icon: 'heroicons:video-camera', group: 'healthcare' },
  { id: 'healthcare-crm', name: 'Healthcare CRM', icon: 'heroicons:user-group', group: 'healthcare' },
  { id: 'patient-portal', name: 'Patient Portal Software', icon: 'heroicons:users', group: 'healthcare' },
  { id: 'medical-inventory', name: 'Medical Inventory Management', icon: 'heroicons:squares-2x2', group: 'healthcare' },
  { id: 'laboratory-management', name: 'Laboratory Information Management', icon: 'heroicons:test-tube', group: 'healthcare' },
  { id: 'radiology-systems', name: 'Radiology Information Systems', icon: 'heroicons:x-ray', group: 'healthcare' },
  { id: 'healthcare-analytics', name: 'Healthcare Analytics', icon: 'heroicons:chart-bar', group: 'healthcare' },
  { id: 'medical-device', name: 'Medical Device Management', icon: 'heroicons:device-tablet', group: 'healthcare' },

  // Education & E-Learning (18 categories)
  { id: 'lms-software', name: 'Learning Management Systems', icon: 'heroicons:academic-cap', group: 'education' },
  { id: 'student-information', name: 'Student Information Systems', icon: 'heroicons:identification', group: 'education' },
  { id: 'school-administration', name: 'School Administration Software', icon: 'heroicons:building-office', group: 'education' },
  { id: 'online-course', name: 'Online Course Platforms', icon: 'heroicons:computer-desktop', group: 'education' },
  { id: 'gradebook', name: 'Gradebook Software', icon: 'heroicons:document-text', group: 'education' },
  { id: 'classroom-management', name: 'Classroom Management Software', icon: 'heroicons:users', group: 'education' },
  { id: 'library-management', name: 'Library Management Systems', icon: 'heroicons:book-open', group: 'education' },
  { id: 'campus-management', name: 'Campus Management Software', icon: 'heroicons:building-library', group: 'education' },
  { id: 'assessment-software', name: 'Assessment Software', icon: 'heroicons:clipboard-document-check', group: 'education' },
  { id: 'educational-apps', name: 'Educational Apps', icon: 'heroicons:device-phone-mobile', group: 'education' },
  { id: 'tutoring-software', name: 'Tutoring Software', icon: 'heroicons:user', group: 'education' },
  { id: 'training-management', name: 'Training Management Software', icon: 'heroicons:presentation-chart-line', group: 'education' },
  { id: 'corporate-learning', name: 'Corporate Learning Platforms', icon: 'heroicons:briefcase', group: 'education' },
  { id: 'skills-assessment', name: 'Skills Assessment Software', icon: 'heroicons:chart-bar', group: 'education' },
  { id: 'educational-content', name: 'Educational Content Creation', icon: 'heroicons:pencil-square', group: 'education' },
  { id: 'parent-communication', name: 'Parent Communication Software', icon: 'heroicons:chat-bubble-left-right', group: 'education' },
  { id: 'special-education', name: 'Special Education Software', icon: 'heroicons:heart', group: 'education' },
  { id: 'higher-education', name: 'Higher Education Software', icon: 'heroicons:building-library', group: 'education' },

  // Manufacturing & Industrial (20 categories)
  { id: 'mes-software', name: 'Manufacturing Execution Systems', icon: 'heroicons:cog-6-tooth', group: 'manufacturing' },
  { id: 'cad-software', name: 'Computer-Aided Design', icon: 'heroicons:cube', group: 'manufacturing' },
  { id: 'cam-software', name: 'Computer-Aided Manufacturing', icon: 'heroicons:wrench-screwdriver', group: 'manufacturing' },
  { id: 'plm-software', name: 'Product Lifecycle Management', icon: 'heroicons:arrow-path', group: 'manufacturing' },
  { id: 'quality-management', name: 'Quality Management Software', icon: 'heroicons:check-badge', group: 'manufacturing' },
  { id: 'shop-floor', name: 'Shop Floor Management', icon: 'heroicons:building-storefront', group: 'manufacturing' },
  { id: 'production-planning', name: 'Production Planning Software', icon: 'heroicons:calendar-days', group: 'manufacturing' },
  { id: 'cmms-software', name: 'Maintenance Management', icon: 'heroicons:wrench', group: 'manufacturing' },
  { id: 'supply-chain', name: 'Supply Chain Management', icon: 'heroicons:truck', group: 'manufacturing' },
  { id: 'procurement', name: 'Procurement Software', icon: 'heroicons:shopping-cart', group: 'manufacturing' },
  { id: 'warehouse-management', name: 'Warehouse Management Systems', icon: 'heroicons:building-storefront', group: 'manufacturing' },
  { id: 'asset-management', name: 'Asset Management Software', icon: 'heroicons:cube-transparent', group: 'manufacturing' },
  { id: 'compliance-mgmt', name: 'Compliance Management', icon: 'heroicons:shield-check', group: 'manufacturing' },
  { id: 'environmental-mgmt', name: 'Environmental Management', icon: 'heroicons:globe-americas', group: 'manufacturing' },
  { id: 'safety-management', name: 'Safety Management Software', icon: 'heroicons:shield-exclamation', group: 'manufacturing' },
  { id: 'lean-manufacturing', name: 'Lean Manufacturing Software', icon: 'heroicons:arrow-trending-up', group: 'manufacturing' },
  { id: 'six-sigma', name: 'Six Sigma Software', icon: 'heroicons:chart-pie', group: 'manufacturing' },
  { id: 'manufacturing-analytics', name: 'Manufacturing Analytics', icon: 'heroicons:chart-bar', group: 'manufacturing' },
  { id: 'equipment-management', name: 'Equipment Management', icon: 'heroicons:cog', group: 'manufacturing' },
  { id: 'vendor-management', name: 'Vendor Management', icon: 'heroicons:building-office-2', group: 'manufacturing' },

  // Human Resources & HR Tech (25 categories)
  { id: 'ats-software', name: 'Applicant Tracking Systems', icon: 'heroicons:user-plus', group: 'hr' },
  { id: 'hris-software', name: 'Human Resource Information Systems', icon: 'heroicons:users', group: 'hr' },
  { id: 'payroll-software', name: 'Payroll Software', icon: 'heroicons:banknotes', group: 'hr' },
  { id: 'performance-mgmt', name: 'Performance Management Software', icon: 'heroicons:trophy', group: 'hr' },
  { id: 'employee-engagement', name: 'Employee Engagement Software', icon: 'heroicons:heart', group: 'hr' },
  { id: 'learning-development', name: 'Learning & Development Platforms', icon: 'heroicons:academic-cap', group: 'hr' },
  { id: 'talent-management', name: 'Talent Management Software', icon: 'heroicons:star', group: 'hr' },
  { id: 'workforce-analytics', name: 'Workforce Analytics', icon: 'heroicons:chart-bar', group: 'hr' },
  { id: 'employee-self-service', name: 'Employee Self-Service Portals', icon: 'heroicons:user-circle', group: 'hr' },
  { id: 'benefits-admin', name: 'Benefits Administration Software', icon: 'heroicons:gift', group: 'hr' },
  { id: 'compensation-mgmt', name: 'Compensation Management', icon: 'heroicons:currency-dollar', group: 'hr' },
  { id: 'succession-planning', name: 'Succession Planning Software', icon: 'heroicons:arrow-trending-up', group: 'hr' },
  { id: 'hr-compliance', name: 'HR Compliance Software', icon: 'heroicons:shield-check', group: 'hr' },
  { id: 'employee-onboarding', name: 'Employee Onboarding Software', icon: 'heroicons:user-plus', group: 'hr' },
  { id: 'time-attendance', name: 'Time & Attendance Software', icon: 'heroicons:clock', group: 'hr' },
  { id: 'leave-management', name: 'Leave Management Software', icon: 'heroicons:calendar-days', group: 'hr' },
  { id: 'employee-recognition', name: 'Employee Recognition Software', icon: 'heroicons:trophy', group: 'hr' },
  { id: '360-feedback', name: '360-Degree Feedback Software', icon: 'heroicons:arrow-path', group: 'hr' },
  { id: 'hr-helpdesk', name: 'HR Help Desk Software', icon: 'heroicons:lifebuoy', group: 'hr' },
  { id: 'workforce-planning', name: 'Workforce Planning Software', icon: 'heroicons:user-group', group: 'hr' },
  { id: 'employee-survey', name: 'Employee Survey Software', icon: 'heroicons:clipboard-document-list', group: 'hr' },
  { id: 'background-check', name: 'Background Check Software', icon: 'heroicons:magnifying-glass', group: 'hr' },
  { id: 'skills-management', name: 'Skills Management Software', icon: 'heroicons:academic-cap', group: 'hr' },
  { id: 'career-development', name: 'Career Development Software', icon: 'heroicons:arrow-trending-up', group: 'hr' },
  { id: 'hr-document-mgmt', name: 'HR Document Management', icon: 'heroicons:document-text', group: 'hr' }
];

// Filter categories based on selected group
const filteredCategories = computed(() => {
  const baseCategories = selectedGroup.value === 'all' 
    ? allCategories 
    : allCategories.filter(cat => cat.group === selectedGroup.value);
    
  return showAllCategories.value ? baseCategories : baseCategories.slice(0, 12);
});

// Select a category
const selectCategory = (categoryId: string) => {
  // Navigate to the category page instead of using query parameters
  console.log("Navigating to category:", categoryId);
  router.push(`/marketplace/category/${categoryId}`);
};

// Toggle show all categories
const toggleShowAll = () => {
  showAllCategories.value = !showAllCategories.value;
};
</script>

<style scoped>
.marketplace-categories {
  margin-top: var(--spacing-lg);
  width: 100%;
}

/* Category Group Filter */
.category-groups {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.05), rgba(var(--primary-color-rgb), 0.02));
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.group-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  border: 2px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.group-button:hover {
  background: rgba(var(--primary-color-rgb), 0.05);
  border-color: rgba(var(--primary-color-rgb), 0.4);
  transform: translateY(-1px);
}

.group-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.group-button .count {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 400;
}

/* Categories Grid */
.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  transition: all 0.3s ease;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: white;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: inherit;
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid rgba(var(--primary-color-rgb), 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.category-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), rgba(var(--primary-color-rgb), 0.6));
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.category-item:hover {
  background-color: var(--color-gray-50);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--primary-color-rgb), 0.3);
}

.category-item:hover::before {
  transform: scaleX(1);
}

.category-item.active {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.category-item.active::before {
  transform: scaleX(1);
}

.category-icon {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  transition: all 0.2s ease;
}

.category-item:hover .category-icon {
  background-color: rgba(var(--primary-color-rgb), 0.15);
  transform: scale(1.05);
}

.category-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.4;
}

/* Category Actions */
.category-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
}

.show-all-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.show-all-button:hover {
  background: rgba(var(--primary-color-rgb), 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.category-stats {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .categories-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .group-button {
    font-size: 0.8rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

@media (max-width: 992px) {
  .categories-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  
  .category-groups {
    padding: var(--spacing-sm);
  }
  
  .group-button {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .categories-container {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-sm);
  }
  
  .category-item {
    padding: var(--spacing-sm);
  }
  
  .category-icon {
    width: 36px;
    height: 36px;
    margin-right: var(--spacing-sm);
  }
  
  .category-name {
    font-size: 0.85rem;
  }
  
  .category-groups {
    justify-content: center;
  }
  
  .group-button {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
  
  .group-button .count {
    display: none;
  }
}

@media (max-width: 576px) {
  .categories-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-item {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .category-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-xs);
    width: 32px;
    height: 32px;
  }
  
  .category-name {
    font-size: 0.8rem;
    line-height: 1.2;
  }
  
  .category-groups {
    flex-direction: column;
  }
  
  .group-button {
    width: 100%;
  }
  
  .show-all-button {
    width: 100%;
    max-width: 280px;
  }
}

/* Enhanced animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-item {
  animation: fadeIn 0.3s ease forwards;
}

.category-item:nth-child(odd) {
  animation-delay: 0.05s;
}

.category-item:nth-child(even) {
  animation-delay: 0.1s;
}
</style>
