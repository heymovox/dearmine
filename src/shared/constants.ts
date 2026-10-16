/**
 * Dearmine — shared constants.
 * Isomorphic: imported by both the API server and the web client.
 */

export const BRAND = {
  name: 'Dearmine',
  tagline: 'Personalized surprises for your special one.',
  description:
    'Create a beautiful, personalized birthday surprise, love letter or romantic website in minutes. Choose a design, add your memories, and share a link made just for someone special.',
  supportEmail: 'support@dearmine.in',
  currency: 'INR',
} as const

/* -------------------------------------------------------------------------- */
/*  Occasions                                                                  */
/* -------------------------------------------------------------------------- */

export const OCCASIONS = [
  { key: 'BIRTHDAY', label: 'Birthday', emoji: '🎂' },
  { key: 'ANNIVERSARY', label: 'Anniversary', emoji: '💞' },
  { key: 'PROPOSAL', label: 'Proposal', emoji: '💍' },
  { key: 'VALENTINES', label: "Valentine's Day", emoji: '🌹' },
  { key: 'JUST_BECAUSE', label: 'Just Because', emoji: '✨' },
  { key: 'OTHER', label: 'Other romantic occasion', emoji: '❤️' },
] as const

export type OccasionKey = (typeof OCCASIONS)[number]['key']
export const OCCASION_KEYS = OCCASIONS.map((o) => o.key) as OccasionKey[]

export function occasionLabel(key: string): string {
  return OCCASIONS.find((o) => o.key === key)?.label ?? 'Celebration'
}

/* -------------------------------------------------------------------------- */
/*  Template categories                                                        */
/* -------------------------------------------------------------------------- */

export const TEMPLATE_CATEGORIES = [
  {
    slug: 'birthday-love',
    name: 'Birthday Love',
    description: 'Birthday surprises that make the day unforgettable.',
    sortOrder: 1,
  },
  {
    slug: 'our-love-story',
    name: 'Our Love Story',
    description: 'Tell the story of the two of you, from first hello to today.',
    sortOrder: 2,
  },
  {
    slug: 'love-proposal',
    name: 'Love & Proposal',
    description: 'Love letters, milestones and the big question.',
    sortOrder: 3,
  },
  {
    slug: 'cute-creative',
    name: 'Cute & Creative',
    description: 'Playful, interactive surprises your partner can unlock.',
    sortOrder: 4,
  },
] as const

export type CategorySlug = (typeof TEMPLATE_CATEGORIES)[number]['slug']

/* -------------------------------------------------------------------------- */
/*  Plans                                                                      */
/* -------------------------------------------------------------------------- */

export const PLAN_SLUGS = ['mini', 'love', 'forever'] as const
export type PlanSlug = (typeof PLAN_SLUGS)[number]

export type PlanEntitlement = {
  maxPhotos: number
  premiumTemplates: boolean
  music: boolean
  advancedAnimations: boolean
  hostingDays: number
  revisions: number
}

export const PLANS: Array<{
  slug: PlanSlug
  name: string
  pricePaise: number
  description: string
  features: string[]
  entitlement: PlanEntitlement
  hostingDurationDays: number
  isFeatured: boolean
  sortOrder: number
}> = [
  {
    slug: 'mini',
    name: 'Mini Surprise',
    pricePaise: 9900,
    description: 'A sweet first surprise — perfect for a quick, heartfelt gesture.',
    features: [
      'One published surprise website',
      'Basic templates',
      'Name & message customization',
      'Basic animations',
      'Unique shareable link',
      '90 days hosting',
    ],
    entitlement: {
      maxPhotos: 8,
      premiumTemplates: false,
      music: false,
      advancedAnimations: false,
      hostingDays: 90,
      revisions: 2,
    },
    hostingDurationDays: 90,
    isFeatured: false,
    sortOrder: 1,
  },
  {
    slug: 'love',
    name: 'Love Edition',
    pricePaise: 19900,
    description: 'The full romantic experience with photos, a letter and music.',
    features: [
      'All premium templates',
      'Up to 25 photos',
      'Personal love letter',
      'Optional background music',
      'Advanced animations',
      '1 year hosting',
    ],
    entitlement: {
      maxPhotos: 25,
      premiumTemplates: true,
      music: true,
      advancedAnimations: true,
      hostingDays: 365,
      revisions: 10,
    },
    hostingDurationDays: 365,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: 'forever',
    name: 'Forever Memories',
    pricePaise: 39900,
    description: 'Everything unlocked, with the most room for memories.',
    features: [
      'All premium & interactive templates',
      'Up to 60 photos',
      'Music & voice notes',
      'Cinematic animations & interactions',
      'Unlimited revisions while active',
      '2 years hosting',
    ],
    entitlement: {
      maxPhotos: 60,
      premiumTemplates: true,
      music: true,
      advancedAnimations: true,
      hostingDays: 730,
      revisions: 999,
    },
    hostingDurationDays: 730,
    isFeatured: false,
    sortOrder: 3,
  },
]

