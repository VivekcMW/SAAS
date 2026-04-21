<template>
  <div class="cookies-page">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            This policy explains how we use cookies and similar technologies to enhance your experience on SaaSWorld.
          </p>
          <div class="mt-4 text-sm text-gray-500">
            Last updated: {{ new Date().toLocaleDateString() }}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-blue-900 mb-2">Cookie Preferences</h2>
              <p class="text-blue-700 text-sm">Manage your cookie settings and preferences</p>
            </div>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Manage Cookies
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#what-are-cookies" class="text-blue-600 hover:text-blue-800">1. What Are Cookies</a>
            <a href="#how-we-use" class="text-blue-600 hover:text-blue-800">2. How We Use Cookies</a>
            <a href="#types-of-cookies" class="text-blue-600 hover:text-blue-800">3. Types of Cookies</a>
            <a href="#third-party" class="text-blue-600 hover:text-blue-800">4. Third-Party Cookies</a>
            <a href="#cookie-management" class="text-blue-600 hover:text-blue-800">5. Cookie Management</a>
            <a href="#browser-settings" class="text-blue-600 hover:text-blue-800">6. Browser Settings</a>
            <a href="#impact-of-disabling" class="text-blue-600 hover:text-blue-800">7. Impact of Disabling</a>
            <a href="#updates" class="text-blue-600 hover:text-blue-800">8. Policy Updates</a>
            <a href="#contact" class="text-blue-600 hover:text-blue-800">9. Contact Information</a>
          </div>
        </div>

        <!-- Content -->
        <div class="prose prose-lg max-w-none">
          
          <!-- What Are Cookies -->
          <section id="what-are-cookies" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p class="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit our website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p class="text-gray-700 mb-4">
              Cookies contain information that is transferred to your device's hard drive and stored there. They help us recognize your device and remember certain information about your visit, such as your preferred language and other settings.
            </p>
            <p class="text-gray-700">
              SaaSWorld uses cookies to enhance your browsing experience, analyze website traffic, and provide personalized content and advertisements.
            </p>
          </section>

          <!-- How We Use -->
          <section id="how-we-use" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p class="text-gray-700 mb-4">We use cookies for several important purposes:</p>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">2.1 Essential Website Functions</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Maintain your login session and authentication</li>
              <li>Remember your preferences and settings</li>
              <li>Enable shopping cart and checkout functionality</li>
              <li>Provide security features and fraud prevention</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">2.2 Performance and Analytics</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Analyze how visitors use our website</li>
              <li>Monitor website performance and loading times</li>
              <li>Identify and fix technical issues</li>
              <li>Understand user behavior and preferences</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">2.3 Personalization and Marketing</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li>Customize content based on your interests</li>
              <li>Show relevant software recommendations</li>
              <li>Deliver targeted advertisements</li>
              <li>Measure marketing campaign effectiveness</li>
            </ul>
          </section>

          <!-- Types of Cookies -->
          <section id="types-of-cookies" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            
            <div class="space-y-6">
              <!-- Essential Cookies -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                  Essential Cookies
                </h3>
                <p class="text-gray-700 mb-3">
                  These cookies are strictly necessary for our website to function properly. They cannot be disabled.
                </p>
                <div class="bg-gray-50 rounded p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li>• Authentication tokens for logged-in users</li>
                    <li>• Session identifiers for maintaining your browsing session</li>
                    <li>• Security cookies for CSRF protection</li>
                    <li>• Load balancing cookies for website performance</li>
                  </ul>
                </div>
              </div>

              <!-- Performance Cookies -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                  Performance Cookies
                </h3>
                <p class="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting anonymous data.
                </p>
                <div class="bg-gray-50 rounded p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li>• Google Analytics cookies (_ga, _gid, _gat)</li>
                    <li>• Page view tracking and user journey analysis</li>
                    <li>• Performance monitoring and error reporting</li>
                    <li>• Heat mapping and user interaction tracking</li>
                  </ul>
                </div>
              </div>

              <!-- Functional Cookies -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  Functional Cookies
                </h3>
                <p class="text-gray-700 mb-3">
                  These cookies enable enhanced functionality and personalization based on your preferences.
                </p>
                <div class="bg-gray-50 rounded p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li>• Language and region preferences</li>
                    <li>• Theme and display settings</li>
                    <li>• Recently viewed products and search history</li>
                    <li>• Personalized recommendations</li>
                  </ul>
                </div>
              </div>

              <!-- Marketing Cookies -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  Marketing Cookies
                </h3>
                <p class="text-gray-700 mb-3">
                  These cookies are used to deliver advertisements that are relevant to you and your interests.
                </p>
                <div class="bg-gray-50 rounded p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul class="text-sm text-gray-700 space-y-1">
                    <li>• Google Ads and remarketing cookies</li>
                    <li>• Social media advertising pixels</li>
                    <li>• Campaign tracking and attribution</li>
                    <li>• Cross-device advertising coordination</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- Third Party -->
          <section id="third-party" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p class="text-gray-700 mb-4">
              We work with trusted third-party services that may set their own cookies on your device. These partners help us provide better services and understand our audience.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Analytics Services</h3>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li>• Google Analytics</li>
                  <li>• Mixpanel</li>
                  <li>• Hotjar</li>
                  <li>• Segment</li>
                </ul>
              </div>
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Advertising Partners</h3>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li>• Google Ads</li>
                  <li>• Facebook Pixel</li>
                  <li>• LinkedIn Insights</li>
                  <li>• Twitter Analytics</li>
                </ul>
              </div>
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Support Services</h3>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li>• Intercom</li>
                  <li>• Zendesk</li>
                  <li>• Crisp Chat</li>
                  <li>• Help Scout</li>
                </ul>
              </div>
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Payment Processors</h3>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li>• Stripe</li>
                  <li>• PayPal</li>
                  <li>• Apple Pay</li>
                  <li>• Google Pay</li>
                </ul>
              </div>
            </div>

            <p class="text-gray-700 mt-4">
              These third parties have their own privacy policies. We encourage you to review their policies to understand how they use cookies and protect your privacy.
            </p>
          </section>

          <!-- Cookie Management -->
          <section id="cookie-management" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Cookie Management</h2>
            <p class="text-gray-700 mb-4">
              You have control over how cookies are used on our website. We provide several ways to manage your cookie preferences:
            </p>
            
            <h3 class="text-xl font-semibold text-gray-900 mb-3">5.1 Cookie Consent Manager</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p class="text-blue-800 mb-3">
                Use our cookie consent manager to customize your preferences for different types of cookies.
              </p>
              <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Open Cookie Settings
              </button>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">5.2 Account Settings</h3>
            <p class="text-gray-700 mb-4">
              Logged-in users can manage cookie preferences through their account settings. Visit your profile settings to customize:
            </p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Analytics and performance tracking</li>
              <li>Personalization features</li>
              <li>Marketing communications</li>
              <li>Third-party integrations</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">5.3 Browser Controls</h3>
            <p class="text-gray-700">
              Most web browsers allow you to control cookies through their settings. You can block or delete cookies, but this may affect website functionality.
            </p>
          </section>

          <!-- Browser Settings -->
          <section id="browser-settings" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Browser Settings</h2>
            <p class="text-gray-700 mb-4">
              Here's how to manage cookies in popular web browsers:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="text-2xl mr-2">🌐</span> Chrome
                </h3>
                <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Go to Settings > Privacy and security</li>
                  <li>Click "Cookies and other site data"</li>
                  <li>Choose your preferred cookie settings</li>
                  <li>Manage exceptions for specific sites</li>
                </ol>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="text-2xl mr-2">🦊</span> Firefox
                </h3>
                <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Go to Settings > Privacy & Security</li>
                  <li>Find "Cookies and Site Data"</li>
                  <li>Configure tracking protection</li>
                  <li>Manage data for individual sites</li>
                </ol>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="text-2xl mr-2">🧭</span> Safari
                </h3>
                <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Go to Preferences > Privacy</li>
                  <li>Choose "Block all cookies" or customize</li>
                  <li>Manage website data</li>
                  <li>Configure cross-site tracking</li>
                </ol>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="text-2xl mr-2">🌊</span> Edge
                </h3>
                <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Go to Settings > Cookies and site permissions</li>
                  <li>Click "Cookies and site data"</li>
                  <li>Choose blocking options</li>
                  <li>Manage site-specific permissions</li>
                </ol>
              </div>
            </div>

            <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-yellow-800 text-sm">
                <strong>Note:</strong> Disabling cookies may affect your ability to use certain features of our website. Some functionality may not work properly without cookies enabled.
              </p>
            </div>
          </section>

          <!-- Impact of Disabling -->
          <section id="impact-of-disabling" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Impact of Disabling Cookies</h2>
            <p class="text-gray-700 mb-4">
              While you can disable cookies, doing so may impact your experience on SaaSWorld:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3 text-red-600">Potential Issues</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1">
                  <li>Login sessions may not persist</li>
                  <li>Preferences won't be remembered</li>
                  <li>Shopping cart may not function</li>
                  <li>Personalized content unavailable</li>
                  <li>Analytics data collection disabled</li>
                  <li>Targeted ads may be less relevant</li>
                </ul>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3 text-green-600">What Still Works</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1">
                  <li>Basic website navigation</li>
                  <li>Content browsing and reading</li>
                  <li>Search functionality</li>
                  <li>Contact forms</li>
                  <li>Public content access</li>
                  <li>Mobile app functionality</li>
                </ul>
              </div>
            </div>

            <p class="text-gray-700 mt-4">
              We recommend allowing at least essential cookies to ensure the best possible experience on our platform.
            </p>
          </section>

          <!-- Updates -->
          <section id="updates" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Policy Updates</h2>
            <p class="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
            </p>
            <p class="text-gray-700 mb-4">
              When we make significant changes, we will:
            </p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Update the "Last Modified" date at the top of this policy</li>
              <li>Notify you through our website or email</li>
              <li>Request renewed consent where required</li>
              <li>Provide a summary of key changes</li>
            </ul>
            <p class="text-gray-700">
              We encourage you to review this policy periodically to stay informed about how we use cookies.
            </p>
          </section>

          <!-- Contact -->
          <section id="contact" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p class="text-gray-700 mb-4">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">SaaSWorld Cookie Support</h3>
              <div class="space-y-2 text-gray-700">
                <p><strong>Email:</strong> cookies@saasworld.com</p>
                <p><strong>Privacy Office:</strong> privacy@saasworld.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Tech Street, Suite 456<br>San Francisco, CA 94107<br>United States</p>
              </div>
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                <h4 class="text-md font-semibold text-gray-900 mb-2">Quick Links</h4>
                <div class="flex flex-wrap gap-4 text-sm">
                  <button class="text-blue-600 hover:text-blue-800">Manage Cookie Preferences</button>
                  <NuxtLink to="/privacy" class="text-blue-600 hover:text-blue-800">Privacy Policy</NuxtLink>
                  <NuxtLink to="/terms" class="text-blue-600 hover:text-blue-800">Terms of Service</NuxtLink>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- Footer Note -->
        <div class="mt-12 pt-8 border-t border-gray-200 text-center">
          <p class="text-sm text-gray-500">
            This Cookie Policy was last updated on {{ new Date().toLocaleDateString() }}. 
            For questions about previous versions, please contact our support team.
          </p>
          <div class="mt-4">
            <NuxtLink to="/terms" class="text-blue-600 hover:text-blue-800 text-sm mr-6">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy" class="text-blue-600 hover:text-blue-800 text-sm mr-6">Privacy Policy</NuxtLink>
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
  title: 'Cookie Policy | SaaSWorld - Cookie Usage and Management',
  description: 'Learn about SaaSWorld\'s cookie policy, including how we use cookies, tracking technologies, and how to manage your preferences.',
  keywords: 'cookie policy, cookies, tracking, web analytics, privacy preferences, data collection, SaaSWorld cookies',
  canonical: 'https://saasworld.com/cookies',
  ogType: 'website',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cookie Policy',
    description: 'SaaSWorld Cookie Policy and tracking technologies',
    url: 'https://saasworld.com/cookies',
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
    page: 'cookies',
    category: 'legal'
  })
})
</script>

