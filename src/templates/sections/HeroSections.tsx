import { motion } from 'framer-motion'
import { ChevronDown, Lock, Music4, MessageCircleHeart, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { occasionLabel } from '../../shared'
import { seeded, usePrefersReducedMotion } from '../../lib/motion'
import { useTemplate } from '../engine/context'
import { Fade } from '../ui/primitives'
import FloatingHearts from '../../components/FloatingHearts'

type HeroTone = 'dark' | 'light'
type HeroBg = 'gradient' | 'photo' | 'paper'
type HeroDeco =
  | 'none'
  | 'hearts'
  | 'stars'
  | 'shimmer'
  | 'petals'
  | 'pixels'
  | 'doodle'
  | 'moon'
  | 'bubbles'
  | 'glow'
  | 'lock'
  | 'music'
  | 'chat'

type HeroDef = {
  tone: HeroTone
  bg: HeroBg
  deco: HeroDeco
  cinematic?: boolean
  icon?: 'sparkles' | 'lock' | 'music' | 'chat'
}

/** One entry per `hero` section key in the 40-template catalog. */
const HERO_DEFS: Record<string, HeroDef> = {
  'glowing-hearts': { tone: 'dark', bg: 'gradient', deco: 'hearts' },
  'night-hero': { tone: 'dark', bg: 'photo', deco: 'stars' },
  'gold-hero': { tone: 'light', bg: 'gradient', deco: 'shimmer' },
  'heart-burst-hero': { tone: 'light', bg: 'gradient', deco: 'hearts' },
  'luxury-hero': { tone: 'dark', bg: 'gradient', deco: 'shimmer' },
  'floral-hero': { tone: 'light', bg: 'paper', deco: 'petals' },
  'scrapbook-cover': { tone: 'light', bg: 'paper', deco: 'doodle' },
  'starry-hero': { tone: 'dark', bg: 'gradient', deco: 'stars' },
  'pastel-hero': { tone: 'light', bg: 'gradient', deco: 'bubbles' },
  'cinematic-intro': { tone: 'dark', bg: 'photo', deco: 'none', cinematic: true },
  hero: { tone: 'dark', bg: 'photo', deco: 'glow' },
  'distance-hero': { tone: 'dark', bg: 'photo', deco: 'stars' },
  'music-hero': { tone: 'dark', bg: 'photo', deco: 'music', icon: 'music' },
  'chat-hero': { tone: 'light', bg: 'gradient', deco: 'chat', icon: 'chat' },
  'minimal-hero': { tone: 'light', bg: 'gradient', deco: 'none' },
  'journal-cover': { tone: 'light', bg: 'paper', deco: 'doodle' },
  'envelope-hero': { tone: 'light', bg: 'paper', deco: 'petals' },
  'proposal-hero': { tone: 'dark', bg: 'gradient', deco: 'hearts' },
  'anniversary-hero': { tone: 'light', bg: 'gradient', deco: 'shimmer' },
  'promises-hero': { tone: 'light', bg: 'gradient', deco: 'bubbles' },
  'garden-hero': { tone: 'light', bg: 'paper', deco: 'petals' },
  'elegant-hero': { tone: 'dark', bg: 'gradient', deco: 'shimmer' },
  'countdown-hero': { tone: 'dark', bg: 'gradient', deco: 'stars' },
  'moon-hero': { tone: 'dark', bg: 'gradient', deco: 'moon' },
  'doodle-hero': { tone: 'light', bg: 'paper', deco: 'doodle' },
  'quiz-hero': { tone: 'light', bg: 'gradient', deco: 'bubbles' },
  'unlock-hero': { tone: 'dark', bg: 'gradient', deco: 'lock', icon: 'lock' },
  'gift-hero': { tone: 'light', bg: 'gradient', deco: 'shimmer' },
  'coupons-hero': { tone: 'light', bg: 'paper', deco: 'doodle' },
  'choices-hero': { tone: 'light', bg: 'gradient', deco: 'bubbles' },
  'comic-hero': { tone: 'light', bg: 'paper', deco: 'doodle' },
  'pixel-hero': { tone: 'dark', bg: 'gradient', deco: 'pixels' },
  'modular-hero': { tone: 'dark', bg: 'photo', deco: 'glow', cinematic: true },
}

const DEFAULT_DEF: HeroDef = { tone: 'dark', bg: 'gradient', deco: 'glow' }

export default function HeroSection({ variant, index }: { variant: string; index: number }) {
  const { content, meta, photos, cover, mode } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const def = HERO_DEFS[variant] ?? DEFAULT_DEF

  const heroPhoto = cover?.url ?? photos[0]?.url ?? ''
  const title = content.title || (meta.recipientName ? `For ${meta.recipientName}` : 'A surprise for you')
  const subtitle = content.openingMessage || (mode === 'preview' ? '' : '')

  const toneCls = def.tone === 'dark' ? 'text-[color-mix(in_srgb,var(--tpl-surface)_94%,white_6%)]' : ''
  const bgStyle =
    def.bg === 'paper'
      ? { background: 'var(--tpl-soft)' }
      : def.bg === 'gradient'
        ? {
            background:
              def.tone === 'dark'
                ? 'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--tpl-accent) 38%, var(--tpl-ink)) 0%, var(--tpl-ink) 62%)'
                : 'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--tpl-accent) 24%, var(--tpl-surface)) 0%, var(--tpl-surface) 70%)',
          }
        : {}

  return (
    <section
      id={`tpl-sec-${index}`}
      className={`relative flex min-h-[86vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center sm:min-h-[92vh] ${
        def.cinematic ? 'min-h-[96vh]' : ''
      } ${toneCls}`}
      style={bgStyle}
    >
      {def.bg === 'photo' && heroPhoto ? (
        <div aria-hidden className="absolute inset-0">
          <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--tpl-ink) 62%, transparent) 0%, color-mix(in srgb, var(--tpl-ink) 78%, transparent) 55%, color-mix(in srgb, var(--tpl-ink) 92%, transparent) 100%)',
            }}
          />
        </div>
      ) : null}

      <HeroDecoration deco={def.deco} tone={def.tone} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5">
        <Fade delay={0.05}>
          <p className="tpl-kicker" style={def.tone === 'dark' ? { color: 'var(--tpl-soft)' } : undefined}>
            {occasionLabel(meta.occasion)}
          </p>
        </Fade>

        {def.icon ? (
          <Fade delay={0.1}>
            <span
              className="grid h-14 w-14 place-items-center rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--tpl-accent) 26%, transparent)',
                color: 'var(--tpl-accent)',
              }}
            >
              {def.icon === 'lock' ? (
                <Lock className="h-6 w-6" strokeWidth={1.5} />
              ) : def.icon === 'music' ? (
                <Music4 className="h-6 w-6" strokeWidth={1.5} />
              ) : def.icon === 'chat' ? (
                <MessageCircleHeart className="h-6 w-6" strokeWidth={1.5} />
              ) : (
                <Sparkles className="h-6 w-6" strokeWidth={1.5} />
              )}
            </span>
          </Fade>
        ) : null}

        <Fade delay={0.14}>
          <h1
            className="font-display leading-[1.04] font-semibold"
            style={{
              fontSize: 'clamp(2.5rem, 8.5vw, 4.75rem)',
              textShadow: def.tone === 'dark' ? '0 4px 34px rgba(0,0,0,0.35)' : undefined,
            }}
          >
            {title}
          </h1>
        </Fade>

        {subtitle ? (
          <Fade delay={0.24}>
            <p
              className="max-w-xl text-lg leading-relaxed sm:text-xl"
              style={{
                color:
                  def.tone === 'dark'
                    ? 'color-mix(in srgb, var(--tpl-surface) 80%, transparent)'
                    : 'color-mix(in srgb, var(--tpl-ink) 72%, var(--tpl-surface) 28%)',
              }}
            >
              {subtitle}
            </p>
          </Fade>
        ) : null}

        <Fade delay={0.34}>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById(`tpl-sec-${index + 1}`)
                ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
            }}
            className="tpl-btn mt-3"
            style={
              def.tone === 'dark'
                ? { background: 'var(--tpl-surface)', color: 'var(--tpl-ink)' }
                : undefined
            }
          >
            Open the surprise
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </Fade>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ color: 'color-mix(in srgb, var(--tpl-accent) 80%, transparent)' }}
      >
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </section>
  )
}

