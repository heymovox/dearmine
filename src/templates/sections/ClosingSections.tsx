import { motion, AnimatePresence } from 'framer-motion'
import { HeartHandshake, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import ConfettiBurst from '../../components/ConfettiBurst'
import Fireworks from '../../components/Fireworks'
import GlowingHeart from '../../components/GlowingHeart'
import { seeded, usePrefersReducedMotion } from '../../lib/motion'
import { useTemplate } from '../engine/context'
import { Fade, MessageText, SectionHeading, SectionShell } from '../ui/primitives'

/** Hand-signed closing block. */
export function SignatureSection() {
  const { content, meta } = useTemplate()
  const signature = content.signature
  if (!signature) return null

  return (
    <SectionShell>
      <Fade className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <span
          aria-hidden
          className="grid h-12 w-12 place-items-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--tpl-accent) 20%, transparent)', color: 'var(--tpl-accent)' }}
        >
          <HeartHandshake className="h-5.5 w-5.5" strokeWidth={1.5} />
        </span>
        <p className="font-hand text-3xl leading-snug sm:text-4xl" style={{ color: 'var(--tpl-accent)' }}>
          {signature}
        </p>
        {meta.creatorName ? <p className="tpl-kicker">— {meta.creatorName}</p> : null}
      </Fade>
    </SectionShell>
  )
}

/** The big closing scene — `finale` and `celebration` variants. */
export function FinaleSection({ variant = 'finale' }: { variant?: 'finale' | 'celebration' }) {
  const { content, meta } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const message = content.finalMessage || content.mainMessage || 'The best is yet to come.'
  const celebration = variant === 'celebration'

  return (
    <section
      id="tpl-finale"
      className="relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{
        background:
          'radial-gradient(110% 90% at 50% 100%, color-mix(in srgb, var(--tpl-accent) 45%, var(--tpl-ink)) 0%, var(--tpl-ink) 68%)',
        color: 'var(--tpl-surface)',
      }}
    >
      <Fireworks active={!reduced} bursts={celebration ? 6 : 4} />
      {celebration ? <ConfettiBurst count={52} seed={4} /> : null}

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
        {!celebration ? <GlowingHeart size={132} strong /> : (
          <Fade>
            <span className="text-5xl" aria-hidden>🎉</span>
          </Fade>
        )}

        <Fade delay={0.1}>
          <p className="tpl-kicker" style={{ color: 'var(--tpl-soft)' }}>
            {meta.nickname ? `For ${meta.nickname}` : 'For you'}
          </p>
        </Fade>

        <Fade delay={0.2}>
          <h2
            className="font-display leading-[1.06] font-semibold"
            style={{ fontSize: 'clamp(2.2rem, 7vw, 4rem)' }}
          >
            {content.title || 'The end of the surprise — the start of more'}
          </h2>
        </Fade>

        <Fade delay={0.3}>
          <MessageText text={message} className="text-lg leading-relaxed opacity-90 sm:text-xl" />
        </Fade>

        {content.signature ? (
          <Fade delay={0.4}>
            <p className="font-hand text-3xl" style={{ color: 'var(--tpl-soft)' }}>
              {content.signature}
            </p>
          </Fade>
        ) : null}

        <Fade delay={0.5}>
          <p className="mt-2 font-body text-[11px] tracking-[0.3em] uppercase opacity-55">
            Made with LoveSurprise ♥
          </p>
        </Fade>
      </div>
    </section>
  )
}

/** Confetti shower around a single highlighted message. */
export function ConfettiMessageSection() {
  const { content } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const text = content.mainMessage || content.openingMessage || content.finalMessage
  if (!text) return null

  return (
    <SectionShell>
      <div className="tpl-card relative mx-auto max-w-2xl overflow-hidden px-7 py-12 text-center sm:px-12">
        <ConfettiBurst active={!reduced} count={48} seed={14} />
        <Fade>
          <Sparkles className="mx-auto mb-4 h-6 w-6" style={{ color: 'var(--tpl-accent)' }} aria-hidden />
          <MessageText text={text} className="font-display text-2xl leading-relaxed sm:text-3xl" />
        </Fade>
      </div>
    </SectionShell>
  )
}

