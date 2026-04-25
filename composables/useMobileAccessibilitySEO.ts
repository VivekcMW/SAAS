/**
 * Mobile & Accessibility SEO Optimization
 * Enhances mobile experience and accessibility for better SEO performance
 */

export const useMobileAccessibilitySEO = () => {
  // Mobile-first SEO optimization
  const optimizeForMobile = () => {
    const mobileOptimizations = {
      viewport: {
        meta: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
        recommendations: [
          'Use responsive design principles',
          'Ensure touch targets are at least 44px',
          'Optimize for one-handed usage',
          'Test on various device sizes'
        ]
      },
      performance: {
        targetMetrics: {
          LCP: '< 2.5s',
          FID: '< 100ms',
          CLS: '< 0.1',
          FCP: '< 1.8s'
        },
        optimizations: [
          'Compress and optimize images',
          'Minimize JavaScript execution time',
          'Use modern image formats (WebP, AVIF)',
          'Implement lazy loading',
          'Enable text compression'
        ]
      },
      usability: {
        guidelines: [
          'Make buttons and links easily tappable',
          'Use readable font sizes (16px minimum)',
          'Ensure sufficient color contrast',
          'Provide clear navigation',
          'Avoid horizontal scrolling'
        ]
      }
    }

    return mobileOptimizations
  }

  // Progressive Web App (PWA) optimization
  const generatePWAManifest = (appInfo: {
    name: string
    shortName: string
    description: string
    themeColor: string
    backgroundColor: string
  }) => {
    return {
      name: appInfo.name,
      short_name: appInfo.shortName,
      description: appInfo.description,
      start_url: '/',
      display: 'standalone',
      background_color: appInfo.backgroundColor,
      theme_color: appInfo.themeColor,
      orientation: 'portrait-primary',
      categories: ['business', 'productivity', 'utilities'],
      lang: 'en',
      dir: 'ltr',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ],
      shortcuts: [
        {
          name: 'Browse Software',
          short_name: 'Browse',
          description: 'Browse software categories',
          url: '/marketplace',
          icons: [{ src: '/icons/browse-96x96.png', sizes: '96x96' }]
        },
        {
          name: 'Submit Software',
          short_name: 'Submit',
          description: 'Submit your software',
          url: '/submit',
          icons: [{ src: '/icons/submit-96x96.png', sizes: '96x96' }]
        }
      ],
      screenshots: [
        {
          src: '/screenshots/desktop-home.png',
          sizes: '1280x720',
          type: 'image/png',
          platform: 'wide',
          label: 'Home page showing software categories'
        },
        {
          src: '/screenshots/mobile-marketplace.png',
          sizes: '375x812',
          type: 'image/png',
          platform: 'narrow',
          label: 'Mobile marketplace view'
        }
      ]
    }
  }

  // Accessibility SEO optimization
  const optimizeAccessibility = () => {
    const accessibilityFeatures = {
      semanticHTML: {
        structure: [
          'Use proper heading hierarchy (h1 > h2 > h3)',
          'Use semantic HTML5 elements (article, section, nav)',
          'Implement proper list structures (ul, ol, dl)',
          'Use descriptive link text',
          'Structure forms with proper labels'
        ],
        landmarks: [
          '<main> for primary content',
          '<nav> for navigation menus',
          '<aside> for sidebar content',
          '<header> for page/section headers',
          '<footer> for page/section footers'
        ]
      },
      aria: {
        labels: [
          'aria-label for descriptive labels',
          'aria-labelledby for referencing labels',
          'aria-describedby for additional descriptions',
          'aria-expanded for collapsible content',
          'aria-current for current page/step'
        ],
        roles: [
          'role="button" for clickable elements',
          'role="tab" for tab interfaces',
          'role="search" for search forms',
          'role="banner" for site header',
          'role="contentinfo" for site footer'
        ]
      },
      keyboard: {
        navigation: [
          'All interactive elements focusable with Tab',
          'Logical tab order throughout page',
          'Visible focus indicators',
          'Skip links for main content',
          'Escape key closes modals/dropdowns'
        ]
      },
      visual: {
        contrast: {
          normal: '4.5:1 minimum ratio',
          large: '3:1 minimum ratio for 18pt+ text',
          graphics: '3:1 for important graphics'
        },
        text: [
          'Minimum 16px font size',
          'Line height of 1.5 or greater',
          'Resizable text up to 200%',
          'Adequate spacing between elements'
        ]
      }
    }

    return accessibilityFeatures
  }

  // Generate accessibility schema markup
  const generateAccessibilitySchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      accessibilityFeature: [
        'structuralNavigation',
        'alternativeText',
        'captions',
        'describedMath',
        'longDescription',
        'resizeText',
        'highContrastDisplay',
        'largePrint',
        'rubyAnnotations'
      ],
      accessibilityHazard: [
        'noFlashingHazard',
        'noMotionSimulationHazard',
        'noSoundHazard'
      ],
      accessibilityControl: [
        'fullKeyboardControl',
        'fullMouseControl',
        'fullTouchControl'
      ],
      accessibilityAPI: [
        'ARIA'
      ]
    }
  }

  // Mobile SEO meta tags
  const generateMobileSEOTags = () => {
    return [
      // Viewport
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      
      // Mobile web app
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-status-bar-style', content: 'default' },
      { name: 'mobile-web-app-title', content: 'Moonmart' },
      
      // Apple iOS
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Moonmart' },
      { name: 'apple-touch-fullscreen', content: 'yes' },
      
      // Microsoft
      { name: 'msapplication-TileColor', content: '#1a73e8' },
      { name: 'msapplication-tap-highlight', content: 'no' },
      
      // Android
      { name: 'theme-color', content: '#1a73e8' },
      { name: 'color-scheme', content: 'dark' },
      
      // Performance hints
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'format-detection', content: 'telephone=no' }
    ]
  }

  // AMP (Accelerated Mobile Pages) optimization
  const generateAMPVersion = (pageData: {
    title: string
    description: string
    content: string
    canonicalUrl: string
    publishedTime?: string
    modifiedTime?: string
  }) => {
    return `<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${pageData.title}</title>
  <link rel="canonical" href="${pageData.canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${pageData.title}",
    "description": "${pageData.description}",
    "url": "${pageData.canonicalUrl}",
    "datePublished": "${pageData.publishedTime || new Date().toISOString()}",
    "dateModified": "${pageData.modifiedTime || new Date().toISOString()}",
    "publisher": {
      "@type": "Organization",
      "name": "Moonmart",
      "logo": "https://moonmart.ai/assets/images/logo.png"
    }
  }
  </script>
</head>
<body>
  <header>
    <h1>${pageData.title}</h1>
  </header>
  <main>
    ${pageData.content}
  </main>
</body>
</html>`
  }

  // Touch and gesture optimization
  const optimizeTouchExperience = () => {
    return {
      touchTargets: {
        minimumSize: '44px',
        spacing: '8px between targets',
        feedback: 'Visual feedback on touch'
      },
      gestures: {
        swipe: 'Horizontal navigation',
        pinch: 'Zoom functionality',
        tap: 'Primary interactions',
        longPress: 'Context menus'
      },
      css: `
        /* Touch-friendly styles */
        .touch-target {
          min-height: 44px;
          min-width: 44px;
          margin: 4px;
          touch-action: manipulation;
        }
        
        .button {
          -webkit-tap-highlight-color: rgba(26, 115, 232, 0.3);
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Prevent zoom on inputs */
        input, select, textarea {
          font-size: 16px;
        }
        
        /* Safe area for notched devices */
        .safe-area {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
      `
    }
  }

  return {
    optimizeForMobile,
    generatePWAManifest,
    optimizeAccessibility,
    generateAccessibilitySchema,
    generateMobileSEOTags,
    generateAMPVersion,
    optimizeTouchExperience
  }
}
