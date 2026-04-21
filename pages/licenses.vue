<template>
  <div class="licenses-page">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Software Licenses</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            SaaSWorld is built using open source software and third-party libraries. Here are the licenses and attributions for the software that powers our platform.
          </p>
          <div class="mt-4 text-sm text-gray-500">
            Last updated: {{ new Date().toLocaleDateString() }}
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-2xl font-bold text-blue-600 mb-2">85+</div>
            <div class="text-sm text-gray-600">Open Source Libraries</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-2xl font-bold text-green-600 mb-2">12</div>
            <div class="text-sm text-gray-600">License Types</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-2xl font-bold text-purple-600 mb-2">100%</div>
            <div class="text-sm text-gray-600">Compliance Rate</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-2xl font-bold text-orange-600 mb-2">45+</div>
            <div class="text-sm text-gray-600">Contributors</div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#our-license" class="text-blue-600 hover:text-blue-800">1. Our Software License</a>
            <a href="#open-source" class="text-blue-600 hover:text-blue-800">2. Open Source Dependencies</a>
            <a href="#license-types" class="text-blue-600 hover:text-blue-800">3. License Types Overview</a>
            <a href="#frontend-licenses" class="text-blue-600 hover:text-blue-800">4. Frontend Libraries</a>
            <a href="#backend-licenses" class="text-blue-600 hover:text-blue-800">5. Backend Dependencies</a>
            <a href="#development-tools" class="text-blue-600 hover:text-blue-800">6. Development Tools</a>
            <a href="#fonts-assets" class="text-blue-600 hover:text-blue-800">7. Fonts and Assets</a>
            <a href="#compliance" class="text-blue-600 hover:text-blue-800">8. License Compliance</a>
            <a href="#attributions" class="text-blue-600 hover:text-blue-800">9. Attributions</a>
            <a href="#contact" class="text-blue-600 hover:text-blue-800">10. Contact Information</a>
          </div>
        </div>

        <!-- Content -->
        <div class="prose prose-lg max-w-none">
          
          <!-- Our License -->
          <section id="our-license" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Our Software License</h2>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">SaaSWorld Platform License</h3>
              <p class="text-blue-800 mb-3">
                The SaaSWorld platform is proprietary software owned by SaaSWorld Inc. All rights reserved.
              </p>
              <div class="bg-blue-100 rounded p-4">
                <p class="text-sm text-blue-900">
                  <strong>Copyright © 2024 SaaSWorld Inc.</strong><br>
                  This software and its source code are protected by copyright law and international treaties. 
                  Unauthorized reproduction or distribution is prohibited.
                </p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              While our platform is proprietary, we rely heavily on open source software and are committed to giving back to the community. 
              We contribute to open source projects and maintain several of our own open source tools.
            </p>
            <p class="text-gray-700">
              For licensing inquiries or partnership opportunities, please contact our legal team at legal@saasworld.com.
            </p>
          </section>

          <!-- Open Source -->
          <section id="open-source" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Open Source Dependencies</h2>
            <p class="text-gray-700 mb-4">
              SaaSWorld is built on the shoulders of giants. We use numerous open source libraries and frameworks that enable us to deliver a robust and feature-rich platform. We are grateful to all the maintainers and contributors of these projects.
            </p>
            
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <h3 class="text-lg font-semibold text-green-900 mb-2">Our Open Source Commitment</h3>
              <ul class="text-green-800 space-y-1">
                <li>• We strictly comply with all open source license requirements</li>
                <li>• We contribute back to projects we use extensively</li>
                <li>• We maintain proper attribution for all dependencies</li>
                <li>• We regularly audit our dependencies for security and compliance</li>
              </ul>
            </div>

            <p class="text-gray-700">
              Below you'll find detailed information about all the open source software we use, including license types, versions, and attributions.
            </p>
          </section>

          <!-- License Types -->
          <section id="license-types" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">3. License Types Overview</h2>
            <p class="text-gray-700 mb-4">
              Our platform uses software under various open source licenses. Here's an overview of the main license types:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- MIT License -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  MIT License
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Most permissive license. Allows commercial use, modification, and distribution.
                </p>
                <div class="text-xs text-gray-500">
                  Used by: Vue.js, Nuxt.js, Tailwind CSS, and many utilities
                </div>
              </div>

              <!-- Apache 2.0 -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  Apache 2.0
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Permissive license with patent protection. Requires attribution.
                </p>
                <div class="text-xs text-gray-500">
                  Used by: TypeScript, many Google libraries, infrastructure tools
                </div>
              </div>

              <!-- BSD Licenses -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                  BSD Licenses
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Permissive licenses with minimal restrictions on usage.
                </p>
                <div class="text-xs text-gray-500">
                  Used by: Various utilities and libraries
                </div>
              </div>

              <!-- ISC License -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                  ISC License
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Simplified version of MIT license with similar permissions.
                </p>
                <div class="text-xs text-gray-500">
                  Used by: Node.js ecosystem packages
                </div>
              </div>
            </div>
          </section>

          <!-- Frontend Licenses -->
          <section id="frontend-licenses" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Frontend Libraries</h2>
            <p class="text-gray-700 mb-4">
              Our frontend is built using modern web technologies and frameworks:
            </p>
            
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Library</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Vue.js</td>
                    <td class="px-4 py-3 text-sm text-gray-700">3.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Frontend framework</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Nuxt.js</td>
                    <td class="px-4 py-3 text-sm text-gray-700">3.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Vue.js framework</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Tailwind CSS</td>
                    <td class="px-4 py-3 text-sm text-gray-700">3.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">CSS framework</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">TypeScript</td>
                    <td class="px-4 py-3 text-sm text-gray-700">5.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Apache 2.0</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Type system</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Pinia</td>
                    <td class="px-4 py-3 text-sm text-gray-700">2.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">State management</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Vue Router</td>
                    <td class="px-4 py-3 text-sm text-gray-700">4.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Client-side routing</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Axios</td>
                    <td class="px-4 py-3 text-sm text-gray-700">1.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">HTTP client</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Lodash</td>
                    <td class="px-4 py-3 text-sm text-gray-700">4.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Utility library</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Backend Licenses -->
          <section id="backend-licenses" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Backend Dependencies</h2>
            <p class="text-gray-700 mb-4">
              Our backend services utilize various open source technologies:
            </p>
            
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technology</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Node.js</td>
                    <td class="px-4 py-3 text-sm text-gray-700">18.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">JavaScript runtime</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Express.js</td>
                    <td class="px-4 py-3 text-sm text-gray-700">4.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Web framework</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">PostgreSQL</td>
                    <td class="px-4 py-3 text-sm text-gray-700">15.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">PostgreSQL</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Database</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Redis</td>
                    <td class="px-4 py-3 text-sm text-gray-700">7.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">BSD</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Caching & sessions</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">Prisma</td>
                    <td class="px-4 py-3 text-sm text-gray-700">5.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Apache 2.0</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Database ORM</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">JWT</td>
                    <td class="px-4 py-3 text-sm text-gray-700">9.x</td>
                    <td class="px-4 py-3"><span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span></td>
                    <td class="px-4 py-3 text-sm text-gray-700">Authentication</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Development Tools -->
          <section id="development-tools" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Development Tools</h2>
            <p class="text-gray-700 mb-4">
              Our development workflow is powered by these open source tools:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Build Tools</h3>
                <ul class="space-y-2">
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Vite</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">ESLint</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Prettier</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">PostCSS</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                </ul>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Testing & Quality</h3>
                <ul class="space-y-2">
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Vitest</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Playwright</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Apache 2.0</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Husky</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Lint-staged</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Fonts and Assets -->
          <section id="fonts-assets" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Fonts and Assets</h2>
            <p class="text-gray-700 mb-4">
              We use various fonts and assets under open licenses:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Fonts</h3>
                <ul class="space-y-2">
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Inter</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">SIL OFL</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">JetBrains Mono</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Apache 2.0</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Material Icons</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Apache 2.0</span>
                  </li>
                </ul>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Icon Libraries</h3>
                <ul class="space-y-2">
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Heroicons</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Lucide Icons</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">ISC</span>
                  </li>
                  <li class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">Tabler Icons</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">MIT</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Compliance -->
          <section id="compliance" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">8. License Compliance</h2>
            <p class="text-gray-700 mb-4">
              We take license compliance seriously and have implemented processes to ensure we meet all obligations:
            </p>
            
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-green-900 mb-3">Our Compliance Process</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold text-green-800 mb-2">Automated Scanning</h4>
                  <ul class="text-sm text-green-700 space-y-1">
                    <li>• License detection in CI/CD pipeline</li>
                    <li>• Dependency vulnerability scanning</li>
                    <li>• Regular compliance audits</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-green-800 mb-2">Manual Review</h4>
                  <ul class="text-sm text-green-700 space-y-1">
                    <li>• Legal team review for new dependencies</li>
                    <li>• License compatibility assessment</li>
                    <li>• Attribution requirements verification</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-3">License Requirements We Follow</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Attribution:</strong> We maintain proper copyright notices and author attributions</li>
              <li><strong>License Inclusion:</strong> We include required license texts with our distributions</li>
              <li><strong>Source Code:</strong> We make source code available when required by copyleft licenses</li>
              <li><strong>Modification Notice:</strong> We document any modifications made to original code</li>
              <li><strong>Patent Grants:</strong> We respect patent grant conditions in licenses like Apache 2.0</li>
            </ul>
          </section>

          <!-- Attributions -->
          <section id="attributions" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Attributions</h2>
            <p class="text-gray-700 mb-4">
              We would like to thank the following projects and their contributors:
            </p>
            
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Special Thanks</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-800 mb-2">Framework Authors</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Evan You and the Vue.js team</li>
                    <li>• Sébastien Chopin and the Nuxt.js team</li>
                    <li>• Adam Wathan and the Tailwind CSS team</li>
                    <li>• Microsoft TypeScript team</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-800 mb-2">Infrastructure</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• PostgreSQL Global Development Group</li>
                    <li>• Redis core team</li>
                    <li>• Node.js Foundation</li>
                    <li>• The npm community</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-600">
                  And countless other open source contributors who make modern web development possible. 
                  Your dedication and hard work enable companies like ours to build amazing products.
                </p>
              </div>
            </div>
          </section>

          <!-- Contact -->
          <section id="contact" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p class="text-gray-700 mb-4">
              For questions about our software licenses or to report license compliance issues:
            </p>
            
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Legal & Compliance Team</h3>
              <div class="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@saasworld.com</p>
                <p><strong>License Compliance:</strong> compliance@saasworld.com</p>
                <p><strong>Open Source:</strong> opensource@saasworld.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Tech Street, Suite 456<br>San Francisco, CA 94107<br>United States</p>
              </div>
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                <h4 class="text-md font-semibold text-gray-900 mb-2">Response Time</h4>
                <p class="text-gray-700 text-sm">
                  We respond to license-related inquiries within 5 business days.
                </p>
              </div>
            </div>
          </section>

        </div>

        <!-- Footer Note -->
        <div class="mt-12 pt-8 border-t border-gray-200 text-center">
          <p class="text-sm text-gray-500">
            This license information was last updated on {{ new Date().toLocaleDateString() }}. 
            For the most current dependency list, please check our package.json files.
          </p>
          <div class="mt-4">
            <NuxtLink to="/terms" class="text-blue-600 hover:text-blue-800 text-sm mr-6">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy" class="text-blue-600 hover:text-blue-800 text-sm mr-6">Privacy Policy</NuxtLink>
            <NuxtLink to="/cookies" class="text-blue-600 hover:text-blue-800 text-sm">Cookie Policy</NuxtLink>
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
  title: 'Licenses | SaaSWorld - Open Source Licenses and Attributions',
  description: 'View SaaSWorld\'s open source licenses, third-party attributions, and software licensing information for our platform.',
  keywords: 'licenses, open source, attributions, software licenses, third-party licenses, MIT license, Apache license, GPL',
  canonical: 'https://saasworld.com/licenses',
  ogType: 'website',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Licenses',
    description: 'SaaSWorld software licenses and open source attributions',
    url: 'https://saasworld.com/licenses',
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
    page: 'licenses',
    category: 'legal'
  })
})
</script>

