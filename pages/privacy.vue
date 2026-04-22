<template>
  <LegalShell
    title="Privacy Policy"
    eyebrow="Legal · Privacy"
    lede="Your privacy is important to us. This policy explains what data we collect, how we use it, and the rights you have over it."
    :updated="updatedAt"
    contact-email="privacy@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      
          <!-- Introduction -->
          <section id="introduction" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p class="text-gray-700 mb-4">
              Welcome to SaaSWorld ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our software marketplace platform.
            </p>
            <p class="text-gray-700 mb-4">
              We are committed to protecting your privacy and ensuring transparency about our data practices. This policy applies to all users of our platform, including visitors, registered users, vendors, and customers.
            </p>
            <p class="text-gray-700">
              By using SaaSWorld, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access or use our platform.
            </p>
          </section>

          <!-- Information Collection -->
          <section id="information-collection" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p class="text-gray-700 mb-4">We may collect the following personal information:</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Name, email address, and contact information</li>
              <li>Account credentials and authentication data</li>
              <li>Profile information and preferences</li>
              <li>Payment and billing information</li>
              <li>Company information for business accounts</li>
              <li>Communication records and support interactions</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">2.2 Usage Information</h3>
            <p class="text-gray-700 mb-4">We automatically collect information about your interaction with our platform:</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>IP address, device information, and browser type</li>
              <li>Pages visited, time spent, and navigation patterns</li>
              <li>Search queries and feature usage</li>
              <li>Performance data and error reports</li>
              <li>Location data (if enabled)</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">2.3 Cookies and Tracking Technologies</h3>
            <p class="text-gray-700">
              We use cookies, web beacons, and similar technologies to enhance your experience and collect usage data. For detailed information, please see our <NuxtLink to="/cookies" class="text-blue-600 hover:text-blue-800">Cookie Policy</NuxtLink>.
            </p>
          </section>

          <!-- Usage -->
          <section id="usage" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">3. How We Use Information</h2>
            <p class="text-gray-700 mb-4">We use your information for the following purposes:</p>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.1 Platform Operations</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Provide and maintain our marketplace platform</li>
              <li>Process transactions and manage accounts</li>
              <li>Authenticate users and prevent fraud</li>
              <li>Provide customer support and technical assistance</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.2 Improvements and Analytics</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Analyze usage patterns and improve our services</li>
              <li>Develop new features and functionality</li>
              <li>Conduct research and analytics</li>
              <li>Monitor platform performance and security</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">3.3 Communications</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li>Send service updates and important notifications</li>
              <li>Provide marketing communications (with consent)</li>
              <li>Respond to inquiries and support requests</li>
              <li>Send newsletters and platform updates</li>
            </ul>
          </section>

          <!-- Sharing -->
          <section id="sharing" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p class="text-gray-700 mb-4">We may share your information in the following circumstances:</p>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">4.1 Service Providers</h3>
            <p class="text-gray-700 mb-4">We work with third-party service providers who assist us in operating our platform, including:</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Payment processors and financial institutions</li>
              <li>Cloud hosting and infrastructure providers</li>
              <li>Analytics and marketing services</li>
              <li>Customer support and communication tools</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">4.2 Legal Requirements</h3>
            <p class="text-gray-700 mb-4">We may disclose information when required by law or to:</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Comply with legal obligations and court orders</li>
              <li>Protect our rights and property</li>
              <li>Investigate fraud or security issues</li>
              <li>Ensure user safety and platform integrity</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">4.3 Business Transfers</h3>
            <p class="text-gray-700">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections.
            </p>
          </section>

          <!-- Security -->
          <section id="security" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p class="text-gray-700 mb-4">We implement comprehensive security measures to protect your information:</p>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">5.1 Technical Safeguards</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and penetration testing</li>
              <li>Intrusion detection and monitoring systems</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">5.2 Organizational Measures</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Employee training on data protection</li>
              <li>Limited access on a need-to-know basis</li>
              <li>Data processing agreements with vendors</li>
              <li>Incident response and breach notification procedures</li>
            </ul>

            <p class="text-gray-700">
              While we strive to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.
            </p>
          </section>

          <!-- Retention -->
          <section id="retention" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p class="text-gray-700 mb-4">We retain your information for as long as necessary to:</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Protect against fraud and security threats</li>
            </ul>
            <p class="text-gray-700 mb-4">
              When information is no longer needed, we securely delete or anonymize it according to our data retention schedule.
            </p>
            <p class="text-gray-700">
              You may request deletion of your personal information at any time, subject to legal and operational requirements.
            </p>
          </section>

          <!-- Rights -->
          <section id="rights" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p class="text-gray-700 mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">7.1 Access and Portability</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Request access to your personal information</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>View how your information is being used</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">7.2 Correction and Deletion</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Update your account preferences</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">7.3 Processing Controls</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Object to certain types of data processing</li>
              <li>Restrict how we use your information</li>
              <li>Withdraw consent for optional data uses</li>
            </ul>

            <p class="text-gray-700">
              To exercise these rights, please contact us using the information provided in the Contact section below.
            </p>
          </section>

          <!-- Cookies -->
          <section id="cookies" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p class="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience and collect analytics data. Our cookies include:
            </p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Essential cookies:</strong> Required for platform functionality</li>
              <li><strong>Analytics cookies:</strong> Help us understand usage patterns</li>
              <li><strong>Preference cookies:</strong> Remember your settings and choices</li>
              <li><strong>Marketing cookies:</strong> Deliver relevant advertisements</li>
            </ul>
            <p class="text-gray-700">
              You can manage your cookie preferences through your browser settings or our cookie management tool. For more information, see our <NuxtLink to="/cookies" class="text-blue-600 hover:text-blue-800">Cookie Policy</NuxtLink>.
            </p>
          </section>

          <!-- Third Party -->
          <section id="third-party" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p class="text-gray-700 mb-4">
              Our platform may integrate with or link to third-party services, including:
            </p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Software vendors and their applications</li>
              <li>Payment processors and financial services</li>
              <li>Social media platforms and authentication services</li>
              <li>Analytics and marketing tools</li>
            </ul>
            <p class="text-gray-700">
              These third parties have their own privacy policies, and we are not responsible for their data practices. We encourage you to review their policies before sharing information.
            </p>
          </section>

          <!-- International -->
          <section id="international" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">10. International Transfers</h2>
            <p class="text-gray-700 mb-4">
              SaaSWorld operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:
            </p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Compliance with applicable data protection laws</li>
              <li>Standard contractual clauses for international transfers</li>
              <li>Adequacy decisions for certain jurisdictions</li>
              <li>Additional security measures for sensitive data</li>
            </ul>
            <p class="text-gray-700">
              We are committed to protecting your information regardless of where it is processed.
            </p>
          </section>

          <!-- Children -->
          <section id="children" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
            <p class="text-gray-700 mb-4">
              SaaSWorld is not intended for use by children under the age of 13 (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children.
            </p>
            <p class="text-gray-700 mb-4">
              If we become aware that we have collected information from a child without parental consent, we will take steps to delete such information promptly.
            </p>
            <p class="text-gray-700">
              Parents and guardians who believe their child has provided personal information should contact us immediately.
            </p>
          </section>

          <!-- Changes -->
          <section id="changes" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Policy Changes</h2>
            <p class="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.
            </p>
            <p class="text-gray-700 mb-4">
              When we make significant changes, we will:
            </p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Notify users via email or platform notifications</li>
              <li>Post the updated policy on our website</li>
              <li>Update the "Last Modified" date</li>
              <li>Provide a summary of key changes</li>
            </ul>
            <p class="text-gray-700">
              Your continued use of SaaSWorld after policy changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <!-- Contact -->
          <section id="contact" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p class="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">SaaSWorld Privacy Office</h3>
              <div class="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@saasworld.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Tech Street, Suite 456<br>San Francisco, CA 94107<br>United States</p>
              </div>
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                <h4 class="text-md font-semibold text-gray-900 mb-2">Data Protection Officer</h4>
                <p class="text-gray-700">Email: dpo@saasworld.com</p>
              </div>
              
              <div class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="text-md font-semibold text-gray-900 mb-2">Response Time</h4>
                <p class="text-gray-700">We will respond to privacy inquiries within 30 days of receipt.</p>
              </div>
            </div>
          </section>

    </div>
  </LegalShell>
</template>

<script setup lang="ts">
// SEO Configuration
const { applySEO } = useSEO()

const updatedAt = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})

