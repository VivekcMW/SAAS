import { requireVendor } from '~/server/utils/auth'
import { readMultipartFormData } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { makeId } from '~/server/utils/database'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

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
  const uploadsDir = join(process.cwd(), 'public', 'uploads')

  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), filePart.data)

  return { url: `/uploads/${filename}` }
})
