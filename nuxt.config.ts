// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Use the current date as recommended by Nitro
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    ['@nuxtjs/google-fonts', {
      families: {
        Poppins: [400, 500, 600, 700, 800],
        Inter: [400, 500, 600, 700],
        'JetBrains Mono': [500, 600]
      },
      display: 'swap',
      preload: true
    }],
  ],

  // SEO and Performance Configuration
  experimental: {
    payloadExtraction: false
  },

  nitro: {
    prerender: {
      routes: ['/api/sitemap.xml', '/api/robots.txt']
    },
    compressPublicAssets: true
  },

  // Per-route headers — embed pages must be iframe-safe
  routeRules: {
    '/embed/**': {
      headers: {
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *",
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      }
    }
  },

  // Configure @nuxt/icon
  icon: {
    size: '24px',
    class: 'icon',
    mode: 'svg',
    serverBundle: {
      collections: ['heroicons', 'simple-icons', 'logos', 'mdi']
    }
  },

  // Configure @nuxtjs/i18n
  i18n: {
    vueI18n: './i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false
    },
    locales: [
      { code: 'en', name: 'English', file: 'en.json', flag: 'us' },
      { code: 'es', name: 'Español', file: 'es.json', flag: 'es' },
      { code: 'fr', name: 'Français', file: 'fr.json', flag: 'fr' },
      { code: 'de', name: 'Deutsch', file: 'de.json', flag: 'de' },
      { code: 'pt', name: 'Português', file: 'pt.json', flag: 'pt' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    }
  },

  // Global CSS - order matters!
  css: [
    '~/assets/css/tokens.css',    // Design tokens (single source of truth — must load first)
    '~/assets/css/reset.css',     // Normalize browser styles
    '~/assets/css/global.css',    // Global layout rules
    '~/assets/css/main.css',      // Base elements + utility classes
    '~/assets/scss/main.scss',    // SCSS component styles
    '~/assets/css/responsive-fixes.css',
  ],

  // Vite configuration for SCSS
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Remove additionalData since we're using @use in the main.scss file
        }
      }
    }
  },
  
  // App Config with SEO optimizations
  app: {
    head: {
      title: 'SaaSWorld - Global Software Marketplace for Business Solutions',
      titleTemplate: '%s | SaaSWorld',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs with expert reviews and comparisons.' },
        { name: 'keywords', content: 'saas marketplace, business software, enterprise solutions, software directory, digital tools, cloud applications, software comparison, saas platform, global software marketplace' },
        { name: 'author', content: 'SaaSWorld' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#1a73e8' },
        { name: 'msapplication-TileColor', content: '#1a73e8' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'SaaSWorld' },
        
        // Open Graph / Social Media Meta Tags
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SaaSWorld' },
        { property: 'og:title', content: 'SaaSWorld - Global Software Marketplace for Business Solutions' },
        { property: 'og:description', content: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs.' },
        { property: 'og:image', content: 'https://saasworld.com/assets/images/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://saasworld.com' },
        { property: 'og:locale', content: 'en_US' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@SaaSWorld' },
        { name: 'twitter:creator', content: '@SaaSWorld' },
        { name: 'twitter:title', content: 'SaaSWorld - Global Software Marketplace for Business Solutions' },
        { name: 'twitter:description', content: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs.' },
        { name: 'twitter:image', content: 'https://saasworld.com/assets/images/og-image.jpg' },
        
        // Additional SEO tags
        { name: 'application-name', content: 'SaaSWorld' },
        { name: 'referrer', content: 'origin-when-cross-origin' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'canonical', href: 'https://saasworld.com' },
        
        // Preconnect for performance
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
        { rel: 'dns-prefetch', href: '//www.googletagmanager.com' }
      ],
      htmlAttrs: {
        lang: 'en'
      }
    }
  },

  // Auto-imports configuration
  imports: {
    dirs: [
      'composables',
      'composables/**',
      'utils',
      'utils/**'
    ]
  },

  // Components auto-import configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Runtime config for global features
  runtimeConfig: {
    public: {
      // Exchange rates API (example: fixer.io or similar)
      exchangeRatesApi: 'https://api.exchangerate-api.com/v4/latest/',
      // Regional settings
      regions: {
        US: { name: 'United States', currency: 'USD', tax: 8.5, locale: 'en-US', flag: 'us' },
        EU: { name: 'European Union', currency: 'EUR', tax: 20, locale: 'en-GB', flag: 'eu' },
        BR: { name: 'Brazil', currency: 'BRL', tax: 17, locale: 'pt-BR', flag: 'br' },
        IN: { name: 'India', currency: 'INR', tax: 18, locale: 'hi-IN', flag: 'in' },
        JP: { name: 'Japan', currency: 'JPY', tax: 10, locale: 'ja-JP', flag: 'jp' },
        CN: { name: 'China', currency: 'CNY', tax: 13, locale: 'zh-CN', flag: 'cn' },
        SA: { name: 'Saudi Arabia', currency: 'SAR', tax: 15, locale: 'ar-SA', flag: 'sa' }
      }
    }
  }
})