/** Small illustrated wish cards built from the project's own messages. */
export function WishCardsSection() {
  const { content, meta } = useTemplate()

  const wishes = useMemo(
    () =>
      [
        content.openingMessage ? { kicker: 'First', text: content.openingMessage } : null,
        content.mainMessage ? { kicker: 'Then', text: content.mainMessage } : null,
        content.finalMessage ? { kicker: 'Always', text: content.finalMessage } : null,
        content.signature ? { kicker: 'P.S.', text: content.signature } : null,
      ].filter((w): w is { kicker: string; text: string } => Boolean(w)),
    [content],
  )

  if (!wishes.length) return null

  return (
    <SectionShell tone="paper">
      <SectionHeading kicker="Little wishes" title={meta.nickname ? `${meta.nickname}, here is to us` : 'Wishes for you'} />
      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {wishes.map((w, i) => (
          <Fade key={i} delay={i * 0.08}>
            <div className="tpl-card h-full px-6 py-7">
              <p className="tpl-kicker mb-2">{w.kicker}</p>
              <p className="font-display text-xl leading-snug">{w.text}</p>
            </div>
          </Fade>
        ))}
      </div>
    </SectionShell>
  )
}

/** Tilted sticky notes with the creator's lines. */
export function StickyNotesSection() {
  const { content } = useTemplate()
  const lines = [
    ...content.mainMessage.split('\n').map((l) => l.trim()).filter(Boolean),
    ...content.finalMessage.split('\n').map((l) => l.trim()).filter(Boolean),
  ].slice(0, 8)

  if (!lines.length) return null

  const rand = seeded(33)
  const tints = ['color-mix(in srgb, var(--tpl-soft) 85%, white 15%)', 'color-mix(in srgb, var(--tpl-accent) 30%, var(--tpl-surface))', 'color-mix(in srgb, var(--tpl-surface) 70%, white 30%)']

  return (
    <SectionShell>
      <SectionHeading kicker="Stuck to the fridge" title="Notes for you" />
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
        {lines.map((line, i) => (
          <Fade key={i} delay={i * 0.06} y={20}>
            <div
              className="flex min-h-36 items-center justify-center rounded-md p-4 text-center shadow-[0_14px_30px_-16px_rgba(51,11,26,0.5)]"
              style={{
                background: tints[i % tints.length],
                color: 'var(--tpl-ink)',
                transform: `rotate(${(rand() * 8 - 4).toFixed(1)}deg)`,
              }}
            >
              <p className="font-hand text-lg leading-snug">{line}</p>
            </div>
          </Fade>
        ))}
      </div>
    </SectionShell>
  )
}

/** Retro pixel-heart grid that lights up — pixel template's closing beat. */
export function PixelHeartsSection() {
  const { content, mode } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const cells = 36

  const grid = useMemo(() => {
    const rand = seeded(64)
    return Array.from({ length: cells }, (_, i) => ({
      id: i,
      lit: rand() > 0.45,
      delay: rand() * 2.4,
    }))
  }, [])

  const text = content.finalMessage || content.mainMessage || content.title

  return (
    <SectionShell>
      <SectionHeading kicker="8-bit love" title="Press start ♥" />
      <Fade className="mx-auto flex max-w-md flex-col items-center gap-7">
        <div className="grid grid-cols-6 gap-2" role="img" aria-label="Pixel hearts lighting up">
          {grid.map((c) => (
            <motion.span
              key={c.id}
              className="block aspect-square rounded-[3px]"
              style={{
                background: c.lit ? 'var(--tpl-accent)' : 'color-mix(in srgb, var(--tpl-ink) 18%, var(--tpl-surface))',
                boxShadow: c.lit ? '0 0 12px color-mix(in srgb, var(--tpl-accent) 65%, transparent)' : undefined,
              }}
              animate={reduced || !c.lit ? undefined : { opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        {text ? (
          <div className="tpl-card px-7 py-6 text-center">
            <MessageText text={text} className="font-display text-xl" />
          </div>
        ) : null}
        {mode === 'preview' && !text ? (
          <p className="tpl-kicker opacity-60">Your final message appears here</p>
        ) : null}
      </Fade>
    </SectionShell>
  )
}

/** Simple animated wish/heart burst used as a light celebration. */
export function HeartBurstSection() {
  const { content } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const text = content.openingMessage || content.mainMessage
  return (
    <SectionShell>
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl px-7 py-14 text-center">
        <AnimatePresence>
          {!reduced ? <ConfettiBurst key="burst" count={44} seed={17} /> : null}
        </AnimatePresence>
        <Fade>
          <GlowingHeart size={116} />
          {text ? (
            <p className="mt-6 font-display text-2xl leading-relaxed sm:text-3xl">{text}</p>
          ) : null}
        </Fade>
      </div>
    </SectionShell>
  )
}
