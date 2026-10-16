import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError } from 'zod'
import { AppError, validationError } from './errors'

/** Wrap an async route handler so thrown errors reach the error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> }

export function sendOk<T>(res: Response, data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data }
  res.status(status).json(body)
}

export function sendCreated<T>(res: Response, data: T) {
  sendOk(res, data, undefined, 201)
}

export function sendNoContent(res: Response) {
  res.status(204).end()
}

/** Parse a zod schema or throw a validation AppError with field details. */
export function parseOrThrow<T>(schema: { parse: (v: unknown) => T }, value: unknown): T {
  try {
    return schema.parse(value)
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
      throw validationError('Please check the highlighted fields', details)
    }
    throw error
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
