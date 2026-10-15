import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { seeded, usePrefersReducedMotion } from '../lib/motion'

const COLORS = ['#F8DCE5', '#FFF8F0', '#D7A0A7', '#F5C6D5', '#E9A7B8']

type Spark = {
  id: string
  x: number
  y: number
  key: number
}

type Props = {
  active?: boolean
  /** How many fireworks bloom, staggered. */
  bursts?: number
  /** Interval between blooms in ms. */
  interval?: number
}

/**
 * Cinematic, self-limiting firework bloom for the finale.
 * Uses transform/opacity only, and stops on its own so it never hurts battery.
 */
export default function Fireworks({
  active = true,
  bursts = 5,
  interval = 1400,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const [fired, setFired] = useState(0)

  useEffect(() => {
    if (!active || reduced) return
    if (fired >= bursts) return
    const t = window.setTimeout(() => setFired((n) => n + 1), interval)
    return () => window.clearTimeout(t)
  }, [active, reduced, fired, bursts, interval])

  const sparks = useMemo(() => {
    const out: Spark[] = []
    for (let b = 0; b < fired; b++) {
      const rand = seeded(1000 + b * 37)
      const cx = 12 + rand() * 76
      const cy = 10 + rand() * 46
      const arms = 22
      const reach = 46 + rand() * 58
      for (let i = 0; i < arms; i++) {
        const a = (i / arms) * Math.PI * 2
        out.push({
          id: `${b}-${i}`,
          key: b,
          x: cx + Math.cos(a) * reach,
          y: cy + Math.sin(a) * reach * 0.82,
        })
      }
    }
    return out
  }, [fired])

  const colors = useMemo(() => {
    const rand = seeded(4242)
    return COLORS.map(() => rand())
  }, [])

  if (reduced) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((s, i) => (
        <motion.span
          key={s.id}
          className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full"
          style={{
            backgroundColor: COLORS[i % COLORS.length],
            boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}`,
            translateX: `${s.x}vw`,
            translateY: `${s.y}vh`,
            opacity: colors[i % colors.length] > 0.5 ? 1 : 0.6,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.15, 0.2], opacity: [0, 0.95, 0] }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: (i % 22) * 0.012 }}
        />
      ))}
    </div>
  )
}