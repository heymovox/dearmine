import { promises as fs } from 'node:fs'
import path from 'node:path'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../env'
import { badRequest } from '../lib/errors'
import { buildObjectKey } from '../lib/ids'

export type UploadTicket = {
  storageKey: string
  publicUrl: string
  uploadUrl: string
  method: 'PUT'
  headers: Record<string, string>
  provider: 'local' | 'r2'
}

export interface StorageProvider {
  readonly name: 'local' | 'r2'
  createUpload(input: { prefix: string; filename: string; mimeType: string }): Promise<UploadTicket>
  publicUrl(storageKey: string): string
  delete(storageKey: string): Promise<void>
}

/* -------------------------------------------------------------------------- */
/*  Local (development-only) provider                                          */
/* -------------------------------------------------------------------------- */

export const LOCAL_UPLOAD_ROOT = path.resolve(process.cwd(), 'server', 'uploads')

/** In-memory registry of authorized (dev-only) local uploads. */
const pendingUploads = new Map<string, { mimeType: string; expiresAt: number }>()

function registerPendingUpload(key: string, mimeType: string) {
  pendingUploads.set(key, { mimeType, expiresAt: Date.now() + 10 * 60 * 1000 })
}

export function consumePendingUpload(key: string): { mimeType: string } | null {
  const entry = pendingUploads.get(key)
  if (!entry) return null
  pendingUploads.delete(key)
  if (entry.expiresAt < Date.now()) return null
  return { mimeType: entry.mimeType }
}

class LocalStorage implements StorageProvider {
  readonly name = 'local' as const

  async createUpload(input: { prefix: string; filename: string; mimeType: string }): Promise<UploadTicket> {
    const storageKey = buildObjectKey(input.prefix, input.filename)
    registerPendingUpload(storageKey, input.mimeType)
    return {
      storageKey,
      publicUrl: this.publicUrl(storageKey),
      uploadUrl: `${env.API_BASE_URL}/api/v1/uploads/local?key=${encodeURIComponent(storageKey)}`,
      method: 'PUT',
      headers: { 'Content-Type': input.mimeType },
      provider: 'local',
    }
  }

  publicUrl(storageKey: string): string {
    return `${env.PUBLIC_ASSET_BASE_URL.replace(/\/$/, '')}/${storageKey}`
  }

  /** Resolve a storage key to an absolute path, refusing traversal. */
  resolvePath(storageKey: string): string {
    const target = path.resolve(LOCAL_UPLOAD_ROOT, storageKey)
    if (!target.startsWith(LOCAL_UPLOAD_ROOT)) throw badRequest('Invalid storage key')
    return target
  }

  async put(storageKey: string, data: Buffer): Promise<void> {
    const target = this.resolvePath(storageKey)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, data)
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await fs.unlink(this.resolvePath(storageKey))
    } catch {
      // Already gone — deletion is best effort.
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Cloudflare R2 provider (S3-compatible)                                     */
/* -------------------------------------------------------------------------- */

class R2Storage implements StorageProvider {
  readonly name = 'r2' as const
  private client: S3Client
  private bucket: string

  constructor() {
    this.bucket = env.R2_BUCKET
    this.client = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  }

  async createUpload(input: { prefix: string; filename: string; mimeType: string }): Promise<UploadTicket> {
    const storageKey = buildObjectKey(input.prefix, input.filename)
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: input.mimeType,
    })
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 600 })
    return {
      storageKey,
      publicUrl: this.publicUrl(storageKey),
      uploadUrl,
      method: 'PUT',
      headers: { 'Content-Type': input.mimeType },
      provider: 'r2',
    }
  }

  publicUrl(storageKey: string): string {
    return `${env.PUBLIC_ASSET_BASE_URL.replace(/\/$/, '')}/${storageKey}`
  }

  async delete(storageKey: string): Promise<void> {
    await this.client
      .send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }))
      .catch(() => undefined)
  }
}

/* -------------------------------------------------------------------------- */

let instance: StorageProvider | null = null

export function storage(): StorageProvider {
  if (!instance) {
    instance = env.STORAGE_PROVIDER === 'r2' ? new R2Storage() : new LocalStorage()
    if (env.NODE_ENV === 'production' && instance.name === 'local') {
      console.warn('[storage] Using local disk storage in production is not recommended. Configure R2.')
    }
  }
  return instance
}

export function localUploadPut(storageKey: string, data: Buffer): Promise<void> {
  const provider = storage()
  if (!(provider instanceof LocalStorage)) {
    throw badRequest('Local uploads are not available with the configured storage provider')
  }
  return provider.put(storageKey, data)
}
