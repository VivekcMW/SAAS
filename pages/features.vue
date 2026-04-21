<template>
  <div class="features-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <div class="page-hero-content">
          <h1>Powerful Features for Your Business</h1>
          <p>Discover all the tools and features designed to take your business to the next level.</p>
        </div>
      </div>
    </section>

    <!-- Main Features Section -->
    <section class="main-features">
      <div class="container">
        <div class="features-grid">
          <div v-for="(feature, index) in mainFeatures" :key="index" class="feature-card large">
            <div class="feature-content">
              <div class="feature-icon">
                <UIcon dynamic :name="feature.icon" />
              </div>
              <h2>{{ feature.title }}</h2>
              <p>{{ feature.description }}</p>
              <ul class="feature-list">
                <li v-for="(item, idx) in feature.items" :key="idx">
                  <UIcon dynamic name="i-heroicons-check" class="check-icon" />
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="feature-image">
              <img :src="feature.image" :alt="feature.title">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- All Features Grid -->
    <section class="all-features">
      <div class="container">
        <div class="section-header centered">
          <h2>All Features</h2>
          <p>Everything you need to succeed is right here.</p>
        </div>
        <div class="features-grid small">
          <div v-for="(feature, index) in allFeatures" :key="index" class="feature-card small">
            <div class="feature-icon">
              <UIcon dynamic :name="feature.icon" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Integration Section -->
    <section class="integration-section">
      <div class="container">
        <div class="section-header centered">
          <h2>Seamlessly Integrate with Your Stack</h2>
          <p>Connect with the tools you already use and love.</p>
        </div>
        <div class="integration-logos">
          <div v-for="(logo, index) in integrations" :key="index" class="logo-item">
            <img :src="logo.src" :alt="logo.name">
          </div>
        </div>
        <div class="integration-cta">
          <NuxtLink to="/integrations" class="btn btn-secondary">View All Integrations</NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
// Main features with detailed descriptions
const mainFeatures = [
  {
    title: 'Workflow Automation',
    description: 'Automate repetitive tasks and complex business processes with our powerful workflow engine.',
    icon: 'heroicons:arrow-path-rounded-square',
    image: '/assets/images/features/workflow-automation.png',
    items: [
      'Visual workflow builder',
      'Custom triggers and actions',
      'Integration with external systems',
      'Real-time monitoring and analytics'
    ]
  },
  {
    title: 'Customer Relationship Management',
    description: 'Manage your customer interactions and relationships all in one place.',
    icon: 'heroicons:users',
    image: '/assets/images/features/crm.png',
    items: [
      'Contact management',
      'Deal tracking',
      'Email campaigns',
      'Customer support integration'
    ]
  },
  {
    title: 'Advanced Analytics',
    description: 'Make data-driven decisions with comprehensive analytics and reporting tools.',
    icon: 'heroicons:chart-bar',
    image: '/assets/images/features/analytics.png',
    items: [
      'Customizable dashboards',
      'Real-time reporting',
      'Data visualization',
      'Export and share insights'
    ]
  },
  {
    title: 'Collaboration Tools',
    description: 'Work together seamlessly with integrated collaboration features.',
    icon: 'heroicons:user-group',
    image: '/assets/images/features/collaboration.png',
    items: [
      'Team messaging',
      'Document sharing',
      'Task assignment',
      'Video conferencing'
    ]
  }
];

