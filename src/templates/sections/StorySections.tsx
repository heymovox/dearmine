import { motion } from 'framer-motion'
import { Heart, MapPin, Star } from 'lucide-react'
import { seeded, usePrefersReducedMotion } from '../../lib/motion'
import { useTemplate } from '../engine/context'
import { Fade, MessageText, SectionHeading, SectionShell, usePhotoViewModels } from '../ui/primitives'
import SmartImage from '../../components/SmartImage'

/** Relationship milestones as a vertical timeline. */
export function TimelineSection() {
  const { content, meta } = useTemplate()
  const items = content.timeline

  return (
    <SectionShell>
      <SectionHeading
        kicker="Our story"
        title="How we got here"
        subtitle={items.length ? undefined : 'Add your milestones in the editor.'}
      />
      {items.length === 0 ? null : (
        <div className="relative mx-auto max-w-2xl">
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[1.35rem] w-px sm:left-1/2"
            style={{ background: 'linear-gradient(var(--tpl-accent), transparent)' }}
          />
          <div className="space-y-8">
            {items.map((item, i) => (
              <Fade key={i} delay={i * 0.07} y={20}>
                <div className={`relative flex gap-5 ${i % 2 ? 'sm:flex-row-reverse sm:text-right' : ''} sm:gap-10`}>
                  <span
                    aria-hidden
                    className="relative z-10 mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full"
                    style={{
                      background: 'var(--tpl-accent)',
                      color: 'var(--tpl-surface)',
                      boxShadow: '0 0 0 6px color-mix(in srgb, var(--tpl-accent) 22%, transparent)',
                    }}
                  >
                    <Heart className="h-4.5 w-4.5 fill-current" />
                  </span>
                  <div className="tpl-card flex-1 px-5 py-4 sm:px-6 sm:py-5">
                    <p className="tpl-kicker mb-1.5">{item.date}</p>
                    <h3 className="font-display text-xl font-semibold sm:text-2xl">{item.title}</h3>
                    {item.description ? (
                      <p className="mt-1.5 text-[0.97rem] leading-relaxed opacity-80">{item.description}</p>
                    ) : null}
                  </div>
                </div>
              </Fade>
            ))}
          </div>
          {meta.nickname ? null : null}
        </div>
      )}
    </SectionShell>
  )
}

/** Two names joined by drawn constellation stars. */
export function StarMapSection() {
  const { meta } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const stars = Array.from({ length: 26 }, (_, i) => {
    const rand = seeded(101 + i * 13)
    return { id: i, x: rand() * 100, y: rand() * 100, r: 1 + rand() * 2.2, delay: rand() * 3 }
  })
  const label = [meta.creatorName, meta.recipientName].filter(Boolean).join(' & ') || 'Us'

  return (
    <SectionShell tone="dark">
      <SectionHeading
        kicker="Written in the stars"
        title={label}
        subtitle="Two names, one constellation."
        dark
      />
      <Fade className="relative mx-auto h-72 w-full max-w-3xl overflow-hidden rounded-[1.75rem] sm:h-96">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 70% at 30% 20%, color-mix(in srgb, var(--tpl-accent) 30%, transparent), transparent 60%), linear-gradient(160deg, color-mix(in srgb, var(--tpl-ink) 94%, black 6%), var(--tpl-ink))',
          }}
        />
        {stars.map((s) => (
          <motion.span
            key={s.id}
            aria-hidden
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2 }}
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 2.6, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {/* The drawn line between the two names */}
        <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full" aria-hidden>
          <path
            d="M14 44 L34 22 L52 38 L70 16 L86 30"
            fill="none"
            stroke="var(--tpl-accent)"
            strokeWidth="0.4"
            strokeDasharray="2 1.6"
            opacity="0.8"
          />
          {[
            [14, 44],
            [34, 22],
            [52, 38],
            [70, 16],
            [86, 30],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="var(--tpl-soft)" />
          ))}
        </svg>
        <div className="absolute inset-x-0 bottom-0 p-6 text-center">
          <p className="font-display text-3xl" style={{ color: 'var(--tpl-surface)' }}>
            {label}
          </p>
        </div>
      </Fade>
    </SectionShell>
  )
}

