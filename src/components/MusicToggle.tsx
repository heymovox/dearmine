import { AnimatePresence, motion } from 'framer-motion'
import { Music4, Volume2, VolumeX } from 'lucide-react'
import { useMusic } from '../audio/musicContext'
import { welcome } from '../config/siteConfig'

type Props = {
  /** `light` for dark backgrounds, `dark` for cream backgrounds. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Floating music control. Hidden entirely when no audio file is configured,
 * so the page never shows a button that does nothing.
 */
export default function MusicToggle({ tone = 'light', className = '' }: Props) {
  const { available, ready, playing, toggle } = useMusic()

  if (ready && !available) return null

  const isLight = tone === 'light'

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        title={playing ? 'Pause music' : 'Play music'}
        initial={{ opacity: 0, scale: 0.7, y: -10 }}
        animate={{ opacity: ready ? 1 : 0, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        whileTap={{ scale: 0.9 }}
        className={[
          'pointer-events-auto relative grid h-11 w-11 place-items-center rounded-full ring-1 backdrop-blur-md transition-colors',
          isLight
            ? 'bg-cream/10 text-blush ring-cream/25 hover:bg-cream/20'
            : 'bg-burgundy/8 text-romantic ring-romantic/20 hover:bg-burgundy/14',
          className,
        ].join(' ')}
      >
        {playing ? (
          <>
            <Volume2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
            {!isLight && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full ring-2 ring-romantic/40"
                animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </>
        ) : (
          <VolumeX className="h-[18px] w-[18px]" strokeWidth={1.6} />
        )}
      </motion.button>
    </AnimatePresence>
  )
}

/** Small pulsing nudge on the welcome screen, shown only while music is silent. */
export function MusicHint() {
  const { available, ready, playing, play } = useMusic()
  if (!ready || !available || playing) return null

  return (
    <motion.button
      type="button"
      onClick={play}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileTap={{ scale: 0.95 }}
      className="mx-auto inline-flex items-center gap-2 rounded-full bg-cream/8 px-4 py-2 font-body text-[11px] tracking-[0.18em] text-blush/80 uppercase ring-1 ring-blush/20 backdrop-blur-sm transition hover:bg-cream/14"
    >
      <motion.span
        aria-hidden
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="grid place-items-center"
      >
        <Music4 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </motion.span>
      {welcome.musicHint}
    </motion.button>
  )
}