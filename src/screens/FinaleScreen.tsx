import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import FloatingHearts from '../components/FloatingHearts'
import Fireworks from '../components/Fireworks'
import Reveal from '../components/Reveal'
import RomanticButton from '../components/RomanticButton'
import { finale } from '../config/siteConfig'
import type { ScreenId } from '../config/siteConfig'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  onNavigate: (id: ScreenId) => void
}

/** Screen 5 — the finale, with working navigation back into the story. */
export default function FinaleScreen({ onNavigate }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      className="grain relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-burgundy via-romantic/75 to-romantic-soft px-5 pt-20 pb-28 text-center text-cream sm:pb-32"
      aria-label="Final birthday surprise"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 55% at 50% 0%, rgba(248,220,229,0.35) 0%, rgba(74,16,37,0) 65%), radial-gradient(80% 55% at 50% 100%, rgba(74,16,37,0.75) 0%, rgba(74,16,37,0) 70%)',
        }}
      />

      <Fireworks active bursts={reduced ? 0 : 6} interval={1300} />
      <FloatingHearts count={18} seed={73} duration={15} className="text-blush/65" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 sm:mb-9"
        >
          <motion.span
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream/10 ring-1 ring-blush/30 backdrop-blur-sm sm:h-24 sm:w-24"
            animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="h-9 w-9 fill-blush text-blush sm:h-11 sm:w-11" strokeWidth={1.2} />
          </motion.span>
        </motion.div>

        <Reveal delay={0.18}>
          <h2 className="text-rose-gradient font-display text-[2.05rem] leading-[1.14] font-semibold tracking-tight text-shadow-glow sm:text-5xl md:text-6xl">
            {finale.title}
          </h2>
        </Reveal>

        <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          {finale.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.34 + i * 0.12}>
              <p className="mx-auto max-w-xl font-body text-[15px] leading-[1.85] text-cream/88 sm:text-lg">
                {p}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.62}>
          <p className="mt-7 font-display text-xl leading-snug font-medium text-blush italic sm:mt-9 sm:text-3xl">
            {finale.closing}
          </p>
        </Reveal>

        <Reveal delay={0.78}>
          <p className="mt-8 font-hand text-2xl text-cream/90 sm:text-3xl">{finale.signature}</p>
        </Reveal>

        <div className="mt-11 flex w-full max-w-xl flex-col items-stretch gap-3.5 sm:mt-14 sm:flex-row sm:justify-center sm:gap-4">
          {finale.buttons.map((b, i) => (
            <RomanticButton
              key={b.id}
              onClick={() => onNavigate(b.id as ScreenId)}
              variant={i === 0 ? 'cream' : i === 1 ? 'romantic' : 'ghost-light'}
              delay={0.9 + i * 0.1}
              className="w-full sm:w-auto"
            >
              {b.label}
            </RomanticButton>
          ))}
        </div>
      </div>
    </section>
  )
}