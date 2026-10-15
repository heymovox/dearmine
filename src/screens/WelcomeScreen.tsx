import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import FloatingHearts from '../components/FloatingHearts'
import GlowingHeart from '../components/GlowingHeart'
import { MusicHint } from '../components/MusicToggle'
import Reveal from '../components/Reveal'
import RomanticButton from '../components/RomanticButton'
import { people, welcome } from '../config/siteConfig'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  onOpen: () => void
}

/** Screen 1 — the secret door. */
export default function WelcomeScreen({ onOpen }: Props) {
  const [bursting, setBursting] = useState(false)
  const timer = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()

  const handleOpen = () => {
    if (bursting) return
    setBursting(true)
    const delay = reduced ? 260 : 1000
    timer.current = window.setTimeout(() => {
      onOpen()
      setBursting(false)
    }, delay)
  }

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  return (
    <section
      className="grain relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-burgundy px-5 pt-14 pb-24 text-center text-cream"
      aria-label="Welcome"
    >
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 85% at 50% 8%, rgba(181,40,77,0.55) 0%, rgba(74,16,37,0) 62%), radial-gradient(90% 60% at 50% 110%, rgba(215,160,167,0.28) 0%, rgba(74,16,37,0) 65%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <FloatingHearts count={16} seed={11} className="text-blush/70" />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
        <motion.div
          animate={bursting && !reduced ? { scale: 4.2, opacity: 0.15 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 sm:mb-9"
        >
          <GlowingHeart size={150} />
        </motion.div>

        <Reveal delay={0.15}>
          <p className="mb-4 font-body text-[11px] tracking-[0.36em] text-blush/65 uppercase sm:text-xs">
            {welcome.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <h1 className="text-rose-gradient font-display text-[2.4rem] leading-[1.12] font-semibold tracking-tight text-shadow-glow sm:text-6xl">
            {welcome.title}
          </h1>
        </Reveal>

        <Reveal delay={0.42}>
          <p className="mx-auto mt-5 max-w-md font-body text-[15px] leading-relaxed text-cream/82 sm:mt-6 sm:text-lg">
            {welcome.subtitle}
          </p>
        </Reveal>

        <Reveal delay={0.56}>
          <p className="mx-auto mt-4 max-w-sm font-hand text-lg text-blush/75 sm:text-xl">
            {welcome.hint}
          </p>
        </Reveal>

        <div className="mt-9 flex flex-col items-center gap-5 sm:mt-11">
          <RomanticButton onClick={handleOpen} delay={0.7} className="text-base sm:text-lg">
            {welcome.cta}
          </RomanticButton>

          <AnimatePresence>
            {!bursting && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MusicHint />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Reveal delay={0.95}>
          <p className="mt-10 font-body text-[10px] tracking-[0.3em] text-cream/35 uppercase">
            Made with love by {people.myName}
          </p>
        </Reveal>
      </div>

      {/* Heart-expansion wipe */}
      <AnimatePresence>
        {bursting && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-50"
            initial={{ clipPath: 'circle(0% at 50% 36%)' }}
            animate={{ clipPath: 'circle(150% at 50% 36%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.25 : 0.95, ease: [0.65, 0, 0.35, 1] }}
            style={{
              background:
                'radial-gradient(circle at 50% 36%, #FFF8F0 0%, #F8DCE5 32%, #B5284D 74%, #4A1025 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Cream flash right before handing over */}
      <AnimatePresence>
        {bursting && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-50 bg-cream"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.92] }}
            transition={{ duration: reduced ? 0.25 : 1, times: [0, 0.7, 1] }}
          />
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {bursting ? 'Opening your surprise' : ''}
      </span>
    </section>
  )
}