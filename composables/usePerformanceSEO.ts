/**
 * Advanced Performance SEO Optimizations
 * Improves Core Web Vitals and user experience metrics
 */

export const usePerformanceSEO = () => {
  // Core Web Vitals monitoring and optimization
  const optimizeCoreWebVitals = () => {
    // LCP (Largest Contentful Paint) optimization
    const optimizeLCP = () => {
      // Preload critical resources
      useHead({
        link: [
          { rel: 'preload', as: 'font', href: '/fonts/inter-var.woff2', type: 'font/woff2', crossorigin: 'anonymous' },
          { rel: 'preload', as: 'image', href: '/assets/images/hero-banner.webp' },
          { rel: 'preload', as: 'style', href: '/assets/css/critical.css' },
          { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
          { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
          { rel: 'dns-prefetch', href: 'https://api.moonmart.ai' },
          { rel: 'dns-prefetch', href: 'https://cdn.moonmart.ai' }
        ]
      })
    }

    // FID (First Input Delay) optimization
    const optimizeFID = () => {
      // Code splitting and lazy loading
      if (import.meta.client) {
        // Defer non-critical JavaScript
        setTimeout(() => {
          // Load analytics after initial interaction
          const script = document.createElement('script')
          script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
          script.async = true
          document.head.appendChild(script)
        }, 3000)
      }
    }

    // CLS (Cumulative Layout Shift) optimization
    const optimizeCLS = () => {
      useHead({
        style: [{
          innerHTML: `
            /* Reserve space for images to prevent layout shift */
            .hero-image { aspect-ratio: 16/9; background: #f3f4f6; }
            .app-card-image { aspect-ratio: 1/1; background: #f9fafb; }
            .banner-container { min-height: 200px; }
            
            /* Font display optimization */
            @font-face {
              font-family: 'Inter';
              font-display: swap;
              src: url('/fonts/inter-var.woff2') format('woff2');
            }
          `
        }]
      })
    }

    optimizeLCP()
    optimizeFID()
    optimizeCLS()
  }

  // Advanced image optimization
  const optimizeImages = () => {
    return {
      // WebP with fallback
      generateResponsiveImageSrcSet: (imagePath: string, alt: string) => ({
        srcset: `
          ${imagePath}.webp 400w,
          ${imagePath}@2x.webp 800w,
          ${imagePath}@3x.webp 1200w
        `,
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        alt,
        loading: 'lazy',
        decoding: 'async'
      }),

      // Critical images (above the fold)
      generateCriticalImage: (imagePath: string, alt: string) => ({
        src: `${imagePath}.webp`,
        alt,
        loading: 'eager',
        decoding: 'sync',
        fetchpriority: 'high'
      })
    }
  }

  // Service Worker for caching
  const implementServiceWorker = () => {
    if (import.meta.client && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration)
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
    }
  }

  return {
    optimizeCoreWebVitals,
    optimizeImages,
    implementServiceWorker
  }
}
