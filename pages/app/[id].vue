<template>
  <div class="app-website-page">
    <!-- Website Navigation -->
    <AppWebsiteNavbar :app="app" />
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading application details...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="!app" class="error-state">
      <div class="error-icon">
        <Icon name="i-heroicons-exclamation-circle" />
      </div>
      <h2>Application Not Found</h2>
      <p>We couldn't find the application you're looking for.</p>
      <NuxtLink to="/marketplace" class="btn btn-primary">
        Return to Marketplace
      </NuxtLink>
    </div>

    <!-- App Website Content -->
    <div v-else class="app-website-content">
      <!-- Home Section (Hero) -->
      <section id="home" class="website-section home-section">
        <AppDetailsHero 
          :app="app" 
          @toggleFavorite="handleFavoriteToggle"
        />
      </section>

      <!-- Navigation Sidebar (Left, Always Visible, Icons Only) -->
      <nav class="website-sidebar left-sidebar always-visible icon-only">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <Icon name="i-heroicons-bars-3" class="nav-header-icon" />
          </div>
          <div class="sidebar-nav open">
            <ul class="nav-links">
              <li>
                <a href="#home" @click="scrollToSection('home')" :class="{ 'active': activeSection === 'home' }" :title="'Home'">
                  <Icon name="i-heroicons-home" class="nav-icon" />
                  <span class="nav-tooltip">Home</span>
                </a>
              </li>
              <li>
                <a href="#features" @click="scrollToSection('features')" :class="{ 'active': activeSection === 'features' }" :title="'Features'">
                  <Icon name="i-heroicons-sparkles" class="nav-icon" />
                  <span class="nav-tooltip">Features</span>
                </a>
              </li>
              <li>
                <a href="#gallery" @click="scrollToSection('gallery')" :class="{ 'active': activeSection === 'gallery' }" :title="'Gallery'">
                  <Icon name="i-heroicons-photo" class="nav-icon" />
                  <span class="nav-tooltip">Gallery</span>
                </a>
              </li>
              <li>
                <a href="#pricing" @click="scrollToSection('pricing')" :class="{ 'active': activeSection === 'pricing' }" :title="'Pricing'">
                  <Icon name="i-heroicons-currency-dollar" class="nav-icon" />
                  <span class="nav-tooltip">Pricing</span>
                </a>
              </li>
              <li>
                <a href="#integrations" @click="scrollToSection('integrations')" :class="{ 'active': activeSection === 'integrations' }" :title="'Integrations'">
                  <Icon name="i-heroicons-puzzle-piece" class="nav-icon" />
                  <span class="nav-tooltip">Integrations</span>
                </a>
              </li>
              <li>
                <a href="#testimonials" @click="scrollToSection('testimonials')" :class="{ 'active': activeSection === 'testimonials' }" :title="'Testimonials'">
                  <Icon name="i-heroicons-chat-bubble-left-ellipsis" class="nav-icon" />
                  <span class="nav-tooltip">Testimonials</span>
                </a>
              </li>
              <li>
                <a href="#certifications" @click="scrollToSection('certifications')" :class="{ 'active': activeSection === 'certifications' }" :title="'Certifications'">
                  <Icon name="i-heroicons-shield-check" class="nav-icon" />
                  <span class="nav-tooltip">Certifications</span>
                </a>
              </li>
              <li>
                <a href="#reviews" @click="scrollToSection('reviews')" :class="{ 'active': activeSection === 'reviews' }" :title="'Reviews'">
                  <Icon name="i-heroicons-star" class="nav-icon" />
                  <span class="nav-tooltip">Reviews</span>
                </a>
              </li>
              <li>
                <a href="#enquiry" @click="scrollToSection('enquiry')" :class="{ 'active': activeSection === 'enquiry' }" :title="'Enquiry'">
                  <Icon name="i-heroicons-envelope" class="nav-icon" />
                  <span class="nav-tooltip">Enquiry</span>
                </a>
              </li>
              <li>
                <a href="#similar-apps" @click="scrollToSection('similar-apps')" :class="{ 'active': activeSection === 'similar-apps' }" :title="'Similar Apps'">
                  <Icon name="i-heroicons-squares-2x2" class="nav-icon" />
                  <span class="nav-tooltip">Similar Apps</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="website-section hero-section">
        <div class="hero-container">
          <div class="container">
            <div class="hero-content">
              <!-- Left Side - Hero Image -->
              <div class="hero-image-section">
                <div class="hero-image-container">
                  <div class="hero-image-wrapper">
                    <img 
                      :src="heroContent.image.src" 
                      :alt="heroContent.image.alt"
                      class="hero-image"
                      @error="handleImageError"
                      loading="lazy"
                    />
                    <!-- Decorative elements -->
                    <div class="hero-image-decorations">
                      <div class="decoration-circle decoration-1"></div>
                      <div class="decoration-circle decoration-2"></div>
                      <div class="decoration-square decoration-3"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right Side - Content -->
              <div class="hero-text-section">
                <div class="hero-badge" v-if="heroContent.badge">
                  {{ heroContent.badge }}
                </div>
                <h1 class="hero-headline">
                  {{ heroContent.headline }}
                </h1>
                <p class="hero-subheadline">
                  {{ heroContent.subheadline }}
                </p>
                <div class="hero-features" v-if="heroContent.features">
                  <div class="feature-item" v-for="feature in heroContent.features" :key="feature">
                    <Icon name="i-heroicons-check-circle" class="feature-icon" />
                    <span>{{ feature }}</span>
                  </div>
                </div>
                <div class="hero-cta">
                  <button class="btn btn-primary btn-large hero-btn-primary">
                    {{ heroContent.primaryCta }}
                  </button>
                  <button v-if="heroContent.secondaryCta" class="btn btn-secondary btn-large hero-btn-secondary">
                    {{ heroContent.secondaryCta }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="website-section features-section">
        <div class="container">
          <div class="section-header">
            <h2>Key Features</h2>
            <p>Discover what makes {{ app.name }} the perfect solution for your business</p>
          </div>
          <div class="features-grid">
            <div v-for="feature in appFeatures" :key="feature.id" class="feature-card">
              <div class="feature-icon">
                <Icon :name="feature.icon" />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Application Gallery Section -->
      <section id="gallery" class="website-section gallery-section">
        <div class="container">
          <div class="section-header">
            <h2>Application Gallery</h2>
            <p>Explore {{ app.name }} in action with detailed feature screenshots and videos</p>
          </div>
          
          <!-- Gallery Tabs -->
          <div class="gallery-tabs-container">
            <div class="gallery-tabs">
              <button 
                v-for="(galleryItem, index) in appGallery" 
                :key="galleryItem.id"
                @click="activeGalleryTab = index"
                class="gallery-tab"
                :class="{ 'active': activeGalleryTab === index }">
                {{ galleryItem.title }}
              </button>
            </div>
            
            <!-- Gallery Content -->
            <div class="gallery-tab-content">
              <div v-for="(galleryItem, index) in appGallery" 
                   :key="galleryItem.id"
                   v-show="activeGalleryTab === index"
                   class="gallery-tab-panel">
                
                <div class="gallery-panel-layout">
                  <!-- Media Section -->
                  <div class="gallery-media-section">
                    <div class="gallery-media-container">
                      <img v-if="galleryItem.type === 'image'" 
                           :src="galleryItem.media" 
                           :alt="galleryItem.title"
                           class="gallery-media-image" />
                      <div v-else-if="galleryItem.type === 'video'" class="gallery-video-container">
                        <video :src="galleryItem.media" 
                               class="gallery-media-video"
                               controls
                               :poster="galleryItem.poster">
                        </video>
                        <div class="video-play-overlay">
                          <Icon name="i-heroicons-play" class="play-icon" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Description Section -->
                  <div class="gallery-description-section">
                    <div class="gallery-feature-header">
                      <h3>{{ galleryItem.title }}</h3>
                      <div class="gallery-tags">
                        <span v-for="tag in galleryItem.tags" :key="tag" class="gallery-tag">
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                    
                    <p class="gallery-description">{{ galleryItem.description }}</p>
                    
                    <!-- Feature Benefits -->
                    <div class="gallery-benefits" v-if="galleryItem.benefits">
                      <h4>Key Benefits:</h4>
                      <ul class="benefits-list">
                        <li v-for="benefit in galleryItem.benefits" :key="benefit">
                          <Icon name="i-heroicons-check-circle" class="benefit-icon" />
                          {{ benefit }}
                        </li>
                      </ul>
                    </div>
                    
                    <!-- Register Enquiry Button -->
                    <div class="gallery-enquiry-section">
                      <button @click="showEnquiryModal = true" class="btn btn-primary gallery-enquiry-btn">
                        <Icon name="i-heroicons-envelope" class="enquiry-icon" />
                        Register Enquiry for {{ galleryItem.title }}
                      </button>
                      <p class="enquiry-subtitle">Get detailed information and pricing for this feature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="website-section pricing-section">
        <div class="pricing-container">
          <div class="section-header">
            <h2>Pricing Plans</h2>
            <p>Choose the perfect plan for your business needs and scale as you grow</p>
          </div>
          
          <!-- Pricing Table -->
          <div class="pricing-table-wrapper">
            <div class="pricing-table-container">
              <table class="pricing-table">
                <!-- Table Header -->
                <thead>
                  <tr>
                    <th class="feature-column">Features</th>
                    <th v-for="plan in pricingPlans" :key="plan.id" class="plan-column" :class="{ 'featured-plan': plan.featured }">
                      <div class="plan-header-content">
                        <h3 class="plan-name">{{ plan.name }}</h3>
                        <p class="plan-description">{{ plan.description }}</p>
                        <div class="plan-price" v-if="plan.period !== 'custom'">
                          <span class="currency">$</span>
                          <span class="amount">{{ plan.price }}</span>
                          <span class="period">/{{ plan.period }}</span>
                        </div>
                        <div class="plan-price custom-price" v-else>
                          <span class="custom-text">Custom</span>
                        </div>
                        <button class="btn btn-primary table-cta" :class="{ 'featured-cta': plan.featured }">
                          {{ plan.cta }}
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                
                <!-- Table Body -->
                <tbody>
                  <!-- Users Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Number of Users
                    </td>
                    <td class="plan-value">Up to 5 users</td>
                    <td class="plan-value featured-value">Up to 25 users</td>
                    <td class="plan-value">Unlimited users</td>
                    <td class="plan-value">Unlimited users</td>
                  </tr>
                  
                  <!-- Storage Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Cloud Storage
                    </td>
                    <td class="plan-value">10GB</td>
                    <td class="plan-value featured-value">100GB</td>
                    <td class="plan-value">Unlimited</td>
                    <td class="plan-value">Unlimited</td>
                  </tr>
                  
                  <!-- Analytics Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Analytics & Reporting
                    </td>
                    <td class="plan-value">
                      Basic
                    </td>
                    <td class="plan-value featured-value">
                      Advanced
                    </td>
                    <td class="plan-value">
                      Enterprise
                    </td>
                    <td class="plan-value">
                      Custom
                    </td>
                  </tr>
                  
                  <!-- Support Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Customer Support
                    </td>
                    <td class="plan-value">Email (24h response)</td>
                    <td class="plan-value featured-value">Priority (4h response)</td>
                    <td class="plan-value">Dedicated manager</td>
                    <td class="plan-value">24/7 Premium</td>
                  </tr>
                  
                  <!-- Integrations Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Integrations
                    </td>
                    <td class="plan-value">
                      Standard
                    </td>
                    <td class="plan-value featured-value">
                      All included
                    </td>
                    <td class="plan-value">
                      Custom + API
                    </td>
                    <td class="plan-value">
                      Fully custom
                    </td>
                  </tr>
                  
                  <!-- Mobile App Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Mobile App Access
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                    <td class="plan-value featured-value">
                      ✓ Included
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                  </tr>
                  
                  <!-- Workflows Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Custom Workflows
                    </td>
                    <td class="plan-value">
                      ✗ Not included
                    </td>
                    <td class="plan-value featured-value">
                      ✓ Included
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                  </tr>
                  
                  <!-- Security Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Advanced Security
                    </td>
                    <td class="plan-value">
                      ✗ Not included
                    </td>
                    <td class="plan-value featured-value">
                      ✗ Not included
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                    <td class="plan-value">
                      ✓ Included
                    </td>
                  </tr>
                  
                  <!-- SLA Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      SLA Guarantee
                    </td>
                    <td class="plan-value">
                      ✗ Not included
                    </td>
                    <td class="plan-value featured-value">
                      ✗ Not included
                    </td>
                    <td class="plan-value">99.9% uptime</td>
                    <td class="plan-value">Custom SLA</td>
                  </tr>
                  
                  <!-- Training Row -->
                  <tr class="feature-row">
                    <td class="feature-name">
                      Training & Onboarding
                    </td>
                    <td class="plan-value">Self-service</td>
                    <td class="plan-value featured-value">Documentation</td>
                    <td class="plan-value">Custom sessions</td>
                    <td class="plan-value">Dedicated program</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Additional Info -->
          <div class="pricing-footer">
            <div class="guarantee-info">
              <span>30-day money-back guarantee on all plans</span>
            </div>
            <div class="contact-info">
              <p>Need a custom solution? <a href="#enquiry" class="contact-link">Contact our sales team</a></p>
            </div>
          </div>
        </div>
      </section>

      <!-- Integrations Section -->
      <section id="integrations" class="website-section integrations-section">
        <div class="container">
          <div class="section-header">
            <h2>Integrations</h2>
            <p>Connect {{ app.name }} with your favorite tools</p>
          </div>
          <div class="integrations-grid">
            <div v-for="integration in appIntegrations" :key="integration.id" class="integration-card">
              <img :src="integration.logo" :alt="integration.name" class="integration-logo">
              <h4>{{ integration.name }}</h4>
              <p>{{ integration.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section id="testimonials" class="website-section testimonials-section">
        <div class="container">
          <div class="section-header">
            <h2>What Our Customers Say</h2>
            <p>Hear from businesses that have transformed their operations with {{ app.name }}</p>
          </div>
          <div class="testimonials-grid">
            <div v-for="testimonial in appTestimonials" :key="testimonial.id" class="testimonial-card">
              <div class="testimonial-content">
                <div class="quote-icon">
                  <Icon name="i-heroicons-chat-bubble-left-ellipsis" />
                </div>
                <p class="testimonial-text">{{ testimonial.text }}</p>
              </div>
              <div class="testimonial-author">
                <img :src="testimonial.avatar" :alt="testimonial.name" class="author-avatar">
                <div class="author-info">
                  <h4>{{ testimonial.name }}</h4>
                  <p>{{ testimonial.position }} at {{ testimonial.company }}</p>
                  <div class="testimonial-rating">
                    <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" class="star-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Certifications Section -->
      <section id="certifications" class="website-section certifications-section">
        <div class="container">
          <div class="section-header">
            <h2>Security & Compliance Certifications</h2>
            <p>{{ app.name }} meets the highest industry standards for security, privacy, and compliance</p>
          </div>
          
          <div class="certifications-content">
            <!-- Main Certifications Grid -->
            <div class="certifications-grid">
              <div v-for="certification in appCertifications" :key="certification.id" class="certification-card">
                <div class="certification-icon">
                  <img :src="certification.logo" :alt="certification.name" />
                </div>
                <div class="certification-content">
                  <h3>{{ certification.name }}</h3>
                </div>
              </div>
            </div>
            
            <!-- Security Features Highlight -->
            <div class="security-features">
              <div class="security-header">
                <Icon name="i-heroicons-shield-check" class="security-icon" />
                <h3>Enterprise-Grade Security Features</h3>
              </div>
              <div class="security-grid">
                <div v-for="feature in securityFeatures" :key="feature.id" class="security-feature">
                  <Icon :name="feature.icon" class="feature-icon" />
                  <h4>{{ feature.title }}</h4>
                  <p>{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews/Comments Section -->
      <section id="reviews" class="website-section reviews-section">
        <div class="container">
          <div class="section-header">
            <h2>Customer Reviews & Comments</h2>
            <p>Real feedback from verified users</p>
          </div>
          <div class="reviews-content">
            <!-- Overall Rating Summary Row -->
            <div class="reviews-summary-row">
              <div class="overall-rating-card">
                <div class="overall-rating">
                  <span class="rating-number">{{ app.rating }}</span>
                  <div class="rating-stars">
                    <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" class="star-icon" />
                  </div>
                  <p>Based on {{ app.reviewCount }} reviews</p>
                </div>
              </div>
              <div class="rating-breakdown-card">
                <div class="rating-breakdown">
                  <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar">
                    <span class="rating-label">{{ rating }} stars</span>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: `${(ratingBreakdown[rating] / app.reviewCount) * 100}%` }"></div>
                    </div>
                    <span class="rating-count">{{ ratingBreakdown[rating] }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Write Review Section -->
            <div class="write-review-section">
              <div class="write-review-header">
                <h3>Write a Review</h3>
                <p>Share your experience with {{ app.name }}</p>
              </div>
              
              <form @submit.prevent="handleReviewSubmission" class="review-form">
                <div class="review-form-row">
                  <div class="form-group">
                    <label for="reviewer-name">Your Name *</label>
                    <input 
                      type="text" 
                      id="reviewer-name" 
                      v-model="newReview.name" 
                      required 
                      placeholder="Enter your full name"
                    >
                  </div>
                  <div class="form-group">
                    <label for="reviewer-company">Company</label>
                    <input 
                      type="text" 
                      id="reviewer-company" 
                      v-model="newReview.company" 
                      placeholder="Your company name (optional)"
                    >
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="review-rating">Rating *</label>
                  <div class="rating-input">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      type="button"
                      @click="setReviewRating(star)"
                      class="star-button"
                      :class="{ 'active': star <= newReview.rating }"
                    >
                      <Icon name="i-heroicons-star-solid" />
                    </button>
                    <span class="rating-text">{{ newReview.rating }}/5 stars</span>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="review-comment">Your Review *</label>
                  <textarea 
                    id="review-comment" 
                    v-model="newReview.comment" 
                    required
                    rows="3"
                    placeholder="Share your experience, what you liked, what could be improved..."
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label for="review-tags">Tags (Optional)</label>
                  <div class="tags-input-container">
                    <div class="selected-tags">
                      <span 
                        v-for="(tag, index) in newReview.tags" 
                        :key="index" 
                        class="selected-tag"
                      >
                        {{ tag }}
                        <button type="button" @click="removeReviewTag(index)" class="remove-tag">
                          <Icon name="i-heroicons-x-mark" />
                        </button>
                      </span>
                    </div>
                    <input 
                      type="text" 
                      id="review-tags"
                      v-model="newTagInput"
                      @keydown.enter.prevent="addReviewTag"
                      @keydown.comma.prevent="addReviewTag"
                      placeholder="Add tags (press Enter or comma to add)"
                    >
                  </div>
                  <div class="suggested-tags">
                    <span class="suggested-label">Suggested:</span>
                    <button 
                      v-for="suggestedTag in suggestedReviewTags" 
                      :key="suggestedTag"
                      type="button"
                      @click="addSuggestedTag(suggestedTag)"
                      class="suggested-tag"
                      :disabled="newReview.tags.includes(suggestedTag)"
                    >
                      {{ suggestedTag }}
                    </button>
                  </div>
                </div>
                
                <div class="review-form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="!isReviewFormValid">
                    <Icon name="i-heroicons-paper-airplane" class="btn-icon" />
                    Submit Review
                  </button>
                  <button type="button" @click="resetReviewForm" class="btn btn-secondary">
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Individual Reviews List -->
            <div class="reviews-list">
              <div v-for="review in appReviews" :key="review.id" class="review-card">
                <div class="review-header">
                  <img :src="review.avatar" :alt="review.name" class="reviewer-avatar">
                  <div class="reviewer-info">
                    <h4>{{ review.name }}</h4>
                    <p>{{ review.company }} • {{ review.date }}</p>
                    <div class="review-rating">
                      <Icon v-for="star in review.rating" :key="star" name="i-heroicons-star-solid" class="star-icon filled" />
                      <Icon v-for="star in (5 - review.rating)" :key="star + review.rating" name="i-heroicons-star" class="star-icon empty" />
                    </div>
                  </div>
                  <div class="review-actions">
                    <button 
                      @click="toggleReplyForm(review.id)" 
                      class="btn btn-ghost btn-sm reply-btn"
                      :class="{ 'active': activeReplyForm === review.id }"
                    >
                      <Icon name="i-heroicons-chat-bubble-left" class="btn-icon" />
                      Reply
                    </button>
                  </div>
                </div>
                <div class="review-content">
                  <p>{{ review.comment }}</p>
                  <div class="review-tags">
                    <span v-for="tag in review.tags" :key="tag" class="review-tag">{{ tag }}</span>
                  </div>
                </div>
                
                <!-- Reply Form -->
                <div v-if="activeReplyForm === review.id" class="reply-form-container">
                  <form @submit.prevent="handleReplySubmission(review.id)" class="reply-form">
                    <div class="reply-form-header">
                      <h5>Reply to {{ review.name }}</h5>
                      <button type="button" @click="cancelReply" class="btn btn-ghost btn-sm">
                        <Icon name="i-heroicons-x-mark" />
                      </button>
                    </div>
                    <div class="reply-form-body">
                      <div class="form-group">
                        <label for="reply-name">Your Name *</label>
                        <input 
                          type="text" 
                          id="reply-name" 
                          v-model="replyForm.name" 
                          required 
                          placeholder="Enter your name"
                        >
                      </div>
                      <div class="form-group">
                        <label for="reply-comment">Your Reply *</label>
                        <textarea 
                          id="reply-comment" 
                          v-model="replyForm.comment" 
                          required
                          rows="3"
                          placeholder="Write your reply..."
                        ></textarea>
                      </div>
                      <div class="reply-form-actions">
                        <button type="submit" class="btn btn-primary btn-sm" :disabled="!isReplyFormValid">
                          <Icon name="i-heroicons-paper-airplane" class="btn-icon" />
                          Post Reply
                        </button>
                        <button type="button" @click="cancelReply" class="btn btn-secondary btn-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                
                <!-- Existing Replies -->
                <div v-if="review.replies && review.replies.length > 0" class="replies-section">
                  <div class="replies-header">
                    <h5>{{ review.replies.length }} {{ review.replies.length === 1 ? 'Reply' : 'Replies' }}</h5>
                  </div>
                  <div class="replies-list">
                    <div v-for="reply in review.replies" :key="reply.id" class="reply-card">
                      <div class="reply-header">
                        <img :src="reply.avatar || '/assets/images/default-avatar.svg'" :alt="reply.name" class="reply-avatar">
                        <div class="reply-info">
                          <h6>{{ reply.name }}</h6>
                          <p class="reply-date">{{ reply.date }}</p>
                          <span v-if="reply.isOwner" class="owner-badge">App Owner</span>
                        </div>
                      </div>
                      <div class="reply-content">
                        <p>{{ reply.comment }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Enquiry Section -->
      <section id="enquiry" class="website-section enquiry-section">
        <div class="container">
          <div class="section-header">
            <h2>Get Started Today</h2>
            <p>Have questions or ready to get started? We're here to help!</p>
          </div>
          <div class="enquiry-content">
            <div class="enquiry-form">
              <form @submit.prevent="handleEnquiry">
                <div class="enquiry-form-row">
                  <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" v-model="enquiryForm.name" required>
                  </div>
                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" v-model="enquiryForm.email" required>
                  </div>
                </div>
                <div class="form-group">
                  <label for="company">Company Name</label>
                  <input type="text" id="company" v-model="enquiryForm.company">
                </div>
                <div class="form-group">
                  <label for="message">Message</label>
                  <textarea id="message" v-model="enquiryForm.message" rows="3" placeholder="Tell us about your requirements..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-large">
                  Send Enquiry
                </button>
              </form>
            </div>
            <div class="enquiry-info">
              <div class="info-card">
                <Icon name="i-heroicons-envelope" class="info-icon" />
                <h4>Email Support</h4>
                <p>support@{{ app.name.toLowerCase().replace(' ', '') }}.com</p>
              </div>
              <div class="info-card">
                <Icon name="i-heroicons-phone" class="info-icon" />
                <h4>Phone Support</h4>
                <p>+1 (555) 123-4567</p>
              </div>
              <div class="info-card">
                <Icon name="i-heroicons-clock" class="info-icon" />
                <h4>Business Hours</h4>
                <p>Mon-Fri: 9AM-6PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Similar Applications Section -->
      <section id="similar-apps" class="website-section similar-apps-section">
        <div class="container">
          <div class="section-header">
            <h2>Similar Applications</h2>
            <p>Discover other applications that might interest you in the same category</p>
          </div>
          
          <div class="similar-apps-grid">
            <div v-for="similarApp in similarApps" :key="similarApp.id" class="grid-item">
              <div class="app-card" @click="navigateToApp(similarApp.id)">
                <!-- Row 1: Logo and App Name - Made Prominent -->
                <div class="app-header">
                  <div class="app-logo">
                    <img 
                      :src="similarApp.logo" 
                      :alt="similarApp.name + ' logo'" 
                      @error="handleSimilarAppImageError($event, similarApp)" 
                      loading="lazy"
                    />
                  </div>
                  <h3 class="app-name" :title="similarApp.name">{{ similarApp.name }}</h3>
                </div>
                
                <!-- Row 2: Provider name and Categories/Tags -->
                <div class="app-categories">
                  <div class="app-provider" :title="similarApp.provider">by {{ similarApp.provider }}</div>
                  <div class="app-tags">
                    <span v-for="(tag, index) in similarApp.tags.slice(0, 2)" :key="index" class="app-tag" :title="tag">{{ tag }}</span>
                    <span v-if="similarApp.tags.length > 2" class="app-tag app-tag-more" :title="`${similarApp.tags.length - 2} more tags`">+{{ similarApp.tags.length - 2 }}</span>
                  </div>
                </div>
                
                <!-- Row 3: App Description -->
                <p class="app-description" :title="similarApp.description">{{ truncateText(similarApp.description, 100) }}</p>
                
                <!-- Row 4: Pricing and Ratings -->
                <div class="app-meta">
                  <div class="app-pricing" v-if="similarApp.pricing.type === 'free'">
                    <span class="price-label">Price:</span>
                    <span class="free-tag">Free</span>
                  </div>
                  <div class="app-pricing" v-else-if="similarApp.pricing.type === 'trial'">
                    <span class="price-label">Price:</span>
                    <span class="trial-tag">Free Trial</span>
                  </div>
                  <div class="app-pricing" v-else>
                    <span class="price-label">Price:</span>
                    <span class="price-tag">${{ similarApp.pricing.value }}/<span class="period">{{ similarApp.pricing.period }}</span></span>
                  </div>
                  
                  <div class="app-rating">
                    <div class="stars">
                      <Icon 
                        v-for="star in 5" 
                        :key="star" 
                        :name="getStarIcon(star, similarApp.rating)" 
                        :class="getStarClass(star, similarApp.rating)"
                      />
                    </div>
                    <span class="rating-value">{{ similarApp.rating.toFixed(1) }}</span>
                    <span class="rating-count">({{ similarApp.reviewCount }})</span>
                  </div>
                </div>
                
                <!-- Row 5: Action Buttons -->
                <div class="app-footer">
                  <div class="app-actions">
                    <button class="btn btn-primary btn-view full-width" @click.stop="navigateToApp(similarApp.id)">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- View All Similar Apps Button -->
          <div class="similar-apps-footer">
            <NuxtLink to="/marketplace" class="btn btn-secondary btn-large">
              View All Applications
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Enquiry Modal -->
    <div v-if="showEnquiryModal" class="modal-overlay" @click="showEnquiryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Register Enquiry</h3>
          <button @click="showEnquiryModal = false" class="modal-close">
            <Icon name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleEnquiry; showEnquiryModal = false">
            <div class="form-group">
              <label for="modal-name">Full Name *</label>
              <input type="text" id="modal-name" v-model="enquiryForm.name" required>
            </div>
            <div class="form-group">
              <label for="modal-email">Email Address *</label>
              <input type="email" id="modal-email" v-model="enquiryForm.email" required>
            </div>
            <div class="form-group">
              <label for="modal-company">Company Name</label>
              <input type="text" id="modal-company" v-model="enquiryForm.company">
            </div>
            <div class="form-group">
              <label for="modal-message">Message</label>
              <textarea id="modal-message" v-model="enquiryForm.message" rows="4" placeholder="Tell us about your specific requirements for this feature..."></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEnquiryModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Send Enquiry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface App {
  id: string;
  name: string;
  provider: string;
  logo: string;
  description: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  pricingType: 'free' | 'paid' | 'custom';
  startingPrice: number;
  launchDate: string;
  userCount: number;
  companyCount: number;
  integrationCount: number;
}

interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta?: string;
  badge?: string;
  features?: string[];
  image: {
    src: string;
    alt: string;
  };
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  media: string;
  poster?: string;
  tags: string[];
  benefits?: string[];
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  period: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

interface Integration {
  id: string;
  name: string;
  logo: string;
  description: string;
}

interface EnquiryForm {
  name: string;
  email: string;
  company: string;
  message: string;
}

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  text: string;
  avatar: string;
}

interface Review {
  id: string;
  name: string;
  company: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
  tags: string[];
  replies?: Reply[];
}

interface Reply {
  id: string;
  name: string;
  comment: string;
  date: string;
  avatar?: string;
  isOwner?: boolean;
}

interface NewReview {
  name: string;
  company: string;
  rating: number;
  comment: string;
  tags: string[];
}

interface ReplyForm {
  name: string;
  comment: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: string;
  validUntil: string;
  tags: string[];
}

interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface SimilarApp {
  id: string;
  name: string;
  provider: string;
  logo: string;
  description: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  pricing: {
    type: 'free' | 'paid' | 'trial';
    value?: number;
    period?: string;
  };
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
}

// Use route params properly in Nuxt 3
const route = useRoute();
const appId = computed(() => route.params.id as string);

const loading = ref(true);
const app = ref<App | null>(null);

// Navigation state
const activeSection = ref('home');

// Website content data
const appFeatures = ref<Feature[]>([]);
const pricingPlans = ref<PricingPlan[]>([]);
const appIntegrations = ref<Integration[]>([]);
const appTestimonials = ref<Testimonial[]>([]);
const appReviews = ref<Review[]>([]);
const heroContent = ref<HeroContent>({
  headline: '',
  subheadline: '',
  primaryCta: '',
  secondaryCta: '',
  badge: '',
  features: [],
  image: { src: '', alt: '' }
});
const appGallery = ref<GalleryItem[]>([]);
const similarApps = ref<SimilarApp[]>([]);
const ratingBreakdown = ref<Record<number, number>>({
  5: 156,
  4: 78,
  3: 15,
  2: 5,
  1: 2
});

// Gallery tab state
const activeGalleryTab = ref(0);
const showEnquiryModal = ref(false);

// Certifications data
const appCertifications = ref<Certification[]>([]);
const securityFeatures = ref<SecurityFeature[]>([]);

// Enquiry form
const enquiryForm = ref<EnquiryForm>({
  name: '',
  email: '',
  company: '',
  message: ''
});

// Review form data
const newReview = ref<NewReview>({
  name: '',
  company: '',
  rating: 0,
  comment: '',
  tags: []
});

const newTagInput = ref('');
const suggestedReviewTags = ref(['Easy to use', 'Great support', 'Feature-rich', 'Good value', 'Reliable', 'User-friendly', 'Time-saving', 'Excellent', 'Recommended', 'Professional']);

// Reply form data
const replyForm = ref<ReplyForm>({
  name: '',
  comment: ''
});

const activeReplyForm = ref<string | null>(null);

// Computed properties for form validation
const isReviewFormValid = computed(() => {
  return newReview.value.name.trim() !== '' && 
         newReview.value.rating > 0 && 
         newReview.value.comment.trim() !== '';
});

const isReplyFormValid = computed(() => {
  return replyForm.value.name.trim() !== '' && 
         replyForm.value.comment.trim() !== '';
});

// Simulated app data - Replace with actual API call
const fetchAppDetails = async (id: string) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data - Replace with actual API response
    app.value = {
      id: id,
      name: 'Example App',
      provider: 'Example Provider',
      logo: '/assets/images/integrations/example-logo.svg',
      description: 'A comprehensive solution for modern businesses, offering advanced features and seamless integration capabilities.',
      rating: 4.8,
      reviewCount: 256,
      categories: ['Productivity', 'Team Collaboration', 'Project Management'],
      pricingType: 'paid',
      startingPrice: 29,
      launchDate: '2024-01-15',
      userCount: 50000,
      companyCount: 1200,
      integrationCount: 25
    };

    // Load website content
    loadWebsiteContent();
  } catch (error) {
    console.error('Error fetching app details:', error);
    app.value = null;
  } finally {
    loading.value = false;
  }
};

const loadWebsiteContent = () => {
  // Mock features data
  appFeatures.value = [
    {
      id: 'feature-1',
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your business performance with comprehensive analytics and reporting.',
      icon: 'i-heroicons-chart-bar'
    },
    {
      id: 'feature-2',
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team using built-in collaboration tools and real-time updates.',
      icon: 'i-heroicons-user-group'
    },
    {
      id: 'feature-3',
      title: 'Automated Workflows',
      description: 'Streamline your processes with intelligent automation and custom workflow builders.',
      icon: 'i-heroicons-cog-8-tooth'
    },
    {
      id: 'feature-4',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with compliance certifications to keep your data safe.',
      icon: 'i-heroicons-shield-check'
    },
    {
      id: 'feature-5',
      title: 'Mobile Access',
      description: 'Access your data and tools anywhere with our responsive mobile application.',
      icon: 'i-heroicons-device-phone-mobile'
    },
    {
      id: 'feature-6',
      title: '24/7 Support',
      description: 'Get help when you need it with our round-the-clock customer support team.',
      icon: 'i-heroicons-chat-bubble-left-right'
    }
  ];

  // Mock pricing data
  pricingPlans.value = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      price: 19,
      period: 'month',
      features: [
        'Up to 5 users',
        'Basic analytics and reporting',
        'Email support (24h response)',
        '10GB cloud storage',
        'Standard integrations',
        'Mobile app access',
        'Basic templates library'
      ],
      cta: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Best for growing businesses',
      price: 49,
      period: 'month',
      featured: true,
      features: [
        'Up to 25 users',
        'Advanced analytics & insights',
        'Priority support (4h response)',
        '100GB cloud storage',
        'All integrations included',
        'Custom workflows & automation',
        'Advanced reporting tools',
        'Team collaboration features',
        'Premium templates library'
      ],
      cta: 'Get Started Now'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with advanced needs',
      price: 99,
      period: 'month',
      features: [
        'Unlimited users',
        'Enterprise-grade analytics',
        'Dedicated support manager',
        'Unlimited cloud storage',
        'Custom integrations & API',
        'Advanced security controls',
        'SLA guarantee (99.9% uptime)',
        'White-label options',
        'Custom training sessions',
        'Advanced compliance tools'
      ],
      cta: 'Contact Sales'
    },
    {
      id: 'custom',
      name: 'Enterprise Plus',
      description: 'Fully customized solution for your unique requirements',
      price: 0,
      period: 'custom',
      features: [
        'Tailored feature development',
        'Custom integration solutions',
        'Dedicated account manager',
        'On-premise deployment options',
        'Custom security implementations',
        'Personalized training program',
        'Volume pricing discounts',
        '24/7 premium support',
        'Custom SLA agreements',
        'Dedicated infrastructure'
      ],
      cta: 'Get Custom Quote'
    }
  ];

  // Mock integrations data
  appIntegrations.value = [
    {
      id: 'slack',
      name: 'Slack',
      logo: '/assets/images/integrations/slack.svg',
      description: 'Connect with your team communication'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      logo: '/assets/images/integrations/salesforce.svg',
      description: 'Sync your CRM data seamlessly'
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      logo: '/assets/images/integrations/google.svg',
      description: 'Integrate with Google apps'
    },
    {
      id: 'microsoft-365',
      name: 'Microsoft 365',
      logo: '/assets/images/integrations/microsoft.svg',
      description: 'Connect with Office applications'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      logo: '/assets/images/integrations/zapier.svg',
      description: 'Automate workflows with 1000+ apps'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      logo: '/assets/images/integrations/hubspot.svg',
      description: 'Marketing and sales automation'
    }
  ];

  // Mock testimonials data
  appTestimonials.value = [
    {
      id: 'testimonial-1',
      name: 'Sarah Johnson',
      position: 'CEO',
      company: 'TechStart Inc',
      text: 'This application has completely transformed how we manage our business operations. The intuitive interface and powerful features have increased our productivity by 40%.',
      avatar: '/assets/images/testimonials/sarah-johnson.jpg'
    },
    {
      id: 'testimonial-2',
      name: 'Michael Chen',
      position: 'Operations Manager',
      company: 'Global Solutions Ltd',
      text: 'The integration capabilities are outstanding. We were able to connect all our existing tools seamlessly, saving us countless hours of manual work.',
      avatar: '/assets/images/testimonials/michael-chen.jpg'
    },
    {
      id: 'testimonial-3',
      name: 'Emily Rodriguez',
      position: 'Product Manager',
      company: 'Innovation Labs',
      text: 'Excellent customer support and regular updates. The team behind this product really cares about user experience and it shows in every detail.',
      avatar: '/assets/images/testimonials/emily-rodriguez.jpg'
    }
  ];

  // Mock reviews data
  appReviews.value = [
    {
      id: 'review-1',
      name: 'David Thompson',
      company: 'Marketing Pro',
      date: '2 weeks ago',
      rating: 5,
      comment: 'Absolutely fantastic software! Easy to use, great features, and excellent customer support. Highly recommend to anyone looking for a comprehensive business solution.',
      avatar: '/assets/images/reviews/david-thompson.jpg',
      tags: ['Easy to use', 'Great support', 'Feature-rich'],
      replies: [
        {
          id: 'reply-1',
          name: 'Sarah Wilson',
          comment: 'Thank you for your wonderful feedback, David! We\'re thrilled to hear that you\'re enjoying the software and our support team.',
          date: '1 week ago',
          avatar: '/assets/images/team/sarah-wilson.jpg',
          isOwner: true
        }
      ]
    },
    {
      id: 'review-2',
      name: 'Lisa Wang',
      company: 'Creative Agency',
      date: '1 month ago',
      rating: 4,
      comment: 'Really good software with lots of useful features. The interface could be a bit more modern, but overall it does exactly what we need.',
      avatar: '/assets/images/reviews/lisa-wang.jpg',
      tags: ['Functional', 'Reliable', 'Good value'],
      replies: [
        {
          id: 'reply-2',
          name: 'Mike Chen',
          comment: 'Thanks for the feedback, Lisa! We\'re actually working on a UI refresh that should address your concerns about the interface. Stay tuned!',
          date: '3 weeks ago',
          avatar: '/assets/images/team/mike-chen.jpg',
          isOwner: true
        },
        {
          id: 'reply-3',
          name: 'John Davis',
          comment: 'I agree with Lisa - the functionality is great but the interface could use some updates. Looking forward to the refresh!',
          date: '2 weeks ago',
          avatar: '/assets/images/users/john-davis.jpg',
          isOwner: false
        }
      ]
    },
    {
      id: 'review-3',
      name: 'Robert Miller',
      company: 'Consulting Firm',
      date: '1 month ago',
      rating: 5,
      comment: 'This has streamlined our entire workflow. The automation features save us hours every week, and the reporting is incredibly detailed.',
      avatar: '/assets/images/reviews/robert-miller.jpg',
      tags: ['Time-saving', 'Automation', 'Great reports'],
      replies: []
    },
    {
      id: 'review-4',
      name: 'Jennifer Adams',
      company: 'Small Business',
      date: '2 months ago',
      rating: 4,
      comment: 'Good software overall. Setup was straightforward and the learning curve is reasonable. Would be nice to have more customization options.',
      avatar: '/assets/images/reviews/jennifer-adams.jpg',
      tags: ['Easy setup', 'User-friendly', 'Could improve'],
      replies: [
        {
          id: 'reply-4',
          name: 'Product Team',
          comment: 'Hi Jennifer, thanks for your review! We\'ve recently added more customization options in our latest update. Please check out the new settings panel!',
          date: '1 month ago',
          avatar: '/assets/images/team/product-team.jpg',
          isOwner: true
        }
      ]
    }
  ];

  // Hero content data
  heroContent.value = {
    headline: 'Transform Your Business Operations',
    subheadline: 'Streamline workflows, boost productivity, and drive growth with our comprehensive business solution that scales with your needs.',
    primaryCta: 'Start Free Trial',
    secondaryCta: 'Watch Demo',
    badge: 'Most Popular',
    features: ['30-day free trial', 'No credit card required', 'Setup in 5 minutes'],
    image: {
      src: '/assets/images/hero-dashboard.png',
      alt: 'Dashboard Overview'
    }
  };

  // Mock gallery data
  appGallery.value = [
    {
      id: 'gallery-1',
      title: 'Dashboard Overview',
      description: 'Get a comprehensive view of your business metrics and KPIs with our intuitive dashboard interface that provides real-time insights into your company performance.',
      type: 'image',
      media: '/assets/images/hero-dashboard.png',
      tags: ['Dashboard', 'Analytics', 'Overview'],
      benefits: [
        'Real-time data visualization with interactive charts',
        'Customizable widgets for personalized views',
        'One-click report generation and export',
        'Mobile-responsive design for on-the-go access'
      ]
    },
    {
      id: 'gallery-2',
      title: 'Project Management',
      description: 'Organize tasks, track progress, and manage deadlines with our powerful project management tools that help teams collaborate efficiently.',
      type: 'image',
      media: '/assets/images/features/project-management.svg',
      tags: ['Projects', 'Tasks', 'Planning'],
      benefits: [
        'Kanban boards and Gantt charts for visual planning',
        'Automated task assignment and notifications',
        'Time tracking and resource allocation',
        'Team collaboration with file sharing and comments'
      ]
    },
    {
      id: 'gallery-3',
      title: 'Team Collaboration Demo',
      description: 'See how teams can collaborate in real-time with our integrated communication and file sharing features that boost productivity.',
      type: 'image',
      media: '/assets/images/features/project-management.svg',
      tags: ['Collaboration', 'Communication', 'Teamwork'],
      benefits: [
        'Real-time messaging and video conferencing',
        'Shared workspaces with live document editing',
        'File version control and approval workflows',
        'Integration with popular communication tools'
      ]
    },
    {
      id: 'gallery-4',
      title: 'Reports & Analytics',
      description: 'Generate detailed reports and gain insights from your data with customizable charts and visualizations that drive informed decisions.',
      type: 'image',
      media: '/assets/images/features/analytics-reports.svg',
      tags: ['Reports', 'Data', 'Insights'],
      benefits: [
        'Advanced data filtering and segmentation',
        'Automated report scheduling and distribution',
        'Predictive analytics and trend analysis',
        'Custom dashboard creation with drag-and-drop'
      ]
    },
    {
      id: 'gallery-5',
      title: 'Mobile Experience',
      description: 'Access all features on the go with our responsive mobile interface designed for productivity and seamless user experience.',
      type: 'image',
      media: '/assets/images/features/mobile-app.svg',
      tags: ['Mobile', 'Responsive', 'Accessibility'],
      benefits: [
        'Native mobile apps for iOS and Android',
        'Offline functionality with automatic sync',
        'Push notifications for important updates',
        'Touch-optimized interface for easy navigation'
      ]
    },
    {
      id: 'gallery-6',
      title: 'Integration Setup',
      description: 'Connect with your favorite tools and services with our easy-to-use integration configuration that streamlines your workflow.',
      type: 'image',
      media: '/assets/images/features/integrations-setup.svg',
      tags: ['Integrations', 'Setup', 'Configuration'],
      benefits: [
        'One-click setup for popular business tools',
        'Custom API connections and webhooks',
        'Data synchronization across all platforms',
        'Automated workflow triggers and actions'
      ]
    }
  ];

  // Mock certifications data
  appCertifications.value = [
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      description: 'Demonstrates our commitment to security, availability, processing integrity, confidentiality, and privacy.',
      logo: '/assets/images/certifications/soc2-logo.svg',
      status: 'Certified',
      validUntil: 'December 2025',
      tags: ['Security', 'Audit', 'Compliance']
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      description: 'International standard for information security management systems, ensuring systematic approach to data protection.',
      logo: '/assets/images/certifications/iso27001-logo.svg',
      status: 'Certified',
      validUntil: 'March 2026',
      tags: ['Security', 'International', 'Management']
    },
    {
      id: 'gdpr',
      name: 'GDPR Compliant',
      description: 'Full compliance with European General Data Protection Regulation for data privacy and protection.',
      logo: '/assets/images/certifications/gdpr-logo.svg',
      status: 'Compliant',
      validUntil: 'Ongoing',
      tags: ['Privacy', 'European', 'Data Protection']
    },
    {
      id: 'hipaa',
      name: 'HIPAA Compliant',
      description: 'Complies with Health Insurance Portability and Accountability Act for healthcare data protection.',
      logo: '/assets/images/certifications/hipaa-logo.svg',
      status: 'Compliant',
      validUntil: 'Ongoing',
      tags: ['Healthcare', 'Privacy', 'US Regulation']
    },
    {
      id: 'pci-dss',
      name: 'PCI DSS Level 1',
      description: 'Payment Card Industry Data Security Standard compliance for secure payment processing.',
      logo: '/assets/images/certifications/pci-logo.svg',
      status: 'Certified',
      validUntil: 'October 2025',
      tags: ['Payments', 'Security', 'Finance']
    },
    {
      id: 'ccpa',
      name: 'CCPA Compliant',
      description: 'California Consumer Privacy Act compliance ensuring consumer privacy rights are protected.',
      logo: '/assets/images/certifications/ccpa-logo.svg',
      status: 'Compliant',
      validUntil: 'Ongoing',
      tags: ['Privacy', 'California', 'Consumer Rights']
    }
  ] as Certification[];

  // Mock security features data
  securityFeatures.value = [
    {
      id: 'encryption',
      title: 'End-to-End Encryption',
      description: 'All data is encrypted using AES-256 encryption both in transit and at rest.',
      icon: 'i-heroicons-lock-closed'
    },
    {
      id: 'backup',
      title: 'Automated Backups',
      description: 'Daily automated backups with 99.9% recovery guarantee and instant restoration.',
      icon: 'i-heroicons-cloud-arrow-up'
    },
    {
      id: 'monitoring',
      title: '24/7 Security Monitoring',
      description: 'Continuous monitoring and threat detection with real-time security alerts.',
      icon: 'i-heroicons-eye'
    },
    {
      id: 'access-control',
      title: 'Role-Based Access Control',
      description: 'Granular permissions and multi-factor authentication for secure access management.',
      icon: 'i-heroicons-user-group'
    },
    {
      id: 'audit-logs',
      title: 'Comprehensive Audit Logs',
      description: 'Complete activity logging and audit trails for compliance and security analysis.',
      icon: 'i-heroicons-document-text'
    },
    {
      id: 'incident-response',
      title: 'Incident Response Plan',
      description: 'Detailed incident response procedures with 15-minute notification guarantee.',
      icon: 'i-heroicons-exclamation-triangle'
    }
  ] as SecurityFeature[];

  // Mock similar applications data
  similarApps.value = [
    {
      id: 'app-002',
      name: 'Asana Tasks',
      provider: 'Asana Inc.',
      logo: '/assets/images/integrations/asana.svg',
      description: 'Advanced project management tool with team collaboration features, timeline tracking, and resource allocation.',
      rating: 4.5,
      reviewCount: 189,
      tags: ['Project Management', 'Collaboration', 'Teams'],
      pricing: { type: 'trial', value: 19, period: 'month' },
      trending: true
    },
    {
      id: 'app-003',
      name: 'Zapier Connect',
      provider: 'Zapier Inc.',
      logo: '/assets/images/integrations/zapier.svg',
      description: 'Automation platform that connects your apps and automates workflows to save time and increase productivity.',
      rating: 4.6,
      reviewCount: 324,
      tags: ['Automation', 'Integration', 'Workflow'],
      pricing: { type: 'trial', value: 25, period: 'month' },
      featured: true
    },
    {
      id: 'app-004',
      name: 'Slack Teams',
      provider: 'Slack Technologies',
      logo: '/assets/images/integrations/slack.svg',
      description: 'Team communication platform with channels, direct messaging, file sharing, and powerful integrations.',
      rating: 4.4,
      reviewCount: 567,
      tags: ['Communication', 'Team Chat', 'Collaboration'],
      pricing: { type: 'trial', value: 15, period: 'month' }
    },
    {
      id: 'app-005',
      name: 'HubSpot CRM',
      provider: 'HubSpot Inc.',
      logo: '/assets/images/integrations/hubspot.svg',
      description: 'Free CRM with marketing, sales, and customer service tools to help grow your business effectively.',
      rating: 4.3,
      reviewCount: 432,
      tags: ['CRM', 'Marketing', 'Sales'],
      pricing: { type: 'free' }
    },
    {
      id: 'app-006',
      name: 'Notion Workspace',
      provider: 'Notion Labs',
      logo: '/assets/images/integrations/notion.svg',
      description: 'All-in-one workspace for notes, tasks, wikis, and databases. Perfect for teams and personal productivity.',
      rating: 4.7,
      reviewCount: 298,
      tags: ['Productivity', 'Documentation', 'Database'],
      pricing: { type: 'trial', value: 12, period: 'month' },
      isNew: true
    },
    {
      id: 'app-007',
      name: 'Microsoft Teams',
      provider: 'Microsoft Corporation',
      logo: '/assets/images/integrations/microsoft.svg',
      description: 'Unified communication and collaboration platform that combines workplace chat, meetings, and file storage.',
      rating: 4.2,
      reviewCount: 789,
      tags: ['Communication', 'Video Conferencing', 'Collaboration'],
      pricing: { type: 'trial', value: 22, period: 'month' }
    }
  ] as SimilarApp[];
};

