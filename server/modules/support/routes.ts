import { Router } from 'express'
import { supportRequestSchema } from '../../shared'
import { asyncHandler, parseOrThrow, sendCreated, sendOk } from '../../lib/http'
import { prisma } from '../../db'
import { attachAuth } from '../../middleware/auth'
import { sendSupportReceivedEmail } from '../../services/mail'
import { BRAND } from '../../shared'

export const supportRouter = Router()

supportRouter.use(attachAuth)

supportRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(supportRequestSchema, req.body)
    const request = await prisma.supportRequest.create({
      data: {
        userId: req.auth?.user.id ?? null,
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
    })
    // Fire-and-forget acknowledgement; failures must not block the request.
    void sendSupportReceivedEmail(input.email, input.subject).catch(() => undefined)
    sendCreated(res, {
      id: request.id,
      status: request.status,
      supportEmail: BRAND.supportEmail,
    })
  }),
)

supportRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.auth) {
      sendOk(res, [])
      return
    }
    const requests = await prisma.supportRequest.findMany({
      where: { userId: req.auth.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, subject: true, message: true, status: true, createdAt: true },
    })
    sendOk(res, requests)
  }),
)
