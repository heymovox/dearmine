import type { NextFunction, Request, Response } from 'express'
import { forbidden, unauthorized } from '../lib/errors'
import { SESSION_COOKIE, resolveSession } from '../services/session'

/** Attach the session/user when present; never blocks the request. */
export async function attachAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined
    const auth = await resolveSession(token)
    if (auth) req.auth = auth
  } catch {
    // Ignore session resolution errors — treated as anonymous.
  }
  next()
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(unauthorized())
  next()
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(unauthorized())
  if (req.auth.user.role !== 'ADMIN') return next(forbidden('Administrator access required'))
  next()
}

/** Convenience accessor that throws when unauthenticated. */
export function currentUser(req: Request) {
  if (!req.auth) throw unauthorized()
  return req.auth.user
}
