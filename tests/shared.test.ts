import { describe, expect, it } from 'vitest'
import {
  BRAND,
  CONTENT_FIELDS,
  OCCASIONS,
  OCCASION_KEYS,
  PALETTES,
  PLANS,
  PLAN_SLUGS,
  buildShareMessage,
  buildThemeVars,
  clamp,
  formatINR,
  formatINRShort,
  generatePublicId,
  getPalette,
  getPlan,
  occasionLabel,
  slugify,
  whatsappShareUrl,
} from '../src/shared'
import {
  couponInputSchema,
  createOrderSchema,
  designConfigSchema,
  emailSchema,
  occasionEnum,
  publicIdSchema,
  registerSchema,
  supportRequestSchema,
  surpriseContentSchema,
} from '../src/shared'

describe('formatting utilities', () => {
  it('formats paise as whole rupees without trailing zeros', () => {
    expect(formatINR(19900)).toBe('₹199')
    expect(formatINRShort(19900)).toBe('₹199')
  })

  it('keeps up to two decimals when needed', () => {
    expect(formatINR(19950)).toBe('₹199.5')
    expect(formatINR(0)).toBe('₹0')
  })

  it('uses Indian digit grouping for large amounts', () => {
    expect(formatINR(100000000)).toContain(',')
  })
})

describe('string utilities', () => {
  it('slugifies human text into a safe identifier', () => {
    expect(slugify('  Midnight Birthday Surprise!  ')).toBe('midnight-birthday-surprise')
    expect(slugify('Rose & Gold — Romance')).toBe('rose-gold-romance')
    expect(slugify('***')).toBe('')
  })

  it('generates non-empty, unique public ids', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 200; i += 1) ids.add(generatePublicId())
    expect(ids.size).toBe(200)
    for (const id of ids) {
      expect(id).toHaveLength(16)
      expect(publicIdSchema.safeParse(id).success).toBe(true)
    }
  })

  it('clamps numbers into range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })

  it('builds share messages and WhatsApp links', () => {
    const msg = buildShareMessage('https://example.com/s/abc')
    expect(msg).toContain('https://example.com/s/abc')
    expect(whatsappShareUrl('https://x.test', 'hi')).toContain('https://wa.me/')
    expect(whatsappShareUrl('https://x.test')).toContain(encodeURIComponent('https://x.test'))
  })
})

describe('palette + theme', () => {
  it('falls back to a real palette for unknown ids', () => {
    const fallback = getPalette('does-not-exist')
    expect(PALETTES.some((p) => p.id === fallback.id)).toBe(true)
  })

  it('produces css custom properties for palette and font', () => {
    const vars = buildThemeVars('midnight', 'cormorant')
    const keys = Object.keys(vars)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) expect(key.startsWith('--')).toBe(true)
    expect(Object.values(vars).some((v) => /serif|sans|display|"|'/.test(v))).toBe(true)
  })

  it('handles null palette and font gracefully', () => {
    expect(() => buildThemeVars(null, undefined)).not.toThrow()
  })
})

describe('constants', () => {
  it('exposes the three documented plans', () => {
    expect(PLAN_SLUGS).toEqual(['mini', 'love', 'forever'])
    expect(PLANS.map((p) => p.slug).sort()).toEqual([...PLAN_SLUGS].sort())
    for (const plan of PLANS) {
      expect(plan.pricePaise).toBeGreaterThanOrEqual(0)
      expect(plan.hostingDurationDays).toBeGreaterThan(0)
      expect(getPlan(plan.slug)?.slug).toBe(plan.slug)
    }
  })

  it('every occasion key resolves to a label', () => {
    expect(OCCASION_KEYS.length).toBe(OCCASIONS.length)
    for (const key of OCCASION_KEYS) {
      expect(occasionLabel(key)).toBeTruthy()
      expect(occasionEnum.safeParse(key).success).toBe(true)
    }
  })

  it('brand metadata is populated', () => {
    expect(BRAND.name).toBe('LoveSurprise')
    expect(BRAND.currency).toBe('INR')
  })

  it('content field list has no duplicates', () => {
    expect(new Set(CONTENT_FIELDS).size).toBe(CONTENT_FIELDS.length)
  })
})

describe('schemas', () => {
  it('normalises and validates emails', () => {
    expect(emailSchema.parse('  Hello@Example.COM ')).toBe('hello@example.com')
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })

  it('rejects weak registration input', () => {
    expect(
      registerSchema.safeParse({ name: 'A', email: 'x@y.com', password: 'short', acceptTerms: true }).success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ name: 'Ann', email: 'a@b.com', password: 'longenough', acceptTerms: false })
        .success,
    ).toBe(false)
    const ok = registerSchema.safeParse({
      name: 'Ann',
      email: 'ann@example.com',
      password: 'longenough',
      acceptTerms: true,
    })
    expect(ok.success).toBe(true)
  })

  it('applies defaults so an empty surprise is renderable', () => {
    const content = surpriseContentSchema.parse({})
    expect(content.title).toBe('')
    expect(content.timeline).toEqual([])
    expect(content.mainMessage).toBe('')

    const design = designConfigSchema.parse({})
    expect(design.palette).toBe('midnight')
    expect(design.sections).toEqual({})
  })

  it('caps oversized content arrays', () => {
    const tooMany = Array.from({ length: 20 }, (_, i) => ({ title: `t${i}`, body: 'b' }))
    expect(surpriseContentSchema.safeParse({ promises: tooMany }).success).toBe(false)
  })

  it('rejects unknown plan slugs on order creation', () => {
    expect(createOrderSchema.safeParse({ projectId: 'p1', planSlug: 'gold' }).success).toBe(false)
    expect(createOrderSchema.safeParse({ projectId: 'p1', planSlug: 'love' }).success).toBe(true)
  })

  it('uppercases coupon codes and requires a positive discount', () => {
    const parsed = couponInputSchema.parse({ code: ' welcome10 ', discountType: 'PERCENT', discountValue: 10 })
    expect(parsed.code).toBe('WELCOME10')
    expect(couponInputSchema.safeParse({ code: 'X1', discountType: 'FIXED', discountValue: 0 }).success).toBe(false)
  })

  it('validates support requests', () => {
    expect(
      supportRequestSchema.safeParse({ name: 'Ann', email: 'a@b.com', subject: 'Hi', message: 'too short' })
        .success,
    ).toBe(false)
    expect(
      supportRequestSchema.safeParse({
        name: 'Ann',
        email: 'a@b.com',
        subject: 'Need help',
        message: 'Please help me with publishing.',
      }).success,
    ).toBe(true)
  })
})
