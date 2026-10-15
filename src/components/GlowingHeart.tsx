import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  size?: number
  className?: string
  /** Slower, deeper heartbeat. */
  strong?: boolean
}

const HEART_PATH =
  'M12 21s-7.5-4.7-9.6-9A5.6 5.6 0 0 1 12 6.3 5.6 5.6 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9Z'

/** The glowing, softly beating heart from the welcome screen. */
export default function GlowingHeart({ size = 148, className = '', strong = false }: Props) {
  const reduced = usePrefersReducedMotion()

  const beat = reduced
    ? {}
    : {
        scale: [1, strong ? 1.12 : 1.07, 1, 1.05, 1],
      }

  return (
    <motion.div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      animate={beat}
      transition={
        reduced ? undefined : { duration: strong ? 2.2 : 3.2, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {/* Soft outer glows */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(248,220,229,0.55), transparent 68%)' }}
        animate={reduced ? undefined : { scale: [1, 1.22, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        viewBox="0 0 24 24"
        width={size * 0.72}
        height={size * 0.72}
        className="relative"
        role="img"
        aria-label="A glowing heart"
      >
        <defs>
          <linearGradient id="heartFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="38%" stopColor="#F8DCE5" />
            <stop offset="100%" stopColor="#B5284D" />
          </linearGradient>
          <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={HEART_PATH}
          fill="url(#heartFill)"
          filter="url(#heartGlow)"
          stroke="rgba(255,248,240,0.5)"
          strokeWidth="0.35"
        />
      </svg>

      {/* Specular highlight */}
      <motion.span
        aria-hidden
        className="absolute top-[26%] left-[31%] h-2.5 w-4 rounded-full bg-white/70 blur-[3px]"
        animate={reduced ? undefined : { opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}