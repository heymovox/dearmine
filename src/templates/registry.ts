/**
 * Static registry: `componentKey` + section keys from the shared catalog map
 * to the React section components. User data never influences this mapping —
 * only catalog strings authored with the templates do.
 */
import { getTemplateByComponentKey, type TemplateMeta } from '../shared'

export type SectionKind =
  | 'hero'
  | 'gallery'
  | 'letter'
  | 'timeline'
  | 'starmap'
  | 'mapline'
  | 'chat'
  | 'promises'
  | 'comic'
  | 'quiz'
  | 'coupons'
  | 'choices'
  | 'unlock'
  | 'gift'
  | 'countdown'
  | 'cake'
  | 'signature'
  | 'finale'
  | 'celebration'
  | 'message'
  | 'wishes'
  | 'sticky'
  | 'pixel'

export type SectionSpec = {
  kind: SectionKind
  /** Sub-style inside the section component (hero variant, gallery layout…). */
  variant?: string
}

/** Every section key used in `src/shared/templates/catalog.ts`. */
export const SECTION_MAP: Record<string, SectionSpec> = {
  // heroes
  'glowing-hearts': { kind: 'hero', variant: 'glowing-hearts' },
  'night-hero': { kind: 'hero', variant: 'night-hero' },
  'gold-hero': { kind: 'hero', variant: 'gold-hero' },
  'heart-burst-hero': { kind: 'hero', variant: 'heart-burst-hero' },
  'luxury-hero': { kind: 'hero', variant: 'luxury-hero' },
  'floral-hero': { kind: 'hero', variant: 'floral-hero' },
  'scrapbook-cover': { kind: 'hero', variant: 'scrapbook-cover' },
  'starry-hero': { kind: 'hero', variant: 'starry-hero' },
  'pastel-hero': { kind: 'hero', variant: 'pastel-hero' },
  'cinematic-intro': { kind: 'hero', variant: 'cinematic-intro' },
  hero: { kind: 'hero', variant: 'hero' },
  'distance-hero': { kind: 'hero', variant: 'distance-hero' },
  'music-hero': { kind: 'hero', variant: 'music-hero' },
  'chat-hero': { kind: 'hero', variant: 'chat-hero' },
  'minimal-hero': { kind: 'hero', variant: 'minimal-hero' },
  'journal-cover': { kind: 'hero', variant: 'journal-cover' },
  'envelope-hero': { kind: 'hero', variant: 'envelope-hero' },
  'proposal-hero': { kind: 'hero', variant: 'proposal-hero' },
  'anniversary-hero': { kind: 'hero', variant: 'anniversary-hero' },
  'promises-hero': { kind: 'hero', variant: 'promises-hero' },
  'garden-hero': { kind: 'hero', variant: 'garden-hero' },
  'elegant-hero': { kind: 'hero', variant: 'elegant-hero' },
  'countdown-hero': { kind: 'hero', variant: 'countdown-hero' },
  'moon-hero': { kind: 'hero', variant: 'moon-hero' },
  'doodle-hero': { kind: 'hero', variant: 'doodle-hero' },
  'quiz-hero': { kind: 'hero', variant: 'quiz-hero' },
  'unlock-hero': { kind: 'hero', variant: 'unlock-hero' },
  'gift-hero': { kind: 'hero', variant: 'gift-hero' },
  'coupons-hero': { kind: 'hero', variant: 'coupons-hero' },
  'choices-hero': { kind: 'hero', variant: 'choices-hero' },
  'comic-hero': { kind: 'hero', variant: 'comic-hero' },
  'pixel-hero': { kind: 'hero', variant: 'pixel-hero' },
  'modular-hero': { kind: 'hero', variant: 'modular-hero' },

  // galleries
  gallery: { kind: 'gallery', variant: 'grid' },
  'memory-gallery': { kind: 'gallery', variant: 'memory' },
  'polaroid-wall': { kind: 'gallery', variant: 'polaroid' },
  'bloom-gallery': { kind: 'gallery', variant: 'bloom' },

  // letters
  letter: { kind: 'letter', variant: 'reveal' },
  'envelope-letter': { kind: 'letter', variant: 'envelope' },
  'handwritten-note': { kind: 'letter', variant: 'handwritten' },
  'text-flow': { kind: 'letter', variant: 'text-flow' },

  // story
  timeline: { kind: 'timeline' },
  'star-map': { kind: 'starmap' },
  'map-line': { kind: 'mapline' },
  'chat-thread': { kind: 'chat' },
  'promise-cards': { kind: 'promises' },
  'comic-panels': { kind: 'comic' },

  // interactive
  'love-quiz': { kind: 'quiz' },
  'coupon-book': { kind: 'coupons' },
  choices: { kind: 'choices' },
  'secret-unlock': { kind: 'unlock' },
  'gift-box': { kind: 'gift' },
  countdown: { kind: 'countdown' },
  'cake-stage': { kind: 'cake' },

  // closings
  signature: { kind: 'signature' },
  finale: { kind: 'finale' },
  celebration: { kind: 'celebration' },
  'confetti-message': { kind: 'message' },
  'wish-cards': { kind: 'wishes' },
  'sticky-notes': { kind: 'sticky' },
  'pixel-hearts': { kind: 'pixel' },
}

export type TemplateManifest = {
  meta: TemplateMeta
  sections: SectionSpec[]
}

const FALLBACK: SectionSpec = { kind: 'message' }

export function manifestFor(componentKey: string): TemplateManifest {
  const meta = getTemplateByComponentKey(componentKey)
  if (!meta) {
    throw new Error(`Unknown template componentKey: ${componentKey}`)
  }
  return {
    meta,
    sections: meta.sections.map((key) => SECTION_MAP[key] ?? FALLBACK),
  }
}
