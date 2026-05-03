/**
 * Unit tests for server/utils/auth.ts
 * Tests the pure crypto functions: hashPassword and verifyPassword.
 * These have no Nuxt or DB dependencies and can run in isolation.
 */
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '~/server/utils/auth'

describe('hashPassword', () => {
  it('returns a string in the format scrypt:<salt>:<hash>', () => {
    const result = hashPassword('mypassword')
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBe('scrypt')
    expect(parts[1]).toHaveLength(32) // 16 bytes → 32 hex chars
    expect(parts[2].length).toBeGreaterThan(0)
  })

  it('produces different hashes for the same password on each call (unique salts)', () => {
    const hash1 = hashPassword('samepassword')
    const hash2 = hashPassword('samepassword')
    expect(hash1).not.toBe(hash2)
  })

  it('produces different hashes for different passwords', () => {
    const hash1 = hashPassword('password1')
    const hash2 = hashPassword('password2')
    expect(hash1).not.toBe(hash2)
  })

  it('handles empty string without throwing', () => {
    expect(() => hashPassword('')).not.toThrow()
  })

  it('handles unicode passwords', () => {
    const result = hashPassword('pässwörد')
    expect(result.startsWith('scrypt:')).toBe(true)
  })

  it('handles long passwords (512 chars)', () => {
    const long = 'a'.repeat(512)
    const result = hashPassword(long)
    expect(result.startsWith('scrypt:')).toBe(true)
  })
})

describe('verifyPassword', () => {
  it('returns true when the correct password is provided', () => {
    const hash = hashPassword('correctpassword')
    expect(verifyPassword('correctpassword', hash)).toBe(true)
  })

  it('returns false for a wrong password', () => {
    const hash = hashPassword('correctpassword')
    expect(verifyPassword('wrongpassword', hash)).toBe(false)
  })

  it('returns false for an empty stored hash', () => {
    expect(verifyPassword('anything', '')).toBe(false)
  })

  it('returns false for a malformed stored hash (missing parts)', () => {
    expect(verifyPassword('password', 'scrypt:onlyonepart')).toBe(false)
  })

  it('returns false for a non-scrypt algorithm prefix', () => {
    expect(verifyPassword('password', 'bcrypt:fakesalt:fakehash')).toBe(false)
  })

  it('verifies freshly hashed passwords consistently', () => {
    const passwords = ['Short1!', 'ALongerPassw0rd', 'Unicode🔐Pass']
    for (const pw of passwords) {
      const hash = hashPassword(pw)
      expect(verifyPassword(pw, hash)).toBe(true)
      expect(verifyPassword(pw + 'x', hash)).toBe(false)
    }
  })

  it('is case-sensitive', () => {
    const hash = hashPassword('SecretPass')
    expect(verifyPassword('secretpass', hash)).toBe(false)
    expect(verifyPassword('SECRETPASS', hash)).toBe(false)
    expect(verifyPassword('SecretPass', hash)).toBe(true)
  })
})
