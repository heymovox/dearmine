import { Router } from 'express'
import { applyCouponSchema, createOrderSchema, mockPaySchema, verifyPaymentSchema } from '../../shared'
import { asyncHandler, parseOrThrow, sendCreated, sendOk } from '../../lib/http'
import { currentUser, requireAuth } from '../../middleware/auth'
import { recordAudit } from '../../services/audit'
import {
  applyCoupon,
  cancelOrder,
  completeMockOrder,
  createOrder,
  getOrderForUser,
  listOrders,
  verifyPayment,
} from './service'

export const ordersRouter = Router()

ordersRouter.use(requireAuth)

ordersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    sendOk(res, await listOrders(currentUser(req).id))
  }),
)

ordersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const user = currentUser(req)
    const input = parseOrThrow(createOrderSchema, req.body)
    const result = await createOrder(user.id, input)
    await recordAudit({
      actorId: user.id,
      action: 'order.create',
      entityType: 'Order',
      entityId: result.order.id,
      metadata: { planSlug: input.planSlug, amountPaise: result.checkout.amountPaise },
    })
    sendCreated(res, result)
  }),
)

ordersRouter.post(
  '/apply-coupon',
  asyncHandler(async (req, res) => {
    const user = currentUser(req)
    const input = parseOrThrow(applyCouponSchema, req.body)
    sendOk(res, await applyCoupon(user.id, input.code, input.planSlug))
  }),
)

ordersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    sendOk(res, await getOrderForUser(currentUser(req).id, req.params.id))
  }),
)

ordersRouter.post(
  '/:id/verify',
  asyncHandler(async (req, res) => {
    const user = currentUser(req)
    const input = parseOrThrow(verifyPaymentSchema, req.body)
    const order = await verifyPayment(user.id, { ...input, orderId: req.params.id })
    await recordAudit({
      actorId: user.id,
      action: 'order.paid',
      entityType: 'Order',
      entityId: order.id,
      metadata: { provider: order.provider },
    })
    sendOk(res, order)
  }),
)

ordersRouter.post(
  '/:id/mock-complete',
  asyncHandler(async (req, res) => {
    const user = currentUser(req)
    parseOrThrow(mockPaySchema, { orderId: req.params.id })
    const order = await completeMockOrder(user.id, req.params.id)
    await recordAudit({
      actorId: user.id,
      action: 'order.paid',
      entityType: 'Order',
      entityId: order.id,
      metadata: { provider: 'mock' },
    })
    sendOk(res, order)
  }),
)

ordersRouter.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    sendOk(res, await cancelOrder(currentUser(req).id, req.params.id))
  }),
)
