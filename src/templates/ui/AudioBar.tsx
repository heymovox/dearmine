import { Pause, Play, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTemplate } from '../engine/context'

/**
 * Fixed music toggle for templates that ship an audio asset.
 * One <audio> element, never autoplay-with-sound (browser policy): it starts
 * muted-safe on explicit user tap only.
 */
export default function AudioBar({ label = 'Our song' }: { label?: string }) {
  const { audio } = useTemplate()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  if (!audio) return null

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audio.url}
        loop
        preload="metadata"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        className="fixed bottom-5 left-1/2 z-40 flex min-h-11 -translate-x-1/2 cursor-pointer items-center gap-2.5 rounded-full px-5 py-2.5 shadow-[0_14px_40px_-16px_rgba(51,11,26,0.7)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: 'color-mix(in srgb, var(--tpl-ink) 78%, transparent)',
          color: 'var(--tpl-surface)',
          border: '1px solid color-mix(in srgb, var(--tpl-accent) 45%, transparent)',
        }}
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        <span className="max-w-40 truncate font-body text-[12px] font-medium tracking-[0.14em] uppercase">
          {label}
        </span>
        <Volume2 className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </button>
    </>
  )
}
