/**
 * The Dearmine template catalog — 40 templates across 4 categories.
 * This is metadata only (isomorphic). The React implementations live in
 * `src/templates` and are mapped from `componentKey` by a static registry.
 */
import type { CategorySlug, ContentFieldKey, OccasionKey, PaletteId, PlanSlug } from '../constants'

export type TemplateAnimation = 'subtle' | 'balanced' | 'cinematic'

export type TemplateMeta = {
  /** Stable identifier, e.g. `birthday-01-midnight`. */
  id: string
  slug: string
  name: string
  category: CategorySlug
  /** Key into the static React component registry (never user supplied). */
  componentKey: string
  tagline: string
  description: string
  occasions: OccasionKey[]
  requiredPlan: PlanSlug
  isFeatured: boolean
  palette: PaletteId
  animation: TemplateAnimation
  supportedFields: ContentFieldKey[]
  sections: string[]
  sortOrder: number
}

const COMMON: ContentFieldKey[] = ['title', 'openingMessage', 'mainMessage', 'finalMessage', 'signature']
const PHOTOS: ContentFieldKey[] = ['photos']

function t(
  n: number,
  category: CategorySlug,
  slug: string,
  name: string,
  tagline: string,
  description: string,
  options: Partial<TemplateMeta> & {
    supportedFields: ContentFieldKey[]
    sections: string[]
  },
): TemplateMeta {
  const key = `T${String(n).padStart(2, '0')}`
  return {
    id: `${category}-${String(n).padStart(2, '0')}-${slug}`,
    slug,
    name,
    category,
    componentKey: key,
    tagline,
    description,
    occasions: options.occasions ?? ['BIRTHDAY'],
    requiredPlan: options.requiredPlan ?? 'mini',
    isFeatured: options.isFeatured ?? false,
    palette: options.palette ?? 'midnight',
    animation: options.animation ?? 'balanced',
    supportedFields: options.supportedFields,
    sections: options.sections,
    sortOrder: n,
  }
}

