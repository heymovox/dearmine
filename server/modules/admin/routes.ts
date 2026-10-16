import { Router } from 'express'
import { z } from 'zod'
import {
  adminPlanUpdateSchema,
  adminTemplateUpdateSchema,
  couponInputSchema,
} from '../../shared'
import { asyncHandler, parseOrThrow, sendCreated, sendOk } from '../../lib/http'
import { badRequest, conflict, notFound } from '../../lib/errors'
import { prisma } from '../../db'
import { currentUser, requireAdmin } from '../../middleware/auth'
import { recordAudit } from '../../services/audit'

export const adminRouter = Router()

adminRouter.use(requireAdmin)

const limitParam = (raw: unknown, fallback: number, max: number) => {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(Math.trunc(n), max)
}

/* ------------------------------- overview -------------------------------- */

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [users, projects, publishedPages, totalOrders, paidOrders, revenue, openSupport, recentOrders, recentSupport] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.surpriseProject.count({ where: { deletedAt: null } }),
        prisma.publishedPage.count({ where: { status: 'ACTIVE' } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PAID' } }),
        prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { amountPaise: true } }),
        prisma.supportRequest.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { plan: true, user: { select: { name: true, email: true } } },
        }),
        prisma.supportRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      ])

    sendOk(res, {
      users,
      projects,
      activePublicPages: publishedPages,
      orders: { total: totalOrders, paid: paidOrders },
      revenuePaise: revenue._sum.amountPaise ?? 0,
      openSupport,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        plan: o.plan.name,
        amountPaise: o.amountPaise,
        status: o.status,
        customer: o.user.name,
        email: o.user.email,
        createdAt: o.createdAt.toISOString(),
      })),
      recentSupport: recentSupport.map((s) => ({
        id: s.id,
        subject: s.subject,
        email: s.email,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
    })
  }),
)

/* --------------------------------- users --------------------------------- */

adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = limitParam(req.query.limit, 20, 100)
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
          createdAt: true,
          deletedAt: true,
          _count: { select: { projects: true, orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ])
    sendOk(res, { items: users, total, page, limit })
  }),
)

const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  emailVerified: z.boolean().optional(),
})

adminRouter.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const input = parseOrThrow(adminUserUpdateSchema, req.body)
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) throw notFound('User not found')
    if (user.id === actor.id && input.role && input.role !== 'ADMIN') {
      throw badRequest('You cannot remove your own admin access')
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name ?? undefined,
        role: input.role ?? undefined,
        emailVerifiedAt:
          input.emailVerified === undefined ? undefined : input.emailVerified ? new Date() : null,
      },
      select: { id: true, name: true, email: true, role: true, emailVerifiedAt: true },
    })
    await recordAudit({
      actorId: actor.id,
      action: 'admin.user.update',
      entityType: 'User',
      entityId: user.id,
      metadata: { changes: input as unknown as Record<string, unknown> },
    })
    sendOk(res, updated)
  }),
)

adminRouter.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    if (req.params.id === actor.id) throw badRequest('You cannot delete your own account')
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) throw notFound('User not found')
    await prisma.$transaction([
      prisma.publishedPage.updateMany({
        where: { project: { ownerId: user.id } },
        data: { status: 'UNPUBLISHED', unpublishedAt: new Date() },
      }),
      prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } }),
    ])
    await recordAudit({ actorId: actor.id, action: 'admin.user.delete', entityType: 'User', entityId: user.id })
    sendOk(res, { ok: true })
  }),
)

/* -------------------------------- orders --------------------------------- */

adminRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = limitParam(req.query.limit, 20, 100)
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const where = status ? { status: status as 'PAID' } : {}
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          plan: true,
          user: { select: { name: true, email: true } },
          project: { select: { projectTitle: true } },
          payments: { select: { providerPaymentId: true, status: true } },
        },
      }),
      prisma.order.count({ where }),
    ])
    sendOk(res, {
      items: orders.map((o) => ({
        id: o.id,
        status: o.status,
        provider: o.provider,
        amountPaise: o.amountPaise,
        discountAmountPaise: o.discountAmountPaise,
        plan: o.plan.name,
        planSlug: o.plan.slug,
        customer: o.user.name,
        email: o.user.email,
        projectTitle: o.project.projectTitle,
        providerPaymentId: o.payments[0]?.providerPaymentId ?? null,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt ? o.paidAt.toISOString() : null,
      })),
      total,
      page,
      limit,
    })
  }),
)

