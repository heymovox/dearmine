import { motion } from 'framer-motion'
import { screenLabels, screenOrder } from '../config/siteConfig'
import type { ScreenId } from '../config/siteConfig'

type Props = {
  current: ScreenId
  onNavigate: (id: ScreenId) => void
  /** Hidden on the welcome screen until the visitor opens the surprise. */
  visible: boolean
  tone?: 'light' | 'dark'
}

/** Slim progress rail so nobody ever feels lost or "stuck" in the story. */
export default function ScreenProgress({ current, onNavigate, visible, tone = 'light' }: Props) {
  if (!visible) return null
  const isLight = tone === 'light'
  const currentIndex = screenOrder.indexOf(current)

  return (
    <nav
      aria-label="Surprise progress"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-safe"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className={[
          'pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-2 backdrop-blur-md',
          isLight ? 'bg-burgundy-deep/30 ring-1 ring-cream/12' : 'bg-cream/55 ring-1 ring-romantic/12',
        ].join(' ')}
      >
        {screenOrder.map((id, i) => {
          const active = id === current
          const passed = i < currentIndex
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-label={screenLabels[id]}
              aria-current={active ? 'step' : undefined}
              title={screenLabels[id]}
              className="group grid h-8 w-8 place-items-center"
            >
              <span
                className={[
                  'block rounded-full transition-all duration-500',
                  active
                    ? isLight
                      ? 'h-2 w-6 bg-blush shadow-[0_0_12px_rgba(248,220,229,0.8)]'
                      : 'h-2 w-6 bg-romantic shadow-[0_0_12px_rgba(181,40,77,0.55)]'
                    : passed
                      ? isLight
                        ? 'h-1.5 w-1.5 bg-cream/55'
                        : 'h-1.5 w-1.5 bg-romantic/35'
                      : isLight
                        ? 'h-1.5 w-1.5 bg-cream/25'
                        : 'h-1.5 w-1.5 bg-romantic/18',
                ].join(' ')}
              />
            </button>
          )
        })}
      </motion.div>
    </nav>
  )
}