const handleFavoriteToggle = (isFavorite: boolean) => {
  // Handle favorite toggle - Implement your logic here
  if (app.value) {
    console.log(`App ${app.value.id} favorite status:`, isFavorite);
  }
};

const handleEnquiry = () => {
  // Handle enquiry form submission
  console.log('Enquiry submitted:', enquiryForm.value);
  
  // Here you would typically send the enquiry to your backend
  // For now, just show a success message
  alert('Thank you for your enquiry! We will get back to you soon.');
  
  // Reset form
  enquiryForm.value = {
    name: '',
    email: '',
    company: '',
    message: ''
  };
};

// Similar apps functions
const navigateToApp = (appId: string) => {
  navigateTo(`/app/${appId}`);
};

const handleSimilarAppImageError = (event: Event, app: SimilarApp) => {
  const img = event.target as HTMLImageElement;
  // Fallback to a default application icon if image fails to load
  img.src = '/assets/images/integrations/default-app-icon.svg';
  img.alt = `${app.name} logo (fallback)`;
};

// Hero image error handler
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Fallback to a placeholder image if hero image fails to load
  img.src = '/assets/images/placeholder-app-logo.svg';
  img.alt = 'Application Preview (fallback)';
};

// Review functions
const handleReviewSubmission = () => {
  if (!isReviewFormValid.value) return;
  
  const newReviewData: Review = {
    id: `review-${Date.now()}`,
    name: newReview.value.name,
    company: newReview.value.company || 'Anonymous',
    date: 'Just now',
    rating: newReview.value.rating,
    comment: newReview.value.comment,
    avatar: '/assets/images/default-avatar.svg',
    tags: [...newReview.value.tags],
    replies: []
  };

  // Add the new review to the beginning of the list
  appReviews.value.unshift(newReviewData);
  
  // Update the app review count
  if (app.value) {
    app.value.reviewCount += 1;
    // Recalculate average rating
    const totalRating = appReviews.value.reduce((sum, review) => sum + review.rating, 0);
    app.value.rating = Math.round((totalRating / appReviews.value.length) * 10) / 10;
    
    // Update rating breakdown
    ratingBreakdown.value[newReview.value.rating] += 1;
  }
  
  // Reset form
  resetReviewForm();
  
  // Show success message
  alert('Thank you for your review! Your feedback helps other users make informed decisions.');
};

