import { ImageOff } from 'lucide-react'
import { useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  /** Extra classes applied only to the <img>, e.g. `max-h-[64vh] object-contain`. */
  imageClassName?: string
  /** `cover` fills and crops (grid cards). `contain` shows the whole photo. */
  fit?: 'cover' | 'contain'
  /** Shown if the image file is missing or fails to load. */
  fallbackLabel?: string
  loading?: 'lazy' | 'eager'
}

/**
 * `contain` deliberately ships NO max-* defaults: an explicit
 * `max-h-[…]` passed via `imageClassName` must be the only constraint,
 * otherwise a later-in-the-cascade `max-h-full` silently disables it.
 */
const FIT_CLASS = {
  cover: 'h-full w-full object-cover',
  contain: 'h-auto w-auto object-contain',
} as const

/**
 * An <img> that never breaks the layout: if the file is missing (before the
 * real photos are uploaded) it swaps to an elegant labelled placeholder.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  fit = 'cover',
  fallbackLabel,
  loading = 'lazy',
}: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-blush via-cream to-cream-deep text-center ${className}`}
      >
        <ImageOff className="h-7 w-7 text-romantic/50" strokeWidth={1.4} aria-hidden />
        <p className="px-3 font-body text-[11px] leading-snug tracking-[0.14em] text-romantic/55 uppercase">
          {fallbackLabel ? `${fallbackLabel} coming soon` : 'Photo coming soon'}
        </p>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${FIT_CLASS[fit]} ${className} ${imageClassName}`}
    />
  )
}