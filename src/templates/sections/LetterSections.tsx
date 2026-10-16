import { useState, type ReactNode } from 'react'
import Envelope from '../../components/Envelope'
import RomanticButton from '../../components/RomanticButton'
import Typewriter from '../../components/Typewriter'
import { useTemplate } from '../engine/context'
import { Fade, MessageText, SectionHeading, SectionShell } from '../ui/primitives'

type LetterVariant = 'reveal' | 'envelope' | 'handwritten' | 'text-flow'

/** The love letter — four reveal styles, one source of truth (content.letter). */
export default function LetterSection({ variant = 'reveal' }: { variant?: LetterVariant }) {
  const { content, meta } = useTemplate()
  const letter = content.letter
  const letterLabel = `A letter for ${meta.recipientName || 'you'}`

  if (!letter) {
    if (variant === 'envelope') return <EnvelopeLetter letter={letter} label={letterLabel} />
    return (
      <SectionShell>
        <SectionHeading kicker="From my heart" title="Your letter" />
        <p className="text-center tpl-subtitle opacity-70">
          Write your letter in the editor and it will appear here, in your words.
        </p>
      </SectionShell>
    )
  }

  if (variant === 'envelope') return <EnvelopeLetter letter={letter} label={letterLabel} />
  if (variant === 'handwritten') return <HandwrittenLetter letter={letter} label={letterLabel} />
  if (variant === 'text-flow') return <TextFlowLetter letter={letter} label={letterLabel} />
  return <TypewriterLetter letter={letter} label={letterLabel} />
}

function LetterPaper({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`tpl-paper relative mx-auto w-full max-w-3xl rounded-[1.75rem] px-6 py-10 sm:px-12 sm:py-14 ${className}`}>
      <span
        aria-hidden
        className="absolute top-5 right-6 font-hand text-sm tracking-widest opacity-45"
        style={{ color: 'var(--tpl-accent)' }}
      >
        ♥
      </span>
      <p className="tpl-kicker mb-6 text-center">{label}</p>
      {children}
    </div>
  )
}

function SignatureLine({ signature }: { signature?: string }) {
  if (!signature) return null
  return (
    <Fade delay={0.2} className="mt-8 text-right">
      <p className="font-hand text-2xl sm:text-3xl" style={{ color: 'color-mix(in srgb, var(--tpl-accent) 90%, var(--tpl-ink) 10%)' }}>
        {signature}
      </p>
    </Fade>
  )
}

function TypewriterLetter({ letter, label }: { letter: string; label: string }) {
  const { content } = useTemplate()
  const [showAll, setShowAll] = useState(false)
  const paragraphs = letter.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <SectionShell>
      <LetterPaper label={label}>
        {showAll ? (
          <MessageText text={letter} className="text-lg leading-relaxed" />
        ) : (
          <Typewriter paragraphs={paragraphs} className="text-lg leading-relaxed" onDone={() => {}} />
        )}
        <SignatureLine signature={content.signature} />
        {!showAll ? (
          <Fade delay={0.1} className="mt-7 flex justify-center">
            <RomanticButton variant="ghost-dark" onClick={() => setShowAll(true)}>
              Show the full letter
            </RomanticButton>
          </Fade>
        ) : null}
      </LetterPaper>
    </SectionShell>
  )
}

function EnvelopeLetter({ letter, label }: { letter: string; label: string }) {
  const { content } = useTemplate()
  const [open, setOpen] = useState(false)

  return (
    <SectionShell>
      <SectionHeading kicker="Sealed with love" title={label} subtitle="Tap the envelope — it's just for them." />
      {!open ? (
        <Envelope open={false} onOpen={() => setOpen(true)} label="Open the love letter" />
      ) : (
        <Fade>
          <LetterPaper label={label} className="max-w-2xl">
            <MessageText text={letter} className="text-lg leading-relaxed" />
            <SignatureLine signature={content.signature} />
          </LetterPaper>
        </Fade>
      )}
    </SectionShell>
  )
}

function HandwrittenLetter({ letter, label }: { letter: string; label: string }) {
  const { content } = useTemplate()
  return (
    <SectionShell tone="paper">
      <LetterPaper label={label} className="shadow-none">
        <div
          className="font-hand text-[1.45rem] leading-[1.9] sm:text-[1.7rem]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 2.8rem, color-mix(in srgb, var(--tpl-accent) 22%, transparent) 2.8rem, color-mix(in srgb, var(--tpl-accent) 22%, transparent) calc(2.8rem + 1px))',
          }}
        >
          <MessageText text={letter} />
        </div>
        <SignatureLine signature={content.signature} />
      </LetterPaper>
    </SectionShell>
  )
}

function TextFlowLetter({ letter, label }: { letter: string; label: string }) {
  const { content } = useTemplate()
  return (
    <SectionShell>
      <SectionHeading kicker={label} title="In your words" />
      <Fade className="mx-auto max-w-2xl">
        <p
          className="font-display text-center text-2xl leading-[1.75] sm:text-3xl"
          style={{ color: 'color-mix(in srgb, var(--tpl-ink) 88%, var(--tpl-surface) 12%)' }}
        >
          {letter.split(/\n{2,}/)[0]}
        </p>
        {letter.split(/\n{2,}/).length > 1 ? (
          <div className="mt-8 space-y-5 text-lg leading-relaxed opacity-85">
            <MessageText text={letter.split(/\n{2,}/).slice(1).join('\n\n')} />
          </div>
        ) : null}
        <div className="mt-10 text-center">
          <SignatureLine signature={content.signature} />
        </div>
      </Fade>
    </SectionShell>
  )
}
