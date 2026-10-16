import { Router } from 'express'
import { createProjectSchema, updateProjectSchema } from '../../shared'
import { asyncHandler, parseOrThrow, sendOk, sendCreated } from '../../lib/http'
import { env } from '../../env'
import { currentUser, requireAuth } from '../../middleware/auth'
import { recordAudit } from '../../services/audit'
import { sendPublishConfirmation } from '../../services/mail'
import {
  buildRenderPayload,
  createProject,
  deleteProject,
  duplicateProject,
  getActiveEntitlement,
  getOwnedProject,
  listProjects,
  publishProject,
  toProjectDTO,
  unpublishProject,
  updateProject,
} from './service'

export const projectsRouter = Router()

projectsRouter.use(requireAuth)

projectsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const projects = await listProjects(owner.id, {
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
    })
    sendOk(res, projects)
  }),
)

projectsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const input = parseOrThrow(createProjectSchema, req.body)
    const project = await createProject(owner.id, input)
    await recordAudit({
      actorId: owner.id,
      action: 'project.create',
      entityType: 'SurpriseProject',
      entityId: project.id,
    })
    sendCreated(res, await toProjectDTO(project))
  }),
)

projectsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const project = await getOwnedProject(owner.id, req.params.id)
    sendOk(res, await toProjectDTO(project))
  }),
)

projectsRouter.get(
  '/:id/preview',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const project = await getOwnedProject(owner.id, req.params.id)
    const entitlement = await getActiveEntitlement(project.id)
    sendOk(res, {
      payload: buildRenderPayload(project),
      canPublish: Boolean(entitlement),
      entitlement: entitlement
        ? {
            planSlug: entitlement.snapshot.planSlug,
            expiresAt: entitlement.expiresAt.toISOString(),
          }
        : null,
    })
  }),
)

projectsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const input = parseOrThrow(updateProjectSchema, req.body)
    const project = await updateProject(owner.id, req.params.id, input)
    sendOk(res, await toProjectDTO(project))
  }),
)

projectsRouter.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const copy = await duplicateProject(owner.id, req.params.id)
    await recordAudit({
      actorId: owner.id,
      action: 'project.duplicate',
      entityType: 'SurpriseProject',
      entityId: copy.id,
      metadata: { from: req.params.id },
    })
    sendCreated(res, await toProjectDTO(copy))
  }),
)

projectsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    await deleteProject(owner.id, req.params.id)
    await recordAudit({
      actorId: owner.id,
      action: 'project.delete',
      entityType: 'SurpriseProject',
      entityId: req.params.id,
    })
    sendOk(res, { ok: true })
  }),
)

projectsRouter.post(
  '/:id/publish',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    const result = await publishProject(owner.id, req.params.id)
    await recordAudit({
      actorId: owner.id,
      action: 'project.publish',
      entityType: 'SurpriseProject',
      entityId: req.params.id,
      metadata: { publicId: result.publicId },
    })
    void sendPublishConfirmation(owner.email, result.projectTitle, `${env.PUBLIC_SITE_URL.replace(/\/$/, '')}${result.url}`).catch(
      () => undefined,
    )
    sendOk(res, result)
  }),
)

projectsRouter.post(
  '/:id/unpublish',
  asyncHandler(async (req, res) => {
    const owner = currentUser(req)
    await unpublishProject(owner.id, req.params.id)
    await recordAudit({
      actorId: owner.id,
      action: 'project.unpublish',
      entityType: 'SurpriseProject',
      entityId: req.params.id,
    })
    sendOk(res, { ok: true })
  }),
)
