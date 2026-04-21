<template>
  <div class="signup-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <div class="page-hero-content">
          <h1>Get Started with SaaSWorld</h1>
          <p>Create your account and start your 14-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>

    <!-- Signup Form Section -->
    <section class="signup-form-section">
      <div class="container">
        <div class="signup-wrapper">
          <div class="signup-content">
            <!-- Plan Selection -->
            <div class="plan-selection" v-if="!selectedPlan">
              <h2>Choose Your Plan</h2>
              
              <!-- Billing Toggle -->
              <div class="billing-toggle">
                <span :class="{ 'active': billingCycle === 'monthly' }">Monthly</span>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="annualBilling" @change="toggleBilling">
                  <span class="toggle-slider"></span>
                </label>
                <span :class="{ 'active': billingCycle === 'annual' }">Annual</span>
                <span class="save-badge" v-if="billingCycle === 'annual'">Save 20%</span>
              </div>
              
              <!-- Plans -->
              <div class="plans-grid">
                <div 
                  v-for="(plan, index) in plans" 
                  :key="plan.id" 
                  class="plan-card"
                  :class="{ 'popular': plan.id === 'professional' }"
                  @click="selectPlan(plan.id)"
                >
                  <div v-if="plan.id === 'professional'" class="popular-badge">Most Popular</div>
                  <h3>{{ plan.name }}</h3>
                  <div class="plan-price">
                    <span class="currency">$</span>
                    <span class="amount">{{ billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice }}</span>
                    <span class="period">/month per user</span>
                  </div>
                  <p v-if="billingCycle === 'annual'" class="billing-note">
                    Billed annually (${{ plan.annualPrice * 12 }}/year per user)
                  </p>
                  
                  <div class="plan-features">
                    <ul>
                      <li v-for="(feature, idx) in plan.features.slice(0, 4)" :key="idx">
                        <UIcon dynamic name="i-heroicons-check" class="check-icon" /> {{ feature }}
                      </li>
                    </ul>
                    <p class="features-more" v-if="plan.features.length > 4">
                      + {{ plan.features.length - 4 }} more features
                    </p>
                  </div>
                  
                  <button :class="['btn', plan.id === 'professional' ? 'btn-primary' : 'btn-outline']">
                    Select {{ plan.name }}
                  </button>
                </div>
              </div>
              
              <div class="plan-footer">
                <p>All plans include a 14-day free trial</p>
                <p>Need help choosing? <NuxtLink to="/contact">Contact our sales team</NuxtLink></p>
              </div>
            </div>
            
            <!-- Registration Form -->
            <div class="registration-form" v-if="selectedPlan">
              <div class="form-header">
                <button class="back-button" @click="selectedPlan = null">
                  <UIcon dynamic name="i-heroicons-arrow-left" /> Back to Plans
                </button>
                <h2>Create Your Account</h2>
                <p>You've selected the <strong>{{ getPlanName(selectedPlan) }}</strong> plan with <strong>{{ billingCycle }}</strong> billing.</p>
              </div>
              
              <p v-if="registrationError" class="registration-error">{{ registrationError }}</p>

              <form @submit.prevent="submitRegistration" class="signup-form">
                <!-- Account Information -->
                <div class="form-section">
                  <h3>Account Information</h3>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        v-model="formData.firstName"
                        required
                        placeholder="Enter your first name"
                      >
                    </div>
                    
                    <div class="form-group">
                      <label for="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        v-model="formData.lastName"
                        required
                        placeholder="Enter your last name"
                      >
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="email">Work Email</label>
                    <input
                      type="email"
                      id="email"
                      v-model="formData.email"
                      required
                      placeholder="Enter your work email"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-input">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        v-model="formData.password"
                        required
                        placeholder="Create a password (8+ characters)"
                        minlength="8"
                      >
                      <button 
                        type="button" 
                        class="password-toggle" 
                        @click="showPassword = !showPassword"
                      >
                        <UIcon dynamic 
                          :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
                          
                        />
                      </button>
                    </div>
                    <div class="password-strength" v-if="formData.password">
                      <div class="strength-bar">
                        <div 
                          class="strength-indicator" 
                          :style="{ width: passwordStrength + '%' }" 
                          :class="getPasswordStrengthClass()"
                        ></div>
                      </div>
                      <span>{{ getPasswordStrengthText() }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Company Information -->
                <div class="form-section">
                  <h3>Company Information</h3>
                  
                  <div class="form-group">
                    <label for="companyName">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      v-model="formData.companyName"
                      required
                      placeholder="Enter your company name"
                    >
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="companySize">Company Size</label>
                      <select id="companySize" v-model="formData.companySize" required>
                        <option value="" disabled>Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1001+">1001+ employees</option>
                      </select>
                    </div>
                    
                    <div class="form-group">
                      <label for="jobTitle">Job Title</label>
                      <input
                        type="text"
                        id="jobTitle"
                        v-model="formData.jobTitle"
                        required
                        placeholder="Enter your job title"
                      >
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      v-model="formData.phoneNumber"
                      placeholder="Enter your phone number"
                    >
                  </div>
                </div>
                
                <!-- Terms & Privacy -->
                <div class="form-section">
                  <div class="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="termsAgree" 
                      v-model="formData.termsAgree" 
                      required
                    >
                    <label for="termsAgree">
                      I agree to SaaSWorld's <NuxtLink to="/terms" target="_blank">Terms of Service</NuxtLink> and <NuxtLink to="/privacy" target="_blank">Privacy Policy</NuxtLink>
                    </label>
                  </div>
                  
                  <div class="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="marketingAgree" 
                      v-model="formData.marketingAgree"
                    >
                    <label for="marketingAgree">
                      I agree to receive product updates and marketing communications from SaaSWorld
                    </label>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="!isSubmitting">Create Account & Start Free Trial</span>
                    <span v-else>Creating Your Account...</span>
                  </button>
                </div>
                
                <div class="form-footer">
                  <p>Already have an account? <NuxtLink to="/login">Log in</NuxtLink></p>
                </div>
              </form>
            </div>
            
            <!-- Success State -->
            <div class="registration-success" v-if="registrationSuccess">
              <div class="success-icon">
                <UIcon dynamic name="i-heroicons-check-circle" />
              </div>
              <h2>Welcome to SaaSWorld!</h2>
              <p>Your account has been successfully created.</p>
              <p>We've sent a confirmation email to <strong>{{ formData.email }}</strong> with instructions to get started.</p>
              <div class="success-actions">
                <NuxtLink to="/dashboard" class="btn btn-primary">Go to Dashboard</NuxtLink>
                <NuxtLink to="/onboarding" class="btn btn-outline">Complete Setup</NuxtLink>
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="signup-sidebar">
            <div class="benefits-card">
              <h3>Benefits of SaaSWorld</h3>
              <ul class="benefits-list">
                <li>
                  <div class="benefit-icon">
                    <UIcon dynamic name="i-heroicons-rocket-launch" />
                  </div>
                  <div class="benefit-content">
                    <h4>Quick Setup</h4>
                    <p>Get up and running in minutes with our guided onboarding.</p>
                  </div>
                </li>
                <li>
                  <div class="benefit-icon">
                    <UIcon dynamic name="i-heroicons-currency-dollar" />
                  </div>
                  <div class="benefit-content">
                    <h4>No Risk</h4>
                    <p>14-day free trial with no credit card required to start.</p>
                  </div>
                </li>
                <li>
                  <div class="benefit-icon">
                    <UIcon dynamic name="i-heroicons-adjustments-horizontal" />
                  </div>
                  <div class="benefit-content">
                    <h4>Fully Customizable</h4>
                    <p>Tailor the platform to meet your specific business needs.</p>
                  </div>
                </li>
                <li>
                  <div class="benefit-icon">
                    <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
                  </div>
                  <div class="benefit-content">
                    <h4>Dedicated Support</h4>
                    <p>Our customer success team is available to help you succeed.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-content">
                <UIcon dynamic name="i-heroicons-quote-mark" class="quote-icon" />
                <p>"SaaSWorld has transformed how we operate. The platform's flexibility and powerful features have helped us scale our business faster than we thought possible."</p>
                <div class="testimonial-author">
                  <img src="/assets/images/testimonials/john-smith.jpg" alt="John Smith">
                  <div class="author-info">
                    <span class="author-name">John Smith</span>
                    <span class="author-title">CTO, TechNova Inc.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <div class="section-header centered">
          <h2>Frequently Asked Questions</h2>
          <p>Have questions? Find answers below or <NuxtLink to="/contact">contact our team</NuxtLink>.</p>
        </div>
        
        <div class="faq-grid">
          <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Billing cycle state
const billingCycle = ref('monthly');
const annualBilling = ref(false);

// Toggle between monthly and annual billing
const toggleBilling = () => {
  billingCycle.value = annualBilling.value ? 'annual' : 'monthly';
};

// Plans data
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 23,
    features: [
      'Up to 5 team members',
      'Basic workflow automation',
      '5GB storage per user',
      'Email support',
      'Mobile app access',
      '30-day data retention'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 59,
    annualPrice: 47,
    features: [
      'Unlimited team members',
      'Advanced workflow automation',
      '20GB storage per user',
      'Priority email & chat support',
      'Advanced analytics',
      'API access',
      '90-day data retention',
      'Custom integrations'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99,
    annualPrice: 79,
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Unlimited storage',
      'Phone, email & chat support',
      'Custom security controls',
      'SSO and SAML integration',
      'Unlimited data retention',
      'SLA guarantees',
      'On-premises deployment option'
    ]
  }
];

