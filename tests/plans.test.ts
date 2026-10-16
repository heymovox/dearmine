import { describe, expect, it } from 'vitest'
import { toPublicPlanDTO, type PricingPlanRecord } from '../server/modules/plans/dto'

/**
 * Regression guard for a production crash: LandingPage/PricingPage read
 * `plan.features`, but the endpoint used to serialize the raw `featuresJson`
 * column, so `plan.features` was undefined and `.slice()` threw.
 *
 * These assertions pin the public wire contract so a rename on either the
 * server serializer or the client DTO fails here instead of in the browser.
 */
const basePlan: PricingPlanRecord = {
  id: 'plan_1',
  name: 'Mini Love',
  slug: 'mini',
  description: 'A lovely starter',
  pricePaise: 9900,
  currency: 'INR',
  featuresJson: ['One published surprise website', '90 days hosting'],
  entitlementJson: {
    maxPhotos: 12,
    premiumTemplates: false,
    music: false,
    advancedAnimations: false,
    hostingDays: 90,
    revisions: 5,
  },
  hostingDurationDays: 90,
  isFeatured: false,
}

describe('public plan DTO', () => {
  it('serializes exactly the fields the web client expects', () => {
    expect(Object.keys(toPublicPlanDTO(basePlan)).sort()).toEqual(
      [
        'currency',
        'description',
        'entitlement',
        'features',
        'hostingDurationDays',
        'id',
        'isFeatured',
        'name',
        'pricePaise',
        'slug',
      ].sort(),
    )
  })

  it('exposes features, never the raw featuresJson column', () => {
    const dto = toPublicPlanDTO(basePlan)
    expect(dto.features).toEqual(['One published surprise website', '90 days hosting'])
    expect(dto).not.toHaveProperty('featuresJson')
  })

  it('exposes entitlement, never the raw entitlementJson column', () => {
    const dto = toPublicPlanDTO(basePlan)
    expect(dto.entitlement.hostingDays).toBe(90)
    expect(dto.entitlement.maxPhotos).toBe(12)
    expect(dto).not.toHaveProperty('entitlementJson')
  })

  it('always returns an array for features so the UI can call .slice()/.map()', () => {
    expect(toPublicPlanDTO({ ...basePlan, featuresJson: null }).features).toEqual([])
    expect(toPublicPlanDTO({ ...basePlan, featuresJson: undefined }).features).toEqual([])
    expect(toPublicPlanDTO({ ...basePlan, featuresJson: 'not-an-array' }).features).toEqual([])
  })

  it('preserves pricing and featured flag', () => {
    const dto = toPublicPlanDTO({ ...basePlan, isFeatured: true, pricePaise: 49900 })
    expect(dto.pricePaise).toBe(49900)
    expect(dto.currency).toBe('INR')
    expect(dto.isFeatured).toBe(true)
  })
})