export const TEMPLATE_CATALOG: TemplateMeta[] = [
  // ── Category A — Birthday Love (01–10) ────────────────────────────────────
  t(1, 'birthday-love', 'midnight-birthday-surprise', 'Midnight Birthday Surprise',
    'A cinematic birthday reveal under a glowing night sky.',
    'Burgundy night sky, glowing hearts and a cinematic opening sequence that ends in a birthday reveal.',
    { palette: 'midnight', isFeatured: true, animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter', 'audio'], sections: ['glowing-hearts', 'night-hero', 'letter', 'gallery', 'celebration'] }),
  t(2, 'birthday-love', 'rose-gold-romance', 'Rose Gold Romance',
    'Champagne, rose gold and quiet elegance.',
    'An elegant champagne and rose-gold design with balanced serif typography and soft shimmer.',
    { palette: 'rosegold', isFeatured: true, animation: 'balanced',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['gold-hero', 'gallery', 'letter', 'signature'] }),
  t(3, 'birthday-love', 'pink-heart-explosion', 'Pink Heart Explosion',
    'Playful hearts everywhere, all at once.',
    'A joyful, high-energy birthday page bursting with heart particles and celebration effects.',
    { palette: 'blush', animation: 'balanced',
      supportedFields: [...COMMON, ...PHOTOS, 'audio'], sections: ['heart-burst-hero', 'gallery', 'confetti-message'] }),
  t(4, 'birthday-love', 'luxury-black-gold', 'Luxury Black & Gold',
    'Refined, premium and unmistakably special.',
    'Black and gold with refined typography and a premium, editorial visual style.',
    { palette: 'noir', requiredPlan: 'love', isFeatured: true, animation: 'balanced',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['luxury-hero', 'gallery', 'letter', 'signature'] }),
  t(5, 'birthday-love', 'floral-birthday-letter', 'Floral Birthday Letter',
    'Watercolour flowers around a letter just for them.',
    'Watercolour florals frame a slow, tender letter reveal for a birthday.',
    { palette: 'pastel', animation: 'subtle',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['floral-hero', 'envelope-letter', 'gallery'] }),
  t(6, 'birthday-love', 'birthday-scrapbook', 'Birthday Scrapbook',
    'Polaroids, tape and handmade paper.',
    'A scrapbook of polaroids, handwritten captions and paper textures for a birthday.',
    { palette: 'sunset', animation: 'subtle',
      supportedFields: [...COMMON, ...PHOTOS], sections: ['scrapbook-cover', 'polaroid-wall', 'handwritten-note'] }),
  t(7, 'birthday-love', 'dreamy-starry-night', 'Dreamy Starry Night',
    'Constellations and soft, drifting stars.',
    'A dreamy starry sky with constellations, twinkling stars and gentle transitions.',
    { palette: 'starlight', animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['starry-hero', 'star-map', 'gallery', 'letter'] }),
  t(8, 'birthday-love', 'cute-pastel-birthday', 'Cute Pastel Birthday',
    'Soft pastels and friendly little illustrations.',
    'Pastel colours, friendly illustrations and a warm, uncomplicated birthday wish.',
    { palette: 'pastel', animation: 'balanced',
      supportedFields: [...COMMON, ...PHOTOS], sections: ['pastel-hero', 'gallery', 'wish-cards'] }),
  t(9, 'birthday-love', 'birthday-cake-reveal', 'Birthday Cake Reveal',
    'Light the candles, make a wish.',
    'An interactive birthday cake: blow out the candles to reveal the celebration.',
    { palette: 'midnight', animation: 'balanced',
      supportedFields: [...COMMON, ...PHOTOS], sections: ['cake-stage', 'gallery', 'celebration'] }),
  t(10, 'birthday-love', 'cinematic-birthday-story', 'Cinematic Birthday Story',
    'A full-screen story, scene by scene.',
    'Full-screen storytelling with dramatic scene transitions for a milestone birthday.',
    { palette: 'midnight', requiredPlan: 'love', isFeatured: true, animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter', 'audio'], sections: ['cinematic-intro', 'gallery', 'letter', 'finale'] }),

  // ── Category B — Our Love Story (11–20) ───────────────────────────────────
  t(11, 'our-love-story', 'our-memories', 'Our Memories',
    'A gallery of the moments you keep.',
    'A photo-led memory gallery that puts your favourite frames first.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY', 'BIRTHDAY'], palette: 'rosegold',
      supportedFields: [...COMMON, ...PHOTOS], sections: ['hero', 'memory-gallery', 'signature'] }),
  t(12, 'our-love-story', 'first-meeting-story', 'First Meeting Story',
    'From the first hello to right now.',
    'A relationship timeline you fill in — first meeting, first date, and every milestone since.',
    { occasions: ['ANNIVERSARY', 'JUST_BECAUSE'], palette: 'blush', requiredPlan: 'love',
      supportedFields: [...COMMON, 'timeline', ...PHOTOS], sections: ['hero', 'timeline', 'gallery'] }),
  t(13, 'our-love-story', 'long-distance-love', 'Long-Distance Love',
    'Two cities, one heart.',
    'Distance-inspired visuals and messages for the love that spans miles.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY'], palette: 'starlight',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['distance-hero', 'map-line', 'gallery', 'letter'] }),
  t(14, 'our-love-story', 'digital-scrapbook', 'Digital Scrapbook',
    'Layered photos, notes and stickers.',
    'A digital scrapbook of layered photographs, sticky notes and little stickers.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY', 'BIRTHDAY'], palette: 'sunset',
      supportedFields: [...COMMON, ...PHOTOS], sections: ['scrapbook-cover', 'polaroid-wall', 'sticky-notes'] }),
  t(15, 'our-love-story', 'music-and-memories', 'Music & Memories',
    'Let the song carry the memories.',
    'A music-first experience where one song plays while your memories drift by.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY', 'BIRTHDAY'], palette: 'midnight', requiredPlan: 'love',
      supportedFields: [...COMMON, ...PHOTOS, 'audio', 'letter'], sections: ['music-hero', 'gallery', 'letter'] }),
  t(16, 'our-love-story', 'chat-inspired-love', 'Chat-Inspired Love',
    'Your whole story as a chat.',
    'Message bubbles and a conversation-inspired layout that tells your story like a chat.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY'], palette: 'blush',
      supportedFields: [...COMMON, 'timeline', ...PHOTOS], sections: ['chat-hero', 'chat-thread', 'gallery'] }),
  t(17, 'our-love-story', 'constellation-couple', 'Constellation Couple',
    'Two names drawn in the stars.',
    'A star-map aesthetic with your names as constellations.',
    { occasions: ['ANNIVERSARY', 'JUST_BECAUSE', 'VALENTINES'], palette: 'starlight', requiredPlan: 'love',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['starry-hero', 'star-map', 'letter'] }),
  t(18, 'our-love-story', 'minimal-love', 'Minimal Love',
    'Restrained type, generous whitespace.',
    'A quiet, minimal design that lets the words do all the work.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY', 'VALENTINES'], palette: 'rosegold', animation: 'subtle',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['minimal-hero', 'text-flow', 'gallery', 'signature'] }),
  t(19, 'our-love-story', 'cinematic-couple-story', 'Cinematic Couple Story',
    'Your story, widescreen.',
    'Cinematic image sections and captions that unfold like a short film.',
    { occasions: ['ANNIVERSARY', 'VALENTINES', 'JUST_BECAUSE'], palette: 'noir', requiredPlan: 'love', animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['cinematic-intro', 'gallery', 'letter', 'finale'] }),
  t(20, 'our-love-story', 'handwritten-love-journal', 'Handwritten Love Journal',
    'Paper, ink and your handwriting.',
    'Paper textures and handwritten typography that read like a journal page.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY'], palette: 'rosegold', animation: 'subtle',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['journal-cover', 'handwritten-note', 'gallery'] }),

  // ── Category C — Love & Proposal (21–30) ──────────────────────────────────
  t(21, 'love-proposal', 'secret-love-letter', 'Secret Love Letter',
    'An envelope waiting to be opened.',
    'An envelope and letter-opening animation that hides your message until they tap.',
    { occasions: ['VALENTINES', 'JUST_BECAUSE', 'ANNIVERSARY'], palette: 'rosegold',
      supportedFields: [...COMMON, 'letter', 'secretMessage', ...PHOTOS], sections: ['envelope-hero', 'secret-unlock', 'letter'] }),
  t(22, 'love-proposal', 'will-you-be-mine', 'Will You Be Mine',
    'The question, asked beautifully.',
    'A proposal-focused interactive reveal with the big question at the end.',
    { occasions: ['PROPOSAL', 'VALENTINES'], palette: 'blush', requiredPlan: 'love', isFeatured: true,
      supportedFields: [...COMMON, ...PHOTOS, 'choices'], sections: ['proposal-hero', 'gallery', 'choices', 'finale'] }),
  t(23, 'love-proposal', 'romantic-proposal', 'Romantic Proposal',
    'Your proposal, told cinematically.',
    'A cinematic proposal story with scenes building to the question.',
    { occasions: ['PROPOSAL'], palette: 'midnight', requiredPlan: 'love', animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['cinematic-intro', 'gallery', 'letter', 'finale'] }),
  t(24, 'love-proposal', 'anniversary-memories', 'Anniversary Memories',
    'The date, the photos, the milestones.',
    'An anniversary page with the date, photos and milestone messages.',
    { occasions: ['ANNIVERSARY'], palette: 'rosegold', isFeatured: true,
      supportedFields: [...COMMON, ...PHOTOS, 'countdown'], sections: ['anniversary-hero', 'gallery', 'countdown', 'letter'] }),
  t(25, 'love-proposal', 'forever-promises', 'Forever Promises',
    'Little promises you can keep.',
    'Editable promise cards your partner can flip through one by one.',
    { occasions: ['PROPOSAL', 'ANNIVERSARY', 'VALENTINES'], palette: 'blush',
      supportedFields: [...COMMON, 'promises', ...PHOTOS], sections: ['promises-hero', 'promise-cards', 'signature'] }),
  t(26, 'love-proposal', 'valentines-day-surprise', "Valentine's Day Surprise",
    'Hearts, roses and a love note.',
    "A Valentine's celebration of hearts, roses and a note for the one you love.",
    { occasions: ['VALENTINES'], palette: 'blush', animation: 'balanced',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['heart-burst-hero', 'gallery', 'letter', 'confetti-message'] }),
  t(27, 'love-proposal', 'rose-garden', 'Rose Garden',
    'A garden in full bloom, for them.',
    'Floral visuals and a letter reveal set in a blooming rose garden.',
    { occasions: ['VALENTINES', 'ANNIVERSARY', 'JUST_BECAUSE'], palette: 'emerald',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['garden-hero', 'bloom-gallery', 'letter'] }),
  t(28, 'love-proposal', 'elegant-love-notes', 'Elegant Love Notes',
    'Refined type and quiet devotion.',
    'Refined typography and personal notes arranged with restraint and elegance.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY', 'VALENTINES'], palette: 'noir', animation: 'subtle',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['elegant-hero', 'text-flow', 'gallery', 'signature'] }),
  t(29, 'love-proposal', 'countdown-special-day', 'Countdown to a Special Day',
    'Every second closer to the moment.',
    'A live countdown to the date that matters, with a message for the day.',
    { occasions: ['BIRTHDAY', 'ANNIVERSARY', 'OTHER', 'VALENTINES'], palette: 'starlight',
      supportedFields: [...COMMON, 'countdown', ...PHOTOS], sections: ['countdown-hero', 'countdown', 'gallery'] }),
  t(30, 'love-proposal', 'moonlight-romance', 'Moonlight Romance',
    'Moon, stars and quiet night air.',
    'A moonlit scene with ambient animation for a soft, romantic night.',
    { occasions: ['VALENTINES', 'ANNIVERSARY', 'JUST_BECAUSE'], palette: 'starlight', animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter'], sections: ['moon-hero', 'gallery', 'letter', 'signature'] }),

  // ── Category D — Cute & Creative (31–40) ──────────────────────────────────
  t(31, 'cute-creative', 'cute-doodle-love', 'Cute Doodle Love',
    'Scribbles, doodles and a big heart.',
    'A playful doodle-covered page with handwritten notes and plenty of charm.',
    { occasions: ['JUST_BECAUSE', 'BIRTHDAY', 'VALENTINES'], palette: 'pastel', animation: 'balanced',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['doodle-hero', 'sticky-notes', 'gallery'] }),
  t(32, 'cute-creative', 'love-quiz', 'Love Quiz',
    'How well do you know us?',
    'A customizable love quiz with questions and answers that ends in a personal message.',
    { occasions: ['VALENTINES', 'ANNIVERSARY', 'JUST_BECAUSE'], palette: 'blush', requiredPlan: 'love', isFeatured: true,
      supportedFields: [...COMMON, 'quiz', ...PHOTOS], sections: ['quiz-hero', 'love-quiz', 'gallery', 'finale'] }),
  t(33, 'cute-creative', 'secret-message-unlock', 'Secret Message Unlock',
    'Hidden until they figure it out.',
    'The recipient unlocks a hidden message through a small interaction.',
    { occasions: ['VALENTINES', 'BIRTHDAY', 'JUST_BECAUSE'], palette: 'midnight', requiredPlan: 'love',
      supportedFields: [...COMMON, 'secretMessage', ...PHOTOS], sections: ['unlock-hero', 'secret-unlock', 'gallery', 'finale'] }),
  t(34, 'cute-creative', 'interactive-gift-box', 'Interactive Gift Box',
    'Tap to unwrap, one layer at a time.',
    'An animated present that opens in layers, revealing your message and photos.',
    { occasions: ['BIRTHDAY', 'VALENTINES', 'ANNIVERSARY'], palette: 'sunset', requiredPlan: 'love',
      supportedFields: [...COMMON, 'gift', ...PHOTOS], sections: ['gift-hero', 'gift-box', 'gallery', 'finale'] }),
  t(35, 'cute-creative', 'love-coupons', 'Love Coupons',
    'Redeemable for hugs, dates and favours.',
    'Customizable digital coupons your partner can flip through and redeem.',
    { occasions: ['VALENTINES', 'JUST_BECAUSE', 'ANNIVERSARY'], palette: 'blush',
      supportedFields: [...COMMON, 'coupons', ...PHOTOS], sections: ['coupons-hero', 'coupon-book', 'signature'] }),
  t(36, 'cute-creative', 'choose-your-surprise', 'Choose Your Surprise',
    'Pick a path, get a message.',
    'Interactive choices that lead to different messages depending on what they pick.',
    { occasions: ['JUST_BECAUSE', 'BIRTHDAY', 'VALENTINES'], palette: 'starlight', requiredPlan: 'love', isFeatured: true,
      supportedFields: [...COMMON, 'choices', ...PHOTOS], sections: ['choices-hero', 'choices', 'finale'] }),
  t(37, 'cute-creative', 'animated-flower-garden', 'Animated Flower Garden',
    'Flowers blooming as they read.',
    'A gentle animated garden where flowers bloom as your message is revealed.',
    { occasions: ['JUST_BECAUSE', 'BIRTHDAY', 'ANNIVERSARY'], palette: 'emerald', animation: 'balanced',
      supportedFields: [...COMMON, 'letter', ...PHOTOS], sections: ['garden-hero', 'bloom-gallery', 'letter'] }),
  t(38, 'cute-creative', 'comic-love-story', 'Comic Love Story',
    'Your story in illustrated panels.',
    'Configurable illustrated story panels that tell your story like a comic.',
    { occasions: ['JUST_BECAUSE', 'ANNIVERSARY', 'BIRTHDAY'], palette: 'sunset', requiredPlan: 'love',
      supportedFields: [...COMMON, 'storyPanels', ...PHOTOS], sections: ['comic-hero', 'comic-panels', 'gallery'] }),
  t(39, 'cute-creative', 'pixel-heart-romance', 'Pixel Heart Romance',
    'Retro pixels and 8-bit love.',
    'Pixel-art heart effects and a retro, arcade-inspired love note.',
    { occasions: ['VALENTINES', 'JUST_BECAUSE', 'BIRTHDAY'], palette: 'starlight',
      supportedFields: [...COMMON, ...PHOTOS], sections: ['pixel-hero', 'pixel-hearts', 'gallery', 'finale'] }),
  t(40, 'cute-creative', 'ultimate-custom-reveal', 'Ultimate Custom Reveal',
    'Build it your way, section by section.',
    'Modular sections you can switch on and off for a completely personal finale.',
    { occasions: ['BIRTHDAY', 'ANNIVERSARY', 'PROPOSAL', 'VALENTINES', 'JUST_BECAUSE', 'OTHER'], palette: 'midnight',
      requiredPlan: 'forever', isFeatured: true, animation: 'cinematic',
      supportedFields: [...COMMON, ...PHOTOS, 'letter', 'audio', 'timeline', 'promises', 'countdown', 'quiz', 'coupons', 'gift', 'choices', 'secretMessage', 'storyPanels'],
      sections: ['modular-hero', 'gallery', 'timeline', 'letter', 'promise-cards', 'countdown', 'love-quiz', 'coupon-book', 'choices', 'finale'] }),
]

export function getTemplateById(id: string) {
  return TEMPLATE_CATALOG.find((tpl) => tpl.id === id)
}

export function getTemplateBySlug(slug: string) {
  return TEMPLATE_CATALOG.find((tpl) => tpl.slug === slug)
}

export function getTemplateByComponentKey(key: string) {
  return TEMPLATE_CATALOG.find((tpl) => tpl.componentKey === key)
}
