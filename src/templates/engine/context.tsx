import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react'
import {
  buildThemeVars,
  designConfigSchema,
  surpriseContentSchema,
  type DesignConfig,
  type RenderAsset,
  type RenderPayload,
  type SurpriseContent,
} from '../../shared'

export type TemplateMode = 'preview' | 'live'

export type TemplateContextValue = {
  payload: RenderPayload
  /** Content normalized against the zod schema so missing keys become ''. */
  content: SurpriseContent
  design: DesignConfig
  meta: RenderPayload['meta']
  mode: TemplateMode
  photos: RenderAsset[]
  audio: RenderAsset | null
  cover: RenderAsset | null
  /** True while nothing has been personalised yet (editor first run). */
  isBlank: boolean
}

const TemplateContext = createContext<TemplateContextValue | null>(null)

/**
 * Provides the rendered payload to every section. Also normalises `content`
 * and `design` through the shared zod schemas so a half-filled draft behaves
 * predictably (empty strings instead of undefined) instead of crashing.
 */
export function TemplateProvider({
  payload,
  mode = 'live',
  children,
}: {
  payload: RenderPayload
  mode?: TemplateMode
  children: ReactNode
}) {
  const value = useMemo<TemplateContextValue>(() => {
    const content = safeContent(payload.content)
    const design = safeDesign(payload.design)
    const assets = [...payload.assets].sort((a, b) => a.sortOrder - b.sortOrder)
    const photos = assets.filter((a) => a.type === 'PHOTO')
    const audio = assets.find((a) => a.type === 'AUDIO') ?? null
    const cover = assets.find((a) => a.type === 'COVER') ?? null

    const isBlank = !(
      content.title ||
      content.openingMessage ||
      content.mainMessage ||
      content.letter ||
      payload.meta.recipientName
    )

    return { payload, content, design, meta: payload.meta, mode, photos, audio, cover, isBlank }
  }, [payload, mode])

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

function safeContent(raw: unknown): SurpriseContent {
  const parsed = surpriseContentSchema.safeParse(raw ?? {})
  return parsed.success ? parsed.data : surpriseContentSchema.parse({})
}

function safeDesign(raw: unknown): DesignConfig {
  const parsed = designConfigSchema.safeParse(raw ?? {})
  return parsed.success ? parsed.data : designConfigSchema.parse({})
}

export function useTemplate(): TemplateContextValue {
  const ctx = useContext(TemplateContext)
  if (!ctx) throw new Error('useTemplate() must be used inside <TemplateRenderer>')
  return ctx
}

/** CSS custom properties for the active palette + font. */
export function useThemeVars(): CSSProperties {
  const { design } = useTemplate()
  return buildThemeVars(design.palette, design.font) as CSSProperties
}
