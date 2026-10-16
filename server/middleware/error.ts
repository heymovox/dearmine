import type { NextFunction, Request, Response } from 'express'
import { isProd } from '../env'
import { AppError } from '../lib/errors'
import { isAppError } from '../lib/http'

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (isAppError(error)) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
    })
    return
  }

  // Prisma unique constraint
  if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'P2002') {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'A record with these details already exists' },
    })
    return
  }

  // Prisma "not found" for update/delete
  if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'P2025') {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } })
    return
  }

  if (isProd) {
    console.error('[error]', error)
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } })
    return
  }

  const message = error instanceof Error ? error.message : String(error)
  console.error('[error]', error)
  res.status(500).json({
    error: { code: 'INTERNAL', message, stack: error instanceof Error ? error.stack : undefined },
  })
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This endpoint does not exist' } })
}

export { AppError }
