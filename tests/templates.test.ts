import { describe, expect, it } from 'vitest'
import { CONTENT_FIELDS, PALETTES, PLAN_SLUGS, TEMPLATE_CATEGORIES, TEMPLATE_CATALOG } from '../src/shared'
import {
  getTemplateByComponentKey,
  getTemplateById,
  getTemplateBySlug,
} from '../src/shared'
import { SECTION_MAP, manifestFor } from '../src/templates/registry'

const CATEGORY_SLUGS = TEMPLATE_CATEGORIES.map((c) => c.slug)
const PALETTE_IDS = PALETTES.map((p) => p.id)
const CONTENT_FIELD_SET = new Set<string>(CONTENT_FIELDS)

describe('template catalog', () => {
  it('ships exactly 40 templates', () => {
    expect(TEMPLATE_CATALOG).toHaveLength(40)
  })

  it('uses sequential T01..T40 component keys with no duplicates', () => {
    const keys = TEMPLATE_CATALOG.map((t) => t.componentKey)
    expect(new Set(keys).size).toBe(keys.length)
    keys.forEach((key, index) => {
      expect(key).toBe(`T${String(index + 1).padStart(2, '0')}`)
    })
  })

  it('has unique ids and slugs', () => {
    expect(new Set(TEMPLATE_CATALOG.map((t) => t.id)).size).toBe(TEMPLATE_CATALOG.length)
    expect(new Set(TEMPLATE_CATALOG.map((t) => t.slug)).size).toBe(TEMPLATE_CATALOG.length)
  })

  it('references only known categories, palettes and plans', () => {
    for (const template of TEMPLATE_CATALOG) {
      expect(CATEGORY_SLUGS).toContain(template.category)
      expect(PALETTE_IDS).toContain(template.palette)
      expect(PLAN_SLUGS).toContain(template.requiredPlan)
      expect(template.name.length).toBeGreaterThan(0)
      expect(template.tagline.length).toBeGreaterThan(0)
      expect(template.sections.length).toBeGreaterThan(0)
      expect(template.supportedFields.length).toBeGreaterThan(0)
    }
  })

  it('only declares supported fields that exist in the content model', () => {
    for (const template of TEMPLATE_CATALOG) {
      for (const field of template.supportedFields) {
        expect(CONTENT_FIELD_SET.has(field)).toBe(true)
      }
    }
  })

  it('declares at least one occasion per template', () => {
    for (const template of TEMPLATE_CATALOG) {
      expect(template.occasions.length).toBeGreaterThan(0)
    }
  })

  it('resolves lookups by id, slug and component key', () => {
    for (const template of TEMPLATE_CATALOG) {
      expect(getTemplateById(template.id)?.componentKey).toBe(template.componentKey)
      expect(getTemplateBySlug(template.slug)?.componentKey).toBe(template.componentKey)
      expect(getTemplateByComponentKey(template.componentKey)?.slug).toBe(template.slug)
    }
    expect(getTemplateById('nope')).toBeUndefined()
    expect(getTemplateByComponentKey('T99')).toBeUndefined()
  })
})

describe('template registry', () => {
  it('maps every catalog section key to a real section component', () => {
    for (const template of TEMPLATE_CATALOG) {
      for (const key of template.sections) {
        expect(SECTION_MAP[key], `missing section mapping for "${key}"`).toBeDefined()
      }
    }
  })

  it('builds a manifest for every template without throwing', () => {
    for (const template of TEMPLATE_CATALOG) {
      const manifest = manifestFor(template.componentKey)
      expect(manifest.meta.componentKey).toBe(template.componentKey)
      expect(manifest.sections).toHaveLength(template.sections.length)
      template.sections.forEach((key, index) => {
        // Every section must come from the static map (never the fallback).
        expect(manifest.sections[index]).toEqual(SECTION_MAP[key])
        expect(typeof manifest.sections[index]!.kind).toBe('string')
      })
    }
  })

  it('throws for an unknown component key', () => {
    expect(() => manifestFor('T99')).toThrow()
  })
})
