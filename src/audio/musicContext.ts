import { createContext, useContext } from 'react'

export type MusicState = {
  /** The song is reachable and playable. */
  available: boolean
  /** Currently playing. */
  playing: boolean
  /** True once we know whether the file exists (avoids flicker). */
  ready: boolean
  toggle: () => void
  play: () => void
  pause: () => void
  /** Jump back to 0:00 and keep playing (used by "Replay"). */
  restart: () => void
}

export const MusicContext = createContext<MusicState | null>(null)

/** Access the shared, never-unmounted music player. */
export function useMusic(): MusicState {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}