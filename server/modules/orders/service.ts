import { prisma } from '../../db'
import { formatINR, getPlan, PLANS } from '../../shared'
import { badRequest, conflict, notFound, paymentFailed } from '../../lib/errors'
import { payments, isMockProvider, simulateMockPayment } from '../../services/payments'
import { sendPaymentConfirmation } from '../../services/mail'
import type { PlanSnapshot } from '../projects/service'
import { getOwnedProject } from '../projects/service'
import type { Order, Payment } from '@prisma/client'

export type OrderDTO = {
  id: string
  projectId: string
  plan: { slug: string; name: string }
  provider: string
  status: string
  subtotalPaise: number
  discountAmountPaise: number
  amountPaise: number
  currency: string
  couponCode: string | null
  createdAt: string
  paidAt: string | null
}

export function toOrderDTO(order: Order & { plan: { slug: string; name: string }; coupon: { code: string } | null }): OrderDTO {
  return {
    id: order.id,
    projectId: order.projectId,
    plan: { slug: order.plan.slug, name: order.plan.name },
    provider: order.provider,
    status: order.status,
    subtotalPaise: order.subtotalPaise,
    discountAmountPaise: order.discountAmountPaise,
    amountPaise: order.amountPaise,
    currency: order.currency,
    couponCode: order.coupon?.code ?? null,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
  }
}

const orderInclude = {
  plan: true,
  coupon: true,
  payments: { orderBy: { createdAt: 'desc' as const } },
} as const

function planSnapshotFromPlan(plan: {
  slug: string
  name: string
  pricePaise: number
  entitlementJson: unknown
  hostingDurationDays: number
}): PlanSnapshot {
  const entitlement = plan.entitlementJson as PlanSnapshot['entitlement']
  return {
    planSlug: plan.slug,
    name: plan.name,
    pricePaise: plan.pricePaise,
    entitlement,
    hostingDurationDays: plan.hostingDurationDays,
  }
}

export function quote(slug: string): { subtotalPaise: number; currency: string } {
  const plan = getPlan(slug)
  if (!plan) throw badRequest('Unknown plan')
  return { subtotalPaise: plan.pricePaise, currency: 'INR' }
}

async function resolveCoupon(code: string, userId: string, subtotalPaise: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
  if (!coupon || !coupon.isActive) throw badRequest('That coupon code is not valid')
  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) throw badRequest('This coupon is not active yet')
  if (coupon.expiresAt && coupon.expiresAt < now) throw badRequest('This coupon has expired')
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw badRequest('This coupon has reached its usage limit')
  }
  const userUses = await prisma.order.count({ where: { couponId: coupon.id, userId, status: 'PAID' } })
  if (userUses >= coupon.perUserLimit) throw badRequest('You have already used this coupon')

  const raw =
    coupon.discountType === 'PERCENT'
      ? Math.floor((subtotalPaise * coupon.discountValue) / 100)
      : coupon.discountValue
  return { coupon, discountPaise: Math.min(Math.max(raw, 0), subtotalPaise) }
}

export async function createOrder(
  userId: string,
  input: { projectId: string; planSlug: string; couponCode?: string },
) {
  const project = await getOwnedProject(userId, input.projectId)
  const plan = await prisma.pricingPlan.findUnique({ where: { slug: input.planSlug } })
  if (!plan || !plan.isActive) throw badRequest('That plan is not available')

  const subtotalPaise = plan.pricePaise
  let discountPaise = 0
  let couponId: string | undefined
  if (input.couponCode) {
    const { coupon, discountPaise: d } = await resolveCoupon(input.couponCode, userId, subtotalPaise)
    discountPaise = d
    couponId = coupon.id
  }
  const amountPaise = Math.max(subtotalPaise - discountPaise, 0)
  const snapshot = planSnapshotFromPlan(plan)

  const order = await prisma.order.create({
    data: {
      userId,
      projectId: project.id,
      planId: plan.id,
      couponId,
      provider: payments().name,
      subtotalPaise,
      discountAmountPaise: discountPaise,
      amountPaise,
      currency: plan.currency,
      status: 'CREATED',
      planSnapshot: snapshot as unknown as object,
    },
  })

  const providerOrder = await payments().createOrder({
    amountPaise,
    currency: plan.currency,
    receipt: order.id,
    notes: { projectId: project.id, planSlug: plan.slug },
  })

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: 'PENDING', provider: providerOrder.provider } }),
    prisma.payment.create({
      data: {
        orderId: order.id,
        provider: providerOrder.provider,
        providerOrderId: providerOrder.providerOrderId,
        amountPaise,
        currency: plan.currency,
        status: 'CREATED',
      },
    }),
  ])

  return {
    order: await getOrderForUser(userId, order.id),
    checkout: {
      provider: providerOrder.provider,
      providerOrderId: providerOrder.providerOrderId,
      amountPaise,
      currency: plan.currency,
      publicKey: providerOrder.publicKey ?? null,
      isMock: isMockProvider(),
    },
  }
}