const resetReviewForm = () => {
  newReview.value = {
    name: '',
    company: '',
    rating: 0,
    comment: '',
    tags: []
  };
  newTagInput.value = '';
};

const setReviewRating = (rating: number) => {
  newReview.value.rating = rating;
};

const addReviewTag = () => {
  const tag = newTagInput.value.trim();
  if (tag && !newReview.value.tags.includes(tag)) {
    newReview.value.tags.push(tag);
    newTagInput.value = '';
  }
};

const removeReviewTag = (index: number) => {
  newReview.value.tags.splice(index, 1);
};

const addSuggestedTag = (tag: string) => {
  if (!newReview.value.tags.includes(tag)) {
    newReview.value.tags.push(tag);
  }
};

// Reply functions
const toggleReplyForm = (reviewId: string) => {
  if (activeReplyForm.value === reviewId) {
    cancelReply();
  } else {
    activeReplyForm.value = reviewId;
    // Reset reply form when opening
    replyForm.value = {
      name: '',
      comment: ''
    };
  }
};

const cancelReply = () => {
  activeReplyForm.value = null;
  replyForm.value = {
    name: '',
    comment: ''
  };
};

const handleReplySubmission = (reviewId: string) => {
  if (!isReplyFormValid.value) return;
  
  const newReplyData: Reply = {
    id: `reply-${Date.now()}`,
    name: replyForm.value.name,
    comment: replyForm.value.comment,
    date: 'Just now',
    avatar: '/assets/images/default-avatar.svg',
    isOwner: false
  };

  // Find the review and add the reply
  const reviewIndex = appReviews.value.findIndex(review => review.id === reviewId);
  if (reviewIndex !== -1) {
    if (!appReviews.value[reviewIndex].replies) {
      appReviews.value[reviewIndex].replies = [];
    }
    appReviews.value[reviewIndex].replies!.push(newReplyData);
  }
  
  // Close reply form
  cancelReply();
  
  // Show success message
  alert('Your reply has been posted successfully!');
};