/** Long-distance route line: origin pin → destination pin → heart. */
export function MapLineSection() {
  const { meta } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const from = meta.creatorName || 'Here'
  const to = meta.recipientName || 'There'

  return (
    <SectionShell>
      <SectionHeading kicker="Miles apart" title="Two cities, one heart" />
      <Fade className="mx-auto max-w-3xl">
        <div className="tpl-card relative overflow-hidden px-6 py-10 sm:px-10">
          <svg viewBox="0 0 320 110" className="w-full" role="img" aria-label={`${from} to ${to}`}>
            <path
              d="M30 78 C 90 10, 230 10, 290 78"
              fill="none"
              stroke="var(--tpl-accent)"
              strokeWidth="2.5"
              strokeDasharray="7 7"
              opacity="0.85"
            />
            <motion.circle
              cx="30"
              cy="78"
              r="7"
              fill="var(--tpl-accent)"
              animate={reduced ? undefined : { scale: [1, 1.35, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="290"
              cy="78"
              r="7"
              fill="var(--tpl-accent)"
              animate={reduced ? undefined : { scale: [1, 1.35, 1] }}
              transition={{ duration: 2, delay: 0.4, repeat: Infinity }}
            />
            <circle cx="160" cy="34" r="5" fill="var(--tpl-soft)" />
            <text x="160" y="20" textAnchor="middle" fill="var(--tpl-soft)" fontSize="13">♥</text>
            <text x="30" y="102" textAnchor="middle" fill="var(--tpl-ink)" fontSize="12" fontFamily="var(--font-body)">
              {from}
            </text>
            <text x="290" y="102" textAnchor="middle" fill="var(--tpl-ink)" fontSize="12" fontFamily="var(--font-body)">
              {to}
            </text>
          </svg>
          <div className="mt-4 flex items-center justify-center gap-3 text-center">
            <MapPin className="h-4 w-4 opacity-60" aria-hidden />
            <p className="tpl-subtitle">
              No distance is far enough to reach you. <Heart className="inline h-4 w-4 fill-current" style={{ color: 'var(--tpl-accent)' }} aria-hidden />
            </p>
          </div>
        </div>
      </Fade>
    </SectionShell>
  )
}

/** The relationship retold as a chat conversation. */
export function ChatThreadSection() {
  const { content, meta } = useTemplate()
  const items = content.timeline
  const fallback: Array<{ from: 'me' | 'them'; text: string }> = [
    { from: 'them', text: 'Hey… I made this for you.' },
    { from: 'me', text: 'Every message with you is my favourite notification.' },
  ]
  const rows: Array<{ from: 'me' | 'them'; text: string }> = items.length
    ? items.flatMap((t) => [
        { from: 'them' as const, text: t.title || t.date },
        { from: 'me' as const, text: t.description || t.date },
      ])
    : fallback

  return (
    <SectionShell tone="paper">
      <SectionHeading
        kicker="Us, in messages"
        title={meta.nickname ? `A chat with ${meta.nickname}` : 'Our story as a chat'}
      />
      <div className="mx-auto flex max-w-xl flex-col gap-3">
        {rows.map((row, i) => (
          <Fade key={i} delay={i * 0.05} y={14} className={row.from === 'me' ? 'self-end' : 'self-start'}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.98rem] leading-snug ${
                row.from === 'me' ? 'rounded-br-md' : 'rounded-bl-md'
              }`}
              style={
                row.from === 'me'
                  ? { background: 'var(--tpl-accent)', color: 'var(--tpl-surface)' }
                  : {
                      background: 'color-mix(in srgb, var(--tpl-surface) 80%, white 20%)',
                      color: 'var(--tpl-ink)',
                      border: '1px solid color-mix(in srgb, var(--tpl-accent) 24%, transparent)',
                    }
              }
            >
              {row.text}
            </div>
          </Fade>
        ))}
        <Fade delay={0.2} className="self-center pt-2">
          <span className="font-hand text-lg opacity-60">…and many more 💌</span>
        </Fade>
      </div>
    </SectionShell>
  )
}

/** Flip-through promise cards. */
export function PromisesSection() {
  const { content } = useTemplate()
  const items = content.promises

  return (
    <SectionShell>
      <SectionHeading
        kicker="Little promises"
        title="Things I will keep doing"
        subtitle={items.length ? undefined : 'Add promises in the editor.'}
      />
      {items.length === 0 ? null : (
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {items.map((p, i) => (
            <Fade key={i} delay={i * 0.08}>
              <div className="tpl-card flex h-full flex-col gap-2 px-6 py-7 text-center">
                <span
                  aria-hidden
                  className="mx-auto grid h-10 w-10 place-items-center rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--tpl-accent) 20%, transparent)', color: 'var(--tpl-accent)' }}
                >
                  <Star className="h-4.5 w-4.5 fill-current" />
                </span>
                <p className="tpl-kicker">{p.title || 'I promise'}</p>
                <p className="font-display text-xl leading-snug">{p.body}</p>
              </div>
            </Fade>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

/** Story told in comic panels with photos on top. */
export function ComicPanelsSection() {
  const { content } = useTemplate()
  const photos = usePhotoViewModels()
  const panels = content.storyPanels

  return (
    <SectionShell>
      <SectionHeading kicker="Issue #1" title="Our comic" />
      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {panels.map((panel, i) => {
          const photo = photos[i]
          return (
            <Fade key={i} delay={i * 0.07}>
              <div
                className="tpl-card overflow-hidden p-0"
                style={{ border: '3px solid var(--tpl-ink)', borderRadius: '0.5rem' }}
              >
                <div className="aspect-[16/10] w-full overflow-hidden" style={{ background: 'var(--tpl-soft)' }}>
                  {photo ? (
                    <SmartImage src={photo.src} alt={photo.caption} fallbackLabel={photo.label} className="h-full w-full" />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <span className="tpl-kicker">Panel {i + 1}</span>
                    </div>
                  )}
                </div>
                <p className="border-t-[3px] px-4 py-3 font-hand text-xl" style={{ borderColor: 'var(--tpl-ink)' }}>
                  {panel.caption}
                </p>
              </div>
            </Fade>
          )
        })}
      </div>
      {panels.length === 0 ? (
        <p className="text-center tpl-subtitle opacity-70">Add your story panels in the editor.</p>
      ) : null}
    </SectionShell>
  )
}

/** Free-form message block used by simple text sections. */
export function MessageSection({ title, kicker }: { title?: string; kicker?: string }) {
  const { content } = useTemplate()
  const body = content.mainMessage || content.finalMessage
  if (!body) return null
  return (
    <SectionShell>
      <SectionHeading kicker={kicker} title={title} />
      <Fade className="mx-auto max-w-2xl">
        <MessageText text={body} className="text-center text-lg leading-relaxed opacity-90" />
      </Fade>
    </SectionShell>
  )
}
