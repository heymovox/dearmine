/**
 * The original single-page Mumaaa birthday experience, kept as a live demo of
 * what a finished LoveSurprise site looks like. Available at /demo.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MusicProvider } from '../audio/MusicProvider'
import { useMusic } from '../audio/musicContext'
import MusicToggle from '../components/MusicToggle'
import ScreenProgress from '../components/ScreenProgress'
import { screenOrder } from '../config/siteConfig'
import type { ScreenId } from '../config/siteConfig'
import { screenTransition, usePrefersReducedMotion } from '../lib/motion'
import BirthdayScreen from '../screens/BirthdayScreen'
import FinaleScreen from '../screens/FinaleScreen'
import LetterScreen from '../screens/LetterScreen'
import MemoriesScreen from '../screens/MemoriesScreen'
import WelcomeScreen from '../screens/WelcomeScreen'

const LIGHT_SCREENS: ScreenId[] = ['welcome', 'birthday', 'finale']

const ENTER = {
  initial: { opacity: 0, scale: 1.03, y: 14 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -10 },
}

const ENTER_REDUCED = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

function Experience() {
  const [screen, setScreen] = useState<ScreenId>('welcome')
  const [opened, setOpened] = useState(false)
  const reduced = usePrefersReducedMotion()
  const { restart } = useMusic()
  const scrollerRef = useRef<HTMLDivElement>(null)

  const navigate = useCallback((id: ScreenId) => {
    setScreen(id)
  }, [])

  const goNext = useCallback(() => {
    const i = screenOrder.indexOf(screen)
    setScreen(screenOrder[Math.min(i + 1, screenOrder.length - 1)])
  }, [screen])

  const replay = useCallback(() => {
    restart()
    setOpened(false)
    setScreen('welcome')
  }, [restart])

  const handleFinaleAction = useCallback(
    (id: ScreenId) => {
      if (id === 'welcome') replay()
      else navigate(id)
    },
    [navigate, replay],
  )

  const handleOpen = useCallback(() => {
    setOpened(true)
    setScreen('birthday')
  }, [])

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [screen])

  const variants = reduced ? ENTER_REDUCED : ENTER
  const tone = LIGHT_SCREENS.includes(screen) ? 'light' : 'dark'

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-burgundy">
      <div ref={scrollerRef} className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reduced ? { duration: 0.15 } : screenTransition}
            className="w-full"
          >
            {screen === 'welcome' && <WelcomeScreen onOpen={handleOpen} />}
            {screen === 'birthday' && <BirthdayScreen onNext={goNext} />}
            {screen === 'memories' && <MemoriesScreen onNext={goNext} />}
            {screen === 'letter' && <LetterScreen onNext={goNext} />}
            {screen === 'finale' && <FinaleScreen onNavigate={handleFinaleAction} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <MusicToggle tone={tone} className="pointer-events-auto" />
      </div>

      <ScreenProgress
        current={screen}
        onNavigate={navigate}
        visible={opened && screen !== 'welcome'}
        tone={tone}
      />
    </div>
  )
}

export default function ExperienceDemo() {
  return (
    <MusicProvider>
      <Experience />
    </MusicProvider>
  )
}
