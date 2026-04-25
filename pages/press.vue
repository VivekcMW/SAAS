<template>
  <div class="press-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Press & <span class="highlight">Media</span></h1>
          <p class="hero-subtitle">
            Get the latest news, press releases, and media resources about Moonmart. 
            Download logos, access press kits, and stay updated with our company announcements.
          </p>
        </div>
      </div>
    </section>

    <!-- Press Resources Section -->
    <section class="press-resources">
      <div class="container">
        <div class="section-header">
          <h2>Press Resources</h2>
          <p>Everything you need to write about Moonmart</p>
        </div>
        
        <div class="resources-grid">
          <div class="resource-card">
            <div class="resource-icon">
              <UIcon name="i-heroicons-document-text" />
            </div>
            <h3>Press Kit</h3>
            <p>Complete press kit with company information, executive bios, and key facts.</p>
            <a href="#" class="download-link">Download Press Kit</a>
          </div>
          
          <div class="resource-card">
            <div class="resource-icon">
              <UIcon name="i-heroicons-photo" />
            </div>
            <h3>Brand Assets</h3>
            <p>High-resolution logos, brand guidelines, and visual assets for media use.</p>
            <a href="#" class="download-link">Download Assets</a>
          </div>
          
          <div class="resource-card">
            <div class="resource-icon">
              <UIcon name="i-heroicons-chart-bar" />
            </div>
            <h3>Company Facts</h3>
            <p>Key statistics, company milestones, and industry insights.</p>
            <a href="#" class="download-link">View Facts Sheet</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest News Section -->
    <section class="latest-news">
      <div class="container">
        <div class="section-header">
          <h2>Latest News</h2>
          <p>Recent press releases and company announcements</p>
        </div>
        
        <div class="news-grid">
          <article class="news-item">
            <div class="news-date">December 15, 2024</div>
            <h3>Moonmart Reaches 10,000+ Software Solutions Milestone</h3>
            <p>Our marketplace continues to grow with new enterprise software solutions added daily, helping businesses discover the perfect tools for their needs.</p>
            <a href="#" class="read-more">Read Full Release</a>
          </article>
          
          <article class="news-item">
            <div class="news-date">November 28, 2024</div>
            <h3>New AI-Powered Recommendation Engine Launched</h3>
            <p>Advanced machine learning algorithms now help users find the most relevant software solutions based on their specific business requirements.</p>
            <a href="#" class="read-more">Read Full Release</a>
          </article>
          
          <article class="news-item">
            <div class="news-date">November 10, 2024</div>
            <h3>Moonmart Partners with Leading Enterprise Software Vendors</h3>
            <p>Strategic partnerships announced with major software providers to expand our marketplace offerings and improve vendor verification processes.</p>
            <a href="#" class="read-more">Read Full Release</a>
          </article>
        </div>
      </div>
    </section>

    <!-- Media Contact Section -->
    <section class="media-contact">
      <div class="container">
        <div class="contact-content">
          <h2>Media Contact</h2>
          <p>For press inquiries, interviews, or additional information</p>
          
          <div class="contact-info">
            <div class="contact-item">
              <h4>Press Inquiries</h4>
              <p>press@moonmart.ai</p>
              <p>+1 (555) 123-4567</p>
            </div>
            
            <div class="contact-item">
              <h4>Partnership Inquiries</h4>
              <p>partnerships@moonmart.ai</p>
              <p>+1 (555) 123-4568</p>
            </div>
            
            <div class="contact-item">
              <h4>General Information</h4>
              <p>info@moonmart.ai</p>
              <p>+1 (555) 123-4569</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// SEO Configuration
useSeoMeta({
  title: 'Press & Media - Moonmart',
  description: 'Get the latest news, press releases, and media resources about Moonmart. Download logos, access press kits, and company announcements.',
  keywords: 'Moonmart press, media kit, press releases, company news, brand assets, media contact',
})

// Schema markup for organization
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Moonmart',
        url: 'https://moonmart.ai',
        sameAs: [
          'https://twitter.com/saasworld',
          'https://linkedin.com/company/saasworld'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Press Inquiries',
          email: 'press@moonmart.ai',
          telephone: '+1-555-123-4567'
        }
      })
    }
  ]
})
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: calc(var(--spacing-xxl) * 2) 0;
  background: var(--mm-bg);
  position: relative;
  overflow: visible;
  text-align: center;
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
  color: var(--text-primary);
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
  line-height: 1.6;
}

/* Press Resources Section */
.press-resources {
  padding: var(--spacing-xxl) 0;
  background: var(--mm-s1);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.resource-card {
  background: var(--mm-s2);
  padding: 2rem;
  border-radius: var(--r-lg);
  border: 0.5px solid var(--b1);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.resource-icon {
  width: 4rem;
  height: 4rem;
  background: var(--mm-gold-soft);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg) auto;
  color: var(--mm-gold);
  font-size: 2rem;
}

.resource-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.resource-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.download-link {
  display: inline-block;
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.download-link:hover {
  border-bottom-color: var(--primary-color);
}

/* Latest News Section */
.latest-news {
  padding: var(--spacing-xxl) 0;
  background: var(--mm-bg);
}

.news-grid {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.news-item {
  padding: 2rem;
  border-radius: var(--r-lg);
  border: 0.5px solid var(--b1);
  transition: box-shadow 0.2s ease;
}

.news-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-date {
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.news-item h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.news-item p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.read-more {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.read-more:hover {
  border-bottom-color: var(--primary-color);
}

/* Media Contact Section */
.media-contact {
  padding: var(--spacing-xxl) 0;
  background: var(--mm-s1);
}

.contact-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.contact-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.contact-content > p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xxl);
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.contact-item {
  background: var(--mm-s2);
  padding: 2rem;
  border-radius: var(--r-lg);
  border: 0.5px solid var(--b1);
}

.contact-item h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.contact-item p {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.contact-item p:last-child {
  margin-bottom: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .resource-card,
  .news-item,
  .contact-item {
    padding: 1.5rem;
  }
}
</style>
