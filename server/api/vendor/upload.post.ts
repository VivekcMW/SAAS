import { requireVendor } from '~/server/utils/auth'
import { readMultipartFormData } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { makeId } from '~/server/utils/database'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

async function uploadToCloudinary(
  data: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
  const apiKey = process.env.CLOUDINARY_API_KEY!
  const apiSecret = process.env.CLOUDINARY_API_SECRET!
  const folder = 'moonmart/listings'

  const timestamp = Math.floor(Date.now() / 1000)
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash('sha256').update(toSign).digest('hex')

  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(data)], { type: mimeType }), filename)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('folder', folder)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)
  const json = (await res.json()) as { secure_url: string }
  return json.secure_url
}

export default defineEventHandler(async (event) => {
  await requireVendor(event)

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file')

  if (!filePart) throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  if (!ALLOWED_TYPES.includes(filePart.type || '')) {
    throw createError({ statusCode: 400, statusMessage: 'Only PNG, JPEG, WebP and SVG images are allowed' })
  }
  if (filePart.data.byteLength > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'File exceeds 2 MB limit' })
  }

  const ext = (filePart.filename || '').split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${makeId('img')}.${ext}`

  // Use Cloudinary when credentials are configured
  const useCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET

  if (useCloudinary) {
    const url = await uploadToCloudinary(
      Buffer.from(filePart.data),
      filename,
      filePart.type || 'image/jpeg',
    )
    return { url }
  }

  // Fallback: local filesystem
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), filePart.data)

  return { url: `/uploads/${filename}` }
})