/* ------------------------------- templates ------------------------------- */

adminRouter.get(
  '/templates',
  asyncHandler(async (_req, res) => {
    const templates = await prisma.template.findMany({
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    })
    sendOk(res, templates)
  }),
)

adminRouter.patch(
  '/templates/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const input = parseOrThrow(adminTemplateUpdateSchema, req.body)
    const existing = await prisma.template.findUnique({ where: { id: req.params.id } })
    if (!existing) throw notFound('Template not found')
    const updated = await prisma.template.update({
      where: { id: existing.id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        tagline: input.tagline ?? undefined,
        previewImage: input.previewImage === undefined ? undefined : input.previewImage,
        requiredPlan: input.requiredPlan ?? undefined,
        isPublished: input.isPublished ?? undefined,
        isFeatured: input.isFeatured ?? undefined,
        sortOrder: input.sortOrder ?? undefined,
        categoryId: input.categoryId ?? undefined,
      },
      include: { category: true },
    })
    await recordAudit({ actorId: actor.id, action: 'admin.template.update', entityType: 'Template', entityId: existing.id })
    sendOk(res, updated)
  }),
)

/* --------------------------------- plans --------------------------------- */

adminRouter.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    sendOk(res, await prisma.pricingPlan.findMany({ orderBy: { sortOrder: 'asc' } }))
  }),
)

adminRouter.patch(
  '/plans/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const input = parseOrThrow(adminPlanUpdateSchema, req.body)
    const existing = await prisma.pricingPlan.findUnique({ where: { id: req.params.id } })
    if (!existing) throw notFound('Plan not found')
    const updated = await prisma.pricingPlan.update({
      where: { id: existing.id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        pricePaise: input.pricePaise ?? undefined,
        hostingDurationDays: input.hostingDurationDays ?? undefined,
        isActive: input.isActive ?? undefined,
        isFeatured: input.isFeatured ?? undefined,
        sortOrder: input.sortOrder ?? undefined,
        featuresJson: input.features === undefined ? undefined : input.features,
      },
    })
    await recordAudit({ actorId: actor.id, action: 'admin.plan.update', entityType: 'PricingPlan', entityId: existing.id })
    sendOk(res, updated)
  }),
)

/* -------------------------------- coupons -------------------------------- */

adminRouter.get(
  '/coupons',
  asyncHandler(async (_req, res) => {
    sendOk(res, await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }))
  }),
)

adminRouter.post(
  '/coupons',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const input = parseOrThrow(couponInputSchema, req.body)
    const exists = await prisma.coupon.findUnique({ where: { code: input.code } })
    if (exists) throw conflict('That coupon code already exists')
    const coupon = await prisma.coupon.create({
      data: {
        code: input.code,
        discountType: input.discountType,
        discountValue: input.discountValue,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        usageLimit: input.usageLimit ?? null,
        perUserLimit: input.perUserLimit,
        isActive: input.isActive,
      },
    })
    await recordAudit({ actorId: actor.id, action: 'admin.coupon.create', entityType: 'Coupon', entityId: coupon.id })
    sendCreated(res, coupon)
  }),
)

adminRouter.patch(
  '/coupons/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const input = parseOrThrow(couponInputSchema.partial(), req.body)
    const existing = await prisma.coupon.findUnique({ where: { id: req.params.id } })
    if (!existing) throw notFound('Coupon not found')
    const updated = await prisma.coupon.update({
      where: { id: existing.id },
      data: {
        code: input.code ?? undefined,
        discountType: input.discountType ?? undefined,
        discountValue: input.discountValue ?? undefined,
        startsAt: input.startsAt === undefined ? undefined : input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt === undefined ? undefined : input.expiresAt ? new Date(input.expiresAt) : null,
        usageLimit: input.usageLimit === undefined ? undefined : input.usageLimit,
        perUserLimit: input.perUserLimit ?? undefined,
        isActive: input.isActive ?? undefined,
      },
    })
    await recordAudit({ actorId: actor.id, action: 'admin.coupon.update', entityType: 'Coupon', entityId: existing.id })
    sendOk(res, updated)
  }),
)

