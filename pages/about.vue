<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">The Global Software Marketplace</h1>
          <p class="hero-subtitle">Built to help businesses discover and compare the best software solutions worldwide, SaaSWorld is the most comprehensive marketplace for enterprise and SaaS applications.</p>
          <div class="cta-section">
            <NuxtLink to="/marketplace" class="btn btn-primary">Explore Marketplace</NuxtLink>
            <NuxtLink to="/list-product" class="btn btn-secondary">List Your Software</NuxtLink>
          </div>
        </div>
        
        <!-- Trust Logos -->
        <div class="trust-logos">
          <p class="trust-text">Trusted by businesses worldwide</p>
          <div class="logos-grid">
            <div class="logo-item">Microsoft</div>
            <div class="logo-item">Google</div>
            <div class="logo-item">Amazon</div>
            <div class="logo-item">Salesforce</div>
            <div class="logo-item">Shopify</div>
            <div class="logo-item">Stripe</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="features-section section-animate">
      <div class="container">
        <!-- Feature 1: Discover -->
        <div class="feature-block card-animate">
          <h2>Discover, discover, discover</h2>
          <p>SaaSWorld lets you browse through thousands of vetted software solutions with intelligent filtering and AI-powered recommendations.</p>
        </div>

        <!-- Feature 2: Compare -->
        <div class="feature-block card-animate">
          <h2>Compare like never before</h2>
          <p>Get detailed side-by-side comparisons with pricing, features, and real user reviews. Make informed decisions with comprehensive data.</p>
        </div>

        <!-- Feature 3: Connect -->
        <div class="feature-block card-animate">
          <h2>Connect with confidence</h2>
          <p>Direct integration guides, vendor verification, and seamless onboarding support to get your business up and running faster.</p>
        </div>
      </div>
    </section>

    <!-- Find Software Faster Section -->
    <!-- Find Software Faster Section -->
    <section class="value-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>Find software faster</h2>
          <p>Streamline your software discovery process with our intelligent tools and comprehensive marketplace</p>
        </div>
        
        <div class="benefits-grid">
          <div class="benefit-card card-animate">
            <h4>Smart Filtering</h4>
            <p>Advanced filters help you narrow down options based on your specific industry, company size, and requirements</p>
          </div>
          <div class="benefit-card card-animate">
            <h4>Verified Reviews</h4>
            <p>Real user reviews and ratings from businesses just like yours to help you make informed decisions</p>
          </div>
          <div class="benefit-card card-animate">
            <h4>Expert Support</h4>
            <p>Our team of software experts provides personalized recommendations and implementation guidance</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision Section -->
    <section class="mission-vision-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>Our Purpose</h2>
          <p>The mission and vision that drives everything we do</p>
        </div>
        <div class="mission-vision-grid">
          <div class="mission-card card-animate">
            <h3>Our Mission</h3>
            <p>{{ companyPurpose.mission }}</p>
          </div>
          <div class="vision-card card-animate">
            <h3>Our Vision</h3>
            <p>{{ companyPurpose.vision }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values Section -->
    <section class="values-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>Our Core Values</h2>
          <p>The principles that guide everything we do at SaaSWorld</p>
        </div>
        <div class="values-grid">
          <div v-for="value in coreValues" :key="value.title" class="value-card card-animate">
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>How It Works</h2>
          <p>Discover how SaaSWorld streamlines your software discovery and procurement process</p>
        </div>
        
        <div class="workflow-steps">
          <div v-for="step in workflowSteps" :key="step.step" class="workflow-step card-animate">
            <div class="step-header">
              <div class="step-number">{{ step.step }}</div>
              <h3>{{ step.title }}</h3>
            </div>
            <p>{{ step.description }}</p>
            <div class="step-features">
              <span v-for="feature in step.features" :key="feature" class="feature-tag">{{ feature }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partner with Us Section -->
    <section class="partnership-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>Partner with Us</h2>
          <p>Join our mission to connect businesses with the software that transforms their future</p>
        </div>

        <!-- Partnership Benefits -->
        <div class="partnership-cards">
          <div v-for="benefit in sponsorToUsSection.sponsorshipBenefits" :key="benefit.title" class="partnership-card card-animate">
            <h3>{{ benefit.title }}</h3>
            <div class="card-metric">{{ benefit.metrics }}</div>
          </div>
        </div>

        <!-- Partnership CTA -->
        <div class="partnership-cta">
          <h3>Ready to Make an Impact?</h3>
          <p>Let's build something extraordinary together</p>
          <div class="cta-buttons">
            <button class="btn btn-primary">Start Partnership</button>
            <button class="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </section>

    <!-- List Your SaaS Application - Benefits Section -->
    <section class="listing-benefits-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>{{ listingBenefitsSection.title }}</h2>
          <p>{{ listingBenefitsSection.subtitle }}</p>
        </div>

        <div class="listing-benefits-grid">
          <div v-for="benefit in listingBenefitsSection.benefits" :key="benefit.title" class="listing-benefit-card card-animate">
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Listing Process Section -->
    <section class="listing-process-section section-animate">
      <div class="container">
        <div class="section-header">
          <h2>{{ listingProcessSection.title }}</h2>
          <p>{{ listingProcessSection.subtitle }}</p>
        </div>

        <div class="listing-process-steps">
          <div v-for="step in listingProcessSection.steps" :key="step.step" class="listing-step card-animate">
            <div class="listing-step-header">
              <div class="listing-step-number">{{ step.step }}</div>
              <h3>{{ step.title }}</h3>
            </div>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Listing CTA Section -->
    <section class="listing-cta-section section-animate">
      <div class="container">
        <div class="cta-content">
          <h2>{{ listingCtaSection.title }}</h2>
          <p>{{ listingCtaSection.subtitle }}</p>
          <div class="cta-actions">
            <NuxtLink :to="listingCtaSection.primaryAction.link" class="btn btn-primary btn-large">
              {{ listingCtaSection.primaryAction.text }}
            </NuxtLink>
            <NuxtLink :to="listingCtaSection.secondaryAction.link" class="btn btn-secondary">
              {{ listingCtaSection.secondaryAction.text }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section - Cursor Style -->
    <section class="testimonials-section">
      <div class="container">
        <h2>Loved by business leaders worldwide</h2>
        <p class="testimonials-subtitle">Companies of all sizes trust SaaSWorld to find their perfect software solutions.</p>
        
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"SaaSWorld completely transformed how we discover and evaluate business software. The comparison features and vendor insights saved us months of research time."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar" data-initials="SC">
              </div>
              <div class="author-info">
                <div class="author-name">Sarah Chen</div>
                <div class="author-title">CTO, TechStart Inc</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"The vendor verification and integration guides on SaaSWorld are incredible. We found the perfect CRM solution and had it running in just days, not weeks."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar" data-initials="MJ">
              </div>
              <div class="author-info">
                <div class="author-name">Marcus Johnson</div>
                <div class="author-title">VP Engineering, DataFlow</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"I went from spending weeks researching software to finding exactly what we needed in hours. SaaSWorld's AI recommendations are spot-on for our industry."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar" data-initials="PP">
              </div>
              <div class="author-info">
                <div class="author-name">Priya Patel</div>
                <div class="author-title">Head of Operations, GrowthCo</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"The most comprehensive software marketplace I've ever used. Real user reviews, transparent pricing, and direct vendor contact - everything in one place."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar" data-initials="AR">
              </div>
              <div class="author-info">
                <div class="author-name">Alex Rodriguez</div>
                <div class="author-title">Founder, InnovateLab</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"SaaSWorld's global reach helped us find specialized software solutions we never would have discovered otherwise. Truly a game-changer for international businesses."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar" data-initials="EV">
              </div>
              <div class="author-info">
                <div class="author-name">Elena Volkov</div>
                <div class="author-title">Director of IT, GlobalTech</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-content">
              <p>"After many recommendations from my team, I finally tried SaaSWorld and... wow! The most intuitive software discovery platform I've used. There's no going back."</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar" data-initials="JK">
              </div>
              <div class="author-info">
                <div class="author-name">James Kim</div>
                <div class="author-title">CEO, ScaleUp Ventures</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
// SEO and Meta
useHead({
  title: 'About SaaSWorld - Empowering Businesses Through Smart SaaS Solutions',
  meta: [
    { name: 'description', content: 'Learn about SaaSWorld\'s mission to democratize access to powerful business software through our comprehensive SaaS marketplace connecting businesses with the right tools.' },
    { name: 'keywords', content: 'about saasworld, saas marketplace, business software, company mission, founders, investors' }
  ]
})

// Smooth scroll and animations
onMounted(() => {
  // Add smooth scroll behavior to the document
  document.documentElement.style.scrollBehavior = 'smooth'
  
  // Set up intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  }, observerOptions)
  
  // Observe all sections and cards
  const elementsToAnimate = document.querySelectorAll('.section-animate, .card-animate, .feature-block, .core-value-card, .mission-vision-card, .partnership-card')
  elementsToAnimate.forEach((el) => observer.observe(el))
  
  // Add subtle parallax effect to hero background
  const handleScroll = () => {
    const scrolled = window.pageYOffset
    const heroSection = document.querySelector('.hero-section') as HTMLElement
    if (heroSection && scrolled < window.innerHeight) {
      heroSection.style.transform = `translateY(${scrolled * 0.5}px)`
    }
  }
  
  // Add scroll listener for parallax
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const href = link.getAttribute('href')
      if (href) {
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    })
  })
  
  // Cleanup
  onBeforeUnmount(() => {
    observer.disconnect()
    window.removeEventListener('scroll', handleScroll)
  })
})

