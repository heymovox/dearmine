import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { seeded, usePrefersReducedMotion } from '../lib/motion'

type Props = {
  /** How many hearts to render (kept low on small screens). */
  count?: number
  /** Extra classes for the layer itself. */
  className?: string
  /** Slow the drift down (ms per cycle). */
  duration?: number
  seed?: number
}

const HEART_CHARS = ['♥', '❤', '♥', '❤', '♥']

/** Soft drifting heart layer. Pointer-events are off so it never blocks taps. */
export default function FloatingHearts({
  count = 14,
  className = '',
  duration = 16,
  seed = 7,
}: Props) {
  const reduced = usePrefersReducedMotion()

  const hearts = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, (_, i) => {
      const size = 12 + rand() * 26
      return {
        id: i,
        char: HEART_CHARS[Math.floor(rand() * HEART_CHARS.length)],
        left: rand() * 96,
        size,
        opacity: 0.18 + rand() * 0.32,
        drift: (rand() - 0.5) * 120,
        dur: duration + rand() * duration * 0.9,
        delay: -rand() * duration,
        spin: (rand() - 0.5) * 24,
      }
    })
  }, [count, seed, duration])

  if (reduced) return null

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute select-none"
          style={{
            left: `${h.left}%`,
            top: '100%',
            fontSize: h.size,
            color: 'currentColor',
          }}
          initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '-118vh'],
            x: [0, h.drift, -h.drift * 0.6, 0],
            opacity: [0, h.opacity, h.opacity, 0],
            rotate: [0, h.spin, -h.spin * 0.5, 0],
          }}
          transition={{
            duration: h.dur,
            delay: h.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {h.char}
        </motion.span>
      ))}
    </div>
  )
}