// Helper functions for marketplace card consistency
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const getStarIcon = (position: number, rating: number): string => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  if (position <= Math.floor(roundedRating)) {
    return 'i-heroicons-star-solid';
  } else if (position === Math.ceil(roundedRating) && roundedRating % 1 !== 0) {
    return 'i-heroicons-star-solid'; // For half stars, still use solid but with different class
  } else {
    return 'i-heroicons-star';
  }
};

const getStarClass = (position: number, rating: number): string => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  if (position <= Math.floor(roundedRating)) {
    return 'star-filled';
  } else if (position === Math.ceil(roundedRating) && roundedRating % 1 !== 0) {
    return 'star-half';
  } else {
    return 'star-empty';
  }
};

// Navigation functions
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    activeSection.value = sectionId;
  }
};

// Scroll spy functionality
const handleScroll = () => {
  const sections = ['home', 'features', 'gallery', 'pricing', 'integrations', 'testimonials', 'certifications', 'reviews', 'enquiry', 'similar-apps'];
  const scrollPosition = window.scrollY + 150; // Offset for navbar
  for (const sectionId of sections) {
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.offsetTop;
      const height = element.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        activeSection.value = sectionId;
        break;
      }
    }
  }
};

onMounted(() => {
  fetchAppDetails(appId.value);
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
});
</script>

