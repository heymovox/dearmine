import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import BirthdayCake from '../components/BirthdayCake'
import ConfettiBurst from '../components/ConfettiBurst'
import FloatingHearts from '../components/FloatingHearts'
import Reveal from '../components/Reveal'
import RomanticButton from '../components/RomanticButton'
import { birthday } from '../config/siteConfig'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  onNext: () => void
}

/** Screen 2 — the birthday greeting. */
export default function BirthdayScreen({ onNext }: Props) {
  const [confetti, setConfetti] = useState(true)
  const reduced = usePrefersReducedMotion()
  const timers = useRef<number[]>([])

  useEffect(() => {
    timers.current.push(window.setTimeout(() => setConfetti(false), 4200))
    return () => {
      timers.current.forEach(window.clearTimeout)
      timers.current = []
    }
  }, [])

  return (
    <section
      className="grain relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-linear-to-b from-burgundy via-burgundy-deep to-burgundy px-5 pt-16 pb-28 text-center text-cream sm:pt-20 sm:pb-32"
      aria-label="Birthday greeting"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(100% 60% at 50% 100%, rgba(181,40,77,0.5) 0%, rgba(74,16,37,0) 70%)',
        }}
      />

      <FloatingHearts count={14} seed={23} duration={18} className="text-blush/60" />
      <ConfettiBurst active={confetti} count={44} seed={31} />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 w-44 sm:mb-8 sm:w-56"
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BirthdayCake className="h-auto w-full drop-shadow-[0_24px_38px_rgba(0,0,0,0.45)]" />
          </motion.div>
        </motion.div>

        <Reveal delay={0.16}>
          <p className="mb-4 font-body text-[11px] tracking-[0.36em] text-blush/60 uppercase sm:text-xs">
            {birthday.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <h2 className="text-rose-gradient font-display text-[2.05rem] leading-[1.14] font-semibold tracking-tight text-shadow-glow sm:text-5xl md:text-6xl">
            {birthday.title}
          </h2>
        </Reveal>

        <div className="mx-auto mt-6 max-w-xl space-y-4 sm:mt-8 sm:space-y-5">
          {birthday.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.42 + i * 0.12}>
              <p className="font-body text-[15px] leading-[1.85] text-cream/85 sm:text-lg">
                {p}
              </p>
            </Reveal>
          ))}
        </div>

        <RomanticButton onClick={onNext} delay={0.72} className="mt-10 sm:mt-12">
          {birthday.cta}
        </RomanticButton>
      </div>
    </section>
  )
}