function HeroDecoration({ deco, tone }: { deco: HeroDeco; tone: HeroTone }) {
  const reduced = usePrefersReducedMotion()

  switch (deco) {
    case 'hearts':
      return (
        <>
          <FloatingHearts count={16} />
          {tone === 'dark' ? (
            <div className="absolute inset-0" aria-hidden>
              <div
                className="absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--tpl-accent) 35%, transparent)' }}
              />
            </div>
          ) : null}
        </>
      )
    case 'stars':
      return <ParticleField shape="star" count={34} seed={11} />
    case 'pixels':
      return <ParticleField shape="pixel" count={26} seed={19} />
    case 'doodle':
      return <ParticleField shape="doodle" count={16} seed={5} />
    case 'petals':
      return <ParticleField shape="petal" count={18} seed={13} />
    case 'bubbles':
      return <ParticleField shape="dot" count={22} seed={23} />
    case 'shimmer':
      return (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, color-mix(in srgb, var(--tpl-accent) 30%, transparent) 50%, transparent 70%)',
          }}
          initial={{ x: '-40%' }}
          animate={reduced ? undefined : { x: ['-40%', '40%'] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
      )
    case 'moon':
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[12%] right-[12%] h-40 w-40 rounded-full blur-[2px] sm:h-52 sm:w-52"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #fffdf6 0%, #f6e7c9 55%, color-mix(in srgb, var(--tpl-soft) 60%, transparent) 100%)',
              boxShadow: '0 0 90px 30px color-mix(in srgb, var(--tpl-accent) 40%, transparent)',
            }}
          />
          <ParticleField shape="star" count={28} seed={31} />
        </div>
      )
    case 'lock':
      return <ParticleField shape="star" count={20} seed={41} />
    case 'music':
      return <ParticleField shape="note" count={14} seed={17} />
    case 'chat':
      return <ParticleField shape="dot" count={16} seed={29} />
    case 'glow':
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--tpl-accent) 30%, transparent)' }}
          />
          <ParticleField shape="star" count={18} seed={7} />
        </div>
      )
    default:
      return null
  }
}

