import { motion, AnimatePresence } from 'framer-motion'
import { Check, Gift, PartyPopper, Ticket, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ConfettiBurst from '../../components/ConfettiBurst'
import BirthdayCake from '../../components/BirthdayCake'
import RomanticButton from '../../components/RomanticButton'
import { usePrefersReducedMotion } from '../../lib/motion'
import { useTemplate } from '../engine/context'
import { Fade, MessageText, SectionHeading, SectionShell } from '../ui/primitives'

/* ------------------------------------------------------------------ */
/*  Love quiz                                                          */
/* ------------------------------------------------------------------ */
export function QuizSection() {
  const { content, meta } = useTemplate()
  const questions = content.quiz
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if (questions.length === 0) {
    return (
      <SectionShell>
        <SectionHeading kicker="Test them" title="Love quiz" subtitle="Add quiz questions in the editor." />
      </SectionShell>
    )
  }

  if (done) {
    return (
      <SectionShell>
        <Fade className="tpl-card mx-auto max-w-xl px-8 py-10 text-center">
          <p className="tpl-kicker mb-3">Final score</p>
          <p className="font-display text-5xl font-semibold">
            {score} <span className="opacity-40">/ {questions.length}</span>
          </p>
          <p className="tpl-subtitle mt-4">
            {score === questions.length
              ? 'Perfect. You know us better than anyone.'
              : 'Close enough — love is not a test anyway.'}
          </p>
          {content.finalMessage ? (
            <div className="mt-6">
              <MessageText text={content.finalMessage} className="text-base" />
            </div>
          ) : null}
        </Fade>
      </SectionShell>
    )
  }

  const q = questions[step]
  const answered = picked !== null

  return (
    <SectionShell>
      <SectionHeading
        kicker={`Question ${step + 1} of ${questions.length}`}
        title={meta.nickname ? `How well do you know ${meta.nickname}?` : 'How well do you know us?'}
      />
      <Fade className="tpl-card mx-auto max-w-2xl px-6 py-8 sm:px-9">
        <p className="font-display text-2xl leading-snug">{q.question}</p>
        <div className="mt-6 grid gap-3">
          {q.options.map((opt, i) => {
            const isPicked = picked === i
            const isCorrect = i === q.correctIndex
            const showState = answered
            const style = showState
              ? isCorrect
                ? {
                    background: 'color-mix(in srgb, var(--tpl-accent) 22%, var(--tpl-surface))',
                    borderColor: 'var(--tpl-accent)',
                  }
                : isPicked
                  ? { background: 'color-mix(in srgb, #b91c1c 16%, var(--tpl-surface))', borderColor: '#b91c1c' }
                  : {}
              : {}
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked(i)
                  if (i === q.correctIndex) setScore((s) => s + 1)
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border px-5 py-3.5 text-left font-body transition disabled:cursor-default"
                style={{
                  background: 'color-mix(in srgb, var(--tpl-surface) 82%, white 18%)',
                  color: 'var(--tpl-ink)',
                  border: '1.5px solid color-mix(in srgb, var(--tpl-accent) 32%, transparent)',
                  ...style,
                }}
              >
                <span>{opt}</span>
                {showState && isCorrect ? <Check className="h-4.5 w-4.5 shrink-0" /> : null}
                {showState && isPicked && !isCorrect ? <X className="h-4.5 w-4.5 shrink-0" /> : null}
              </button>
            )
          })}
        </div>
        <AnimatePresence>
          {answered ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center"
            >
              <RomanticButton
                onClick={() => {
                  if (step + 1 >= questions.length) setDone(true)
                  else {
                    setStep((s) => s + 1)
                    setPicked(null)
                  }
                }}
              >
                {step + 1 >= questions.length ? 'See my score' : 'Next question'}
              </RomanticButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Fade>
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Love coupons                                                       */
/* ------------------------------------------------------------------ */
export function CouponsSection() {
  const { content } = useTemplate()
  const coupons = content.coupons
  const [revealed, setRevealed] = useState<number | null>(null)

  if (coupons.length === 0) {
    return (
      <SectionShell>
        <SectionHeading kicker="Redeem anytime" title="Love coupons" subtitle="Add coupons in the editor." />
      </SectionShell>
    )
  }

  return (
    <SectionShell tone="paper">
      <SectionHeading
        kicker="Redeem anytime"
        title="A book of coupons"
        subtitle="Tap a coupon to tear it off — each one is yours."
      />
      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {coupons.map((c, i) => (
          <Fade key={i} delay={i * 0.07}>
            <button
              type="button"
              onClick={() => setRevealed(revealed === i ? null : i)}
              className="tpl-card relative w-full overflow-hidden px-6 py-7 text-left transition-transform duration-300 hover:-translate-y-1"
              aria-expanded={revealed === i}
            >
              <span
                aria-hidden
                className="absolute top-0 bottom-0 left-0 w-1.5"
                style={{ background: 'var(--tpl-accent)' }}
              />
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="tpl-kicker block">Coupon #{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-1.5 block font-display text-2xl font-semibold">{c.title}</span>
                  <span className="mt-1 block text-sm opacity-75">{c.description}</span>
                </span>
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--tpl-accent) 20%, transparent)', color: 'var(--tpl-accent)' }}
                >
                  <Ticket className="h-5 w-5" />
                </span>
              </span>
              <AnimatePresence>
                {revealed === i ? (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 block border-t border-dashed pt-3 font-hand text-xl"
                    style={{ borderColor: 'color-mix(in srgb, var(--tpl-accent) 50%, transparent)' }}
                  >
                    Redeemed — just show me this coupon. ♥
                  </motion.span>
                ) : (
                  <span className="mt-4 block font-body text-[11px] tracking-[0.2em] uppercase opacity-50">
                    Tap to redeem
                  </span>
                )}
              </AnimatePresence>
            </button>
          </Fade>
        ))}
      </div>
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Choose your surprise                                               */
/* ------------------------------------------------------------------ */
export function ChoicesSection() {
  const { content } = useTemplate()
  const choices = content.choices
  const [picked, setPicked] = useState<number | null>(null)

  if (choices.length === 0) {
    return (
      <SectionShell>
        <SectionHeading kicker="Pick one" title="Choose your surprise" subtitle="Add choices in the editor." />
      </SectionShell>
    )
  }

  return (
    <SectionShell>
      <SectionHeading kicker="Pick a path" title="Choose your surprise" subtitle="Each one opens a different message." />
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {choices.map((c, i) => (
          <Fade key={i} delay={i * 0.06}>
            <button
              type="button"
              onClick={() => setPicked(picked === i ? null : i)}
              className="tpl-btn-ghost w-full justify-between"
              aria-expanded={picked === i}
            >
              <span>{c.label}</span>
              <span aria-hidden style={{ color: 'var(--tpl-accent)' }}>{picked === i ? '−' : '+'}</span>
            </button>
            <AnimatePresence>
              {picked === i ? (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="tpl-card px-6 py-5">
                    <MessageText text={c.message} className="text-[1.02rem]" />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Fade>
        ))}
      </div>
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Secret unlock (press & hold)                                       */
/* ------------------------------------------------------------------ */
export function SecretUnlockSection() {
  const { content } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const timer = useRef<number | null>(null)

  const HOLD_MS = 1400

  const stop = () => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
    if (!unlocked) setProgress(0)
  }

  useEffect(() => () => stop(), []) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (unlocked || timer.current) return
    const started = Date.now()
    timer.current = window.setInterval(() => {
      const pct = Math.min(1, (Date.now() - started) / HOLD_MS)
      setProgress(pct)
      if (pct >= 1) {
        setUnlocked(true)
        stop()
      }
    }, 40)
  }

  const secret = content.secretMessage || 'Your secret message will appear here once you add one.'

  return (
    <SectionShell tone="dark">
      <SectionHeading
        kicker="Not so fast"
        title="Something is hidden here"
        subtitle="Press and hold the heart to unlock it."
        dark
      />
      <Fade className="flex flex-col items-center gap-6">
        <button
          type="button"
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          aria-label="Press and hold to unlock the secret message"
          className="relative grid h-36 w-36 cursor-pointer touch-none select-none place-items-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--tpl-accent) 90%, white 10%), var(--tpl-accent))',
            boxShadow: `0 0 ${40 + progress * 60}px color-mix(in srgb, var(--tpl-accent) ${45 + progress * 40}%, transparent)`,
            transform: `scale(${1 + progress * 0.08})`,
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="16.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <circle
              cx="18"
              cy="18"
              r="16.5"
              fill="none"
              stroke="var(--tpl-surface)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${progress * 103.7} 103.7`}
            />
          </svg>
          <span className="text-5xl" aria-hidden>{unlocked ? '♥' : '🔒'}</span>
        </button>

        <div className="max-w-xl text-center">
          <AnimatePresence mode="wait">
            {unlocked ? (
              <motion.div
                key="secret"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="tpl-card-dark px-7 py-7"
                style={{ background: 'color-mix(in srgb, var(--tpl-surface) 10%, transparent)' }}
              >
                <p className="tpl-kicker mb-3" style={{ color: 'var(--tpl-soft)' }}>
                  Unlocked
                </p>
                <MessageText
                  text={secret}
                  className="font-display text-2xl leading-relaxed"
                />
              </motion.div>
            ) : (
              <motion.p key="hint" className="tpl-subtitle" style={{ color: 'color-mix(in srgb, var(--tpl-surface) 70%, transparent)' }}>
                {reduced ? 'Tap once to unlock.' : 'Hold the heart until it fills…'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Fade>
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Layered gift box                                                   */
/* ------------------------------------------------------------------ */
export function GiftBoxSection() {
  const { content } = useTemplate()
  const [layer, setLayer] = useState(0) // 0 sealed, 1 ribbon off, 2 lid off, 3 open
  const reduced = usePrefersReducedMotion()

  const message = content.finalMessage || content.mainMessage || 'A surprise, wrapped just for you.'

  return (
    <SectionShell>
      <SectionHeading
        kicker="For you"
        title="Tap to unwrap"
        subtitle={layer < 3 ? 'Three layers… take your time.' : undefined}
      />
      <Fade className="flex flex-col items-center gap-7">
        <div className="relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64">
          {/* Glow */}
          <span
            aria-hidden
            className="absolute inset-4 rounded-full blur-3xl"
            style={{
              background: 'color-mix(in srgb, var(--tpl-accent) 40%, transparent)',
              opacity: layer === 3 ? 1 : 0.45,
              transition: 'opacity 0.6s ease',
            }}
          />
          <motion.button
            type="button"
            onClick={() => setLayer((l) => Math.min(3, l + 1))}
            disabled={layer >= 3}
            aria-label={layer >= 3 ? 'Gift opened' : 'Tap to unwrap the gift'}
            className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl"
            style={{
              background:
                'linear-gradient(150deg, color-mix(in srgb, var(--tpl-accent) 85%, white 15%), var(--tpl-accent))',
              boxShadow: '0 28px 70px -28px color-mix(in srgb, var(--tpl-ink) 70%, transparent)',
            }}
            animate={
              reduced
                ? undefined
                : layer < 3
                  ? { rotate: [0, -1.5, 1.5, 0], scale: [1, 1.02, 1] }
                  : { rotate: 0, scale: 1 }
            }
            transition={layer < 3 ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
            whileTap={layer < 3 ? { scale: 0.96 } : undefined}
          >
            {/* Ribbon vertical */}
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-1/2 w-9 -translate-x-1/2"
              style={{ background: 'var(--tpl-soft)', opacity: layer >= 1 ? 0 : 1 }}
              animate={{ opacity: layer >= 1 ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            />
            {/* Ribbon horizontal */}
            <motion.span
              aria-hidden
              className="absolute inset-x-0 top-1/2 h-9 -translate-y-1/2"
              style={{ background: 'var(--tpl-soft)' }}
              animate={{ opacity: layer >= 1 ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            />
            {/* Lid */}
            <motion.span
              aria-hidden
              className="absolute inset-x-[-6%] top-[-8%] h-1/3 rounded-2xl"
              style={{
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--tpl-accent) 70%, white 30%), var(--tpl-accent))',
                boxShadow: '0 10px 24px -12px rgba(0,0,0,0.4)',
              }}
              animate={
                layer >= 2
                  ? reduced
                    ? { opacity: 0 }
                    : { y: -170, rotate: -18, opacity: 0 }
                  : { y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            {layer < 3 ? (
              <span className="relative z-10 grid place-items-center gap-1 text-white/95">
                <Gift className="h-9 w-9" strokeWidth={1.4} />
                <span className="font-body text-[11px] tracking-[0.24em] uppercase">
                  {layer === 0 ? 'Tap to unwrap' : layer === 1 ? 'Again…' : 'One more layer'}
                </span>
              </span>
            ) : null}
          </motion.button>
        </div>

        <AnimatePresence>
          {layer === 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="tpl-card max-w-xl px-7 py-7 text-center"
            >
              <ConfettiBurst count={40} />
              <p className="tpl-kicker mb-3">It's open</p>
              <MessageText text={message} className="text-lg" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Fade>
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Countdown                                                          */
/* ------------------------------------------------------------------ */
export function CountdownSection() {
  const { meta, content } = useTemplate()
  const target = useMemo(() => (meta.occasionDate ? new Date(meta.occasionDate) : null), [meta.occasionDate])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [target])

  if (!target || Number.isNaN(target.getTime())) {
    return (
      <SectionShell>
        <SectionHeading
          kicker="The big day"
          title="Counting down"
          subtitle="Set the occasion date in your project and the countdown starts ticking."
        />
      </SectionShell>
    )
  }

  const diff = Math.max(0, target.getTime() - now)
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  const over = diff === 0

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ]

  return (
    <SectionShell tone="dark">
      <SectionHeading
        kicker="The big day"
        title={over ? 'The moment is here' : `Until ${target.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}`}
        dark
      />
      <Fade className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4">
        {units.map((u) => (
          <div key={u.label} className="tpl-card-dark min-w-24 flex-1 px-4 py-6 text-center sm:min-w-32">
            <p
              className="font-display text-4xl font-semibold tabular-nums sm:text-5xl"
              style={{ color: 'var(--tpl-surface)' }}
            >
              {String(u.value).padStart(2, '0')}
            </p>
            <p className="mt-1.5 font-body text-[10px] tracking-[0.3em] uppercase opacity-60">{u.label}</p>
          </div>
        ))}
      </Fade>
      {content.mainMessage ? (
        <Fade delay={0.15} className="mx-auto mt-8 max-w-xl">
          <MessageText text={content.mainMessage} className="text-center text-base" />
        </Fade>
      ) : null}
    </SectionShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Birthday cake stage                                                */
/* ------------------------------------------------------------------ */
export function CakeStageSection() {
  const { content, meta } = useTemplate()
  const reduced = usePrefersReducedMotion()
  const [wished, setWished] = useState(false)

  return (
    <SectionShell>
      <SectionHeading
        kicker={meta.occasion === 'BIRTHDAY' ? 'Make a wish' : 'Celebrate'}
        title={content.title || `Happy ${meta.occasion.toLowerCase()}`}
        subtitle={wished ? undefined : 'Blow out the candles — tap the cake.'}
      />
      <Fade className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => setWished(true)}
          disabled={wished}
          aria-label={wished ? 'Wish made' : 'Tap to blow out the candles'}
          className="relative w-full max-w-md cursor-pointer transition-transform duration-300 hover:scale-[1.03] disabled:cursor-default"
        >
          <BirthdayCake className="w-full" />
          {wished ? null : (
            <span className="absolute inset-x-0 -bottom-2 text-center font-body text-[11px] tracking-[0.24em] uppercase opacity-60">
              Tap to blow out the candles
            </span>
          )}
        </button>

        <AnimatePresence>
          {wished ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="tpl-card relative w-full max-w-xl overflow-hidden px-7 py-8 text-center"
            >
              <ConfettiBurst active={!reduced} count={54} seed={9} />
              <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full" style={{ background: 'color-mix(in srgb, var(--tpl-accent) 22%, transparent)', color: 'var(--tpl-accent)' }}>
                <PartyPopper className="h-5 w-5" />
              </span>
              <p className="font-display text-3xl font-semibold">
                {meta.recipientName ? `Wish made for ${meta.recipientName}` : 'Wish made'}
              </p>
              <MessageText
                text={content.finalMessage || content.mainMessage || 'Many more years of us. 🎂'}
                className="mt-3 text-base"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Fade>
    </SectionShell>
  )
}
