<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            Get in <span class="highlight">Touch</span>
          </h1>
          <p class="hero-subtitle">
            Have questions about SaaSWorld? We're here to help you find the perfect software solutions for your business needs.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="contact-form-section">
      <div class="container">
        <div class="form-wrapper">
          <div>
            <div class="form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible. We typically respond within 24 hours.</p>
            </div>
            
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name *</label>
                  <input
                    id="firstName"
                    v-model="formData.firstName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    v-model="formData.lastName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email Address *</label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input
                    id="phone"
                    v-model="formData.phone"
                    type="tel"
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="company">Company</label>
                  <input
                    id="company"
                    v-model="formData.company"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="subject">Subject *</label>
                  <select
                    id="subject"
                    v-model="formData.subject"
                    class="form-select"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Media & Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label for="message">Message *</label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  class="form-textarea"
                  rows="5"
                  required
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="formData.newsletter"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  <span>I'd like to receive product updates and company news via email.</span>
                </label>
              </div>
              
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                </button>
              </div>
              
              <div v-if="formSuccess" class="submit-message success">
                {{ formSuccess }}
              </div>
              <div v-if="formError" class="submit-message error">
                {{ formError }}
              </div>
            </form>
          </div>
          
          <!-- Contact Info Sidebar -->
          <div class="contact-info">
            <div class="info-card">
              <h3>Contact Information</h3>
              <div class="info-item">
                <div class="info-icon">
                  <UIcon name="i-heroicons-map-pin" />
                </div>
                <div class="info-content">
                  <h4>Address</h4>
                  <p>123 SaaS Street<br>Tech District, CA 94105<br>United States</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <UIcon name="i-heroicons-phone" />
                </div>
                <div class="info-content">
                  <h4>Phone</h4>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <UIcon name="i-heroicons-clock" />
                </div>
                <div class="info-content">
                  <h4>Business Hours</h4>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PST<br>
                     Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div class="social-card">
              <h3>Follow Us</h3>
              <div class="social-links">
                <a href="#" class="social-link">
                  <UIcon name="i-simple-icons-twitter" />
                  <span>Twitter</span>
                </a>
                <a href="#" class="social-link">
                  <UIcon name="i-simple-icons-linkedin" />
                  <span>LinkedIn</span>
                </a>
                <a href="#" class="social-link">
                  <UIcon name="i-simple-icons-github" />
                  <span>GitHub</span>
                </a>
                <a href="#" class="social-link">
                  <UIcon name="i-simple-icons-youtube" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <div class="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions about SaaSWorld</p>
        </div>
        
        <div class="faq-grid">
          <div class="faq-item">
            <h4>How quickly do you respond to inquiries?</h4>
            <p>We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our support number.</p>
          </div>
          <div class="faq-item">
            <h4>Do you offer free consultations?</h4>
            <p>Yes! We provide free 30-minute consultations to help you understand how SaaSWorld can benefit your business.</p>
          </div>
          <div class="faq-item">
            <h4>Can I schedule a demo?</h4>
            <p>Absolutely! You can request a personalized demo through our contact form or by emailing our sales team directly.</p>
          </div>
          <div class="faq-item">
            <h4>What support channels do you offer?</h4>
            <p>We offer email support, live chat, phone support, and a comprehensive knowledge base to help you succeed.</p>
          </div>
          <div class="faq-item">
            <h4>Do you support integrations?</h4>
            <p>Yes, we support hundreds of integrations with popular business tools. Contact us to discuss your specific integration needs.</p>
          </div>
          <div class="faq-item">
            <h4>How can I become a partner?</h4>
            <p>We welcome partnerships! Reach out to our partnerships team to discuss collaboration opportunities and our partner program.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page Meta
useSeoMeta({
  title: 'Contact Us - Get in Touch with SaaSWorld',
  description: 'Contact SaaSWorld for sales inquiries, customer support, partnerships, and media requests. We\'re here to help you find the perfect software solutions.',
  ogTitle: 'Contact Us - Get in Touch with SaaSWorld',
  ogDescription: 'Contact SaaSWorld for sales inquiries, customer support, partnerships, and media requests. We\'re here to help you find the perfect software solutions.',
  twitterTitle: 'Contact Us - Get in Touch with SaaSWorld',
  twitterDescription: 'Contact SaaSWorld for sales inquiries, customer support, partnerships, and media requests. We\'re here to help you find the perfect software solutions.'
});

// Form Data Interface
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

// Reactive Form Data
const formData = ref<ContactFormData>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
  newsletter: false
});

// Form State
const isSubmitting = ref(false);
const formSuccess = ref('');
const formError = ref('');

// Form Submission Handler
const submitForm = async () => {
  if (isSubmitting.value) return;
  
  // Reset previous messages
  formSuccess.value = '';
  formError.value = '';
  
  // Basic validation
  if (!formData.value.firstName || !formData.value.lastName || !formData.value.email || !formData.value.subject || !formData.value.message) {
    formError.value = 'Please fill in all required fields.';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    formError.value = 'Please enter a valid email address.';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    const success = Math.random() > 0.2; // 80% success rate for demo
    
    if (success) {
      formSuccess.value = 'Thank you for your message! We\'ll get back to you within 24 hours.';
      
      // Reset form
      formData.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        newsletter: false
      };
    } else {
      formError.value = 'There was an error submitting your form. Please try again.';
    }
  } catch (error) {
    console.error('Form submission error:', error);
    formError.value = 'There was an error submitting your form. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
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

/* Contact Methods Section */
.contact-methods {
  padding: var(--spacing-xxl) 0;
  background: #f8fafc;
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

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.method-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.method-icon {
  width: 4rem;
  height: 4rem;
  background: var(--primary-color);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg) auto;
  color: white;
  font-size: 2rem;
}

.method-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.method-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.contact-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
  display: block;
  margin-bottom: var(--spacing-sm);
}

.contact-link:hover {
  border-bottom-color: var(--primary-color);
}

.response-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: inline-block;
}

/* Contact Form Section */
.contact-form-section {
  padding: var(--spacing-xxl) 0;
  background: white;
}

.form-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: var(--spacing-xxl);
}

.form-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.form-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.contact-form {
  background: #f8fafc;
  padding: 2.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-group {
  margin: 2rem 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.form-actions {
  margin-top: 2rem;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--dark-color);
  border-color: var(--dark-color);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.submit-message.success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.submit-message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Contact Info Sidebar */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card,
.social-card {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.info-card h3,
.social-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.info-content p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.social-link:hover {
  background: white;
  color: var(--primary-color);
}

/* FAQ Section */
.faq-section {
  padding: var(--spacing-xxl) 0;
  background: #f8fafc;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.faq-item {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.faq-item h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.faq-item p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .section-header h2,
  .form-header h2 {
    font-size: 2rem;
  }
  
  .methods-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-form {
    padding: 2rem;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .method-card,
  .contact-form,
  .info-card,
  .social-card,
  .faq-item {
    padding: 1.5rem;
  }
  
  .form-wrapper {
    gap: 2rem;
  }
}
</style>
