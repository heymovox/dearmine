import type { NextFunction, Request, Response } from 'express'
import { corsOrigins, isProd, isTest } from '../env'
import { forbidden } from '../lib/errors'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Lightweight CSRF protection for cookie-authenticated, state-changing
 * requests: every unsafe request must carry an Origin/Referer that matches
 * the configured app origins. Webhooks are exempt (they use signatures and
 * are mounted before this middleware).
 */
export function originCheck(req: Request, _res: Response, next: NextFunction) {
  if (isTest || SAFE_METHODS.has(req.method)) return next()
  if (req.path.startsWith('/webhook')) return next()

  const allowed = corsOrigins()
  const origin = req.get('origin') ?? (req.get('referer') ? new URL(req.get('referer')!).origin : '')

  // In dev, no Origin header on same-origin tooling requests is acceptable.
  if (!origin) {
    if (isProd) return next(forbidden('Missing origin'))
    return next()
  }

  if (allowed.includes(origin)) return next()
  return next(forbidden('Request blocked for security reasons'))
}
