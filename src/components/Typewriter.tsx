import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  paragraphs: string[]
  /** Milliseconds per character. Lower = faster. */
  speed?: number
  /** Milliseconds pause between paragraphs. */
  paragraphPause?: number
  /** Immediately render everything (reduced motion / user tapped "show all"). */
  instant?: boolean
  onDone?: () => void
  className?: string
}

type Chunk = { type: 'text'; value: string } | { type: 'gap'; value: number }

/**
 * Gentle typewriter reveal for the love letter.
 * Always finishes quickly and can be skipped, so nobody is ever trapped.
 */
export default function Typewriter({
  paragraphs,
  speed = 22,
  paragraphPause = 420,
  instant = false,
  onDone,
  className = '',
}: Props) {
  const reduced = usePrefersReducedMotion()

  const chunks = useMemo<Chunk[]>(() => {
    const out: Chunk[] = []
    paragraphs.forEach((p, i) => {
      if (i > 0) out.push({ type: 'gap', value: paragraphPause })
      out.push({ type: 'text', value: p })
    })
    return out
  }, [paragraphs, paragraphPause])

  const total = useMemo(
    () => chunks.reduce((n, c) => n + (c.type === 'gap' ? c.value / speed : c.value.length), 0),
    [chunks, speed],
  )

  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  /* `instant` (reduced motion or "Show Full Letter") short-circuits at render time. */
  const elapsed = instant || reduced ? Infinity : progress
  const done = elapsed === Infinity || elapsed >= total

  useEffect(() => {
    if (instant || reduced) return
    progressRef.current = 0

    let raf = 0
    let last = performance.now()
    let first = true
    const tick = (now: number) => {
      const dt = first ? 0 : now - last
      first = false
      last = now
      const next = progressRef.current + dt / speed
      if (next >= total) {
        progressRef.current = Infinity
        setProgress(Infinity)
        return
      }
      progressRef.current = next
      setProgress(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [instant, reduced, speed, total])

  useEffect(() => {
    if (done) onDone?.()
  }, [done, onDone])

  const rendered = useMemo(() => {
    if (elapsed === Infinity) return chunks
    let budget = elapsed
    const out: Chunk[] = []
    for (const c of chunks) {
      if (budget <= 0) break
      if (c.type === 'gap') {
        const used = Math.min(c.value, budget)
        budget -= used
        if (used >= c.value) out.push(c)
        else break
      } else {
        const chars = Math.min(c.value.length, Math.floor(budget))
        budget -= chars
        if (chars > 0) out.push({ type: 'text', value: c.value.slice(0, chars) })
        if (chars < c.value.length) break
      }
    }
    return out
  }, [chunks, elapsed])

  const caret = (
    <motion.span
      aria-hidden
      className="typewriter-caret"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  )

  return (
    <div className={className}>
      {rendered.map((c, i, arr) => {
        if (c.type === 'gap') return <div key={`gap-${i}`} className="h-3" aria-hidden />
        const isLast = i === arr.length - 1
        return (
          <p key={`p-${i}`} className="mb-4 last:mb-0">
            {c.value}
            {isLast && !done && caret}
          </p>
        )
      })}
      {rendered.length === 0 && !done && <p className="mb-0">{caret}</p>}
    </div>
  )
}