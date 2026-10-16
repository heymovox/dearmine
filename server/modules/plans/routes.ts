import { Router } from 'express'
import { asyncHandler, sendOk } from '../../lib/http'
import { prisma } from '../../db'
import { toPublicPlanDTO } from './dto'

export const plansRouter = Router()

plansRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    sendOk(res, plans.map(toPublicPlanDTO))
  }),
)