<style scoped>
.app-website-page {
  min-height: 100vh;
  background-color: white;
}

/* Global container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Website Sidebar Navigation */

/* Left Sidebar, Always Visible, Icon Only */
.website-sidebar.left-sidebar.always-visible.icon-only {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 80px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(15px);
  border-radius: 0 20px 20px 0;
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.08);
  border-right: 1px solid rgba(0,0,0,0.06);
  border-top: none;
  border-bottom: none;
  border-left: none;
  opacity: 1;
  transform: none;
  transition: none;
  max-height: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-website-content {
  margin-left: 80px;
  /* Push content to the right of narrower sidebar */
}

.sidebar-content {
  padding: 1rem 0.5rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-header-icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
}

.sidebar-nav {
  max-height: none;
  overflow: visible;
}

.sidebar-nav.open {
  max-height: none;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-links a {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 0.875rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  overflow: visible;
}

.nav-links a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: width 0.3s ease;
  z-index: -1;
  border-radius: 12px;
}

.nav-links a:hover {
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.1);
}

.nav-links a:hover::before {
  width: 4px;
}

.nav-links a.active {
  color: #2563eb;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.nav-links a.active::before {
  width: 4px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-links a.active .nav-icon {
  color: #3b82f6;
}

/* Tooltip styles */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1001;
  pointer-events: none;
}

