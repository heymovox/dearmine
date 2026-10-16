export type PlanEntitlement = {
  maxPhotos: number
  premiumTemplates: boolean
  music: boolean
  advancedAnimations: boolean
  hostingDays: number
  revisions: number
}

/**
 * Shape of the columns this module reads. Kept structural so the serializer
 * stays a pure function and can be unit tested without a database.
 */
export type PricingPlanRecord = {
  id: string
  name: string
  slug: string
  description: string
  pricePaise: number
  currency: string
  featuresJson: unknown
  entitlementJson: unknown
  hostingDurationDays: number
  isFeatured: boolean
}

/**
 * Public plan payload returned by GET /api/v1/plans.
 *
 * Field names are part of the client contract: the web app reads
 * `plan.features` and `plan.entitlement` (see PublicPlanDTO in
 * src/api/types.ts). The raw `*Json` column names are intentionally NOT
 * exposed here, and the admin list endpoint keeps its raw row shape.
 */
export function toPublicPlanDTO(plan: PricingPlanRecord) {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    pricePaise: plan.pricePaise,
    currency: plan.currency,
    features: Array.isArray(plan.featuresJson) ? (plan.featuresJson as string[]) : [],
    entitlement: (plan.entitlementJson ?? {}) as PlanEntitlement,
    hostingDurationDays: plan.hostingDurationDays,
    isFeatured: plan.isFeatured,
  }
}

export type PublicPlanDTO = ReturnType<typeof toPublicPlanDTO>