import { Router } from 'express'
import { asyncHandler, sendOk } from '../../lib/http'
import { prisma } from '../../db'

export const plansRouter = Router()

plansRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    sendOk(
      res,
      plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        pricePaise: p.pricePaise,
        currency: p.currency,
        features: (p.featuresJson as string[]) ?? [],
        entitlement: p.entitlementJson,
        hostingDurationDays: p.hostingDurationDays,
        isFeatured: p.isFeatured,
      })),
    )
  }),
)
