/**
 * server/utils/storage.ts
 * Abstracted file storage — uses AWS S3 when configured, falls back to local disk.
 *
 * Required env vars for S3:
 *   STORAGE_PROVIDER=s3
 *   AWS_REGION
 *   AWS_BUCKET
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_CDN_BASE_URL (optional — if you have CloudFront in front of S3)
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const PROVIDER = process.env.STORAGE_PROVIDER === 's3' ? 's3' : 'local'
const LOCAL_BASE = join(process.cwd(), 'public', 'uploads')
const CDN_BASE = process.env.AWS_CDN_BASE_URL?.replace(/\/$/, '') || ''

interface UploadResult {
  url: string
  key: string
}

// ── S3 upload (lazy-loaded to avoid crashing when SDK is not installed) ──────
async function uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<UploadResult> {
  let S3Client: any, PutObjectCommand: any
  try {
    const sdk = await import('@aws-sdk/client-s3' as string)
    S3Client = sdk.S3Client
    PutObjectCommand = sdk.PutObjectCommand
  } catch {
    throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3')
  }

  const bucket = process.env.AWS_BUCKET
  const region = process.env.AWS_REGION
  if (!bucket || !region) throw new Error('AWS_BUCKET and AWS_REGION must be set for S3 storage')

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key:    key,
    Body:   buffer,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  const url = CDN_BASE
    ? `${CDN_BASE}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`

  return { url, key }
}

// ── Local disk upload ────────────────────────────────────────────────────────
async function uploadToLocal(key: string, buffer: Buffer): Promise<UploadResult> {
  const fullPath = join(LOCAL_BASE, key)
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
  await mkdir(dir, { recursive: true })
  await writeFile(fullPath, buffer)
  // Return a URL relative to the Nuxt public directory
  return { url: `/uploads/${key}`, key }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a file buffer.
 * @param key     Relative path / S3 key, e.g. "listings/lt_abc123/screenshot-1.jpg"
 * @param buffer  File contents
 * @param mimeType MIME type string
 */
export async function uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
  if (PROVIDER === 's3') {
    return uploadToS3(key, buffer, mimeType)
  }
  return uploadToLocal(key, buffer)
}

/**
 * Returns the public base URL for uploaded files.
 * Used to construct URLs when listing existing media.
 */
export function getStorageBase(): string {
  if (PROVIDER === 's3') {
    const bucket = process.env.AWS_BUCKET || ''
    const region = process.env.AWS_REGION || ''
    return CDN_BASE || `https://${bucket}.s3.${region}.amazonaws.com`
  }
  return '/uploads'
}

export const storageProvider = PROVIDER