// Data
const heroData = {
  title: "Empowering Businesses Through Smart SaaS Solutions",
  subtitle: "We're building the world's most comprehensive SaaS marketplace, connecting businesses with the tools they need to thrive in the digital age.",
  foundedYear: "2020"
}

const companyPurpose = {
  mission: "To democratize access to powerful business software by creating a transparent, user-friendly marketplace where companies of all sizes can discover, evaluate, and implement the perfect SaaS solutions for their needs.",
  vision: "A world where every business has access to the best software tools, regardless of their size, budget, or technical expertise.",
  values: "Innovation, Transparency, Accessibility, Trust"
}

const coreValues = [
  {
    title: "Transparency",
    description: "We believe in honest reviews, clear pricing, and transparent business practices that help our users make informed decisions."
  },
  {
    title: "Innovation", 
    description: "We continuously evolve our platform with cutting-edge features that anticipate and meet the changing needs of modern businesses."
  },
  {
    title: "Accessibility",
    description: "Great software shouldn't be limited to large enterprises. We make powerful SaaS tools accessible to businesses of all sizes."
  },
  {
    title: "Trust",
    description: "We earn trust through rigorous vetting processes, reliable recommendations, and unwavering commitment to our users' success."
  }
]

const workflowSteps = [
  {
    step: 1,
    title: "Discover & Browse",
    description: "Browse our comprehensive marketplace of vetted software solutions with advanced filtering and AI-powered recommendations tailored to your business needs.",
    features: ["Smart Filtering", "AI Recommendations", "Category Browse"]
  },
  {
    step: 2,
    title: "Compare & Evaluate",
    description: "Get detailed comparisons, pricing information, and authentic user reviews to make informed decisions about the right software for your business.",
    features: ["Side-by-side Comparison", "Real User Reviews", "Pricing Transparency"]
  },
  {
    step: 3,
    title: "Connect & Trial",
    description: "Connect directly with software vendors, access free trials, and get personalized demos to test solutions before making a commitment.",
    features: ["Direct Vendor Contact", "Free Trials", "Live Demos"]
  },
  {
    step: 4,
    title: "Implement & Support",
    description: "Get implementation guidance, onboarding support, and ongoing assistance to ensure successful software adoption and maximize your ROI.",
    features: ["Implementation Guides", "Onboarding Support", "Success Management"]
  }
]