<style scoped>
.licenses-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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
  color: #14532d;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prose h2 {
  color: #16a34a;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #22c55e;
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
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
  border-radius: 2px;
}

.prose h3 {
  color: #16a34a;
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
  background: linear-gradient(180deg, #22c55e 0%, #4ade80 100%);
  border-radius: 2px;
}

.prose p {
  margin-bottom: 1.25rem;
  text-align: justify;
  text-justify: inter-word;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
  border-color: #22c55e;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Enhanced Table of Contents */
.toc-section {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border: 1px solid #bbf7d0;
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
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #4ade80 100%);
}

.toc-section h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #16a34a;
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
  color: #16a34a;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #bbf7d0;
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
  background: linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%);
  transition: left 0.5s ease;
}

.toc-link:hover {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  border-color: #22c55e;
  color: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.toc-link:hover::before {
  left: 100%;
}

/* License Platform Card */
.platform-license {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.platform-license::before {
  content: "©";
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  color: #3b82f6;
  opacity: 0.2;
  font-weight: 800;
}

.platform-license h3 {
  color: #1e40af;
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  padding-left: 0;
}

.platform-license h3::before {
  display: none;
}

.platform-license p {
  color: #1e40af;
  margin-bottom: 1.5rem;
}

.copyright-box {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid #93c5fd;
}

.copyright-box p {
  color: #1e3a8a;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Open Source Commitment */
.commitment-card {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 2px solid #10b981;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  position: relative;
}

.commitment-card::before {
  content: "💚";
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
}

.commitment-card h3 {
  color: #047857;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  padding-left: 0;
}

.commitment-card h3::before {
  display: none;
}

.commitment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.commitment-list li {
  color: #065f46;
  font-weight: 500;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
}

.commitment-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 800;
  font-size: 1.1rem;
}

/* License Type Cards */
.license-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.license-type-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.license-type-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--license-color, #22c55e);
}

.license-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #22c55e;
}

