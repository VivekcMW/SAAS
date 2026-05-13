/**
 * Bulk AI Thumbnail Generation Script
 * Run with: npm run generate-thumbnails
 */
import { readFile } from 'node:fs/promises'

import { writeFile, readdir } from 'fs/promises'
import path from 'path'

interface BlogPostMeta {
  title: string
  slug: string
  category: string
  style?: 'modern' | 'minimal' | 'colorful' | 'professional'
}

// Extract blog post metadata from Vue files
const extractBlogMetadata = async (): Promise<BlogPostMeta[]> => {
  const blogDir = './pages/blog'
  const files = await readdir(blogDir)
  const posts: BlogPostMeta[] = []

  for (const file of files) {
    if (file.endsWith('.vue') && file !== 'index.vue' && file !== '[slug].vue') {
      const slug = file.replace('.vue', '')
      
      // Read file content to extract title and category
      const content = await readFile(path.join(blogDir, file), 'utf-8')
      
      // Extract title from h1 tag
      const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/s)
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : slug

      // Extract category from content or infer from title
      let category = 'Business Software'
      if (title.toLowerCase().includes('ai')) category = 'AI & Automation'
      if (title.toLowerCase().includes('crm')) category = 'CRM'
      if (title.toLowerCase().includes('project') || title.toLowerCase().includes('management')) category = 'Project Management'
      if (title.toLowerCase().includes('team') || title.toLowerCase().includes('collaboration')) category = 'Collaboration'
      if (title.toLowerCase().includes('productivity')) category = 'Productivity'

      // Determine style based on category
      const styleMap = {
        'AI & Automation': 'modern',
        'CRM': 'professional',
        'Project Management': 'minimal',
        'Collaboration': 'colorful',
        'Productivity': 'modern'
      } as const

      posts.push({
        title,
        slug,
        category,
        style: styleMap[category as keyof typeof styleMap] || 'modern'
      })
    }
  }

  return posts
}

// Generate prompts for different styles
const generatePrompt = (post: BlogPostMeta): string => {
  const basePrompts = {
    modern: 'modern digital illustration, clean geometric shapes, vibrant gradients, tech-focused',
    minimal: 'minimalist design, clean typography, subtle colors, plenty of white space, professional',
    colorful: 'vibrant colors, abstract shapes, energetic composition, bold design elements',
    professional: 'corporate design, sophisticated color palette, clean layout, business-focused'
  }

  const categoryPrompts = {
    'AI & Automation': 'artificial intelligence, neural networks, automation, machine learning, futuristic technology',
    'Productivity': 'productivity tools, efficiency, workflow optimization, time management',
    'Collaboration': 'teamwork, communication, remote work, collaboration tools, connectivity',
    'CRM': 'customer relationship management, sales analytics, business growth, data visualization',
    'Project Management': 'project planning, task organization, team coordination, workflow management',
    'Business Software': 'business tools, software solutions, digital transformation, enterprise'
  }

  const style = basePrompts[post.style || 'modern']
  const categoryPrompt = categoryPrompts[post.category as keyof typeof categoryPrompts] || categoryPrompts['Business Software']
  
  return `Professional blog thumbnail, ${style}, ${categoryPrompt}, high quality, 16:9 aspect ratio, no text overlay, suitable for blog header, SaaS industry theme --ar 16:9 --style raw --v 6`
}

// Main generation function
const generateAllThumbnails = async () => {
  console.log('🎨 Starting AI thumbnail generation for all blog posts...\n')

  const posts = await extractBlogMetadata()
  console.log(`Found ${posts.length} blog posts to process:\n`)

  const results = []
  
  for (const [index, post] of posts.entries()) {
    console.log(`[${index + 1}/${posts.length}] Generating thumbnail for: "${post.title}"`)
    console.log(`Category: ${post.category} | Style: ${post.style}`)

    try {
      const prompt = generatePrompt(post)
      console.log(`Prompt: ${prompt.substring(0, 100)}...`)

      // Try DALL-E first
      let imageUrl = ''
      try {
        const dalleResponse = await $fetch('/api/ai/dalle-thumbnail', {
          method: 'POST',
          body: {
            prompt,
            size: '1792x1024', // 16:9 aspect ratio
            quality: 'hd',
            style: 'vivid'
          }
        })
        imageUrl = dalleResponse.imageUrl
        console.log('✅ Generated with DALL-E')
      } catch (_dalleError) {
        console.log('⚠️  DALL-E failed, trying Stability AI...')
        
        try {
          const stabilityResponse = await $fetch('/api/ai/stability-thumbnail', {
            method: 'POST',
            body: {
              prompt,
              width: 1792,
              height: 1024,
              steps: 30,
              cfg_scale: 7,
              style_preset: 'enhance'
            }
          })
          imageUrl = stabilityResponse.imageUrl
          console.log('✅ Generated with Stability AI')
        } catch (_stabilityError) {
          console.log('❌ Both AI providers failed, skipping...')
          continue
        }
      }

      results.push({
        slug: post.slug,
        title: post.title,
        category: post.category,
        imageUrl,
        generated: true
      })

      console.log(`💾 Saved: ${imageUrl}\n`)

      // Add delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.error(`❌ Failed to generate thumbnail for ${post.slug}:`, error)
      results.push({
        slug: post.slug,
        title: post.title,
        category: post.category,
        imageUrl: '',
        generated: false,
        error: (error as any).message
      })
    }
  }

  // Save results summary
  await writeFile('thumbnail-generation-results.json', JSON.stringify(results, null, 2))
  
  console.log('\n🎉 Thumbnail generation complete!')
  console.log(`✅ Successfully generated: ${results.filter(r => r.generated).length}`)
  console.log(`❌ Failed: ${results.filter(r => !r.generated).length}`)
  console.log(`📄 Results saved to: thumbnail-generation-results.json`)
}

// Run if called directly
if (require.main === module) {
  generateAllThumbnails().catch(console.error)
}

export { generateAllThumbnails, extractBlogMetadata, generatePrompt }
