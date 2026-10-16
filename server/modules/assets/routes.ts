import { Router } from 'express'
import { reorderAssetsSchema, requestUploadSchema, updateAssetSchema } from '../../shared'
import { z } from 'zod'
import { asyncHandler, parseOrThrow, sendCreated, sendOk } from '../../lib/http'
import { currentUser, requireAuth } from '../../middleware/auth'
import {
  confirmUpload,
  deleteProjectAsset,
  listProjectAssets,
  reorderProjectAssets,
  requestUpload,
  updateProjectAsset,
} from './service'

export const assetsRouter = Router()

assetsRouter.use(requireAuth)

const confirmUploadSchema = z.object({
  storageKey: z.string().min(1),
  assetType: z.enum(['PHOTO', 'AUDIO', 'COVER']),
  url: z.string().min(1).max(1000),
  mimeType: z.string().min(3).max(100),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

assetsRouter.post(
  '/:projectId/assets/request-upload',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const input = parseOrThrow(requestUploadSchema, req.body)
    const ticket = await requestUpload(owner.id, req.params.projectId, input)
    sendOk(res, ticket)
  }),
)

assetsRouter.post(
  '/:projectId/assets/confirm',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const input = parseOrThrow(confirmUploadSchema, req.body)
    const asset = await confirmUpload(owner.id, req.params.projectId, input)
    sendCreated(res, asset)
  }),
)

assetsRouter.get(
  '/:projectId/assets',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    sendOk(res, await listProjectAssets(owner.id, req.params.projectId))
  }),
)

assetsRouter.patch(
  '/:projectId/assets/:assetId',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const input = parseOrThrow(updateAssetSchema, req.body)
    const asset = await updateProjectAsset(owner.id, req.params.projectId, req.params.assetId, input)
    sendOk(res, asset)
  }),
)

assetsRouter.post(
  '/:projectId/assets/reorder',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const input = parseOrThrow(reorderAssetsSchema, req.body)
    sendOk(res, await reorderProjectAssets(owner.id, req.params.projectId, input.order))
  }),
)

assetsRouter.delete(
  '/:projectId/assets/:assetId',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    await deleteProjectAsset(owner.id, req.params.projectId, req.params.assetId)
    sendOk(res, { ok: true })
  }),
)