const sponsorToUsSection = {
  title: "Partner with Us",
  subtitle: "Join our mission to connect businesses with the software that transforms their future",
  overview: {
    audienceSize: "50,000+",
    monthlyPageViews: "2.5M+",
    averageSessionTime: "8.5 minutes"
  },
  sponsorshipBenefits: [
    {
      title: "High-Intent Audience",
      metrics: "85% decision-makers"
    },
    {
      title: "Quality Engagement",
      metrics: "8.5 min average session"
    },
    {
      title: "Trusted Platform",
      metrics: "4.8/5 trust rating"
    },
    {
      title: "Measurable Impact",
      metrics: "Full attribution tracking"
    },
    {
      title: "Global Reach",
      metrics: "180+ countries"
    },
    {
      title: "Expert Support",
      metrics: "Dedicated success team"
    }
  ]
}

const listingBenefitsSection = {
  title: "List Your SaaS Application",
  subtitle: "Join thousands of software providers reaching new customers through our marketplace",
  benefits: [
    {
      title: "Increase Visibility",
      description: "Get discovered by 50,000+ active users searching for solutions like yours",
    },
    {
      title: "Quality Leads",
      description: "Connect with pre-qualified prospects actively looking for your type of software"
    },
    {
      title: "Detailed Analytics", 
      description: "Track performance with comprehensive insights into views, clicks, and conversions"
    },
    {
      title: "Marketing Support",
      description: "Benefit from our marketing efforts and promotional campaigns"
    }
  ]
}

