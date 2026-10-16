/**
 * Test environment bootstrap.
 *
 * These values are only defaults so the suite can import the server app
 * without a live database. Real values from `.env` are never overridden
 * (dotenv does not overwrite existing process.env entries).
 */
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL ||= 'postgresql://dearmine:test@localhost:5432/dearmine'
process.env.SESSION_SECRET ||= 'test-only-session-secret-please-change-0001'
process.env.PAYMENT_PROVIDER ||= 'mock'
process.env.STORAGE_PROVIDER ||= 'local'
process.env.RATE_LIMIT_DISABLED ||= 'true'
process.env.CORS_ORIGINS ||= ''

/* Nodemailer should never attempt a real connection in tests. */
process.env.SMTP_HOST ||= ''
