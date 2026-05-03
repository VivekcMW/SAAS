/**
 * Stability AI Thumbnail Generation API
 * /api/ai/stability-thumbnail
 */
import { writeFile } from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    prompt, 
    width = 1024, 
    height = 1024, 
    steps = 30, 
    cfg_scale = 7,
    style_preset = 'enhance'
  } = body

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  try {
    const formData = new FormData()
    formData.append('text_prompts[0][text]', prompt)
    formData.append('text_prompts[0][weight]', '1')
    formData.append('width', width.toString())
    formData.append('height', height.toString())
    formData.append('steps', steps.toString())
    formData.append('cfg_scale', cfg_scale.toString())
    formData.append('style_preset', style_preset)
    formData.append('samples', '1')

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'application/json'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.status}`)
    }

    const result = await response.json()
    const imageBase64 = result.artifacts[0].base64
    
    // Convert base64 to image URL
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const fileName = `stability-thumbnail-${Date.now()}.png`
    
    // Save to public directory
    await writeFile(`public/assets/images/blog/${fileName}`, imageBuffer)

    return {
      imageUrl: `/assets/images/blog/${fileName}`,
      generated: true,
      provider: 'stability-ai'
    }

  } catch (error) {
    console.error('Stability AI Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate image with Stability AI'
    })
  }
})