// Get name of selected plan
const getPlanName = (planId: string) => {
  const plan = plans.find(p => p.id === planId);
  return plan ? plan.name : '';
};

// Form state
const selectedPlan = ref(null);
const showPassword = ref(false);
const isSubmitting = ref(false);
const registrationSuccess = ref(false);
const registrationError = ref('');

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  companyName: '',
  companySize: '',
  jobTitle: '',
  phoneNumber: '',
  termsAgree: false,
  marketingAgree: false,
  plan: '',
  billingCycle: 'annual'
});

// Select a plan and proceed to registration
const selectPlan = (planId: string | null) => {
  selectedPlan.value = planId;
  formData.plan = planId;
  formData.billingCycle = billingCycle.value;
  
  // Scroll to registration form
  setTimeout(() => {
    const formElement = document.querySelector('.registration-form');
    formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

// Password strength calculation
const passwordStrength = computed(() => {
  const password = formData.password;
  if (!password) return 0;
  
  let strength = 0;
  
  // Length
  if (password.length >= 8) strength += 25;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 25;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 25;
  
  // Contains numbers or special characters
  if (/[0-9!@#$%^&*()]/.test(password)) strength += 25;
  
  return strength;
});

const getPasswordStrengthClass = () => {
  if (passwordStrength.value <= 25) return 'weak';
  if (passwordStrength.value <= 50) return 'medium';
  if (passwordStrength.value <= 75) return 'good';
  return 'strong';
};

const getPasswordStrengthText = () => {
  if (passwordStrength.value <= 25) return 'Weak';
  if (passwordStrength.value <= 50) return 'Medium';
  if (passwordStrength.value <= 75) return 'Good';
  return 'Strong';
};

// Submit registration
const submitRegistration = async () => {
  try {
    isSubmitting.value = true;
    registrationError.value = '';

    const result = await $fetch('/api/signup', {
      method: 'POST',
      body: {
        ...formData,
        planName: getPlanName(formData.plan),
        planPrice: annualBilling.value ? 
          plans.find(p => p.id === formData.plan)?.annualPrice : 
          plans.find(p => p.id === formData.plan)?.monthlyPrice
      }
    });

    if (result.success) {
      registrationSuccess.value = true;
      setTimeout(() => {
        window.location.href = result.redirectTo || '/dashboard';
      }, 1200);
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    registrationError.value = error?.data?.statusMessage || error?.message || 'There was an error creating your account. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// FAQ data
const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'Your 14-day free trial gives you full access to all features of your selected plan. No credit card is required to start. At the end of your trial, you\'ll be prompted to enter payment information to continue using SaaSWorld.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be prorated and applied to your next billing cycle.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'You have 30 days after cancellation to export your data. After that period, your data will be permanently deleted from our systems in accordance with our data retention policies.'
  },
  {
    question: 'Do you offer discounts for non-profits or educational institutions?',
    answer: 'Yes, we offer special pricing for qualified non-profit organizations and educational institutions. Please contact our sales team for more information.'
  }
];

// Check if a plan was pre-selected from URL parameter
onMounted(() => {
  const planParam = route.query.plan;
  if (planParam && plans.some(p => p.id === planParam)) {
    selectedPlan.value = planParam;
  }
});
</script>

<style scoped>
.signup-page {
  /* padding-top removed as it's now handled by the layout */
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

.signup-form-section {
  padding: 60px 0;
}

.signup-wrapper {
  display: flex;
  gap: 40px;
}

.signup-content {
  flex: 2;
}

.signup-sidebar {
  flex: 1;
}

/* Plan Selection */
.plan-selection h2 {
  font-size: 1.75rem;
  margin-bottom: 24px;
  color: var(--color-gray-900);
  text-align: center;
}

.billing-toggle {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 auto 30px;
  padding: 6px;
  border-radius: 30px;
  background-color: var(--color-gray-100);
  max-width: fit-content;
  position: relative;
}

.billing-toggle span {
  font-weight: 500;
  color: var(--color-gray-600);
  padding: 8px 12px;
}

.billing-toggle span.active {
  color: var(--color-primary);
  font-weight: 600;
}

.save-badge {
  position: absolute;
  top: -12px;
  right: -20px;
  background-color: var(--color-success);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-gray-300);
  transition: .4s;
  border-radius: 30px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.plan-card {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-gray-200);
}

.plan-card.popular {
  border-color: var(--color-primary);
  transform: scale(1.03);
}

.plan-card.popular:hover {
  transform: scale(1.03) translateY(-5px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.plan-card h3 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--color-gray-900);
  text-align: center;
}

.plan-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-gray-900);
  text-align: center;
  margin-bottom: 6px;
}

.currency {
  font-size: 1.5rem;
  vertical-align: top;
  margin-right: 2px;
}

.period {
  font-size: 1rem;
  font-weight: normal;
  color: var(--color-gray-600);
}

.billing-note {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin-bottom: 20px;
}

.plan-features {
  margin: 20px 0 30px;
}

.plan-features ul {
  padding: 0;
  margin: 0 0 15px;
  list-style-type: none;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  color: var(--color-gray-700);
  font-size: 0.95rem;
}

.check-icon {
  color: var(--color-success);
  margin-right: 8px;
  flex-shrink: 0;
  margin-top: 3px;
}

.features-more {
  font-size: 0.85rem;
  color: var(--color-gray-600);
  text-align: center;
}

.plan-card .btn {
  width: 100%;
}

.plan-footer {
  text-align: center;
  margin-top: 20px;
  color: var(--color-gray-600);
  font-size: 0.95rem;
}

.plan-footer p {
  margin-bottom: 8px;
}

.plan-footer a {
  color: var(--color-primary);
  text-decoration: none;
}

.plan-footer a:hover {
  text-decoration: underline;
}

/* Registration Form */
.registration-form {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-header {
  padding: 30px;
  background-color: var(--color-gray-50);
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gray-600);
  cursor: pointer;
  padding: 6px;
  font-size: 0.95rem;
  font-family: inherit;
}

.back-button:hover {
  color: var(--color-primary);
}

.form-header h2 {
  font-size: 1.75rem;
  margin-bottom: 12px;
  color: var(--color-gray-900);
  text-align: center;
}

.form-header p {
  text-align: center;
  color: var(--color-gray-600);
}

.form-header strong {
  color: var(--color-primary);
}

.registration-error {
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #b91c1c;
}

.signup-form {
  padding: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--color-gray-200);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  font-size: 1.25rem;
  margin-bottom: 20px;
  color: var(--color-gray-800);
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-gray-700);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-input);
  font-size: 1rem;
  color: var(--color-gray-800);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-gray-600);
  cursor: pointer;
  padding: 0;
}

