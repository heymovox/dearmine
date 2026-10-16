import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import { env, corsOrigins, isProd } from './env'
import { asyncHandler, sendOk } from './lib/http'
import { badRequest } from './lib/errors'
import { UPLOAD_LIMITS } from './shared'
import { attachAuth } from './middleware/auth'
import { originCheck } from './middleware/origin'
import { errorHandler, notFoundHandler } from './middleware/error'
import { globalLimiter, sensitiveLimiter } from './middleware/rateLimit'

import { authRouter } from './modules/auth/routes'
import { templatesRouter } from './modules/templates/routes'
import { plansRouter } from './modules/plans/routes'
import { projectsRouter } from './modules/projects/routes'
import { assetsRouter } from './modules/assets/routes'
import { ordersRouter } from './modules/orders/routes'
import { publicRouter } from './modules/public/routes'
import { supportRouter } from './modules/support/routes'
import { adminRouter } from './modules/admin/routes'

import { handleWebhook } from './modules/orders/service'
import { consumePendingUpload, localUploadPut, LOCAL_UPLOAD_ROOT, storage } from './services/storage'

export function createApp(): express.Express {
  const app = express()

  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(
    helmet({
      contentSecurityPolicy: isProd ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin and server-to-server calls have no Origin header.
        // Disallowed origins are rejected without an error so we never emit a
        // 500: the browser blocks the response, and `originCheck` guards
        // state-changing requests with a proper 403 in production.
        if (!origin || corsOrigins().includes(origin)) return cb(null, true)
        cb(null, false)
      },
      credentials: true,
    }),
  )
  app.use(cookieParser())

  /* ---- Webhooks verify a signature over the raw body, so mount first. ---- */
  app.post(
    '/api/payments/webhook',
    express.raw({ type: '*/*', limit: '2mb' }),
    asyncHandler(async (req, res) => {
      const signature = req.get('x-razorpay-signature') ?? req.get('x-signature') ?? ''
      const result = await handleWebhook(req.body as Buffer, signature)
      sendOk(res, result)
    }),
  )

  /* ---- Dev-only local uploads (bucket is authenticated by a pending key). -- */
  app.put(
    '/api/v1/uploads/local',
    express.raw({ type: '*/*', limit: '20mb' }),
    asyncHandler(async (req, res) => {
      const key = typeof req.query.key === 'string' ? req.query.key : ''
      if (!key) throw badRequest('Missing upload key')
      const pending = consumePendingUpload(key)
      if (!pending) throw badRequest('This upload link is missing or has expired. Try again.')

      const declaredType = (req.get('content-type') ?? '').split(';')[0]!.trim()
      if (declaredType !== pending.mimeType) throw badRequest('Unexpected file type for this upload')

      const body = req.body
      if (!Buffer.isBuffer(body) || body.length === 0) throw badRequest('The uploaded file is empty')
      const max = pending.mimeType.startsWith('audio/') ? UPLOAD_LIMITS.maxAudioBytes : UPLOAD_LIMITS.maxPhotoBytes
      if (body.length > max) throw badRequest('That file is larger than the allowed limit')

      await localUploadPut(key, body)
      sendOk(res, { storageKey: key, url: storage().publicUrl(key), sizeBytes: body.length })
    }),
  )

  app.use(express.json({ limit: '2mb' }))

  /* ----------------------------- static assets ---------------------------- */
  app.use(
    '/uploads',
    express.static(LOCAL_UPLOAD_ROOT, { index: false, fallthrough: true, maxAge: '365d', immutable: true }),
  )

  /* -------------------------------- health -------------------------------- */
  app.get('/api/health', (_req, res) => {
    sendOk(res, {
      ok: true,
      service: 'lovesurprise-api',
      provider: { storage: storage().name, payments: env.PAYMENT_PROVIDER },
      time: new Date().toISOString(),
    })
  })

  /* ------------------------------- security ------------------------------- */
  app.use('/api', attachAuth, globalLimiter, originCheck)

  /* ------------------------------- routers -------------------------------- */
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/templates', templatesRouter)
  app.use('/api/v1/plans', plansRouter)
  app.use('/api/v1/projects', projectsRouter)
  app.use('/api/v1/projects', assetsRouter)
  app.use('/api/v1/orders', sensitiveLimiter, ordersRouter)
  app.use('/api/v1/public', publicRouter)
  app.use('/api/v1/support', supportRouter)
  app.use('/api/v1/admin', adminRouter)

  app.use('/api', notFoundHandler)
  app.use(errorHandler)
  return app
}
