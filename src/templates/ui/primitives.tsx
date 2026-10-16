import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../lib/motion'
import { useTemplate } from '../engine/context'
import type { MemoryPhoto } from '../../config/siteConfig'

/** Fade + lift, respecting the visitor's reduced-motion setting. */
export function Fade({
  children,
  delay = 0,
  className = '',
  y = 26,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: reduced ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Outer wrapper every section uses: correct max-width + vertical rhythm. */
export function SectionShell({
  children,
  className = '',
  tone = 'surface',
  id,
}: {
  children: ReactNode
  className?: string
  tone?: 'surface' | 'dark' | 'paper' | 'transparent'
  id?: string
}) {
  const background =
    tone === 'dark'
      ? 'background: color-mix(in srgb, var(--tpl-ink) 92%, var(--tpl-surface) 8%); color: color-mix(in srgb, var(--tpl-surface) 92%, white 8%);'
      : tone === 'paper'
        ? 'background: var(--tpl-soft);'
        : tone === 'transparent'
          ? ''
          : ''

  return (
    <section id={id} className={`tpl-section ${className}`} style={background ? { background } : undefined}>
      {children}
    </section>
  )
}

/** Kicker + heading + optional subtitle, centred by default. */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'center',
  dark = false,
}: {
  kicker?: string
  title?: string
  subtitle?: string
  align?: 'center' | 'left'
  dark?: boolean
}) {
  if (!title && !kicker && !subtitle) return null
  const alignCls = align === 'left' ? 'text-left items-start' : 'text-center items-center'
  return (
    <Fade className={`mb-8 flex flex-col gap-3 sm:mb-11 ${alignCls}`}>
      {kicker ? <p className="tpl-kicker">{kicker}</p> : null}
      {title ? (
        <h2
          className="tpl-title"
          style={dark ? { color: 'color-mix(in srgb, var(--tpl-surface) 94%, white 6%)' } : undefined}
        >
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p
          className="tpl-subtitle max-w-2xl"
          style={dark ? { color: 'color-mix(in srgb, var(--tpl-surface) 72%, transparent)' } : undefined}
        >
          {subtitle}
        </p>
      ) : null}
    </Fade>
  )
}

/** Letter/message body: blank-line paragraphs, single newlines preserved. */
export function MessageText({
  text,
  className = '',
  as: Tag = 'div',
}: {
  text: string
  className?: string
  as?: 'div' | 'p'
}) {
  if (!text) return null
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className={`whitespace-pre-line leading-relaxed ${className}`}>
      {paragraphs.map((p, i) => (
        <Tag key={i} className={i < paragraphs.length - 1 ? 'mb-4 last:mb-0' : 'last:mb-0'}>
          {p}
        </Tag>
      ))}
    </div>
  )
}

/** Dashed "add your content" placeholder shown only in a blank editor preview. */
export function EmptyHint({ what }: { what: string }) {
  const { mode } = useTemplate()
  if (mode !== 'preview') return null
  return (
    <div
      className={`tpl-section flex min-h-32 items-center justify-center rounded-2xl border-2 border-dashed text-center`}
      style={{ borderColor: 'color-mix(in srgb, var(--tpl-accent) 45%, transparent)' }}
    >
      <p className="tpl-kicker opacity-70">{what}</p>
    </div>
  )
}

/** Maps uploaded assets to the photo model the existing Lightbox understands. */
export function usePhotoViewModels(): MemoryPhoto[] {
  const { photos } = useTemplate()
  return photos.map((p, i) => ({
    src: p.url,
    caption: p.caption || `Photo ${i + 1}`,
    label: `Photo ${i + 1}`,
    tilt: ((i * 37) % 9) - 4,
  }))
}