.password-strength {
  margin-top: 12px;
  font-size: 0.85rem;
}

.strength-bar {
  height: 6px;
  background-color: var(--color-gray-200);
  border-radius: 3px;
  margin-bottom: 8px;
  overflow: hidden;
}

.strength-indicator {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-indicator.weak {
  background-color: var(--color-error);
}

.strength-indicator.medium {
  background-color: var(--color-warning);
}

.strength-indicator.good {
  background-color: var(--color-info);
}

.strength-indicator.strong {
  background-color: var(--color-success);
}

.form-group.checkbox-group {
  display: flex;
  align-items: flex-start;
}

.form-group.checkbox-group input {
  width: auto;
  margin-right: 10px;
  margin-top: 4px;
}

.form-group.checkbox-group label {
  font-weight: normal;
  margin-bottom: 0;
  font-size: 0.95rem;
}

.form-group.checkbox-group a {
  color: var(--color-primary);
  text-decoration: none;
}

.form-group.checkbox-group a:hover {
  text-decoration: underline;
}

.form-actions {
  margin-top: 30px;
}

.form-actions .btn {
  width: 100%;
  padding: 14px;
  font-size: 1.05rem;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--color-gray-600);
}

.form-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* Registration Success */
.registration-success {
  background-color: white;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08);
}

