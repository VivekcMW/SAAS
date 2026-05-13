/**
 * TOTP (RFC 6238) implementation using Node.js built-ins only.
 * No external dependencies required.
 */
import { createHmac, randomBytes } from 'node:crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Encode(bytes: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

export function base32Decode(str: string): Buffer {
  const s = str.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const bytes: number[] = []
  let bits = 0
  let value = 0
  for (let i = 0; i < s.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(s[i])
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

export function generateTotpSecret(): string {
  // 20 random bytes → base32 (160-bit secret)
  return base32Encode(randomBytes(20))
}

function hotp(key: Buffer, counter: bigint): number {
  const buf = Buffer.allocUnsafe(8)
  buf.writeBigUInt64BE(counter)
  const hmac = createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3]
  return code % 1_000_000
}

/**
 * Verify a 6-digit TOTP code.
 * Accepts ±1 time step (30 s) to compensate for clock drift.
 */
export function verifyTotp(secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token)) return false
  const code = parseInt(token, 10)
  const key = base32Decode(secret)
  const t = BigInt(Math.floor(Date.now() / 1000 / 30))
  for (let drift = BigInt(-1); drift <= BigInt(1); drift++) {
    if (hotp(key, t + drift) === code) return true
  }
  return false
}

/**
 * Build the otpauth:// URI used by Google Authenticator / Authy.
 */
export function getTotpUri(secret: string, email: string, issuer = 'Moonmart'): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?${params}`
}

/**
 * Generate human-friendly backup codes (e.g. "A1B2-C3D4").
 */
export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const b = randomBytes(4).toString('hex').toUpperCase()
    return `${b.slice(0, 4)}-${b.slice(4)}`
  })
}

// ─── Temp-token helpers for 2-step login ─────────────────────────────────────

const TEMP_TOKEN_SECRET =
  () => {
    const secret = process.env.SESSION_SECRET || process.env.NUXT_SESSION_PASSWORD
    if (!secret || secret.startsWith('change-me')) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[totp] SESSION_SECRET is not set. Set a strong random secret before deploying.')
      }
      return 'moonmart-2fa-dev'
    }
    return secret
  }

/** Sign a short-lived (5 min) token binding a userId for the 2FA login step. */
export function signTwoFactorToken(userId: string): string {
  const ts = Date.now()
  const payload = `${userId}:${ts}`
  const sig = createHmac('sha256', TEMP_TOKEN_SECRET())
    .update(payload)
    .digest('hex')
    .slice(0, 24)
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

/** Verify and extract userId from a 2FA temp token. Returns null if invalid/expired. */
export function verifyTwoFactorToken(token: string, maxAgeMs = 5 * 60 * 1000): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const lastColon = decoded.lastIndexOf(':')
    if (lastColon === -1) return null
    const sig = decoded.slice(lastColon + 1)
    const payload = decoded.slice(0, lastColon)
    const colonIdx = payload.indexOf(':')
    if (colonIdx === -1) return null
    const userId = payload.slice(0, colonIdx)
    const ts = parseInt(payload.slice(colonIdx + 1), 10)
    if (isNaN(ts) || Date.now() - ts > maxAgeMs) return null
    const expected = createHmac('sha256', TEMP_TOKEN_SECRET())
      .update(payload)
      .digest('hex')
      .slice(0, 24)
    if (sig !== expected) return null
    return userId
  } catch {
    return null
  }
}
