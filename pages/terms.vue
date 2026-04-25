<template>
  <LegalShell
    title="Terms of Service"
    eyebrow="Legal · Terms"
    lede="The rules for using Moonmart — what we promise to do, and what we ask of you in return."
    :updated="updatedAt"
    contact-email="legal@moonmart.ai"
    :sections="tocSections"
  >
    <div class="terms-content">
      
        <!-- Introduction -->
        <section id="introduction" class="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Moonmart ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website located at moonmart.ai (the "Service") operated by Moonmart Inc.
          </p>
          <p>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
          </p>
        </section>

        <!-- Definitions -->
        <section id="definitions" class="legal-section">
          <h2>2. Definitions</h2>
          <div class="definition-list">
            <div class="definition-item">
              <strong>"Service"</strong> refers to the Moonmart website and marketplace platform.
            </div>
            <div class="definition-item">
              <strong>"User"</strong> refers to anyone who accesses or uses our Service.
            </div>
            <div class="definition-item">
              <strong>"Vendor"</strong> refers to software companies or individuals who list their products on our platform.
            </div>
            <div class="definition-item">
              <strong>"Content"</strong> refers to text, data, information, software listings, reviews, and other materials.
            </div>
          </div>
        </section>

        <!-- User Accounts -->
        <section id="accounts" class="legal-section">
          <h2>3. User Accounts</h2>
          <h3>3.1 Account Creation</h3>
          <p>
            To access certain features of our Service, you may be required to create an account. You must provide accurate, complete, and current information during registration.
          </p>
          <h3>3.2 Account Security</h3>
          <p>
            You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          <h3>3.3 Account Termination</h3>
          <p>
            We reserve the right to terminate or suspend your account at any time, with or without cause, and with or without notice.
          </p>
        </section>

        <!-- Platform Usage -->
        <section id="usage" class="legal-section">
          <h2>4. Platform Usage</h2>
          <h3>4.1 Permitted Uses</h3>
          <ul class="legal-list">
            <li>Browse and search for software solutions</li>
            <li>Read and submit reviews and ratings</li>
            <li>Compare software features and pricing</li>
            <li>Contact vendors through provided channels</li>
            <li>List your software products (for vendors)</li>
          </ul>
          <h3>4.2 Prohibited Uses</h3>
          <ul class="legal-list">
            <li>Violate any applicable laws or regulations</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated systems to scrape or harvest data</li>
            <li>Impersonate other users or entities</li>
            <li>Submit false or misleading information</li>
          </ul>
        </section>

        <!-- Vendor Obligations -->
        <section id="vendors" class="legal-section">
          <h2>5. Vendor Obligations</h2>
          <h3>5.1 Listing Requirements</h3>
          <p>
            Vendors must provide accurate, complete, and up-to-date information about their software products, including features, pricing, and terms of service.
          </p>
          <h3>5.2 Customer Support</h3>
          <p>
            Vendors are responsible for providing appropriate customer support for their listed products and handling customer inquiries professionally.
          </p>
          <h3>5.3 Compliance</h3>
          <p>
            Vendors must ensure their software complies with all applicable laws, regulations, and industry standards.
          </p>
        </section>

        <!-- Intellectual Property -->
        <section id="ip" class="legal-section">
          <h2>6. Intellectual Property</h2>
          <h3>6.1 Our Rights</h3>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Moonmart and its licensors.
          </p>
          <h3>6.2 User Content</h3>
          <p>
            By submitting content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content.
          </p>
          <h3>6.3 DMCA Policy</h3>
          <p>
            We respect intellectual property rights and will respond to valid DMCA takedown notices. Please contact us at dmca@moonmart.ai for copyright concerns.
          </p>
        </section>

        <!-- Privacy and Data -->
        <section id="privacy" class="legal-section">
          <h2>7. Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Please review our <NuxtLink to="/privacy" class="legal-link">Privacy Policy</NuxtLink>, which governs how we collect, use, and protect your information.
          </p>
          <p>
            We comply with applicable data protection laws, including GDPR and CCPA, and implement appropriate security measures to protect your data.
          </p>
        </section>

        <!-- Disclaimers -->
        <section id="disclaimers" class="legal-section">
          <h2>8. Disclaimers</h2>
          <h3>8.1 Service Availability</h3>
          <p>
            We strive to maintain Service availability but do not guarantee uninterrupted or error-free operation. We may modify, suspend, or discontinue the Service at any time.
          </p>
          <h3>8.2 Third-Party Software</h3>
          <p>
            We are not responsible for the performance, quality, or functionality of third-party software listed on our platform. Users should evaluate software independently.
          </p>
          <h3>8.3 User Reviews</h3>
          <p>
            Reviews and ratings reflect individual user opinions and experiences. We do not endorse or guarantee the accuracy of user-generated content.
          </p>
        </section>

        <!-- Limitation of Liability -->
        <section id="liability" class="legal-section">
          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SAASWORLD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
          </p>
          <p>
            Our total liability shall not exceed the amount paid by you to us in the twelve months preceding the claim.
          </p>
        </section>

        <!-- Governing Law -->
        <section id="law" class="legal-section">
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.
          </p>
          <p>
            Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
          </p>
        </section>

        <!-- Changes to Terms -->
        <section id="changes" class="legal-section">
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website and updating the "Last updated" date.
          </p>
          <p>
            Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
          </p>
        </section>

        <!-- Contact Information -->
        <section id="contact" class="legal-section">
          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div class="contact-info">
            <p><strong>Email:</strong> legal@moonmart.ai</p>
            <p><strong>Address:</strong> Moonmart Inc., 123 Tech Street, San Francisco, CA 94105</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          </div>
        </section>
    </div>
  </LegalShell>
</template>

<script setup lang="ts">
// SEO Configuration
const { applySEO } = useSEO()

const updatedAt = 'August 18, 2025'

const tocSections = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'accounts', label: '3. User Accounts' },
  { id: 'usage', label: '4. Platform Usage' },
  { id: 'vendors', label: '5. Vendor Obligations' },
  { id: 'ip', label: '6. Intellectual Property' },
  { id: 'privacy', label: '7. Privacy & Data' },
  { id: 'disclaimers', label: '8. Disclaimers' },
  { id: 'liability', label: '9. Limitation of Liability' },
  { id: 'law', label: '10. Governing Law' },
  { id: 'changes', label: '11. Changes to Terms' },
  { id: 'contact', label: '12. Contact' }
]

applySEO({
  title: 'Terms of Service | Moonmart - Legal Terms and Conditions',
  description: 'Read Moonmart\'s Terms of Service. Understand your rights and obligations when using our software marketplace platform.',
  keywords: 'terms of service, legal terms, user agreement, terms and conditions, Moonmart legal',
  canonical: 'https://moonmart.ai/terms',
  ogType: 'website',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    description: 'Moonmart Terms of Service and user agreement',
    url: 'https://moonmart.ai/terms',
    publisher: {
      '@type': 'Organization',
      name: 'Moonmart',
      url: 'https://moonmart.ai'
    }
  }
})

// Analytics tracking
onMounted(() => {
  const { $seoTracking } = useNuxtApp()
  $seoTracking.trackEvent('legal_page_view', {
    page: 'terms',
    category: 'legal'
  })
})
</script>