const listingProcessSection = {
  title: "How to List Your Application",
  subtitle: "Simple steps to get your SaaS application featured on our marketplace",
  steps: [
    { step: 1, title: "Submit Application", description: "Fill out our comprehensive application form with your product details" },
    { step: 2, title: "Review Process", description: "Our team reviews your application within 3-5 business days" },
    { step: 3, title: "Profile Setup", description: "Create your optimized listing with screenshots, videos, and descriptions" },
    { step: 4, title: "Go Live", description: "Your application goes live and starts receiving qualified leads" }
  ]
}

const listingCtaSection = {
  title: "Ready to List Your Application?",
  subtitle: "Join our marketplace and start reaching new customers today. Get started in minutes.",
  primaryAction: {
    text: "List Your App Now",
    link: "/list-product"
  },
  secondaryAction: {
    text: "View Pricing",
    link: "/pricing"
  }
}
</script>

<style scoped>
/* Smooth Scroll and Global Animations */
html {
  scroll-behavior: smooth;
}

/* Animation Base Classes */
.section-animate,
.card-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-animate.animate-in,
.card-animate.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered Animation for Cards */
.card-animate:nth-child(1) { transition-delay: 0.1s; }
.card-animate:nth-child(2) { transition-delay: 0.2s; }
.card-animate:nth-child(3) { transition-delay: 0.3s; }
.card-animate:nth-child(4) { transition-delay: 0.4s; }
.card-animate:nth-child(5) { transition-delay: 0.5s; }
.card-animate:nth-child(6) { transition-delay: 0.6s; }

/* Hover Animations */
.benefit-card,
.value-card,
.partnership-card,
.mission-card,
.vision-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.benefit-card:hover,
.value-card:hover,
.partnership-card:hover,
.mission-card:hover,
.vision-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

