import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { seeded, usePrefersReducedMotion } from '../lib/motion'

const COLORS = ['#F8DCE5', '#D7A0A7', '#B5284D', '#FFF8F0', '#E9A7B8', '#C97B94']

type Props = {
  /** Runs only once, then stops — so mobile stays smooth. */
  active?: boolean
  count?: number
  seed?: number
  className?: string
}

/** One-shot confetti burst for the birthday reveal. */
export default function ConfettiBurst({
  active = true,
  count = 46,
  seed = 21,
  className = '',
}: Props) {
  const reduced = usePrefersReducedMotion()

  const pieces = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2
      const distance = 90 + rand() * 260
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 120,
        rot: rand() * 720 - 360,
        size: 6 + rand() * 8,
        color: COLORS[Math.floor(rand() * COLORS.length)],
        round: rand() > 0.6,
        delay: rand() * 0.45,
        dur: 1.5 + rand() * 1.2,
      }
    })
  }, [count, seed])

  if (reduced || !active) return null

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/3 z-20 ${className}`}
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-0 top-0 block"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 1.9,
            borderRadius: p.round ? '999px' : '2px',
            backgroundColor: p.color,
            boxShadow: '0 0 10px rgb(255 248 240 / 0.55)',
          }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
          animate={{
            x: [0, p.x],
            y: [0, p.y, p.y + 260],
            opacity: [0, 1, 1, 0],
            rotate: [0, p.rot],
            scale: [0.4, 1, 0.9],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut', times: [0, 0.35, 0.75, 1] }}
        />
      ))}
    </div>
  )
}