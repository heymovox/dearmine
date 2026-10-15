import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  children: ReactNode
  /** Stagger index for automatic delays. */
  delay?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'
}

/** Fades + lifts its children into place, respecting reduced-motion. */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: Props) {
  const reduced = usePrefersReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: reduced ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}