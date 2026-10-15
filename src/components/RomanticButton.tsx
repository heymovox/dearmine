import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../lib/motion'

type Variant = 'cream' | 'romantic' | 'ghost-light' | 'ghost-dark'

type Props = {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  className?: string
  /** Delays the entrance of the button itself. */
  delay?: number
  type?: 'button' | 'submit'
  ariaLabel?: string
}

const VARIANTS: Record<Variant, string> = {
  cream:
    'bg-linear-to-br from-cream to-blush text-burgundy shadow-[0_16px_40px_-16px_rgba(74,16,37,0.7)] hover:from-white hover:to-blush',
  romantic:
    'bg-linear-to-br from-romantic to-romantic-soft text-cream shadow-[0_16px_40px_-16px_rgba(181,40,77,0.85)] hover:from-romantic-soft hover:to-romantic',
  'ghost-light':
    'bg-cream/8 text-cream ring-1 ring-cream/28 backdrop-blur-md hover:bg-cream/16',
  'ghost-dark':
    'bg-burgundy/7 text-burgundy ring-1 ring-romantic/22 backdrop-blur-md hover:bg-burgundy/12',
}

/** The one button style used across every screen. Always comfortably tappable. */
export default function RomanticButton({
  children,
  onClick,
  variant = 'cream',
  className = '',
  delay = 0,
  type = 'button',
  ariaLabel,
}: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: reduced ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? undefined : { y: -3, scale: 1.02 }}
      whileTap={reduced ? undefined : { scale: 0.965 }}
      className={[
        'inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3.5 font-body text-[15px] leading-none font-medium tracking-[0.04em] transition-colors duration-300 select-none sm:text-base',
        VARIANTS[variant],
        className,
      ].join(' ')}
    >
      <span className="relative">{children}</span>
    </motion.button>
  )
}