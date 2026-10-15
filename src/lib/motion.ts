import { useReducedMotion } from 'framer-motion'

/** `true` when the visitor asked the OS to reduce motion. Always a boolean. */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false
}

/** Nice for screens: quick, cinematic, never blocks the visitor for long. */
export const screenTransition = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { delay: 0.08 * i, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
}

/** Deterministic pseudo-random so decorative layers don't reshuffle on re-render. */
export function seeded(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}