type ParticleShape = 'star' | 'petal' | 'pixel' | 'doodle' | 'dot' | 'note'

const SHAPE_CHARS: Record<ParticleShape, string[]> = {
  star: ['✦', '✧', '·', '★'],
  petal: ['❀', '✿', '✾', '❀'],
  pixel: ['▪', '■', '□', '▪'],
  doodle: ['♡', '☆', '～', '∞'],
  dot: ['•', '◦', '•', '·'],
  note: ['♪', '♫', '♩', '♪'],
}

/** Deterministic drifting glyph field — the whole decorative vocabulary. */
function ParticleField({ shape, count, seed }: { shape: ParticleShape; count: number; seed: number }) {
  const reduced = usePrefersReducedMotion()

  const particles = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      char: SHAPE_CHARS[shape][Math.floor(rand() * SHAPE_CHARS[shape].length)],
      left: rand() * 98,
      top: rand() * 92,
      size: 10 + rand() * 20,
      opacity: 0.16 + rand() * 0.3,
      dur: 9 + rand() * 10,
      delay: -rand() * 8,
      drift: (rand() - 0.5) * 60,
    }))
  }, [count, seed, shape])

  if (reduced) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: p.size,
            color: 'var(--tpl-accent)',
            opacity: p.opacity,
          }}
          animate={{ y: [0, -24, 0], x: [0, p.drift, 0], rotate: [0, 18, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  )
}