const tocSections = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'information-collection', label: '2. Information We Collect' },
  { id: 'usage', label: '3. How We Use Information' },
  { id: 'sharing', label: '4. Information Sharing' },
  { id: 'security', label: '5. Data Security' },
  { id: 'retention', label: '6. Data Retention' },
  { id: 'rights', label: '7. Your Rights' },
  { id: 'cookies', label: '8. Cookies and Tracking' },
  { id: 'third-party', label: '9. Third-Party Services' },
  { id: 'international', label: '10. International Transfers' },
  { id: 'children', label: "11. Children's Privacy" },
  { id: 'changes', label: '12. Policy Changes' },
  { id: 'contact', label: '13. Contact Information' }
]

applySEO({
  title: 'Privacy Policy | SaaSWorld - Data Protection and Privacy Rights',
  description: 'Learn how SaaSWorld protects your privacy and handles your personal data. Our comprehensive privacy policy explains data collection, usage, and your rights.',
  keywords: 'privacy policy, data protection, personal data, GDPR, privacy rights, data security, SaaSWorld privacy',
  canonical: 'https://saasworld.com/privacy',
  ogType: 'website',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description: 'SaaSWorld Privacy Policy and data protection practices',
    url: 'https://saasworld.com/privacy',
    publisher: {
      '@type': 'Organization',
      name: 'SaaSWorld',
      url: 'https://saasworld.com'
    }
  }
})

// Analytics tracking
onMounted(() => {
  const { $seoTracking } = useNuxtApp()
  $seoTracking.trackEvent('legal_page_view', {
    page: 'privacy',
    category: 'legal'
  })
})
</script>

