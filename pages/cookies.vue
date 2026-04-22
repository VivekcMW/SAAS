<template>
  <LegalShell
    title="Cookie Policy"
    eyebrow="Legal · Cookies"
    lede="How SaaSWorld uses cookies and similar technologies — and how you can control them at any time."
    :updated="updatedAt"
    contact-email="privacy@saasworld.com"
    :sections="tocSections"
  >
    <div class="cookies-quick">
      <div>
        <p class="cookies-quick__title">Cookie preferences</p>
        <p class="cookies-quick__body">Manage which cookie categories you allow.</p>
      </div>
      <button type="button" class="cookies-quick__btn">Manage cookies</button>
    </div>

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
  </LegalShell>
</template>

<script setup lang="ts">
// SEO Configuration
const { applySEO } = useSEO()

const updatedAt = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})

const tocSections = [
  { id: 'what-are-cookies', label: '1. What Are Cookies' },
  { id: 'how-we-use', label: '2. How We Use Cookies' },
  { id: 'types-of-cookies', label: '3. Types of Cookies' },
  { id: 'third-party', label: '4. Third-Party Cookies' },
  { id: 'cookie-management', label: '5. Cookie Management' },
  { id: 'browser-settings', label: '6. Browser Settings' },
  { id: 'impact-of-disabling', label: '7. Impact of Disabling' },
  { id: 'updates', label: '8. Policy Updates' },
  { id: 'contact', label: '9. Contact Information' }
]

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
.cookies-quick {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--sw-primary-soft, #fff1e6);
  border: 1px solid #f0d9bf;
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  margin: 0 0 2rem;
}
.cookies-quick__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.15rem;
}
.cookies-quick__body {
  font-size: 0.875rem;
  color: #52370f;
  margin: 0;
}
.cookies-quick__btn {
  background: var(--sw-primary, #ff8838);
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s ease;
}
.cookies-quick__btn:hover { background: var(--sw-primary-hover, #e67326); }
@media (max-width: 600px) {
  .cookies-quick { flex-direction: column; align-items: stretch; }
  .cookies-quick__btn { width: 100%; }
}
</style>
