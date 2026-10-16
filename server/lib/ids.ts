import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'

/** Opaque, high-entropy session token (raw value goes in the cookie). */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

/** Store only a hash of the token at rest. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateEmailToken(): string {
  return randomBytes(32).toString('base64url')
}

export function uuid(): string {
  return randomUUID()
}

/** Constant-time string comparison for signatures. */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * A short, URL-safe, non-sequential public identifier that avoids visually
 * ambiguous characters. 16 chars of a 56-char alphabet ≈ 92 bits.
 */
const PUBLIC_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

export function newPublicId(length = 16): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += PUBLIC_ID_ALPHABET[bytes[i]! % PUBLIC_ID_ALPHABET.length]
  }
  return out
}

/** Build a storage object key that cannot escape its prefix or collide. */
export function buildObjectKey(prefix: string, originalName: string): string {
  const safeExt = /\.([a-z0-9]{1,8})$/i.exec(originalName)?.[1]?.toLowerCase() ?? 'bin'
  const stamp = Date.now().toString(36)
  return `${prefix}/${stamp}-${randomBytes(8).toString('hex')}.${safeExt}`
}

export function randomCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i]! % alphabet.length]
  return out
}
