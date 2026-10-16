/** Shared, dependency-free utilities. */

/** Format integer paise as an INR string, e.g. 19900 -> "₹199.00". */
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/** Format integer paise without decimals when whole, e.g. 19900 -> "₹199". */
export function formatINRShort(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const PUBLIC_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

/** Cryptographically strong, non-sequential public identifier. */
export function generatePublicId(length = 16): string {
  const bytes = new Uint8Array(length)
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes)
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += PUBLIC_ID_ALPHABET[bytes[i]! % PUBLIC_ID_ALPHABET.length]
  }
  return out
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Human friendly "3 days ago" style relative time. */
export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ${pluralize(hours, 'hour')} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} ${pluralize(days, 'day')} ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} ${pluralize(months, 'month')} ago`
  const years = Math.round(months / 12)
  return `${years} ${pluralize(years, 'year')} ago`
}

/** Safe display name from a first name / nickname. */
export function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] ?? ''
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
