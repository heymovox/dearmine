import { useState } from 'react'
import Lightbox from '../../components/Lightbox'
import SmartImage from '../../components/SmartImage'
import { seeded } from '../../lib/motion'
import { useTemplate } from '../engine/context'
import { Fade, EmptyHint, usePhotoViewModels } from './primitives'

export type GalleryVariant = 'grid' | 'memory' | 'polaroid' | 'bloom'

/**
 * The shared photo gallery. Every gallery-style template section routes
 * through here so the lightbox, captions and empty states behave the same.
 */
export default function PhotoGallery({
  variant = 'grid',
  kicker,
  title,
}: {
  variant?: GalleryVariant
  kicker?: string
  title?: string
}) {
  const { photos } = useTemplate()
  const view = usePhotoViewModels()
  const [index, setIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return <EmptyHint what="Upload photos to fill this gallery" />
  }

  const open = (i: number) => setIndex(i)
  const close = () => setIndex(null)
  const prev = () => setIndex((i) => (i === null ? null : (i - 1 + view.length) % view.length))
  const next = () => setIndex((i) => (i === null ? null : (i + 1) % view.length))

  return (
    <>
      <Fade className="mb-7 text-center">
        {kicker ? <p className="tpl-kicker mb-3">{kicker}</p> : null}
        {title ? <h2 className="tpl-title">{title}</h2> : null}
      </Fade>

      {variant === 'polaroid' ? (
        <PolaroidWall view={view} onOpen={open} />
      ) : variant === 'bloom' ? (
        <BloomWall view={view} onOpen={open} />
      ) : variant === 'memory' ? (
        <MemoryWall view={view} onOpen={open} />
      ) : (
        <GridWall view={view} onOpen={open} />
      )}

      <Lightbox photos={view} index={index} onClose={close} onPrev={prev} onNext={next} />
    </>
  )
}

function GridWall({ view, onOpen }: { view: ReturnType<typeof usePhotoViewModels>; onOpen: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {view.map((photo, i) => (
        <Fade key={photo.src + i} delay={Math.min(i * 0.06, 0.5)}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            className="tpl-card group block aspect-square w-full overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1"
            aria-label={`Open ${photo.caption}`}
          >
            <SmartImage
              src={photo.src}
              alt={photo.caption}
              fallbackLabel={photo.label}
              className="h-full w-full"
            />
          </button>
        </Fade>
      ))}
    </div>
  )
}

function MemoryWall({ view, onOpen }: { view: ReturnType<typeof usePhotoViewModels>; onOpen: (i: number) => void }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
      {view.map((photo, i) => (
        <Fade key={photo.src + i} delay={Math.min(i * 0.05, 0.45)}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            className="tpl-card block w-full overflow-hidden p-2 transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0"
            style={{ transform: `rotate(${photo.tilt}deg)` }}
            aria-label={`Open ${photo.caption}`}
          >
            <span className="block overflow-hidden rounded-xl">
              <SmartImage
                src={photo.src}
                alt={photo.caption}
                fallbackLabel={photo.label}
                className="h-full w-full"
                imageClassName={
                  i % 3 === 0 ? 'aspect-[4/5]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[5/4]'
                }
              />
            </span>
            <span className="block px-1 pt-3 pb-1 text-center font-hand text-lg leading-snug">
              {photo.caption}
            </span>
          </button>
        </Fade>
      ))}
    </div>
  )
}

function PolaroidWall({ view, onOpen }: { view: ReturnType<typeof usePhotoViewModels>; onOpen: (i: number) => void }) {
  const rand = seeded(7)
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
      {view.map((photo, i) => {
        const tilt = (rand() * 6 - 3).toFixed(1)
        return (
          <Fade key={photo.src + i} delay={Math.min(i * 0.06, 0.5)} y={34}>
            <button
              type="button"
              onClick={() => onOpen(i)}
              className="block w-full rotate-0 rounded-sm bg-white/95 p-2.5 pb-4 shadow-[0_16px_36px_-18px_rgba(51,11,26,0.55)] transition-transform duration-300 hover:z-10 hover:scale-[1.04]"
              style={{ transform: `rotate(${tilt}deg)` }}
              aria-label={`Open ${photo.caption}`}
            >
              <span className="block overflow-hidden bg-blush/40">
                <SmartImage
                  src={photo.src}
                  alt={photo.caption}
                  fallbackLabel={photo.label}
                  className="aspect-square h-full w-full"
                />
              </span>
              <span className="mt-2.5 block text-center font-hand text-lg text-[#3a1220]">
                {photo.caption}
              </span>
            </button>
          </Fade>
        )
      })}
    </div>
  )
}

function BloomWall({ view, onOpen }: { view: ReturnType<typeof usePhotoViewModels>; onOpen: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
      {view.map((photo, i) => {
        const round = i % 4 === 1
        return (
          <Fade key={photo.src + i} delay={Math.min(i * 0.07, 0.55)}>
            <button
              type="button"
              onClick={() => onOpen(i)}
              className={`tpl-card block w-full overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_-22px_color-mix(in_srgb,var(--tpl-accent)_70%,transparent)] ${
                round ? 'rounded-full' : 'rounded-[1.75rem]'
              }`}
              aria-label={`Open ${photo.caption}`}
            >
              <span className={`block overflow-hidden ${round ? 'aspect-square' : 'aspect-[4/5]'}`}>
                <SmartImage
                  src={photo.src}
                  alt={photo.caption}
                  fallbackLabel={photo.label}
                  className="h-full w-full"
                />
              </span>
            </button>
          </Fade>
        )
      })}
    </div>
  )
}