<style scoped>
.cookies-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%);
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
  color: #9a3412;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prose h2 {
  color: #ea580c;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #f97316;
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
  background: linear-gradient(90deg, #ea580c 0%, #f97316 100%);
  border-radius: 2px;
}

.prose h3 {
  color: #ea580c;
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
  background: linear-gradient(180deg, #f97316 0%, #fb923c 100%);
  border-radius: 2px;
}

.prose p {
  margin-bottom: 1.25rem;
  text-align: justify;
  text-justify: inter-word;
}

/* Cookie Preferences Banner */
.cookie-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
}

.cookie-banner::before {
  content: "🍪";
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  opacity: 0.7;
}

.cookie-banner h2 {
  color: #1e40af;
  margin-top: 0;
  margin-bottom: 0.5rem;
  border-bottom: none;
  font-size: 1.25rem;
}

.cookie-banner p {
  color: #1e40af;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.cookie-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.cookie-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgba(59, 130, 246, 0.4);
}

/* Enhanced Table of Contents */
.toc-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefbf3 100%);
  border: 1px solid #fed7aa;
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
  background: linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%);
}

.toc-section h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #ea580c;
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
  color: #ea580c;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #fed7aa;
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
  background: linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.1) 50%, transparent 100%);
  transition: left 0.5s ease;
}

