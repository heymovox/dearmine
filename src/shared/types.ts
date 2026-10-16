import type { DesignConfig, SurpriseContent } from './schemas'

export type RenderAssetType = 'PHOTO' | 'AUDIO' | 'COVER'

export type RenderAsset = {
  id: string
  type: RenderAssetType
  url: string
  caption: string
  sortOrder: number
}

/**
 * The complete, self-contained payload a template needs to render.
 * Also what gets snapshotted into a PublishedPage so public rendering never
 * depends on unpublished draft state.
 */
export type RenderPayload = {
  templateKey: string
  templateSlug: string
  content: SurpriseContent
  design: DesignConfig
  assets: RenderAsset[]
  meta: {
    title: string
    recipientName: string
    creatorName: string
    nickname: string
    occasion: string
    occasionDate: string | null
  }
}
