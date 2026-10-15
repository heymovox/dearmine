import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { usePrefersReducedMotion } from '../lib/motion'

type Props = {
  open: boolean
  onOpen: () => void
  label: string
  className?: string
}

/**
 * A wax-sealed envelope that opens on tap.
 * The flap rotates up, the letter slides out, the seal breaks — all CSS/transform.
 */
export default function Envelope({ open, onOpen, label, className = '' }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={open ? undefined : onOpen}
      disabled={open}
      aria-label={open ? 'Envelope opened' : label}
      aria-expanded={open}
      className={`relative mx-auto block w-full max-w-[19rem] cursor-pointer select-none rounded-2xl focus-visible:outline-offset-4 sm:max-w-[21rem] ${className}`}
      initial={{ opacity: 0, y: 34, scale: 0.94 }}
      animate={{ opacity: open ? 0.94 : 1, y: 0, scale: open ? 1.14 : 1 }}
      transition={{ duration: reduced ? 0.2 : 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced || open ? undefined : { scale: 1.03, y: -4 }}
      whileTap={reduced || open ? undefined : { scale: 0.98 }}
      style={{ perspective: 900 }}
    >
      {/* Glow behind */}
      <span
        aria-hidden
        className="absolute -inset-6 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(215,160,167,0.45) 0%, rgba(215,160,167,0) 70%)',
        }}
      />

      <span className="relative block aspect-[3/2] w-full">
        {/* Back panel */}
        <span
          className="absolute inset-0 rounded-xl bg-linear-to-br from-[#E9C3B8] to-[#C98E7C] shadow-[0_22px_48px_-18px_rgba(74,16,37,0.6)]"
          style={{ zIndex: 1 }}
        />

        {/* Letter peeking out */}
        <motion.span
          aria-hidden
          className="paper absolute inset-x-3 top-3 bottom-0 block rounded-t-lg shadow-inner"
          style={{ zIndex: 2 }}
          initial={{ y: '16%', opacity: 0 }}
          animate={open ? { y: '-46%', opacity: 1 } : { y: '16%', opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mt-4 block space-y-1.5 px-4">
            <span className="block h-1.5 w-3/4 rounded-full bg-romantic/18" />
            <span className="block h-1.5 w-full rounded-full bg-romantic/12" />
            <span className="block h-1.5 w-5/6 rounded-full bg-romantic/12" />
          </span>
        </motion.span>

        {/* Front pocket */}
        <span
          className="absolute inset-0 rounded-xl bg-linear-to-br from-[#F3D6C6] to-[#D8A293] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
          style={{ zIndex: 3 }}
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 block h-1/2 bg-linear-to-t from-[#C98E7C]/55 to-transparent"
          style={{ zIndex: 3 }}
        />

        {/* Flap */}
        <motion.span
          aria-hidden
          className="absolute inset-x-0 top-0 block h-1/2 origin-top"
          style={{ transformPerspective: 800, zIndex: open ? 0 : 4 }}
          initial={false}
          animate={{ rotateX: open ? -168 : 0 }}
          transition={{ duration: reduced ? 0.2 : 0.85, ease: [0.6, 0, 0.3, 1] }}
        >
          <span className="absolute inset-0 block bg-linear-to-b from-[#E9C3B8] to-[#C98E7C] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          <span className="absolute inset-0 block bg-linear-to-b from-transparent to-rgba(74,16,37,0.16) [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </motion.span>

        {/* Wax seal */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-linear-to-br from-[#C4405F] to-[#8E1738] text-blush shadow-[0_6px_18px_-4px_rgba(74,16,37,0.75)] sm:h-14 sm:w-14"
          style={{ zIndex: 5 }}
          initial={false}
          animate={
            open
              ? { scale: 0, opacity: 0, rotate: 40 }
              : { scale: 1, opacity: 1, rotate: 0 }
          }
          transition={{ duration: reduced ? 0.15 : 0.45, delay: open ? 0 : 0.15 }}
        >
          <Heart className="h-5 w-5 fill-blush/90 sm:h-6 sm:w-6" strokeWidth={1.4} />
        </motion.span>

        {/* Tap cue */}
        <motion.span
          aria-hidden
          className="absolute inset-x-0 -bottom-8 text-center font-body text-[11px] tracking-[0.22em] text-romantic/60 uppercase"
          initial={false}
          animate={open ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
          transition={
            open
              ? { duration: 0.2 }
              : { duration: 2.2, repeat: reduced ? 0 : Infinity, ease: 'easeInOut' }
          }
        >
          {open ? '' : 'Tap to open'}
        </motion.span>
      </span>
    </motion.button>
  )
}