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
        'Plus Jakarta Sans': [300, 400, 500, 600, 700, 800],
        'JetBrains Mono': [300, 400, 500, 600]
      },
      display: 'swap',
      preload: true
    }],
  ],

  image: {
    provider: 'none'
  },

  // SEO and Performance Configuration
  experimental: {
    payloadExtraction: false
  },

  nitro: {
    prerender: {
      routes: ['/api/sitemap.xml', '/api/robots.txt']
    },
    compressPublicAssets: true,
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // Run session cleanup every hour
      '0 * * * *': ['session:cleanup'],
      // Run renewal reminders every day at 08:00 UTC
      '0 8 * * *': ['renewals:reminders'],
      // Discovery agent — daily sources (Product Hunt + Hacker News + Reddit) at 3am UTC
      '0 3 * * *': ['discovery:daily'],
      // Discovery agent — weekly sources (YC + GitHub + IndieHackers + AppSumo + Zapier) every Sunday at 2am UTC
      '0 2 * * 0': ['discovery:weekly'],
      // Discovery enrichment — Proxycurl enrichment batch daily at 4am UTC (after crawlers)
      '0 4 * * *': ['discovery:enrich'],
      // Cat 1 — Extended discovery (AwesomeLists + VC Portfolios + BetaList + AlternativeTo) Saturday 1am UTC
      '0 1 * * 6': ['discovery:extended'],
      // Cat 1 — Crunchbase discovery crawler Sunday 3am UTC (after dedup runs at 1am)
      '0 3 * * 0': ['discovery:crunchbase'],
      // Cat 2 — Screenshot capture daily 5am UTC (after enrichment at 4am)
      '0 5 * * *': ['discovery:screenshots'],
      // Cat 2 — Pricing monitor Wednesday 3am UTC
      '0 3 * * 3': ['discovery:pricing'],
      // Cat 2 — Review sync Thursday 2am UTC
      '0 2 * * 4': ['discovery:reviews'],
      // Cat 2 — Crunchbase enrichment Friday 2am UTC
      '0 2 * * 5': ['discovery:cb-enrich'],
      // Cat 3 — Duplicate merger Sunday 1am UTC (before weekly crawlers at 2am)
      '0 1 * * 0': ['discovery:dedup'],
      // Weekly digest emails — every Monday at 08:00 UTC
      '0 8 * * 1': ['digest:weekly'],
      // Price-drop alerts — daily at 09:00 UTC (after renewals run at 08:00)
      '0 9 * * *': ['price-alerts:daily']
    }
  },

  // Per-route headers — embed pages must be iframe-safe
  routeRules: {
    // Default security headers for all routes
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://api.openai.com https://api.stability.ai",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      }
    },
    // Embed pages must allow cross-origin iframing
    '/embed/**': {
      headers: {
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *",
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      }
    },
    // Cache static marketplace pages
    '/marketplace': { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
    '/marketplace/**': { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },

    // Public content pages — short cache with stale-while-revalidate
    '/news': { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    '/news/**': { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    '/integrations': { headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' } },
    '/integrations/**': { headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' } },
    '/categories/**': { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' } },

    // Public API routes — Nitro-level cache + headers
    '/api/news': { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } },
    '/api/news/**': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
    '/api/apps': { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=300' } },
    '/api/apps/**': { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=300' } },
    '/api/categories/**': { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } },
    '/api/public/**': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
    '/api/stats/**': { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } },
    '/api/qa/questions': { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    '/api/qa/tags': { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } },
    '/api/rfp': { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    '/api/prices/**': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },

    // Never cache auth or dashboard routes
    '/login': { headers: { 'Cache-Control': 'no-store' } },
    '/signup': { headers: { 'Cache-Control': 'no-store' } },
    '/dashboard/**': { headers: { 'Cache-Control': 'no-store' } },

    // Auth APIs — never cache, ever
    '/api/auth/**': { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' } },

    // Private user/vendor/admin/billing APIs — never cache
    '/api/user/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/vendor/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/admin/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/billing/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/stack/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/affiliate/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/buying-rooms/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/ai/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/onboarding/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/rfp/*/respond': { headers: { 'Cache-Control': 'no-store' } },

    // Content pages — blog, changelog, roadmap, guides, careers
    '/blog': { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' } },
    '/blog/**': { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' } },
    '/changelog': { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' } },
    '/roadmap': { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    '/guides': { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' } },
    '/guides/**': { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=900' } },
    '/careers': { headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' } },

    // Content APIs
    '/api/changelog': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
    '/api/roadmap': { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    '/api/guides': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
    '/api/guides/**': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
    '/api/careers/**': { headers: { 'Cache-Control': 'public, max-age=600, s-maxage=1800' } },
    '/api/blog/**': { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
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
      { code: 'pt', name: 'Português', file: 'pt.json', flag: 'pt' },
      { code: 'zh', name: '中文', file: 'zh.json', flag: 'cn' },
      { code: 'ja', name: '日本語', file: 'ja.json', flag: 'jp' },
      { code: 'ar', name: 'العربية', file: 'ar.json', flag: 'sa', dir: 'rtl' },
      { code: 'hi', name: 'हिन्दी', file: 'hi.json', flag: 'in' },
      { code: 'ko', name: '한국어', file: 'ko.json', flag: 'kr' }
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
    '~/assets/css/marketing.css', // Tier 3 marketing/SEO page styles
    '~/assets/css/buyer.css',     // Buyer workspace design system
    '~/assets/css/vendor.css',    // Vendor workspace design system
    '~/assets/css/admin.css',     // Admin console design system
    '~/assets/css/rtl.css',       // RTL (Arabic) directional overrides
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
      title: 'Moonmart - Your world of software, connected.',
      titleTemplate: '%s | Moonmart',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Moonmart is the global SaaS marketplace — discover, compare, and launch the right software for every team. Real reviews, transparent pricing, trusted vendors.' },
        { name: 'keywords', content: 'moonmart, saas marketplace, global software marketplace, business software, enterprise solutions, software directory, cloud applications, software comparison' },
        { name: 'author', content: 'Moonmart' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#D4A843' },
        { name: 'msapplication-TileColor', content: '#07090F' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Moonmart' },
        
        // Open Graph / Social Media Meta Tags
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Moonmart' },
        { property: 'og:title', content: 'Moonmart - Your world of software, connected.' },
        { property: 'og:description', content: 'Moonmart is the global SaaS marketplace — discover, compare, and launch the right software for every team.' },
        { property: 'og:image', content: 'https://moonmart.ai/assets/images/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://moonmart.ai' },
        { property: 'og:locale', content: 'en_US' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@moonmart' },
        { name: 'twitter:creator', content: '@moonmart' },
        { name: 'twitter:title', content: 'Moonmart - Your world of software, connected.' },
        { name: 'twitter:description', content: 'Moonmart is the global SaaS marketplace — discover, compare, and launch the right software for every team.' },
        { name: 'twitter:image', content: 'https://moonmart.ai/assets/images/og-image.jpg' },
        
        // Additional SEO tags
        { name: 'application-name', content: 'Moonmart' },
        { name: 'referrer', content: 'origin-when-cross-origin' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'canonical', href: 'https://moonmart.ai' },
        
        // Preconnect for performance
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
        // Analytics dns-prefetch is injected client-side only after consent (see plugins/seo.client.ts)
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
    // Private (server-only) — set via .env
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    public: {
      // Exchange rates API (example: fixer.io or similar)
      exchangeRatesApi: 'https://api.exchangerate-api.com/v4/latest/',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      oauthGoogleEnabled: !!(process.env.GOOGLE_CLIENT_ID),
      oauthGithubEnabled: !!(process.env.GITHUB_CLIENT_ID),
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