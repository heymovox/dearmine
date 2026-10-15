import { motion } from 'framer-motion'
import { useState } from 'react'
import FloatingHearts from '../components/FloatingHearts'
import Lightbox from '../components/Lightbox'
import Reveal from '../components/Reveal'
import RomanticButton from '../components/RomanticButton'
import SmartImage from '../components/SmartImage'
import { memories } from '../config/siteConfig'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  onNext: () => void
}

/** Screen 3 — a hand-placed scrapbook of Polaroids. */
export default function MemoriesScreen({ onNext }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const reduced = usePrefersReducedMotion()

  const total = memories.photos.length
  const prev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + total) % total))
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % total))

  return (
    <section
      className="grain relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-cream via-cream to-cream-deep px-5 pt-16 pb-28 text-center text-ink sm:pt-20 sm:pb-32"
      aria-label="Our memories"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(80% 50% at 50% 0%, rgba(248,220,229,0.9) 0%, rgba(255,248,240,0) 70%)',
        }}
      />
      <FloatingHearts count={8} seed={41} duration={22} className="text-romantic/25" />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center">
        <Reveal delay={0.05}>
          <p className="mb-4 font-body text-[11px] tracking-[0.36em] text-romantic/55 uppercase sm:text-xs">
            Our little scrapbook · {total} moments
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className="max-w-3xl text-center font-display text-[1.95rem] leading-[1.18] font-semibold tracking-tight text-ink-gradient sm:text-4xl md:text-5xl">
            {memories.title}
          </h2>
        </Reveal>

        <Reveal delay={0.28}>
          <p className="mx-auto mt-4 max-w-lg text-center font-body text-sm leading-relaxed text-ink/60 sm:text-base">
            {memories.subtitle}
          </p>
        </Reveal>

        {/* Scrapbook grid — 2 cols on mobile, up to 5 on wide screens */}
        <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:mt-12 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
          {memories.photos.map((photo, i) => (
            <motion.button
              key={photo.src}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open photo: ${photo.caption}`}
              className="group relative focus-visible:outline-offset-4"
              style={{ rotate: `${photo.tilt}deg` }}
              initial={{ opacity: 0, y: 44, rotate: photo.tilt * 3 }}
              animate={{ opacity: 1, y: 0, rotate: photo.tilt }}
              transition={{
                /* Capped so a long gallery never feels slow. */
                delay: 0.25 + Math.min(i, 8) * 0.07,
                duration: reduced ? 0.25 : 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={reduced ? undefined : { y: -10, rotate: 0, scale: 1.05, zIndex: 20 }}
              whileTap={reduced ? undefined : { scale: 0.97, rotate: 0 }}
            >
              <span className="paper block rounded-[9px] p-1.5 shadow-card ring-1 ring-burgundy/8 transition-shadow duration-300 group-hover:shadow-soft sm:rounded-xl sm:p-2.5">
                <span className="block aspect-3/4 overflow-hidden rounded-[5px] bg-cream-deep sm:rounded-lg">
                  <SmartImage
                    src={photo.src}
                    alt={photo.caption}
                    fallbackLabel={photo.label}
                  />
                </span>
                <span className="mt-1.5 block px-0.5 pb-1 text-center font-hand text-[13px] leading-tight text-burgundy/85 sm:mt-2.5 sm:text-lg">
                  {photo.caption}
                </span>
              </span>
              {/* Gloss */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)',
                }}
              />
            </motion.button>
          ))}
        </div>

        <Reveal delay={0.75}>
          <p className="mt-7 font-hand text-lg text-romantic/60 sm:text-xl">{memories.hint}</p>
        </Reveal>

        <RomanticButton onClick={onNext} delay={0.85} variant="romantic" className="mt-8">
          {memories.cta}
        </RomanticButton>
      </div>

      <Lightbox
        photos={memories.photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onPrev={prev}
        onNext={next}
      />
    </section>
  )
}