.toc-link:hover {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border-color: #f97316;
  color: #c2410c;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.toc-link:hover::before {
  left: 100%;
}

/* Cookie Type Cards */
.cookie-type-card {
  background: linear-gradient(135deg, #ffffff 0%, #fefbf3 100%);
  border: 2px solid #fed7aa;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cookie-type-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--cookie-type-color, #f97316);
}

.cookie-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  border-color: #f97316;
}

.cookie-type-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.cookie-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.cookie-indicator.essential {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.cookie-indicator.performance {
  background: #eab308;
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
}

.cookie-indicator.functional {
  background: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.cookie-indicator.marketing {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.cookie-examples {
  background: linear-gradient(135deg, #fefbf3 0%, #fed7aa 100%);
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.cookie-examples h4 {
  color: #ea580c;
  margin: 0 0 1rem 0;
  font-weight: 600;
  font-size: 0.875rem;
}

.cookie-examples ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.cookie-examples li {
  color: #9a3412;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.cookie-examples li::before {
  content: "🍪";
  position: absolute;
  left: 0;
  font-size: 0.625rem;
}

/* Browser Guide Cards */
.browser-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.browser-card {
  background: linear-gradient(135deg, #ffffff 0%, #fefbf3 100%);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.browser-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
}

.browser-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #f97316;
}

.browser-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.browser-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}

.browser-name {
  color: #ea580c;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.browser-steps {
  counter-reset: step-counter;
  list-style: none;
  padding: 0;
  margin: 0;
}

.browser-steps li {
  counter-increment: step-counter;
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.browser-steps li::before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  color: white;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Third Party Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.service-category {
  background: linear-gradient(135deg, #ffffff 0%, #fefbf3 100%);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.service-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.1);
  border-color: #f97316;
}

.service-category h3 {
  color: #ea580c;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  padding-left: 0;
}

.service-category h3::before {
  display: none;
}

.service-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-list li {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.service-list li::before {
  content: "🔗";
  position: absolute;
  left: 0;
  font-size: 0.75rem;
}

/* Enhanced Link Styling */
.prose a {
  color: #ea580c;
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
  background: linear-gradient(90deg, #ea580c 0%, #f97316 100%);
  transition: width 0.3s ease;
}

.prose a:hover::after {
  width: 100%;
}

.prose a:hover {
  color: #c2410c;
}

/* Impact Cards */
.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.impact-card {
  padding: 2rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.impact-card.issues {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border: 1px solid #f87171;
}

.impact-card.works {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
  border: 1px solid #4ade80;
}

.impact-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

.impact-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  padding-left: 0;
}

.impact-card h3::before {
  display: none;
}

.impact-card.issues h3 {
  color: #dc2626;
}

.impact-card.works h3 {
  color: #16a34a;
}

.impact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.impact-list li {
  margin-bottom: 0.75rem;
  padding-left: 2rem;
  position: relative;
  font-size: 0.875rem;
  line-height: 1.5;
}

.impact-card.issues .impact-list li {
  color: #991b1b;
}

.impact-card.works .impact-list li {
  color: #15803d;
}

.impact-card.issues .impact-list li::before {
  content: "⚠️";
  position: absolute;
  left: 0;
  font-size: 1rem;
}

.impact-card.works .impact-list li::before {
  content: "✅";
  position: absolute;
  left: 0;
  font-size: 1rem;
}

/* Contact Information with Cookie Theme */
.contact-box {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  border-radius: 16px;
  padding: 2.5rem;
  margin-top: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.contact-box::before {
  content: "🍪";
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  opacity: 0.2;
}

.contact-box h3 {
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.375rem;
  font-weight: 700;
  padding-left: 0;
}

.contact-box h3::before {
  display: none;
}

/* Footer with Cookie Theme */
.page-footer {
  margin-top: 3rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #7c2d12 0%, #9a3412 100%);
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
  background: linear-gradient(90deg, #f97316 0%, #fb923c 50%, #fdba74 100%);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #fed7aa;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(253, 215, 170, 0.3);
  background: rgba(253, 215, 170, 0.1);
  backdrop-filter: blur(10px);
}

.footer-link:hover {
  background: rgba(253, 215, 170, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
}

/* Warning Box */
.warning-box {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  border-left: 4px solid #f59e0b;
  position: relative;
}

.warning-box::before {
  content: "⚠️";
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.25rem;
}

.warning-box p {
  color: #92400e;
  margin: 0;
  font-weight: 500;
  font-size: 0.875rem;
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
  
  .toc-section {
    padding: 1.5rem;
  }
  
  .toc-grid {
    grid-template-columns: 1fr;
  }
  
  .browser-grid {
    grid-template-columns: 1fr;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .impact-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .contact-box {
    padding: 1.5rem;
  }
  
  .cookie-banner {
    padding: 1.5rem;
  }
}

/* Focus styles for accessibility */
.toc-link:focus,
.prose a:focus,
.footer-link:focus,
.cookie-button:focus {
  outline: 3px solid #fb923c;
  outline-offset: 2px;
  border-radius: 6px;
}

/* Cookie animation */
@keyframes cookieBounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -10px, 0);
  }
  70% {
    transform: translate3d(0, -5px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

.cookie-float {
  animation: cookieBounce 2s infinite;
}
</style>
