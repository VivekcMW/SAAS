/**
 * POST /api/user/avatar
 * Upload or update the authenticated user's avatar.
 * Saves to public/uploads/avatars/ and updates users.avatar_url.
 * When CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET are set,
 * uploads to Cloudinary instead of local disk.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { readMultipartFormData } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

async function uploadToCloudinary(data: Buffer, filename: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
  const apiKey = process.env.CLOUDINARY_API_KEY!
  const apiSecret = process.env.CLOUDINARY_API_SECRET!
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'moonmart/avatars'
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = createHash('sha256')
    .update(paramsToSign + apiSecret)
    .digest('hex')

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(data)]), filename)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudinary upload failed: ${err}`)
  }
  const json = (await res.json()) as { secure_url: string }
  return json.secure_url
}

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 10, windowMs: 60 * 60 * 1000, prefix: 'avatar' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many uploads. Try again later.' })
  }

  const user = await requireUser(event)

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file')

  if (!filePart) throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  if (!ALLOWED_TYPES.includes(filePart.type || '')) {
    throw createError({ statusCode: 400, statusMessage: 'Only PNG, JPEG, or WebP images are allowed' })
  }
  if (filePart.data.byteLength > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'Avatar image must be under 2 MB' })
  }

  const ext = (filePart.filename || '').split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `avatar_${user.id}.${ext}`

  let url: string

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    url = await uploadToCloudinary(filePart.data, filename)
  } else {
    // Local file system fallback
    const avatarsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(avatarsDir, { recursive: true })
    await writeFile(join(avatarsDir, filename), filePart.data)
    url = `/uploads/avatars/${filename}`
  }

  const db = getDb()
  db.prepare('UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?').run(
    url,
    new Date().toISOString(),
    user.id,
  )

  return { ok: true, url }
})
