import { TemplateProvider, useThemeVars } from './engine/context'
import { manifestFor, type SectionSpec } from './registry'
import AudioBar from './ui/AudioBar'
import PhotoGallery from './ui/PhotoGallery'
import HeroSection from './sections/HeroSections'
import LetterSection from './sections/LetterSections'
import {
  ChatThreadSection,
  ComicPanelsSection,
  MapLineSection,
  MessageSection,
  PromisesSection,
  StarMapSection,
  TimelineSection,
} from './sections/StorySections'
import {
  CakeStageSection,
  ChoicesSection,
  CountdownSection,
  CouponsSection,
  GiftBoxSection,
  QuizSection,
  SecretUnlockSection,
} from './sections/InteractiveSections'
import {
  ConfettiMessageSection,
  FinaleSection,
  PixelHeartsSection,
  SignatureSection,
  StickyNotesSection,
  WishCardsSection,
} from './sections/ClosingSections'
import type { RenderPayload } from '../shared'
import type { TemplateMode } from './engine/context'

/**
 * Renders a complete surprise page from a self-contained `RenderPayload`.
 * `preview` mode (editor/template preview) shows empty-state hints;
 * `live` mode (public published page) renders only what was paid for and published.
 */
export default function TemplateRenderer({
  payload,
  mode = 'live',
  className = '',
}: {
  payload: RenderPayload
  mode?: TemplateMode
  className?: string
}) {
  const manifest = manifestFor(payload.templateKey)

  return (
    <TemplateProvider payload={payload} mode={mode}>
      <div className={`tpl-root ${className}`}>
        {manifest.sections.map((spec, i) => (
          <SectionNode key={`${spec.kind}-${i}`} spec={spec} index={i} />
        ))}
        <PageFooter templateName={manifest.meta.name} />
        <AudioBar />
      </div>
    </TemplateProvider>
  )
}

function SectionNode({ spec, index }: { spec: SectionSpec; index: number }) {
  switch (spec.kind) {
    case 'hero':
      return <HeroSection variant={spec.variant ?? 'hero'} index={index} />

    case 'gallery':
      return (
        <div id={`tpl-sec-${index}`}>
          <PhotoGallery variant={(spec.variant as 'grid' | 'memory' | 'polaroid' | 'bloom') ?? 'grid'} kicker="Moments" title="Our favourite frames" />
        </div>
      )

    case 'letter':
      return (
        <div id={`tpl-sec-${index}`}>
          <LetterSection variant={(spec.variant as 'reveal' | 'envelope' | 'handwritten' | 'text-flow') ?? 'reveal'} />
        </div>
      )

    case 'timeline':
      return (
        <div id={`tpl-sec-${index}`}>
          <TimelineSection />
        </div>
      )
    case 'starmap':
      return (
        <div id={`tpl-sec-${index}`}>
          <StarMapSection />
        </div>
      )
    case 'mapline':
      return (
        <div id={`tpl-sec-${index}`}>
          <MapLineSection />
        </div>
      )
    case 'chat':
      return (
        <div id={`tpl-sec-${index}`}>
          <ChatThreadSection />
        </div>
      )
    case 'promises':
      return (
        <div id={`tpl-sec-${index}`}>
          <PromisesSection />
        </div>
      )
    case 'comic':
      return (
        <div id={`tpl-sec-${index}`}>
          <ComicPanelsSection />
        </div>
      )
    case 'quiz':
      return (
        <div id={`tpl-sec-${index}`}>
          <QuizSection />
        </div>
      )
    case 'coupons':
      return (
        <div id={`tpl-sec-${index}`}>
          <CouponsSection />
        </div>
      )
    case 'choices':
      return (
        <div id={`tpl-sec-${index}`}>
          <ChoicesSection />
        </div>
      )
    case 'unlock':
      return (
        <div id={`tpl-sec-${index}`}>
          <SecretUnlockSection />
        </div>
      )
    case 'gift':
      return (
        <div id={`tpl-sec-${index}`}>
          <GiftBoxSection />
        </div>
      )
    case 'countdown':
      return (
        <div id={`tpl-sec-${index}`}>
          <CountdownSection />
        </div>
      )
    case 'cake':
      return (
        <div id={`tpl-sec-${index}`}>
          <CakeStageSection />
        </div>
      )
    case 'signature':
      return (
        <div id={`tpl-sec-${index}`}>
          <SignatureSection />
        </div>
      )
    case 'finale':
      return (
        <div id={`tpl-sec-${index}`}>
          <FinaleSection variant="finale" />
        </div>
      )
    case 'celebration':
      return (
        <div id={`tpl-sec-${index}`}>
          <FinaleSection variant="celebration" />
        </div>
      )
    case 'message':
      return (
        <div id={`tpl-sec-${index}`}>
          <ConfettiMessageSection />
        </div>
      )
    case 'wishes':
      return (
        <div id={`tpl-sec-${index}`}>
          <WishCardsSection />
        </div>
      )
    case 'sticky':
      return (
        <div id={`tpl-sec-${index}`}>
          <StickyNotesSection />
        </div>
      )
    case 'pixel':
      return (
        <div id={`tpl-sec-${index}`}>
          <PixelHeartsSection />
        </div>
      )
    default:
      return (
        <div id={`tpl-sec-${index}`}>
          <MessageSection />
        </div>
      )
  }
}

/** Small attribution footer — static, safe on every published page. */
function PageFooter({ templateName }: { templateName: string }) {
  const themeVars = useThemeVars()
  return (
    <footer
      className="px-6 py-8 text-center font-body text-[11px] tracking-[0.2em] uppercase"
      style={{
        ...themeVars,
        background: 'color-mix(in srgb, var(--tpl-ink) 94%, var(--tpl-surface) 6%)',
        color: 'color-mix(in srgb, var(--tpl-surface) 55%, transparent)',
      }}
    >
      {templateName} · Made with Dearmine
    </footer>
  )
}