export function getPlan(slug: string) {
  return PLANS.find((p) => p.slug === slug)
}

/* -------------------------------------------------------------------------- */
/*  Upload limits                                                              */
/* -------------------------------------------------------------------------- */

export const UPLOAD_LIMITS = {
  maxPhotoBytes: 8 * 1024 * 1024,
  maxAudioBytes: 15 * 1024 * 1024,
  allowedPhotoMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as string[],
  allowedAudioMimes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'] as string[],
} as const

/* -------------------------------------------------------------------------- */
/*  Sharing                                                                    */
/* -------------------------------------------------------------------------- */

export function buildShareMessage(url: string): string {
  return `Someone made a little surprise just for you ❤️ Open it here: ${url}`
}

export function whatsappShareUrl(url: string, message?: string): string {
  const text = message ?? buildShareMessage(url)
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/* -------------------------------------------------------------------------- */
/*  Content field keys (used by the editor + template capability checks)       */
/* -------------------------------------------------------------------------- */

export const CONTENT_FIELDS = [
  'title',
  'openingMessage',
  'mainMessage',
  'letter',
  'finalMessage',
  'signature',
  'photos',
  'audio',
  'timeline',
  'promises',
  'countdown',
  'quiz',
  'coupons',
  'gift',
  'choices',
  'secretMessage',
  'storyPanels',
] as const

export type ContentFieldKey = (typeof CONTENT_FIELDS)[number]

export const CONTENT_FIELD_LABELS: Record<ContentFieldKey, string> = {
  title: 'A short phrase or title',
  openingMessage: 'Opening greeting',
  mainMessage: 'Main message',
  letter: 'A long love letter',
  finalMessage: 'Closing message',
  signature: 'Your signature',
  photos: 'Photo gallery',
  audio: 'Background music',
  timeline: 'Relationship timeline',
  promises: 'Promise cards',
  countdown: 'Countdown to a date',
  quiz: 'Love quiz',
  coupons: 'Love coupons',
  gift: 'A gift box reveal',
  choices: 'Choose-your-own surprise',
  secretMessage: 'A secret message to unlock',
  storyPanels: 'Illustrated story panels',
}

/* -------------------------------------------------------------------------- */
/*  Palettes (shared between the editor picker and templates)                  */
/* -------------------------------------------------------------------------- */

export const PALETTES = [
  { id: 'midnight', name: 'Midnight', colors: ['#4A1025', '#B5284D', '#F8DCE5', '#FFF8F0'] },
  { id: 'rosegold', name: 'Rose Gold', colors: ['#3B2417', '#D7A0A7', '#F3D9C6', '#FFF9F3'] },
  { id: 'blush', name: 'Blush', colors: ['#7A2E4A', '#E8739B', '#FCE1EC', '#FFF6FA'] },
  { id: 'noir', name: 'Noir & Gold', colors: ['#0B0B0F', '#C9A227', '#F4E9C8', '#FFFFFF'] },
  { id: 'starlight', name: 'Starlight', colors: ['#0B1026', '#5B6BE8', '#C9D3FF', '#F5F7FF'] },
  { id: 'pastel', name: 'Pastel', colors: ['#6B4E7E', '#FF9EC4', '#D7F0E8', '#FFFBF2'] },
  { id: 'emerald', name: 'Emerald', colors: ['#08322A', '#1E8E6E', '#CFE9DF', '#F6FBF8'] },
  { id: 'sunset', name: 'Sunset', colors: ['#4A1A2C', '#FF7A4D', '#FFD9B3', '#FFF6EC'] },
] as const

export type PaletteId = (typeof PALETTES)[number]['id']

/* -------------------------------------------------------------------------- */
/*  Fonts offered in the editor                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fonts offered in the editor.
 *
 * Every stack ends in a full fallback chain (not a bare `serif`/`sans-serif`)
 * so a customer's published page still looks intentional if the webfont
 * fails to load. All four families are requested in index.html — keep this
 * list and that URL in sync.
 */
export const FONT_OPTIONS = [
  {
    id: 'cormorant',
    name: 'Elegant Serif',
    stack: "'Cormorant Garamond', 'Cormorant', ui-serif, Georgia, serif",
  },
  {
    id: 'playfair',
    name: 'Classic Serif',
    stack: "'Playfair Display', ui-serif, Georgia, 'Times New Roman', serif",
  },
  // `id` stays 'jost' for backwards compatibility with saved projects even
  // though the stack is now Google Sans - renaming the id would invalidate
  // every stored design config that referenced it.
  { id: 'jost', name: 'Modern Sans', stack: "'Google Sans', Roboto, ui-sans-serif, system-ui, sans-serif" },
  { id: 'caveat', name: 'Handwritten', stack: "'Caveat', 'Bradley Hand', ui-serif, cursive" },
] as const

export type FontId = (typeof FONT_OPTIONS)[number]['id']
