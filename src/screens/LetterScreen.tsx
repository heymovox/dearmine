import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Envelope from '../components/Envelope'
import FloatingHearts from '../components/FloatingHearts'
import Reveal from '../components/Reveal'
import RomanticButton from '../components/RomanticButton'
import Typewriter from '../components/Typewriter'
import { letter, people } from '../config/siteConfig'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  onNext: () => void
}

/** Screen 4 — envelope → typewriter love letter. */
export default function LetterScreen({ onNext }: Props) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const reduced = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  const typing = open && !showAll && !reduced

  const openEnvelope = () => {
    setOpen(true)
    if (reduced) setRevealed(true)
    window.setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
    }, reduced ? 60 : 950)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target instanceof HTMLElement && e.target.closest('button')) return
        setShowAll(true)
        setRevealed(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <section
      className="grain relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-cream via-cream to-cream-deep px-5 pt-16 pb-28 text-ink sm:pt-20 sm:pb-32"
      aria-label="Love letter"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(75% 45% at 50% 0%, rgba(248,220,229,0.85) 0%, rgba(255,248,240,0) 72%)',
        }}
      />
      <FloatingHearts count={9} seed={57} duration={21} className="text-romantic/22" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <Reveal delay={0.05}>
          <p className="mb-4 font-body text-[11px] tracking-[0.36em] text-romantic/55 uppercase sm:text-xs">
            {letter.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <h2 className="max-w-lg font-display text-[1.85rem] leading-[1.2] font-semibold tracking-tight text-ink-gradient sm:text-4xl md:text-[2.6rem]">
            {letter.title}
          </h2>
        </Reveal>

        {/* ---------- Envelope state ---------- */}
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="envelope"
              exit={{ opacity: 0, y: -18, scale: 0.94 }}
              transition={{ duration: reduced ? 0.15 : 0.4 }}
              className="mt-10 w-full sm:mt-14"
            >
              <Envelope open={false} onOpen={openEnvelope} label={letter.cta} />
              <div className="mt-14 flex justify-center">
                <RomanticButton onClick={openEnvelope} variant="romantic" delay={0.3}>
                  {letter.cta}
                </RomanticButton>
              </div>
            </motion.div>
          ) : (
            /* ---------- Letter card ---------- */
            <motion.div
              key="card"
              ref={cardRef}
              initial={{ opacity: 0, y: 46, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduced ? 0.2 : 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 w-full sm:mt-14"
            >
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -1.5 }}
                animate={{ opacity: 1, y: 0, rotate: open ? 0 : -1.5 }}
                transition={{ delay: reduced ? 0 : 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="paper relative overflow-hidden rounded-2xl px-5 py-8 shadow-soft ring-1 ring-burgundy/10 sm:px-10 sm:py-12"
              >
                {/* Decorative corners */}
                <span
                  aria-hidden
                  className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-blush/50 blur-2xl"
                />
                <span
                  aria-hidden
                  className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-romantic/12 blur-3xl"
                />

                <div className="relative">
                  <p className="mb-6 flex items-center gap-2 font-body text-[10px] tracking-[0.3em] text-romantic/45 uppercase">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
                    A letter from {people.myName}
                  </p>

                  <Typewriter
                    paragraphs={letter.paragraphs}
                    speed={20}
                    instant={!typing}
                    onDone={() => setRevealed(true)}
                    className="font-hand text-[1.22rem] leading-[1.72] text-ink/88 sm:text-[1.42rem] sm:leading-[1.75]"
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: revealed ? 1 : 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="mt-8 border-t border-romantic/15 pt-6"
                  >
                    <p className="font-hand text-xl whitespace-pre-line text-burgundy/85 sm:text-2xl">
                      {letter.signature}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {!revealed && (
                  <RomanticButton
                    onClick={() => {
                      setShowAll(true)
                      setRevealed(true)
                    }}
                    variant="ghost-dark"
                    delay={0.1}
                  >
                    {letter.showFullCta}
                  </RomanticButton>
                )}
                <RomanticButton
                  onClick={onNext}
                  variant={revealed ? 'romantic' : 'ghost-dark'}
                  delay={0.18}
                >
                  {revealed ? letter.continueCta : 'Skip to the surprise 🎉'}
                </RomanticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}