adminRouter.delete(
  '/coupons/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const existing = await prisma.coupon.findUnique({ where: { id: req.params.id } })
    if (!existing) throw notFound('Coupon not found')
    if (existing.usedCount > 0) {
      // Keep history: deactivate instead of hard delete.
      const updated = await prisma.coupon.update({ where: { id: existing.id }, data: { isActive: false } })
      await recordAudit({ actorId: actor.id, action: 'admin.coupon.deactivate', entityType: 'Coupon', entityId: existing.id })
      sendOk(res, updated)
      return
    }
    await prisma.coupon.delete({ where: { id: existing.id } })
    await recordAudit({ actorId: actor.id, action: 'admin.coupon.delete', entityType: 'Coupon', entityId: existing.id })
    sendOk(res, { ok: true })
  }),
)

/* -------------------------------- projects ------------------------------- */

adminRouter.get(
  '/projects',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = limitParam(req.query.limit, 20, 100)
    const where = search
      ? {
          OR: [
            { projectTitle: { contains: search, mode: 'insensitive' as const } },
            { recipientName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}
    const [projects, total] = await Promise.all([
      prisma.surpriseProject.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: { select: { name: true, email: true } },
          template: { select: { name: true } },
          publishedPage: { select: { publicId: true, status: true, expiresAt: true } },
        },
      }),
      prisma.surpriseProject.count({ where }),
    ])
    sendOk(res, {
      items: projects.map((p) => ({
        id: p.id,
        title: p.projectTitle,
        occasion: p.occasion,
        status: p.status,
        owner: p.owner.name,
        email: p.owner.email,
        template: p.template.name,
        published: p.publishedPage
          ? { publicId: p.publishedPage.publicId, status: p.publishedPage.status, expiresAt: p.publishedPage.expiresAt }
          : null,
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    })
  }),
)

adminRouter.post(
  '/projects/:id/unpublish',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const project = await prisma.surpriseProject.findUnique({ where: { id: req.params.id } })
    if (!project) throw notFound('Project not found')
    await prisma.publishedPage.updateMany({
      where: { projectId: project.id },
      data: { status: 'UNPUBLISHED', unpublishedAt: new Date() },
    })
    await prisma.surpriseProject.update({ where: { id: project.id }, data: { status: 'DRAFT' } })
    await recordAudit({ actorId: actor.id, action: 'admin.project.unpublish', entityType: 'SurpriseProject', entityId: project.id })
    sendOk(res, { ok: true })
  }),
)

/* -------------------------------- support -------------------------------- */

adminRouter.get(
  '/support',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const where = status ? { status: status as 'OPEN' } : {}
    const requests = await prisma.supportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
    sendOk(res, requests)
  }),
)

adminRouter.patch(
  '/support/:id',
  asyncHandler(async (req, res) => {
    const actor = currentUser(req)
    const input = parseOrThrow(z.object({ status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']) }), req.body)
    const existing = await prisma.supportRequest.findUnique({ where: { id: req.params.id } })
    if (!existing) throw notFound('Request not found')
    const updated = await prisma.supportRequest.update({ where: { id: existing.id }, data: { status: input.status } })
    await recordAudit({ actorId: actor.id, action: 'admin.support.update', entityType: 'SupportRequest', entityId: existing.id })
    sendOk(res, updated)
  }),
)

/* --------------------------------- audit --------------------------------- */

adminRouter.get(
  '/audit',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = limitParam(req.query.limit, 50, 200)
    const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined
    const where = entityType ? { entityType } : {}
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ])
    sendOk(res, { items: logs, total, page, limit })
  }),
)
