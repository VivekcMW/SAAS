<template>
  <div class="privacy-page">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div class="mt-4 text-sm text-gray-500">
            Last updated: {{ new Date().toLocaleDateString() }}
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#introduction" class="text-blue-600 hover:text-blue-800">1. Introduction</a>
            <a href="#information-collection" class="text-blue-600 hover:text-blue-800">2. Information We Collect</a>
            <a href="#usage" class="text-blue-600 hover:text-blue-800">3. How We Use Information</a>
            <a href="#sharing" class="text-blue-600 hover:text-blue-800">4. Information Sharing</a>
            <a href="#security" class="text-blue-600 hover:text-blue-800">5. Data Security</a>
            <a href="#retention" class="text-blue-600 hover:text-blue-800">6. Data Retention</a>
            <a href="#rights" class="text-blue-600 hover:text-blue-800">7. Your Rights</a>
            <a href="#cookies" class="text-blue-600 hover:text-blue-800">8. Cookies and Tracking</a>
            <a href="#third-party" class="text-blue-600 hover:text-blue-800">9. Third-Party Services</a>
            <a href="#international" class="text-blue-600 hover:text-blue-800">10. International Transfers</a>
            <a href="#children" class="text-blue-600 hover:text-blue-800">11. Children's Privacy</a>
            <a href="#changes" class="text-blue-600 hover:text-blue-800">12. Policy Changes</a>
            <a href="#contact" class="text-blue-600 hover:text-blue-800">13. Contact Information</a>
          </div>
        </div>

        <!-- Content -->
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

        <!-- Footer Note -->
        <div class="mt-12 pt-8 border-t border-gray-200 text-center">
          <p class="text-sm text-gray-500">
            This Privacy Policy was last updated on {{ new Date().toLocaleDateString() }}. 
            For previous versions, please contact our Privacy Office.
          </p>
          <div class="mt-4">
            <NuxtLink to="/terms" class="text-blue-600 hover:text-blue-800 text-sm mr-6">Terms of Service</NuxtLink>
            <NuxtLink to="/cookies" class="text-blue-600 hover:text-blue-800 text-sm mr-6">Cookie Policy</NuxtLink>
            <NuxtLink to="/licenses" class="text-blue-600 hover:text-blue-800 text-sm">Licenses</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO Configuration
const { applySEO } = useSEO()

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

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  position: relative;
}

/* Typography Enhancements */
.prose {
  line-height: 1.7;
  color: #374151;
}

.prose h1 {
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prose h2 {
  color: #1e40af;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #3b82f6;
  scroll-margin-top: 6rem;
  position: relative;
}

.prose h2::before {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 2px;
}

.prose h3 {
  color: #1e40af;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  scroll-margin-top: 5rem;
  position: relative;
  padding-left: 1rem;
}

.prose h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.25rem;
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 2px;
}

.prose p {
  margin-bottom: 1.25rem;
  text-align: justify;
  text-justify: inter-word;
}

/* Enhanced Table of Contents */
.toc-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.toc-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
}

.toc-section h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #1e40af;
  font-size: 1.375rem;
  font-weight: 700;
  border-bottom: none;
  text-align: center;
}

.toc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.toc-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  color: #1e40af;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.toc-link::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
  transition: left 0.5s ease;
}

.toc-link:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
  color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.toc-link:hover::before {
  left: 100%;
}

/* Enhanced Link Styling */
.prose a {
  color: #1e40af;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.prose a::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
  transition: width 0.3s ease;
}

.prose a:hover::after {
  width: 100%;
}

.prose a:hover {
  color: #1d4ed8;
}

/* Section Styling with Privacy Themes */
.content-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
}

.content-section:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-3px);
}

/* List Enhancements with Privacy Icons */
.prose ul {
  list-style-type: none;
  padding-left: 0;
}

.prose ul li {
  position: relative;
  padding-left: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.prose ul li::before {
  content: "🔐";
  position: absolute;
  left: 0;
  top: 0;
  font-size: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 50%;
  border: 1px solid #3b82f6;
}

/* Contact Information with Privacy Theme */
.contact-box {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 16px;
  padding: 2.5rem;
  margin-top: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.contact-box::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: rotate(45deg);
}

.contact-box h3 {
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.375rem;
  font-weight: 700;
}

/* Footer with Privacy Theme */
.page-footer {
  margin-top: 3rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.1);
  backdrop-filter: blur(10px);
}

.footer-link:hover {
  background: rgba(96, 165, 250, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Animation for entrance */
.content-section {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .content-section {
    padding: 1.5rem;
  }
  
  .toc-section {
    padding: 1.5rem;
  }
  
  .toc-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .contact-box {
    padding: 1.5rem;
  }
}

/* Focus styles for accessibility */
.toc-link:focus,
.prose a:focus,
.footer-link:focus {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
  border-radius: 6px;
}
</style>