// All features for the grid section
const allFeatures = [
  {
    title: 'User Management',
    description: 'Control user access and permissions with ease.',
    icon: 'heroicons:user-circle'
  },
  {
    title: 'File Storage',
    description: 'Secure cloud storage for all your important files.',
    icon: 'heroicons:document'
  },
  {
    title: 'Calendar',
    description: 'Schedule and manage your team\'s time efficiently.',
    icon: 'heroicons:calendar'
  },
  {
    title: 'Email Integration',
    description: 'Connect your email accounts for seamless communication.',
    icon: 'heroicons:envelope'
  },
  {
    title: 'Task Management',
    description: 'Create, assign, and track tasks for your team.',
    icon: 'heroicons:check-circle'
  },
  {
    title: 'Notifications',
    description: 'Stay updated with real-time notifications.',
    icon: 'heroicons:bell'
  },
  {
    title: 'Mobile App',
    description: 'Access your work from anywhere with our mobile app.',
    icon: 'heroicons:device-phone-mobile'
  },
  {
    title: 'API Access',
    description: 'Connect with other tools via our robust API.',
    icon: 'heroicons:code-bracket'
  },
  {
    title: 'White Labeling',
    description: 'Brand the platform with your company\'s identity.',
    icon: 'heroicons:tag'
  },
  {
    title: 'Security',
    description: 'Enterprise-grade security to protect your data.',
    icon: 'heroicons:lock-closed'
  },
  {
    title: 'Multi-language',
    description: 'Support for multiple languages and regions.',
    icon: 'heroicons:language'
  },
  {
    title: 'Customization',
    description: 'Tailor the platform to fit your specific needs.',
    icon: 'heroicons:wrench-screwdriver'
  }
];

// Integration logos
const integrations = [
  { name: 'Slack', src: '/assets/images/integrations/slack.png' },
  { name: 'Google Workspace', src: '/assets/images/integrations/google.png' },
  { name: 'Microsoft', src: '/assets/images/integrations/microsoft.png' },
  { name: 'Salesforce', src: '/assets/images/integrations/salesforce.png' },
  { name: 'Zoom', src: '/assets/images/integrations/zoom.png' },
  { name: 'Stripe', src: '/assets/images/integrations/stripe.png' }
];
</script>

<style scoped>
.features-page {
  /* padding removed as it's handled by the layout */
}

.page-hero {
  background-color: var(--color-primary-light);
  padding: 80px 0;
  text-align: center;
}

.page-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.page-hero p {
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto;
  color: var(--color-gray-700);
}

.main-features {
  padding: 80px 0;
}

.features-grid {
  display: grid;
  gap: 40px;
  margin-top: 40px;
}

.feature-card.large {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  background-color: white;
  margin-bottom: 60px;
}

.feature-card.large:nth-child(even) {
  flex-direction: row-reverse;
}

.feature-content {
  padding: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feature-image {
  flex: 1;
  min-height: 400px;
  background-color: var(--color-gray-100);
  position: relative;
}

.feature-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
}

.feature-icon {
  margin-bottom: 20px;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-light);
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.feature-card.large h2 {
  font-size: 1.75rem;
  margin-bottom: 16px;
  color: var(--color-gray-900);
}

.feature-card.large p {
  font-size: 1.125rem;
  margin-bottom: 24px;
  color: var(--color-gray-700);
}

.feature-list {
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
}

.feature-list .check-icon {
  margin-right: 10px;
  color: var(--color-success);
}

.all-features {
  padding: 80px 0;
  background-color: var(--color-gray-50);
}

.section-header.centered {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--color-gray-900);
}

.section-header p {
  font-size: 1.25rem;
  color: var(--color-gray-700);
}

.features-grid.small {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.feature-card.small {
  padding: 30px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card.small:hover {
  transform: translateY(-5px);
}

.feature-card.small h3 {
  margin: 16px 0 12px;
  font-size: 1.25rem;
  color: var(--color-gray-900);
}

.feature-card.small p {
  font-size: 0.95rem;
  color: var(--color-gray-700);
  margin: 0;
}

.integration-section {
  padding: 80px 0;
}

.integration-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  margin: 40px 0;
}

.logo-item {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.logo-item:hover {
  opacity: 1;
}

.logo-item img {
  max-height: 100%;
  max-width: 120px;
}

.integration-cta {
  text-align: center;
  margin-top: 20px;
}

.cta-section {
  padding: 100px 0;
  background-color: var(--color-primary);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Responsive styles */
@media (max-width: 992px) {
  .feature-card.large {
    flex-direction: column !important;
  }

  .feature-image {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .page-hero h1 {
    font-size: 2.5rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .cta-content h2 {
    font-size: 2rem;
  }

  .cta-buttons {
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }
}

@media (max-width: 576px) {
  .feature-content {
    padding: 30px;
  }

  .integration-logos {
    gap: 20px;
  }

  .logo-item {
    height: 50px;
    padding: 0 10px;
  }
}
</style>
