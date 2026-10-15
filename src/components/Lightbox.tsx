import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import type { MemoryPhoto } from '../config/siteConfig'
import { screenTransition } from '../lib/motion'
import SmartImage from './SmartImage'

type Props = {
  photos: MemoryPhoto[]
  index: number | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

/** Full-screen photo viewer with tap zones, swipe and keyboard support. */
export default function Lightbox({ photos, index, onClose, onPrev, onNext }: Props) {
  const open = index !== null

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [open, onClose, onPrev, onNext],
  )

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, handleKey])

  const photo = open ? photos[index] : null

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[80] flex flex-col bg-burgundy-deep/92 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-cream/12 text-cream ring-1 ring-cream/25 backdrop-blur transition hover:bg-cream/22 active:scale-95"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 pt-16 pb-2">
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={screenTransition}
              className="paper flex max-w-full items-center justify-center rounded-2xl p-2 shadow-soft"
              onClick={(e) => e.stopPropagation()}
            >
              {/* fit="contain" + a viewport cap shows the COMPLETE photo, never cropped */}
              <SmartImage
                src={photo.src}
                alt={photo.caption}
                fallbackLabel={photo.label}
                fit="contain"
                loading="eager"
                imageClassName="block max-h-[68vh] max-w-[86vw] rounded-lg"
              />
            </motion.div>

            <div className="flex max-w-full flex-col items-center gap-1 px-2 text-center">
              <p className="font-hand text-2xl leading-tight text-blush sm:text-3xl">
                {photo.caption}
              </p>
              <p className="text-[11px] tracking-[0.25em] text-cream/45 uppercase">
                {(index ?? 0) + 1} / {photos.length}
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center justify-center gap-5 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous photo"
              className="grid h-12 w-12 place-items-center rounded-full bg-cream/12 text-cream ring-1 ring-cream/25 backdrop-blur transition hover:bg-cream/22 active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next photo"
              className="grid h-12 w-12 place-items-center rounded-full bg-cream/12 text-cream ring-1 ring-cream/25 backdrop-blur transition hover:bg-cream/22 active:scale-95"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={1.6} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}