/* Button Animations */
.btn {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* Feature Block Animations */
.feature-block {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature-block:hover {
  transform: translateX(10px);
}

.feature-block h2 {
  transition: color 0.3s ease;
}

.feature-block:hover h2 {
  color: #3b82f6;
}

/* Logo Grid Animation */
.logos-grid {
  animation: subtle-pulse 3s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.logo-item {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.logo-item:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* Trust Logos Fade In */
.trust-logos {
  animation: fadeInUp 1s ease-out 0.5s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Headers */
.section-header h2 {
  transition: all 0.3s ease;
}

.section-animate.animate-in .section-header h2 {
  animation: slideInFromLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Subtle Micro-interactions */
.section-header {
  transition: all 0.3s ease;
}

.section-header:hover {
  transform: translateY(-2px);
}

/* Enhanced Card Interactions */
.benefit-card,
.value-card,
.partnership-card,
.mission-card,
.vision-card {
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.benefit-card:hover,
.value-card:hover,
.partnership-card:hover,
.mission-card:hover,
.vision-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

/* Text Selection Styling */
::selection {
  background: rgba(59, 130, 246, 0.1);
  color: #1e293b;
}

/* Scroll Progress Indicator */
.about-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  z-index: 1000;
  animation: scroll-progress linear;
  animation-timeline: scroll();
}

/* Focus States for Accessibility */
.btn:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 8px;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .section-animate,
  .card-animate,
  .btn,
  .feature-block {
    animation: none;
    transition: none;
  }
  
  .hero-section::before {
    animation: none;
  }
  
  .logos-grid {
    animation: none;
  }
}

.about-page {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Hero Section - Cursor Style */
.hero-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #000;
  padding: 6rem 0 4rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
  animation: subtle-bg-movement 20s ease-in-out infinite;
}

@keyframes subtle-bg-movement {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-10px) translateY(-5px); }
  50% { transform: translateX(5px) translateY(10px); }
  75% { transform: translateX(10px) translateY(-10px); }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 4rem;
  font-weight: 600;
  margin-bottom: 2rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #000;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-subtitle {
  font-size: 1.375rem;
  margin-bottom: 3rem;
  color: #4b5563;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
  font-weight: 400;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.cta-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 4rem;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 1rem;
}

.btn-primary {
  background: #000;
  color: white;
  border-color: #000;
}

.btn-primary:hover {
  background: #1f2937;
  border-color: #1f2937;
}

.btn-secondary {
  background: white;
  color: #000;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Trust Logos */
.trust-logos {
  padding-top: 3rem;
  border-top: 1px solid #e5e7eb;
}

.trust-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

.logos-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.logo-item {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6b7280;
  opacity: 0.8;
}

/* Features Section - Cursor Style */
.features-section {
  padding: 6rem 0;
  background: white;
}

.feature-block {
  padding: 4rem 0;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  border-bottom: 1px solid #f3f4f6;
}

.feature-block:last-child {
  border-bottom: none;
}

.feature-block h2 {
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #000;
}

.feature-block p {
  font-size: 1.25rem;
  color: #4b5563;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Value Section - Enhanced */
.value-section {
  padding: 8rem 0;
  background: white;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.value-section .section-header {
  margin-bottom: 4rem;
}

.value-section h2 {
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #000;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.value-section .section-header p {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto 3rem;
}

.benefit-card {
  background: white;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: left;
}

.benefit-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #000;
}

.benefit-card p {
  color: #6b7280;
  line-height: 1.5;
  font-size: 0.875rem;
}

.section-cta {
  text-align: center;
  margin-top: 2rem;
}

.link-with-arrow {
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.link-with-arrow:hover {
  color: #2563eb;
}

.link-with-arrow::after {
  content: '→';
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
}

.link-with-arrow:hover::after {
  transform: translateX(2px);
}

.link-with-arrow {
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 5rem;
  font-size: 1.125rem;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.link-with-arrow:hover {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-1px);
}

.link-with-arrow::after {
  content: '→';
  margin-left: 0.5rem;
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.link-with-arrow:hover::after {
  transform: translateX(2px);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.benefit-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  text-align: left;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.benefit-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.benefit-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.benefit-card:hover::before {
  transform: scaleX(1);
}

.benefit-card h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
  line-height: 1.3;
}

.benefit-card p {
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

/* Testimonials Section - Cursor Style */
.testimonials-section {
  padding: 6rem 0;
  background: white;
}

.testimonials-section h2 {
  font-size: 3rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  color: #000;
  letter-spacing: -0.02em;
}

.testimonials-subtitle {
  text-align: center;
  font-size: 1.25rem;
  color: #4b5563;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.testimonial-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.testimonial-content p {
  font-size: 1rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  position: relative;
  border: 2px solid #f3f4f6;
}

.author-avatar::before {
  content: attr(data-initials);
}

.author-name {
  font-weight: 600;
  color: #000;
  font-size: 0.9rem;
}

.author-title {
  color: #6b7280;
  font-size: 0.85rem;
}

/* Mission & Vision Section */
.mission-vision-section {
  padding: 8rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.mission-vision-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.mission-card,
.vision-card {
  text-align: center;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.mission-card h3,
.vision-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #000;
  font-weight: 600;
}

.mission-card p,
.vision-card p {
  color: #6b7280;
  line-height: 1.5;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .value-section h2 {
    font-size: 2rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .mission-vision-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .journey-header h2 {
    font-size: 2.5rem;
  }
  
  .journey-header p {
    font-size: 1rem;
  }
  
  .chapter-content {
    flex-direction: column !important;
    gap: 2rem;
    padding: 2rem;
  }
  
  .story-chapter.reverse .chapter-content {
    flex-direction: column !important;
  }
  
  .chapter-narrative {
    max-width: 100%;
    text-align: center;
  }
  
  .chapter-narrative h3 {
    font-size: 1.75rem;
  }
  
  .chapter-stats {
    gap: 1.5rem;
  }
  
  .story-stat {
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2.25rem;
  }
  
  .epilogue-content h3 {
    font-size: 2rem;
  }
  
  .epilogue-content p {
    font-size: 1rem;
  }
  
  .link-with-arrow {
    margin-bottom: 3rem;
    font-size: 1rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .partnership-header h2 {
    font-size: 2rem;
  }
  
  .impact-grid {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .why-partner-section h3 {
    font-size: 1.75rem;
  }
  
  .partnership-cta {
    margin: 0 1rem;
    padding: 2rem 1.5rem;
  }
  
  .cta-content h3 {
    font-size: 1.5rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-actions .btn {
    width: 100%;
    max-width: 200px;
  }
  
  .process-steps {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.875rem;
  }
  
  .value-section {
    padding: 3rem 0;
  }
  
  .value-section h2 {
    font-size: 1.5rem;
  }
  
  .mission-vision-section {
    padding: 3rem 0;
  }
  
  .mission-vision-section h2 {
    font-size: 1.5rem;
  }
  
  .core-values-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .core-value-card {
    padding: 1.25rem;
  }
  
  .partnership-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .process-steps {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .benefit-card {
    padding: 2rem;
  }
  
  .benefit-card h4 {
    font-size: 1.125rem;
  }
  
  .testimonials-section h2 {
    font-size: 2rem;
  }
  
  .cta-section {
    flex-direction: column;
    align-items: center;
  }
  
  .logos-grid {
    gap: 2rem;
  }
  
  .mission-vision-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1e293b;
}

.section-header p {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 800px;
  margin: 0 auto;
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: center;
}

.timeline-year {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  min-width: 80px;
}

.timeline-content {
  flex: 1;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Journey Section - Storytelling */
/* Values Section */
.values-section {
  padding: 6rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.value-card {
  text-align: center;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.value-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000;
}

.value-card p {
  color: #6b7280;
  line-height: 1.5;
  font-size: 0.875rem;
}

/* How It Works Section */
.how-it-works-section {
  padding: 8rem 0;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.workflow-step {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  position: relative;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.step-number {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.workflow-step h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.workflow-step p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.step-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #dbeafe;
}

/* Responsive Design */
@media (max-width: 768px) {
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .values-grid {
    grid-template-columns: 1fr;
  }
}

/* Partnership Section */
.partnership-section {
  padding: 8rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.partnership-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 4rem auto;
}

.partnership-card {
  text-align: center;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.partnership-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #000;
}

.card-metric {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.partnership-cta {
  text-align: center;
  margin-top: 4rem;
}

.partnership-cta h3 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000;
}

.partnership-cta p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cta-buttons .btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid transparent;
  cursor: pointer;
}

.cta-buttons .btn-primary {
  background: #000;
  color: white;
}

.cta-buttons .btn-secondary {
  background: white;
  color: #000;
  border-color: #d1d5db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .partnership-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-buttons .btn {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .partnership-cards {
    grid-template-columns: 1fr;
  }
  
  .workflow-step {
    padding: 1.5rem;
  }
  
  .step-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .step-number {
    width: 45px;
    height: 45px;
    font-size: 1.125rem;
  }
  
  .workflow-step h3 {
    font-size: 1.125rem;
  }
  
  .feature-tag {
    font-size: 0.6875rem;
  }
  
  .listing-step {
    padding: 1.5rem;
  }
  
  .listing-step-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .listing-step-number {
    width: 45px;
    height: 45px;
    font-size: 1.125rem;
  }
  
  .listing-step h3 {
    font-size: 1.125rem;
  }
  
  .listing-benefit-card {
    padding: 2rem;
  }
  
  .cta-content h2 {
    font-size: 1.75rem;
  }
  
  .cta-content p {
    font-size: 1.125rem;
  }
}

/* Listing Benefits Section */
.listing-benefits-section {
  padding: 8rem 0;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.listing-benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.listing-benefit-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.listing-benefit-card h3 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.listing-benefit-card p {
  color: #64748b;
  line-height: 1.6;
  font-size: 1rem;
}

/* Listing Process Section */
.listing-process-section {
  padding: 8rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.listing-process-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.listing-step {
  background: #f8fafc;
  padding: 3rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.listing-step-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.listing-step-number {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.listing-step h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.listing-step p {
  color: #64748b;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

/* Listing CTA Section */
.listing-cta-section {
  padding: 8rem 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-actions .btn-primary {
  background: white;
  color: #3b82f6;
  border: 2px solid white;
}

.cta-actions .btn-primary:hover {
  background: transparent;
  color: white;
}

.cta-actions .btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cta-actions .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Common Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-outline:hover {
  background: #3b82f6;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .mission-vision-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline-item {
    flex-direction: column;
    text-align: center;
  }
  
  .overview-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .workflow-steps {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .workflow-step {
    padding: 2rem;
  }
  
  .step-header {
    gap: 1rem;
  }
  
  .step-number {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .workflow-step h3 {
    font-size: 1.25rem;
  }
  
  .listing-benefits-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .listing-process-steps {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .listing-step {
    padding: 2rem;
  }
  
  .listing-step-header {
    gap: 1rem;
  }
  
  .listing-step-number {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .listing-step h3 {
    font-size: 1.25rem;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-actions .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .package-card.popular {
    transform: none;
  }
}
</style>
