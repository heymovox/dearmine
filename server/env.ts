import 'dotenv/config'
import { z } from 'zod'

const boolFromString = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  APP_BASE_URL: z.string().url().default('http://localhost:5173'),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  PUBLIC_SITE_URL: z.string().url().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional().default(''),

  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_DOMAIN: z.string().optional().default(''),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('Dearmine <no-reply@dearmine.in>'),

  PAYMENT_PROVIDER: z.enum(['mock', 'razorpay']).default('mock'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),

  STORAGE_PROVIDER: z.enum(['local', 'r2']).default('local'),
  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ENDPOINT: z.string().optional().default(''),
  R2_BUCKET: z.string().optional().default(''),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  PUBLIC_ASSET_BASE_URL: z.string().default('http://localhost:4000/uploads'),

  ADMIN_EMAIL: z.string().optional().default(''),

  BRAND_NAME: z.string().default('Dearmine'),
  BRAND_TAGLINE: z.string().default('Every Love Story Deserves a Surprise.'),
  SUPPORT_EMAIL: z.string().default('support@dearmine.in'),
  CURRENCY: z.string().default('INR'),

  // Comma separated list of allowed browser origins for credentialed requests.
  CORS_ORIGINS: z.string().optional().default(''),
  RATE_LIMIT_DISABLED: boolFromString.optional().default('false'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  const env = parsed.data

  // Cross-field validation with clear messages.
  if (env.PAYMENT_PROVIDER === 'razorpay') {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        'PAYMENT_PROVIDER=razorpay requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
      )
    }
  }
  if (env.STORAGE_PROVIDER === 'r2') {
    const missing = (
      ['R2_ENDPOINT', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const
    ).filter((k) => !env[k])
    if (missing.length) {
      throw new Error(`STORAGE_PROVIDER=r2 requires: ${missing.join(', ')}`)
    }
  }
  if (env.NODE_ENV === 'production') {
    if (env.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters in production')
    }
    if (env.PAYMENT_PROVIDER === 'mock') {
      // Not fatal, but loudly warned at boot.
      console.warn('[env] PAYMENT_PROVIDER=mock in production — payments will not be real.')
    }
  }
  return env
}

export const env = loadEnv()

export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
export const isDev = env.NODE_ENV === 'development'

export function corsOrigins(): string[] {
  const list = env.CORS_ORIGINS
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const base = [env.APP_BASE_URL, env.PUBLIC_SITE_URL].filter(Boolean)
  return Array.from(new Set([...base, ...list]))
}
