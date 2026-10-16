/** Structured application errors with stable machine-readable codes. */

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'
  | 'INTERNAL'

export class AppError extends Error {
  status: number
  code: ErrorCode
  details?: unknown

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequest = (message = 'Invalid request', details?: unknown) =>
  new AppError(400, 'BAD_REQUEST', message, details)

export const validationError = (message = 'Validation failed', details?: unknown) =>
  new AppError(422, 'VALIDATION_ERROR', message, details)

export const unauthorized = (message = 'You need to sign in') =>
  new AppError(401, 'UNAUTHORIZED', message)

export const forbidden = (message = 'You do not have access to this resource') =>
  new AppError(403, 'FORBIDDEN', message)

export const notFound = (message = 'Not found') => new AppError(404, 'NOT_FOUND', message)

export const conflict = (message = 'Already exists') => new AppError(409, 'CONFLICT', message)

export const rateLimited = (message = 'Too many requests') =>
  new AppError(429, 'RATE_LIMITED', message)

export const paymentRequired = (message = 'A payment is required for this action') =>
  new AppError(402, 'PAYMENT_REQUIRED', message)

export const paymentFailed = (message = 'Payment verification failed') =>
  new AppError(402, 'PAYMENT_FAILED', message)

export const gone = (message = 'This surprise has expired') => new AppError(410, 'EXPIRED', message)
