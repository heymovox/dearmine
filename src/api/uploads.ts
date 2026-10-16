/** Asset upload flow: request a ticket, PUT the bytes, then confirm. */
import { api, ApiError } from './client'
import type { UploadedAsset, UploadTicket } from './types'

async function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return null
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => resolve(null)
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function uploadProjectAsset(
  projectId: string,
  file: File,
  assetType: 'PHOTO' | 'AUDIO' | 'COVER' = 'PHOTO',
): Promise<UploadedAsset> {
  const ticket = await api.post<UploadTicket>(`/projects/${projectId}/assets/request-upload`, {
    assetType,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  })

  const putRes = await fetch(ticket.uploadUrl, {
    method: ticket.method,
    headers: ticket.headers,
    body: file,
    // Local (development) uploads are authenticated with the session cookie.
    credentials: ticket.provider === 'local' ? 'include' : 'omit',
  })
  if (!putRes.ok) {
    throw new ApiError(putRes.status, { code: 'UPLOAD_FAILED', message: 'Upload failed. Please try again.' })
  }

  const size = await readImageSize(file)
  return api.post<UploadedAsset>(`/projects/${projectId}/assets/confirm`, {
    storageKey: ticket.storageKey,
    assetType,
    url: ticket.publicUrl,
    mimeType: file.type,
    sizeBytes: file.size,
    width: size?.width,
    height: size?.height,
  })
}

export function deleteProjectAsset(projectId: string, assetId: string) {
  return api.del<{ ok: true }>(`/projects/${projectId}/assets/${assetId}`)
}

export function updateProjectAsset(projectId: string, assetId: string, input: { caption?: string }) {
  return api.patch<UploadedAsset>(`/projects/${projectId}/assets/${assetId}`, input)
}

export function reorderProjectAssets(projectId: string, order: string[]) {
  return api.post<UploadedAsset[]>(`/projects/${projectId}/assets/reorder`, { order })
}