.nav-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 4px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.9);
}

.nav-links a:hover .nav-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Hide text spans in icon-only mode */
.website-sidebar.icon-only .nav-links span:not(.nav-tooltip) {
  display: none;
}

/* Sidebar Animation on Scroll */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}


/* Mobile Sidebar Adjustments */
@media (max-width: 900px) {
  .website-sidebar.left-sidebar.always-visible.icon-only {
    position: fixed;
    left: 0;
    top: 0;
    width: 70px;
    border-radius: 0 16px 16px 0;
  }
  .app-website-content {
    margin-left: 70px;
  }
  .nav-icon {
    width: 18px;
    height: 18px;
  }
  .nav-header-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 600px) {
  .website-sidebar.left-sidebar.always-visible.icon-only {
    width: 100vw;
    height: 60px;
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 0;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    border-right: none;
  }
  .app-website-content {
    margin-left: 0;
    margin-top: 60px;
  }
  .sidebar-content {
    padding: 0.5rem;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .sidebar-header {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
    margin-right: 1rem;
  }
  .sidebar-nav {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .nav-links {
    flex-direction: row;
    gap: 0.5rem;
    justify-content: center;
    width: 100%;
  }
  .nav-links a {
    padding: 0.5rem;
  }
  .nav-tooltip {
    left: 50%;
    top: calc(100% + 8px);
    transform: translateX(-50%);
  }
  .nav-tooltip::before {
    right: auto;
    left: 50%;
    top: -4px;
    transform: translateX(-50%);
    border-right-color: transparent;
    border-bottom-color: rgba(0, 0, 0, 0.9);
  }
}

/* Website sections */
.website-section {
  padding: 5rem 0;
  position: relative;
}

/* Hero Section */
.hero-section {
  padding: 6rem 0 8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  position: relative;
  z-index: 2;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 500px;
}

/* Left side - Image */
.hero-image-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.hero-image-wrapper {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  background: white;
  padding: 20px;
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.3s ease;
}

.hero-image-wrapper:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.hero-image-wrapper:hover .hero-image {
  transform: scale(1.02);
}

/* Decorative elements around image */
.hero-image-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1));
  backdrop-filter: blur(10px);
}

.decoration-square {
  position: absolute;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1));
  backdrop-filter: blur(10px);
}

.decoration-1 {
  width: 80px;
  height: 80px;
  top: -20px;
  right: -20px;
  animation: float-decoration 6s ease-in-out infinite;
}

.decoration-2 {
  width: 60px;
  height: 60px;
  bottom: -15px;
  left: -15px;
  animation: float-decoration 8s ease-in-out infinite reverse;
}