async function finalizePaidOrder(
  orderId: string,
  payment: Payment,
  input: { providerPaymentId: string; signature: string; rawPayload?: unknown },
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw notFound('Order not found')
  if (order.status === 'PAID') return order

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        providerPaymentId: input.providerPaymentId,
        providerSignature: input.signature,
        verifiedAt: new Date(),
        rawPayload: (input.rawPayload ?? {}) as object,
      },
    })
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paidAt: new Date() },
    })
    if (order.couponId) {
      await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } })
    }
  })

  const full = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      user: { select: { email: true } },
      project: { select: { projectTitle: true } },
      plan: { select: { name: true } },
    },
  })
  if (full?.paidAt) {
    void sendPaymentConfirmation(full.user.email, full.plan.name, formatINR(full.amountPaise), full.project.projectTitle).catch(
      () => undefined,
    )
  }
  return full
}

export async function verifyPayment(
  userId: string,
  input: { orderId: string; providerOrderId: string; providerPaymentId: string; signature: string },
) {
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId },
    include: orderInclude,
  })
  if (!order) throw notFound('Order not found')
  if (order.status === 'PAID') return getOrderForUser(userId, order.id)

  const payment = order.payments.find((p) => p.providerOrderId === input.providerOrderId)
  if (!payment) throw badRequest('Payment does not match this order')

  const valid = payments().verifyPaymentSignature({
    providerOrderId: input.providerOrderId,
    providerPaymentId: input.providerPaymentId,
    signature: input.signature,
  })
  if (!valid) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', failureReason: 'Signature mismatch' } })
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } })
    throw paymentFailed('We could not verify this payment. You have not been charged.')
  }

  await finalizePaidOrder(order.id, payment, {
    providerPaymentId: input.providerPaymentId,
    signature: input.signature,
  })
  return getOrderForUser(userId, order.id)
}

/** Dev/test only: complete a mock order without a real gateway. */
export async function completeMockOrder(userId: string, orderId: string) {
  if (!isMockProvider()) throw badRequest('Mock payments are disabled')
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: orderInclude })
  if (!order) throw notFound('Order not found')
  if (order.status === 'PAID') return getOrderForUser(userId, order.id)

  const payment = order.payments[0]
  if (!payment || !payment.providerOrderId) throw badRequest('No pending payment for this order')
  const providerPaymentId = `mock_pay_${Math.random().toString(36).slice(2, 14)}`
  const signature = simulateMockPayment(payment.providerOrderId, providerPaymentId)
  await finalizePaidOrder(order.id, payment, { providerPaymentId, signature, rawPayload: { mock: true } })
  return getOrderForUser(userId, order.id)
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } })
  if (!order) throw notFound('Order not found')
  if (order.status === 'PAID') throw conflict('A paid order cannot be cancelled')
  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
  return getOrderForUser(userId, order.id)
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  })
  if (!order) throw notFound('Order not found')
  return toOrderDTO(order)
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
  return orders.map(toOrderDTO)
}

export async function applyCoupon(userId: string, code: string, planSlug: string) {
  const plan = PLANS.find((p) => p.slug === planSlug)
  if (!plan) throw badRequest('Unknown plan')
  const { coupon, discountPaise } = await resolveCoupon(code, userId, plan.pricePaise)
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    subtotalPaise: plan.pricePaise,
    discountPaise,
    totalPaise: Math.max(plan.pricePaise - discountPaise, 0),
  }
}

/* -------------------------------------------------------------------------- */
/*  Webhook processing                                                         */
/* -------------------------------------------------------------------------- */

export async function handleWebhook(rawBody: Buffer, signature: string) {
  const provider = payments()
  if (!provider.verifyWebhook(rawBody, signature)) {
    throw paymentFailed('Invalid webhook signature')
  }
  const parsed = provider.parseWebhook(rawBody)
  if (!parsed.providerOrderId) return { ok: true, ignored: true }

  const payment = await prisma.payment.findFirst({ where: { providerOrderId: parsed.providerOrderId } })
  if (!payment) return { ok: true, ignored: true }

  const succeeded = parsed.event.includes('captured') || parsed.event.includes('paid') || parsed.status === 'captured'
  const failed = parsed.event.includes('failed') || parsed.status === 'failed'

  if (succeeded && parsed.providerPaymentId) {
    await finalizePaidOrder(payment.orderId, payment, {
      providerPaymentId: parsed.providerPaymentId,
      signature: signature.slice(0, 200),
      rawPayload: JSON.parse(rawBody.toString('utf8')),
    })
    return { ok: true }
  }
  if (failed) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } })
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'FAILED' } })
    return { ok: true }
  }
  return { ok: true, ignored: true }
}