.success-icon {
  color: var(--color-success);
  margin-bottom: 20px;
}

.registration-success h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--color-gray-900);
}

.registration-success p {
  color: var(--color-gray-700);
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.registration-success strong {
  color: var(--color-primary);
}

.success-actions {
  margin-top: 30px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Sidebar */
.benefits-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.benefits-card h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--color-gray-900);
}

.benefits-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.benefits-list li {
  display: flex;
  margin-bottom: 25px;
}

.benefits-list li:last-child {
  margin-bottom: 0;
}

.benefit-icon {
  margin-right: 15px;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  height: 50px;
  width: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-content h4 {
  font-size: 1.125rem;
  margin-bottom: 5px;
  color: var(--color-gray-800);
}

.benefit-content p {
  font-size: 0.95rem;
  color: var(--color-gray-600);
  margin: 0;
}

.testimonial-card {
  background-color: var(--color-primary);
  color: white;
  border-radius: 12px;
  padding: 30px;
  position: relative;
  box-shadow: 0 15px 30px rgba(78, 50, 223, 0.2);
}

.quote-icon {
  opacity: 0.2;
  position: absolute;
  top: 20px;
  left: 20px;
}

.testimonial-content p {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 10px 0 20px;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
}

.testimonial-author img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.testimonial-author .author-name {
  font-weight: 500;
  font-size: 1.1rem;
  display: block;
}

.testimonial-author .author-title {
  opacity: 0.8;
  font-size: 0.9rem;
}

/* FAQ Section */
.faq-section {
  padding: 80px 0;
  background-color: var(--color-gray-50);
}

.section-header.centered {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
}

.section-header h2 {
  font-size: 2.25rem;
  margin-bottom: 16px;
  color: var(--color-gray-900);
}

.section-header p {
  font-size: 1.25rem;
  color: var(--color-gray-700);
}

.section-header a {
  color: var(--color-primary);
  text-decoration: none;
}

.section-header a:hover {
  text-decoration: underline;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.faq-item {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.faq-item h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--color-gray-900);
}

.faq-item p {
  color: var(--color-gray-700);
  line-height: 1.6;
}

/* Responsive styles */
@media (max-width: 992px) {
  .signup-wrapper {
    flex-direction: column;
  }
  
  .plans-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .plan-card.popular {
    transform: scale(1);
  }
  
  .plan-card.popular:hover {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .page-hero h1 {
    font-size: 2.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .success-actions {
    flex-direction: column;
    max-width: 100%;
  }
  
  .success-actions .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .form-header {
    padding-top: 50px;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