.license-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.license-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.license-indicator.mit {
  background: #10b981;
}

.license-indicator.apache {
  background: #3b82f6;
}

.license-indicator.bsd {
  background: #8b5cf6;
}

.license-indicator.isc {
  background: #eab308;
}

.license-name {
  color: #16a34a;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.license-description {
  color: #4b5563;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.license-usage {
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
}

/* Dependency Tables */
.dependency-table {
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

.dependency-table table {
  width: 100%;
  border-collapse: collapse;
}

.dependency-table thead {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
}

.dependency-table th {
  padding: 1rem;
  text-align: left;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dependency-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  font-size: 0.875rem;
}

.dependency-table tbody tr:hover {
  background-color: #f0fdf4;
}

.dependency-table .library-name {
  font-weight: 600;
  color: #16a34a;
}

.dependency-table .version {
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.dependency-table .purpose {
  color: #4b5563;
}

/* License Badges */
.license-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.license-badge:hover {
  transform: scale(1.05);
}

.license-badge.mit {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #15803d;
  border: 1px solid #22c55e;
}

.license-badge.apache {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.license-badge.bsd {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #6b21a8;
  border: 1px solid #8b5cf6;
}

.license-badge.postgresql {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
  border: 1px solid #a855f7;
}

/* Development Tools Grid */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.tool-category {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.tool-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.1);
  border-color: #22c55e;
}

.tool-category h3 {
  color: #16a34a;
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  padding-left: 0;
}

.tool-category h3::before {
  display: none;
}

.tool-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-name {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Attribution Section */
.attribution-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
  border-radius: 16px;
  padding: 2.5rem;
  margin: 2rem 0;
  position: relative;
  overflow: hidden;
}

.attribution-box::before {
  content: "🙏";
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 2.5rem;
  opacity: 0.3;
}

.attribution-box h3 {
  color: #15803d;
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  padding-left: 0;
}

.attribution-box h3::before {
  display: none;
}

.thanks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.thanks-category h4 {
  color: #16a34a;
  font-weight: 600;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.thanks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.thanks-list li {
  color: #4b5563;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.thanks-list li::before {
  content: "💚";
  position: absolute;
  left: 0;
  font-size: 0.75rem;
}

.thanks-note {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #bbf7d0;
  text-align: center;
}

.thanks-note p {
  color: #4b5563;
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
}

/* Contact Information with License Theme */
.contact-box {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  border-radius: 16px;
  padding: 2.5rem;
  margin-top: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.contact-box::before {
  content: "⚖️";
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

/* Footer with License Theme */
.page-footer {
  margin-top: 3rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #14532d 0%, #166534 100%);
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
  background: linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #86efac 100%);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #bbf7d0;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(187, 247, 208, 0.3);
  background: rgba(187, 247, 208, 0.1);
  backdrop-filter: blur(10px);
}

.footer-link:hover {
  background: rgba(187, 247, 208, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
}

/* Enhanced Link Styling */
.prose a {
  color: #16a34a;
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
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
  transition: width 0.3s ease;
}

.prose a:hover::after {
  width: 100%;
}

.prose a:hover {
  color: #15803d;
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
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .toc-section {
    padding: 1.5rem;
  }
  
  .toc-grid {
    grid-template-columns: 1fr;
  }
  
  .license-types-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .thanks-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .contact-box {
    padding: 1.5rem;
  }
  
  .dependency-table {
    overflow-x: auto;
  }
}

/* Focus styles for accessibility */
.toc-link:focus,
.prose a:focus,
.footer-link:focus {
  outline: 3px solid #4ade80;
  outline-offset: 2px;
  border-radius: 6px;
}

/* Code highlighting */
.dependency-table .library-name {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

/* Compliance badge */
.compliance-badge {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
