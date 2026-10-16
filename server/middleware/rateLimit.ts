import rateLimit from 'express-rate-limit'
import { env, isTest } from '../env'
import { rateLimited } from '../lib/errors'

function skip() {
  return isTest || env.RATE_LIMIT_DISABLED
}

/** Generous global limiter. */
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  handler: (_req, _res, next) => next(rateLimited('Too many requests, please slow down')),
})

/** Tight limiter for authentication endpoints. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  handler: (_req, _res, next) => next(rateLimited('Too many attempts. Please try again later')),
})

/** Limiter for upload authorization + payment initiation. */
export const sensitiveLimiter = rateLimit({
  windowMs: 60_000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  handler: (_req, _res, next) => next(rateLimited('Too many requests, please slow down')),
})
