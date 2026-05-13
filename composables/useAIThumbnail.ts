/**
 * AI Thumbnail Generator Composable
 * Supports multiple AI image generation services
 */

export interface ThumbnailConfig {
  title: string
  category: string
  author?: string
  date?: string
  style?: 'modern' | 'minimal' | 'colorful' | 'professional'
  dimensions?: { width: number; height: number }
}

export interface AIProvider {
  name: string
  generateImage: (prompt: string, config: ThumbnailConfig) => Promise<string>
  isAvailable: boolean
}

export const useAIThumbnail = () => {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  // Default thumbnail dimensions optimized for blog cards
  const defaultDimensions = { width: 1200, height: 630 } // Perfect for social sharing

  /**
   * Generate Canvas-based thumbnail (fallback/local generation)
   */
  const generateCanvasThumbnail = (config: ThumbnailConfig): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = config.dimensions?.width || defaultDimensions.width
      canvas.height = config.dimensions?.height || defaultDimensions.height

      // Style configurations
      const styles = {
        modern: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textColor: '#ffffff',
          accentColor: '#ff6b6b'
        },
        minimal: {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          textColor: '#2c3e50',
          accentColor: '#3498db'
        },
        colorful: {
          background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b95 100%)',
          textColor: '#ffffff',
          accentColor: '#4ecdc4'
        },
        professional: {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          textColor: '#ffffff',
          accentColor: '#e74c3c'
        }
      }

      const currentStyle = styles[config.style || 'modern']

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      if (currentStyle.background.includes('gradient')) {
        // Parse gradient colors (simplified)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
      }
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add geometric shapes for visual interest
      ctx.globalAlpha = 0.1
      ctx.fillStyle = currentStyle.accentColor
      ctx.beginPath()
      ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 100, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(canvas.width * 0.2, canvas.height * 0.8, 150, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Add title text
      ctx.fillStyle = currentStyle.textColor
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.textAlign = 'center'
      
      // Word wrap for title
      const words = config.title.split(' ')
      const lines: string[] = []
      let currentLine = ''
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)
        if (metrics.width > canvas.width - 100 && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      })
      lines.push(currentLine)

      // Draw title lines
      const lineHeight = 60
      const startY = (canvas.height - (lines.length * lineHeight)) / 2
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight))
      })

      // Add category badge
      if (config.category) {
        ctx.fillStyle = currentStyle.accentColor
        ctx.fillRect(50, 50, ctx.measureText(config.category.toUpperCase()).width + 40, 40)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        ctx.textAlign = 'left'
        ctx.fillText(config.category.toUpperCase(), 70, 75)
      }

      // Add Moonmart branding
      ctx.fillStyle = currentStyle.textColor
      ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.textAlign = 'right'
      ctx.fillText('Moonmart', canvas.width - 50, canvas.height - 30)

      resolve(canvas.toDataURL('image/png', 0.9))
    })
  }

  /**
   * OpenAI DALL-E Integration
   */
  const dalleProvider: AIProvider = {
    name: 'DALL-E',
    isAvailable: true,
    generateImage: async (prompt: string, config: ThumbnailConfig) => {
      try {
        const response = await $fetch('/api/ai/dalle-thumbnail', {
          method: 'POST',
          body: {
            prompt,
            size: '1024x1024',
            quality: 'hd',
            style: config.style || 'vivid'
          }
        })
        return response.imageUrl
      } catch (_err) {
        throw new Error('DALL-E generation failed')
      }
    }
  }

  /**
   * Stability AI Integration
   */
  const stabilityProvider: AIProvider = {
    name: 'Stability AI',
    isAvailable: true,
    generateImage: async (prompt: string, config: ThumbnailConfig) => {
      try {
        const response = await $fetch('/api/ai/stability-thumbnail', {
          method: 'POST',
          body: {
            prompt,
            width: config.dimensions?.width || 1024,
            height: config.dimensions?.height || 1024,
            steps: 30,
            cfg_scale: 7
          }
        })
        return response.imageUrl
      } catch (_err) {
        throw new Error('Stability AI generation failed')
      }
    }
  }

  /**
   * Midjourney-style prompt generator
   */
  const generatePrompt = (config: ThumbnailConfig): string => {
    const basePrompts = {
      modern: 'modern digital illustration, clean geometric shapes, vibrant gradients',
      minimal: 'minimalist design, clean typography, subtle colors, plenty of white space',
      colorful: 'vibrant colors, abstract shapes, energetic composition, bold typography',
      professional: 'corporate design, sophisticated color palette, clean layout, professional typography'
    }

    const categoryKeywords = {
      'AI & Automation': 'artificial intelligence, neural networks, automation, tech',
      'Productivity': 'productivity, efficiency, workflow, organization',
      'Collaboration': 'teamwork, communication, collaboration, remote work',
      'CRM': 'customer relationship, sales, business growth, data analytics',
      'Project Management': 'project planning, task management, team coordination'
    }

    const stylePrompt = basePrompts[config.style || 'modern']
    const categoryPrompt = categoryKeywords[config.category as keyof typeof categoryKeywords] || 'business software'
    
    return `Professional blog thumbnail for "${config.title}", ${stylePrompt}, ${categoryPrompt}, high quality, 16:9 aspect ratio, no text overlay, suitable for blog header --ar 16:9 --v 6`
  }

  /**
   * Main generation function with fallback chain
   */
  const generateThumbnail = async (config: ThumbnailConfig, provider?: string): Promise<string> => {
    isGenerating.value = true
    error.value = null

    try {
      const prompt = generatePrompt(config)

      // Try AI providers first
      if (provider === 'dalle' || !provider) {
        try {
          return await dalleProvider.generateImage(prompt, config)
        } catch (_err) {
          console.warn('DALL-E failed, trying Stability AI')
        }
      }

      if (provider === 'stability' || !provider) {
        try {
          return await stabilityProvider.generateImage(prompt, config)
        } catch (_err) {
          console.warn('Stability AI failed, falling back to canvas')
        }
      }

      // Fallback to canvas generation
      return await generateCanvasThumbnail(config)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Generation failed'
      // Ultimate fallback
      return await generateCanvasThumbnail(config)
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Generate thumbnail for blog post
   */
  const generateBlogThumbnail = async (postData: {
    title: string
    category: string
    slug: string
    style?: ThumbnailConfig['style']
  }) => {
    const config: ThumbnailConfig = {
      title: postData.title,
      category: postData.category,
      author: 'Moonmart Team',
      style: postData.style || 'modern',
      dimensions: defaultDimensions
    }

    const thumbnailUrl = await generateThumbnail(config)
    
    // Save to local storage for caching
    if (import.meta.client) {
      localStorage.setItem(`thumbnail-${postData.slug}`, thumbnailUrl)
    }

    return thumbnailUrl
  }

  /**
   * Get cached thumbnail or generate new one
   */
  const getThumbnail = async (postData: {
    title: string
    category: string
    slug: string
    style?: ThumbnailConfig['style']
  }): Promise<string> => {
    // Check cache first
    if (import.meta.client) {
      const cached = localStorage.getItem(`thumbnail-${postData.slug}`)
      if (cached && cached.startsWith('data:image')) {
        return cached
      }
    }

    return await generateBlogThumbnail(postData)
  }

  return {
    generateThumbnail,
    generateBlogThumbnail,
    getThumbnail,
    generateCanvasThumbnail,
    isGenerating: readonly(isGenerating),
    error: readonly(error)
  }
}