.decoration-3 {
  width: 40px;
  height: 40px;
  top: 50%;
  right: -30px;
  animation: float-decoration 7s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes float-decoration {
  0%, 100% { 
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: translateY(-10px) scale(1.1);
    opacity: 0.8;
  }
}

/* Floating elements around image */

/* Right side - Content */
.hero-text-section {
  padding: 2rem 0;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.hero-headline {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subheadline {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

.hero-features .feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  font-weight: 500;
}

.hero-features .feature-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
  flex-shrink: 0;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-btn-primary,
.hero-btn-secondary {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-btn-primary {
  background: white;
  color: #1e293b;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.hero-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.hero-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.hero-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-content {
    gap: 3rem;
  }
  
  .hero-headline {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 0 6rem;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .hero-image-section {
    order: 2;
  }
  
  .hero-text-section {
    order: 1;
  }
  
  .hero-headline {
    font-size: 2.5rem;
  }
  
  .hero-subheadline {
    font-size: 1.125rem;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .hero-image-decorations {
    display: none;
  }
  
  .hero-image-wrapper {
    transform: none;
  }
  
  .hero-image-wrapper:hover {
    transform: none;
  }
}

@media (max-width: 640px) {
  .hero-headline {
    font-size: 2rem;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn-primary,
  .hero-btn-secondary {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}

.website-section:nth-child(even) {
  background-color: #f8fafc;
}

/* Home section */
.home-section {
  padding-top: 0;
}

/* Section headers */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

/* Hero Carousel Section */
.hero-carousel-section {
  padding: 0 !important;
  position: relative;
  height: 600px;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.carousel-slide.active {
  opacity: 1;
  transform: translateX(0);
}

.carousel-slide.prev {
  transform: translateX(-100%);
}

.carousel-slide.next {
  transform: translateX(100%);
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.carousel-bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.floating-element {
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element:nth-child(2) {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.floating-element:nth-child(3) {
  bottom: 30%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.carousel-content {
  position: relative;
  z-index: 2;
  color: white;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 3rem 2rem;
}

.carousel-text-content {
  text-align: left;
  max-width: 100%;
}

.carousel-visual-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(50px);
  opacity: 0;
  transition: all 1s ease-out;
}

.carousel-visual-content.animate-in {
  transform: translateX(0);
  opacity: 1;
  transition-delay: 0.8s;
}

.visual-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 400px;
}

.carousel-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.carousel-headline {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  transform: translateY(50px);
  opacity: 0;
  transition: all 0.8s ease-out;
}

.carousel-headline.animate-in {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.2s;
}

.carousel-subheadline {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.6;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s ease-out;
}

.carousel-subheadline.animate-in {
  transform: translateY(0);
  opacity: 0.95;
  transition-delay: 0.4s;
}

.carousel-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
}

.carousel-cta {
  display: flex;
  gap: 1rem;
  align-items: center;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s ease-out;
}

.carousel-cta.animate-in {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.6s;
}

/* Visual Content Styles */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.carousel-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.carousel-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-overlay:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  width: 40px;
  height: 40px;
  color: white;
}

.screenshot-showcase {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-frame {
  background: #1f2937;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 450px;
}

.device-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.device-buttons {
  display: flex;
  gap: 8px;
}

.device-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.device-btn.red { background: #ef4444; }
.device-btn.yellow { background: #f59e0b; }
.device-btn.green { background: #10b981; }

.screenshot-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  display: block;
}

.floating-ui-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ui-element {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: float-ui 4s ease-in-out infinite;
  opacity: 0;
  animation-fill-mode: forwards;
}

.ui-notification {
  top: 20%;
  right: -20px;
  animation-delay: 1s;
}

.ui-stats {
  bottom: 40%;
  right: 10px;
  animation-delay: 2s;
}

.ui-user {
  top: 60%;
  left: -30px;
  animation-delay: 3s;
}

@keyframes float-ui {
  0% { 
    opacity: 0;
    transform: translateY(20px);
  }
  20% { 
    opacity: 1;
    transform: translateY(0);
  }
  80% { 
    opacity: 1;
    transform: translateY(0);
  }
  100% { 
    opacity: 0;
    transform: translateY(-20px);
  }
}

.carousel-btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.carousel-btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.carousel-btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.carousel-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Carousel Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-prev {
  left: 2rem;
}

.carousel-next {
  right: 2rem;
}

.carousel-arrow svg {
  width: 24px;
  height: 24px;
}

/* Dot Navigation */
.carousel-nav {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.carousel-dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.carousel-dot:hover {
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.carousel-dot.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.dot-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  transform: scale(0);
  animation: none;
}

.carousel-dot.active .dot-progress {
  animation: dot-fill 5s linear forwards;
}

@keyframes dot-fill {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* Progress Bar */
.carousel-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 10;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
}

/* Slide Number */
.slide-number {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 600;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Gallery Section */
.gallery-section {
  background: #f8fafc;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
}

.gallery-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.gallery-media {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.gallery-screenshot,
.gallery-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-screenshot,
.gallery-item:hover .gallery-video {
  transform: scale(1.05);
}

.gallery-content {
  padding: 2rem;
}

.gallery-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.gallery-content p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.gallery-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.gallery-tag {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* New Gallery Tabs Styles */
.gallery-tabs-container {
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

.gallery-tab {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.gallery-tab:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.gallery-tab.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
}

.gallery-tab-content {
  min-height: 500px;
}

.gallery-tab-panel {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.gallery-panel-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.gallery-media-section {
  position: relative;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.gallery-media-container {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.gallery-media-image {
  width: 100%;
  height: auto;
  display: block;
}

.gallery-video-container {
  position: relative;
  width: 100%;
}

.gallery-media-video {
  width: 100%;
  height: auto;
  display: block;
}

.video-play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: none;
}

.video-play-overlay .play-icon {
  width: 32px;
  height: 32px;
  color: white;
  margin-left: 4px;
}

.gallery-description-section {
  padding: 3rem 2rem 2rem 2rem;
}

.gallery-feature-header h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.gallery-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.gallery-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 2.5rem;
}

.gallery-benefits {
  margin-bottom: 3rem;
}

.gallery-benefits h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
}

.benefit-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
  margin-top: 2px;
  flex-shrink: 0;
}

.gallery-enquiry-section {
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.gallery-enquiry-btn {
  width: 100%;
  max-width: 350px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.enquiry-icon {
  width: 20px;
  height: 20px;
}

.enquiry-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.modal-actions .btn {
  min-width: 100px;
}

/* Responsive Design for Gallery Tabs */
@media (max-width: 768px) {
  .gallery-panel-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .gallery-media-section {
    order: 1;
    padding: 1.5rem;
  }
  
  .gallery-description-section {
    order: 2;
    padding: 2rem 1.5rem;
  }
  
  .gallery-tabs {
    gap: 0.5rem;
    padding: 0 1rem;
  }
  
  .gallery-tab {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .gallery-enquiry-btn {
    font-size: 0.95rem;
    padding: 0.875rem 1.25rem;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1.5rem;
  }
}

/* Features Section */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 24px;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* Pricing Section */
.pricing-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 6rem 0;
}

.pricing-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.pricing-section .section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.pricing-section .section-header h2 {
  font-size: 3rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pricing-section .section-header p {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.pricing-cards-wrapper {
  position: relative;
}

.pricing-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-card.enhanced-card {
  background: white;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.pricing-card.enhanced-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.pricing-card.enhanced-card.featured {
  border: 2px solid #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 15px 50px rgba(59, 130, 246, 0.2);
  z-index: 2;
}

.pricing-card.enhanced-card.featured:hover {
  transform: scale(1.05) translateY(-8px);
  box-shadow: 0 25px 70px rgba(59, 130, 246, 0.25);
}

.featured-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.featured-badge .star-icon {
  width: 16px;
  height: 16px;
}

.plan-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.plan-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.plan-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.currency {
  font-size: 1.5rem;
  color: #6b7280;
  font-weight: 600;
}

.amount {
  font-size: 4rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.period {
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 500;
}

.custom-price {
  flex-direction: column;
  gap: 0.5rem;
}

.custom-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
}

.custom-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.plan-features-wrapper {
  flex: 1;
  margin-bottom: 2.5rem;
}

.features-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
  text-align: center;
}

.plan-features.enhanced-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item:hover {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
  margin: 0 -0.75rem;
}

.check-icon {
  color: #10b981;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-item span {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

.plan-footer {
  text-align: center;
}

.plan-cta.enhanced-cta {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.plan-cta.enhanced-cta.featured-cta {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.plan-cta.enhanced-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.plan-cta.enhanced-cta.featured-cta:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
}

.cta-icon {
  width: 20px;
  height: 20px;
}

.plan-guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.guarantee-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
}

/* Responsive Design for Pricing */
@media (max-width: 1200px) {
  .pricing-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  
  .pricing-card.enhanced-card.featured {
    transform: none;
  }
  
  .pricing-card.enhanced-card.featured:hover {
    transform: translateY(-8px);
  }
}

@media (max-width: 768px) {
  .pricing-section {
    padding: 4rem 0;
  }
  
  .pricing-container {
    padding: 0 1rem;
  }
  
  .pricing-section .section-header h2 {
    font-size: 2.5rem;
  }
  
  .pricing-cards-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .pricing-card.enhanced-card {
    padding: 2rem 1.5rem;
    min-height: auto;
  }
  
  .plan-cta.enhanced-cta.featured-cta {
    transform: none;
  }
  
  .plan-cta.enhanced-cta.featured-cta:hover {
    transform: translateY(-2px);
  }
  
  .amount {
    font-size: 3rem;
  }
}

/* Integrations Section */
.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.integration-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.integration-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.integration-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem auto;
  border-radius: 8px;
  object-fit: cover;
}

.integration-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.integration-card p {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Testimonials Section */
.testimonials-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
  margin-bottom: 2rem;
  position: relative;
}

.quote-icon {
  color: #2563eb;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #374151;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.author-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.author-info p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.testimonial-rating {
  display: flex;
  gap: 0.25rem;
}

.testimonial-rating .star-icon {
  color: #fbbf24;
  width: 16px;
  height: 16px;
}

/* Certifications Section */
.certifications-section {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.certifications-content {
  max-width: 1200px;
  margin: 0 auto;
}

.certifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.certification-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.certification-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.certification-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
}

.certification-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.certification-icon img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.certification-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 1rem;
}

.certification-description {
  color: #6b7280;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 1.5rem;
}

.certification-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.certification-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon.certified {
  color: #10b981;
  width: 20px;
  height: 20px;
}

.status-text {
  font-weight: 600;
  color: #10b981;
  font-size: 0.875rem;
}

.certification-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.date-icon {
  width: 16px;
  height: 16px;
}

.certification-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.cert-tag {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Security Features */
.security-features {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.security-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.security-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.security-header h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.security-feature {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.security-feature:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.security-feature .feature-icon {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  margin: 0 auto 1rem auto;
}

.security-feature h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.security-feature p {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Reviews Section */
.reviews-section {
  background: white;
}

.reviews-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Overall Rating Summary Row */
.reviews-summary-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: start;
}

.overall-rating-card {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.rating-breakdown-card {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.overall-rating {
  margin-bottom: 0;
}

.rating-number {
  font-size: 3rem;
  font-weight: 700;
  color: #111827;
  display: block;
  margin-bottom: 0.5rem;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.rating-stars .star-icon {
  color: #fbbf24;
  width: 20px;
  height: 20px;
}

.overall-rating p {
  color: #6b7280;
  margin: 0;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.rating-label {
  color: #374151;
  min-width: 60px;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #fbbf24;
  transition: width 0.3s ease;
}

.rating-count {
  color: #6b7280;
  min-width: 30px;
  text-align: right;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.reviewer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.reviewer-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.review-rating {
  display: flex;
  gap: 0.25rem;
}

.review-rating .star-icon {
  width: 14px;
  height: 14px;
}

.review-rating .star-icon.filled {
  color: #fbbf24;
}

.review-rating .star-icon.empty {
  color: #d1d5db;
}

.review-content p {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Enquiry Section */
.enquiry-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 3rem 0;
}

.enquiry-section .section-header {
  margin-bottom: 2rem;
}

.enquiry-section .section-header h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.enquiry-section .section-header h2,
.enquiry-section .section-header p {
  color: white;
}

.enquiry-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

.enquiry-form {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.75rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.enquiry-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.enquiry-form .form-group {
  margin-bottom: 1rem;
}

.enquiry-form .form-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 500;
  color: white;
  font-size: 0.875rem;
}

.enquiry-form .form-group input,
.enquiry-form .form-group textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.875rem;
}

.enquiry-form .form-group textarea {
  resize: vertical;
  min-height: 70px;
}

.enquiry-form .form-group input::placeholder,
.enquiry-form .form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.enquiry-form .form-group input:focus,
.enquiry-form .form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.enquiry-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.info-icon {
  width: 32px;
  height: 32px;
  color: #60a5fa;
  flex-shrink: 0;
}

.info-card h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.info-card p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Responsive Design for Enquiry Section */
@media (max-width: 768px) {
  .enquiry-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .enquiry-form {
    padding: 1.5rem;
  }
  
  .enquiry-form-row {
    grid-template-columns: 1fr;
  }
  
  .info-card {
    padding: 1rem;
  }
}

.info-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: white;
}

.info-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
  margin-top: 80px; /* Account for fixed navbar */
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .website-section {
    padding: 3rem 0;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  /* Sidebar responsive */
  .website-sidebar {
    width: 240px;
    top: 10px;
    right: 10px;
  }
  
  .sidebar-content {
    padding: 1rem;
  }
  
  .sidebar-header h3 {
    font-size: 1rem;
  }
  
  .nav-links a {
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }

  /* Carousel responsive */
  .hero-carousel-section {
    height: 500px;
  }

  .carousel-headline {
    font-size: 2.5rem;
    line-height: 1.2;
  }

  .carousel-subheadline {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .carousel-content {
    padding: 2rem 1rem;
    max-width: 100%;
  }

  .carousel-features {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .carousel-cta {
    flex-direction: column;
    gap: 1rem;
  }

  .carousel-arrow {
    width: 50px;
    height: 50px;
  }

  .carousel-prev {
    left: 1rem;
  }

  .carousel-next {
    right: 1rem;
  }

  .carousel-nav {
    bottom: 1rem;
    gap: 0.75rem;
  }

  .carousel-dot {
    width: 14px;
    height: 14px;
  }

  .slide-number {
    top: 1rem;
    right: 1rem;
    font-size: 0.875rem;
    padding: 0.375rem 0.875rem;
  }

  .carousel-badge {
    font-size: 0.75rem;
    padding: 0.375rem 1rem;
    margin-bottom: 1rem;
  }

  /* Gallery responsive */
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .gallery-item {
    margin: 0 1rem;
  }

  .gallery-media {
    height: 200px;
  }

  .gallery-content {
    padding: 1.5rem;
  }

  /* Testimonials responsive */
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .testimonial-card {
    padding: 2rem;
  }

  .testimonial-author {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  /* Reviews responsive */
  .reviews-summary-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .overall-rating-card,
  .rating-breakdown-card {
    padding: 1.5rem;
  }

  .review-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .website-section {
    padding: 3rem 0;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .section-header p {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .pricing-cards {
    grid-template-columns: 1fr;
  }

  .pricing-card.featured {
    transform: none;
  }

  .integrations-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .enquiry-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .enquiry-form {
    padding: 2rem;
  }
  
  /* Certifications Responsive */
  .certifications-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .security-grid {
    grid-template-columns: 1fr;
  }
  
  .compliance-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .compliance-actions .btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .website-section {
    padding: 2rem 0;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  /* Sidebar mobile */
  .website-sidebar {
    width: calc(100vw - 20px);
    max-width: 320px;
    top: 10px;
    right: 10px;
  }
  
  .sidebar-nav.open {
    max-height: 400px;
  }

  /* Carousel mobile */
  .hero-carousel-section {
    height: 450px;
  }

  .carousel-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
    padding: 1.5rem 1rem;
  }
  
  .carousel-text-content {
    order: 2;
  }
  
  .carousel-visual-content {
    order: 1;
    height: 250px;
  }

  .carousel-headline {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .carousel-subheadline {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .carousel-features {
    font-size: 0.875rem;
  }
  
  .device-frame {
    max-width: 300px;
    padding: 16px;
  }
  
  .ui-element {
    display: none;
  }

  .carousel-arrow {
    width: 45px;
    height: 45px;
  }

  .carousel-arrow svg {
    width: 20px;
    height: 20px;
  }

  .carousel-prev {
    left: 0.5rem;
  }

  .carousel-next {
    right: 0.5rem;
  }

  .carousel-dot {
    width: 12px;
    height: 12px;
  }

  .slide-number {
    display: none;
  }

  .feature-card,
  .pricing-card,
  .integration-card {
    padding: 1.5rem;
  }

  .enquiry-form {
    padding: 1.5rem;
  }

  .plan-price .amount {
    font-size: 2.5rem;
  }
}

/* Tablet Responsive */
@media (max-width: 768px) {
  .carousel-content {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
  
  .carousel-text-content {
    order: 2;
  }
  
  .carousel-visual-content {
    order: 1;
    height: 300px;
  }
  
  .carousel-headline {
    font-size: 2.5rem;
  }
  
  .device-frame {
    max-width: 350px;
  }
  
  .ui-element {
    display: none;
  }
}

/* Large Mobile Responsive */
@media (max-width: 640px) {
  .carousel-visual-content {
    height: 280px;
  }
  
  .device-frame {
    max-width: 320px;
    padding: 18px;
  }
  
  .carousel-headline {
    font-size: 2.2rem;
  }
}

/* Similar Applications Section */
.similar-apps-section {
  background-color: #f8fafc;
  padding: 5rem 0;
}

.similar-apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

/* Status Badges */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.5rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.featured {
  background-color: #4ECDC4;
  color: #fff;
}

.status-badge.trending {
  background-color: #FF6B6B;
  color: #fff;
}

.status-badge.recent {
  background-color: #FFE66D;
  color: #2C3E50;
}

/* App Header */
.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-logo {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* App Categories */
.app-categories {
  margin-bottom: 1rem;
}

.app-provider {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.app-tag-more {
  background: #e5e7eb;
  color: #6b7280;
}

/* App Description */
.app-description {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* App Meta */
.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.app-pricing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.free-tag {
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 600;
}

.trial-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 600;
}

.price-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 0;
  font-size: 0.75rem;
  font-weight: 600;
}

.period {
  font-size: 0.6rem;
  color: #6b7280;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.stars svg {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.stars svg.star-filled {
  color: #fbbf24;
}

.stars svg.star-half {
  color: #fbbf24;
}

.stars svg.star-empty {
  color: #d1d5db;
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.rating-count {
  font-size: 0.75rem;
  color: #6b7280;
}

/* App Footer */
.app-footer {
  margin-top: auto;
}

.app-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn.full-width {
  width: 100%;
}

.similar-apps-footer {
  text-align: center;
  margin-top: 2rem;
}

.btn-secondary {
  background: #6b7280;
  color: #fff;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Responsive Design for Similar Apps */
@media (max-width: 768px) {
  .similar-apps-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .app-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .app-rating {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .app-header {
    gap: 0.75rem;
  }
  
  .app-logo {
    width: 48px;
    height: 48px;
  }
  
  .app-name {
    font-size: 1.1rem;
  }
}

.similar-app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
}

.similar-app-card:hover::before {
  opacity: 1;
}

.similar-app-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
}

.status-badge.featured {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.status-badge.trending {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.status-badge.recent {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.similar-app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.similar-app-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.similar-app-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-app-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.similar-app-meta {
  margin-bottom: 1rem;
}

.similar-app-provider {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.similar-app-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
}

.rating-stars svg {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.rating-stars svg.filled {
  color: #fbbf24;
}

.rating-number {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.review-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.similar-app-description {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.similar-app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.app-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.similar-app-pricing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.price-info {
  flex: 1;
}

.price {
  font-weight: 700;
  font-size: 1.125rem;
}

.price.free {
  color: #10b981;
}

.price.trial {
  color: #8b5cf6;
}

.price.paid {
  color: #111827;
}

.period {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.similar-apps-footer {
  text-align: center;
  margin-top: 2rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Reviews Section Styles */
.reviews-section {
  background: #f8fafc;
  padding: 4rem 0;
}

.reviews-summary-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.overall-rating-card,
.rating-breakdown-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.overall-rating {
  text-align: center;
}

.rating-number {
  font-size: 3rem;
  font-weight: 700;
  color: #111827;
  display: block;
  margin-bottom: 0.5rem;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.rating-stars .star-icon {
  width: 24px;
  height: 24px;
  color: #fbbf24;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-label {
  min-width: 70px;
  font-size: 0.875rem;
  color: #6b7280;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #fbbf24;
  transition: width 0.3s ease;
}

.rating-count {
  min-width: 30px;
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Write Review Section */
.write-review-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.write-review-header {
  margin-bottom: 1.25rem;
}

.write-review-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.write-review-header p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.star-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.125rem;
  transition: transform 0.2s ease;
}

.star-button:hover {
  transform: scale(1.05);
}

.star-button svg {
  width: 24px;
  height: 24px;
  color: #d1d5db;
  transition: color 0.2s ease;
}

.star-button.active svg,
.star-button:hover svg {
  color: #fbbf24;
}

.rating-text {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.tags-input-container {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem;
  min-height: 70px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.selected-tag {
  background: #3b82f6;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.remove-tag {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-tag:hover {
  background: rgba(255, 255, 255, 0.2);
}

.remove-tag svg {
  width: 10px;
  height: 10px;
}

.tags-input-container input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
  margin-top: 0.375rem;
}

.suggested-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-right: 0.375rem;
}

.suggested-tag {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggested-tag:hover:not(:disabled) {
  background: #e5e7eb;
}

.suggested-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-form-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-info {
  flex: 1;
}

.reviewer-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.reviewer-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.review-rating {
  display: flex;
  gap: 0.125rem;
}

.review-rating .star-icon {
  width: 16px;
  height: 16px;
}

.review-rating .star-icon.filled {
  color: #fbbf24;
}

.review-rating .star-icon.empty {
  color: #d1d5db;
}

.review-actions {
  display: flex;
  gap: 0.5rem;
}

.reply-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reply-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.reply-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.review-content p {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
}

/* Reply Form */
.reply-form-container {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.reply-form-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
}

.reply-form-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.reply-form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-form-actions {
  display: flex;
  gap: 0.75rem;
}

/* Replies Section */
.replies-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.replies-header {
  margin-bottom: 1rem;
}

.replies-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-left: 1rem;
  border-left: 3px solid #e5e7eb;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.reply-info h6 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.reply-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.owner-badge {
  background: #10b981;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.reply-content p {
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.full-width {
  width: 100%;
}

/* Form Styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Pricing Section Styles */
.pricing-section {
  background: white;
  padding: 4rem 0;
}

.pricing-cards {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: stretch;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 0 1rem;
}

.pricing-card {
  flex: 1;
  min-width: 280px;
  max-width: 320px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: auto;
}

.pricing-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
  transform: translateY(-4px);
}

.pricing-card.featured {
  border-color: #3b82f6;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);
  transform: scale(1.05);
  z-index: 1;
}

.pricing-card.featured::before {
  content: 'Most Popular';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.plan-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.plan-price .currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
}

.plan-price .amount {
  font-size: 3rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.plan-price .period {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.plan-price.custom-price {
  flex-direction: column;
  gap: 0.5rem;
}

.custom-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.custom-email {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-decoration: underline;
}

.plan-features {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  margin-bottom: 2rem;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.plan-features li:last-child {
  border-bottom: none;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
  flex-shrink: 0;
}

.plan-cta {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #3b82f6;
  color: white;
  margin-top: auto;
}

.plan-cta:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.pricing-card.featured .plan-cta {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.pricing-card.featured .plan-cta:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .pricing-cards {
    gap: 1rem;
  }
  
  .pricing-card {
    min-width: 260px;
    max-width: 300px;
  }
}

@media (max-width: 1024px) {
  .pricing-cards {
    gap: 0.75rem;
    padding: 0 0.5rem;
  }
  
  .pricing-card {
    min-width: 240px;
    max-width: 280px;
    padding: 1.5rem;
  }
  
  .pricing-card.featured {
    transform: scale(1.02);
  }
}

@media (max-width: 900px) {
  .pricing-cards {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 0 1rem;
  }
  
  .pricing-card {
    scroll-snap-align: center;
    min-width: 260px;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .reviews-summary-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .review-form-row {
    grid-template-columns: 1fr;
  }
  
  .review-form-actions {
    flex-direction: column;
  }
  
  .reply-form-actions {
    flex-direction: column;
  }
  
  .reply-card {
    margin-left: 0;
  }
  
  .pricing-cards {
    gap: 1rem;
  }
  
  .pricing-card {
    min-width: 280px;
  }
}

@media (max-width: 640px) {
  .pricing-cards {
    padding: 0 0.5rem;
  }
  
  .pricing-card {
    min-width: 260px;
    padding: 1.25rem;
  }
  
  .plan-header h3 {
    font-size: 1.25rem;
  }
  
  .plan-price .amount {
    font-size: 2.5rem;
  }
  
  .custom-text {
    font-size: 1.25rem;
  }
}

/* Pricing Section - Table Style */
.pricing-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.pricing-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header p {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Pricing Table */
.pricing-table-wrapper {
  position: relative;
  overflow-x: auto;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: white;
  margin-bottom: 3rem;
  width: 100%;
}

.pricing-table-container {
  min-width: 100%;
  width: 100%;
}

.pricing-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  table-layout: fixed;
}

/* Table Header */
.pricing-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.pricing-table th {
  padding: 0;
  text-align: center;
  border: none;
  position: relative;
  border-right: 1px solid #cbd5e1;
}

.pricing-table th:last-child {
  border-right: none;
}

.feature-column {
  width: 25%;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1.5rem;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid #475569;
}

.plan-column {
  width: 18.75%;
  position: relative;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-right: 1px solid #cbd5e1;
}

.plan-column.featured-plan {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #3b82f6;
  border-bottom: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.plan-header-content {
  padding: 1.5rem 1rem;
  text-align: center;
  color: #1e293b;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  width: 100%;
  box-sizing: border-box;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.plan-column.featured-plan .plan-name {
  color: #1d4ed8;
}

.plan-description {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 1rem;
  line-height: 1.3;
  color: #64748b;
}

.plan-column.featured-plan .plan-description {
  color: #475569;
}

.plan-price {
  margin-bottom: 1rem;
  color: #1e293b;
}

.plan-column.featured-plan .plan-price {
  color: #1d4ed8;
}

.plan-price .currency {
  font-size: 1rem;
  font-weight: 500;
  vertical-align: top;
}

.plan-price .amount {
  font-size: 1.75rem;
  font-weight: 700;
}

.plan-price .period {
  font-size: 0.9rem;
  opacity: 0.8;
}

.custom-price .custom-text {
  font-size: 1.5rem;
  font-weight: 700;
  display: block;
  text-align: center;
}

.custom-price .custom-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
  display: block;
  margin-top: 0.25rem;
  text-align: center;
}

.table-cta {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.table-cta:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.featured-cta {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2);
}

.featured-cta:hover {
  background: #1e40af;
  border-color: #1e40af;
  box-shadow: 0 4px 8px rgba(30, 64, 175, 0.3);
}

.feature-name {
  padding: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

/* Table Body */
.pricing-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
}

.pricing-table tbody tr:last-child {
  border-bottom: none;
}

.pricing-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.feature-row:hover {
  background: #f1f5f9;
}

.plan-value {
  padding: 1.5rem;
  text-align: center;
  font-weight: 500;
  color: #475569;
  border-right: 1px solid #e2e8f0;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.plan-value:last-child {
  border-right: none;
}

.featured-value {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  color: #1e40af;
  font-weight: 600;
  position: relative;
}

/* Pricing Footer */
.pricing-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 2rem;
}

.guarantee-info {
  margin-bottom: 1rem;
  color: #059669;
  font-weight: 500;
}

.contact-info {
  color: #64748b;
}

.contact-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.contact-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Responsive Design for Pricing Table */
@media (max-width: 1200px) {
  .pricing-table-wrapper {
    overflow-x: auto;
  }
  
  .pricing-table-container {
    min-width: 900px;
  }
  
  .feature-column {
    width: 200px;
  }
  
  .plan-column {
    width: 175px;
  }
  
  .plan-column.featured-plan {
    transform: none;
  }
}

@media (max-width: 768px) {
  .pricing-container {
    padding: 0 1rem;
  }
  
  .section-header h2 {
    font-size: 2.5rem;
  }
  
  .section-header p {
    font-size: 1.1rem;
  }
  
  .pricing-table-container {
    min-width: 700px;
  }
  
  .feature-column {
    width: 160px;
    padding: 1rem;
    font-size: 1rem;
  }
  
  .plan-column {
    width: 135px;
  }
  
  .plan-header-content {
    padding: 1rem 0.5rem;
    min-height: 180px;
  }
  
  .plan-name {
    font-size: 1.1rem;
  }
  
  .plan-price .amount {
    font-size: 1.5rem;
  }
  
  .feature-name,
  .plan-value {
    padding: 1rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 640px) {
  .pricing-table-container {
    min-width: 600px;
  }
  
  .feature-column {
    width: 140px;
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  .plan-column {
    width: 115px;
  }
  
  .plan-header-content {
    padding: 0.75rem 0.5rem;
    min-height: 160px;
  }
  
  .plan-name {
    font-size: 1rem;
  }
  
  .plan-description {
    font-size: 0.75rem;
  }
  
  .plan-price .amount {
    font-size: 1.25rem;
  }
  
  .table-cta {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .feature-name,
  .plan-value {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
