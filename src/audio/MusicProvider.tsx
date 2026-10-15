import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { audio as audioConfig } from '../config/siteConfig'
import { MusicContext } from './musicContext'
import type { MusicState } from './musicContext'

/**
 * Owns exactly one <audio> element for the whole app, so playback survives
 * every screen transition. Autoplay is never attempted until the visitor
 * interacts, and a missing file degrades silently.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [available, setAvailable] = useState(false)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const userStarted = useRef(false)

  /* Create the element once — never unmounted, so the song never restarts. */
  useEffect(() => {
    const el = new Audio()
    el.src = audioConfig.src
    el.loop = audioConfig.loop
    el.volume = audioConfig.volume
    el.preload = 'auto'
    ref.current = el

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)
    const onCanPlay = () => {
      setAvailable(true)
      setReady(true)
      if (userStarted.current) void el.play().catch(() => undefined)
    }
    /* Missing / unsupported / 404 file → stay silent, hide the control. */
    const onError = () => {
      setAvailable(false)
      setReady(true)
      setPlaying(false)
    }

    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('canplaythrough', onCanPlay)
    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('error', onError)

    el.load()

    return () => {
      el.pause()
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('canplaythrough', onCanPlay)
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('error', onError)
      ref.current = null
    }
  }, [])

  const play = useCallback(() => {
    userStarted.current = true
    const el = ref.current
    if (!el) return
    void el.play().catch(() => setPlaying(false))
  }, [])

  const pause = useCallback(() => {
    userStarted.current = false
    ref.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (el.paused) play()
    else pause()
  }, [play, pause])

  const restart = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.currentTime = 0
    if (!el.paused) void el.play().catch(() => undefined)
  }, [])

  /* Optional: begin on the very first interaction with the page. */
  useEffect(() => {
    if (!audioConfig.startOnFirstTap) return
    const onFirst = () => {
      play()
      window.removeEventListener('pointerdown', onFirst)
    }
    window.addEventListener('pointerdown', onFirst, { once: true })
    return () => window.removeEventListener('pointerdown', onFirst)
  }, [play])

  const value: MusicState = { available, playing, ready, toggle, play, pause, restart }

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export default MusicProvider