/**
 * DALL-E Thumbnail Generation API
 * /api/ai/dalle-thumbnail
 */
import { writeFile } from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, size = '1024x1024', quality = 'standard', style = 'vivid' } = body

  // Validate input
  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  try {
    // Use OpenAI API
    const response = await $fetch<{ data: { url: string }[] }>('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'dall-e-3',
        prompt: prompt,
        size: size,
        quality: quality,
        style: style,
        n: 1
      }
    })

    const imageUrl = response.data[0].url

    // Optional: Download and save to your server
    if (process.env.SAVE_IMAGES_LOCALLY === 'true') {
      const imageResponse = await fetch(imageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const fileName = `thumbnail-${Date.now()}.png`
      
      // Save to public/assets/images/blog/
      await writeFile(`public/assets/images/blog/${fileName}`, Buffer.from(imageBuffer))
      
      return {
        imageUrl: `/assets/images/blog/${fileName}`,
        originalUrl: imageUrl,
        generated: true
      }
    }

    return {
      imageUrl: imageUrl,
      generated: true
    }

  } catch (error) {
    console.error('DALL-E API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate image with DALL-E'
    })
  }
})
