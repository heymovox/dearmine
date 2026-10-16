import { prisma } from '../../db'
import { UPLOAD_LIMITS, type RenderAsset } from '../../shared'
import { badRequest } from '../../lib/errors'
import { storage } from '../../services/storage'
import { getOwnedProject, toRenderAsset } from '../projects/service'

/** Hard ceiling for a draft; the active plan enforces a tighter cap at publish. */
export const DRAFT_MAX_PHOTOS = 60

function assertUploadAllowed(assetType: 'PHOTO' | 'AUDIO' | 'COVER', mimeType: string, sizeBytes: number) {
  if (assetType === 'AUDIO') {
    if (!UPLOAD_LIMITS.allowedAudioMimes.includes(mimeType)) {
      throw badRequest('Unsupported audio format. Use MP3, WAV, OGG or M4A.')
    }
    if (sizeBytes > UPLOAD_LIMITS.maxAudioBytes) throw badRequest('Audio files must be 15 MB or smaller')
    return
  }
  if (!UPLOAD_LIMITS.allowedPhotoMimes.includes(mimeType)) {
    throw badRequest('Unsupported image format. Use JPG, PNG, WEBP or GIF.')
  }
  if (sizeBytes > UPLOAD_LIMITS.maxPhotoBytes) throw badRequest('Images must be 8 MB or smaller')
}

export async function requestUpload(
  ownerId: string,
  projectId: string,
  input: { assetType: 'PHOTO' | 'AUDIO' | 'COVER'; filename: string; mimeType: string; sizeBytes: number },
) {
  const project = await getOwnedProject(ownerId, projectId)
  assertUploadAllowed(input.assetType, input.mimeType, input.sizeBytes)

  if (input.assetType !== 'AUDIO') {
    const count = await prisma.projectAsset.count({
      where: { projectId: project.id, assetType: { in: ['PHOTO', 'COVER'] } },
    })
    if (count >= DRAFT_MAX_PHOTOS) throw badRequest(`You can upload up to ${DRAFT_MAX_PHOTOS} photos`)
  } else {
    const existingAudio = await prisma.projectAsset.count({
      where: { projectId: project.id, assetType: 'AUDIO' },
    })
    if (existingAudio >= 3) throw badRequest('You can upload up to 3 audio files')
  }

  const ticket = await storage().createUpload({
    prefix: `projects/${project.id}`,
    filename: input.filename,
    mimeType: input.mimeType,
  })
  return ticket
}

export async function confirmUpload(
  ownerId: string,
  projectId: string,
  input: {
    storageKey: string
    assetType: 'PHOTO' | 'AUDIO' | 'COVER'
    url: string
    mimeType: string
    sizeBytes: number
    width?: number
    height?: number
  },
): Promise<RenderAsset> {
  const project = await getOwnedProject(ownerId, projectId)
  // The storage key must belong to this project's prefix.
  if (!input.storageKey.startsWith(`projects/${project.id}/`)) {
    throw badRequest('Invalid storage key for this project')
  }
  const max = await prisma.projectAsset.aggregate({
    where: { projectId: project.id },
    _max: { sortOrder: true },
  })
  const asset = await prisma.projectAsset.create({
    data: {
      projectId: project.id,
      assetType: input.assetType,
      storageKey: input.storageKey,
      url: input.url,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  })
  return toRenderAsset(asset)
}

export async function listProjectAssets(ownerId: string, projectId: string): Promise<RenderAsset[]> {
  const project = await getOwnedProject(ownerId, projectId)
  const assets = await prisma.projectAsset.findMany({
    where: { projectId: project.id },
    orderBy: { sortOrder: 'asc' },
  })
  return assets.map(toRenderAsset)
}

export async function updateProjectAsset(
  ownerId: string,
  projectId: string,
  assetId: string,
  input: { caption?: string; sortOrder?: number },
): Promise<RenderAsset> {
  await getOwnedProject(ownerId, projectId)
  const asset = await prisma.projectAsset.findFirst({ where: { id: assetId, projectId } })
  if (!asset) throw badRequest('Image not found')
  const updated = await prisma.projectAsset.update({
    where: { id: asset.id },
    data: {
      caption: input.caption ?? undefined,
      sortOrder: input.sortOrder ?? undefined,
    },
  })
  return toRenderAsset(updated)
}

export async function reorderProjectAssets(ownerId: string, projectId: string, order: string[]): Promise<RenderAsset[]> {
  await getOwnedProject(ownerId, projectId)
  const assets = await prisma.projectAsset.findMany({ where: { projectId } })
  const owned = new Set(assets.map((a) => a.id))
  await prisma.$transaction(
    order
      .filter((id) => owned.has(id))
      .map((id, index) => prisma.projectAsset.update({ where: { id }, data: { sortOrder: index + 1 } })),
  )
  return listProjectAssets(ownerId, projectId)
}

export async function deleteProjectAsset(ownerId: string, projectId: string, assetId: string): Promise<void> {
  await getOwnedProject(ownerId, projectId)
  const asset = await prisma.projectAsset.findFirst({ where: { id: assetId, projectId } })
  if (!asset) return
  await prisma.projectAsset.delete({ where: { id: asset.id } })
  await storage().delete(asset.storageKey)
}
