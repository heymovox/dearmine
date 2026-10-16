import { Router } from 'express'
import { z } from 'zod'
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../../shared'
import { asyncHandler, parseOrThrow, sendOk } from '../../lib/http'
import { authLimiter } from '../../middleware/rateLimit'
import { attachAuth, currentUser, requireAuth } from '../../middleware/auth'
import { recordAudit } from '../../services/audit'
import {
  createSession,
  destroyAllSessions,
  destroySession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '../../services/session'
import {
  authenticate,
  changePassword,
  deleteAccount,
  registerUser,
  requestPasswordReset,
  resetPassword,
  serializeUser,
  updateProfile,
  verifyEmailToken,
} from './service'

export const authRouter = Router()

authRouter.use(attachAuth)

authRouter.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(registerSchema, req.body)
    const { user, devVerifyToken } = await registerUser(input)
    const { token, expiresAt } = await createSession(user.id, {
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
    })
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions(expiresAt))
    await recordAudit({ actorId: user.id, action: 'auth.register', entityType: 'User', entityId: user.id })
    sendOk(res, { user: serializeUser(user), devVerifyToken }, undefined, 201)
  }),
)

authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(loginSchema, req.body)
    const user = await authenticate(input)
    const { token, expiresAt } = await createSession(user.id, {
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
    })
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions(expiresAt))
    await recordAudit({ actorId: user.id, action: 'auth.login', entityType: 'User', entityId: user.id })
    sendOk(res, { user: serializeUser(user) })
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined
    await destroySession(token)
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions())
    sendOk(res, { ok: true })
  }),
)

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.auth) {
      sendOk(res, { user: null })
      return
    }
    sendOk(res, { user: serializeUser(req.auth.user) })
  }),
)

authRouter.post(
  '/verify-email',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token } = parseOrThrow(z.object({ token: z.string().min(10) }), req.body)
    const user = await verifyEmailToken(token)
    sendOk(res, { user: serializeUser(user) })
  }),
)

authRouter.post(
  '/forgot-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = parseOrThrow(forgotPasswordSchema, req.body)
    const result = await requestPasswordReset(email)
    // Always the same response, regardless of whether the account exists.
    sendOk(res, { ok: true, ...result })
  }),
)

authRouter.post(
  '/reset-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(resetPasswordSchema, req.body)
    await resetPassword(input.token, input.password)
    sendOk(res, { ok: true })
  }),
)

authRouter.patch(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(updateProfileSchema, req.body)
    const user = await updateProfile(currentUser(req).id, input.name)
    await recordAudit({ actorId: user.id, action: 'auth.profile.update', entityType: 'User', entityId: user.id })
    sendOk(res, { user: serializeUser(user) })
  }),
)

authRouter.post(
  '/change-password',
  requireAuth,
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(changePasswordSchema, req.body)
    const user = currentUser(req)
    await changePassword(user.id, input.currentPassword, input.newPassword)
    await destroyAllSessions(user.id)
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions())
    await recordAudit({ actorId: user.id, action: 'auth.password.change', entityType: 'User', entityId: user.id })
    sendOk(res, { ok: true })
  }),
)

authRouter.delete(
  '/account',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(deleteAccountSchema, req.body)
    const user = currentUser(req)
    await deleteAccount(user.id, input.password)
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions())
    await recordAudit({ actorId: user.id, action: 'auth.account.delete', entityType: 'User', entityId: user.id })
    sendOk(res, { ok: true })
  }),
)
