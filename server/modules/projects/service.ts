import type { Prisma, ProjectAsset, PublishedPage, SurpriseProject, Template } from '@prisma/client'
import { prisma } from '../../db'
import {
  defaultDesign,
  designConfigSchema,
  surpriseContentSchema,
  PLAN_SLUGS,
} from '../../shared'
import { badRequest, notFound, paymentRequired } from '../../lib/errors'
import { newPublicId } from '../../lib/ids'
import { storage } from '../../services/storage'
import type { DesignConfig, RenderAsset, RenderPayload, SurpriseContent } from '../../shared'

export type PlanSnapshot = {
  planSlug: string
  name: string
  pricePaise: number
  entitlement: {
    maxPhotos: number
    premiumTemplates: boolean
    music: boolean
    advancedAnimations: boolean
    hostingDays: number
    revisions: number
  }
  hostingDurationDays: number
}

const PLAN_RANK: Record<string, number> = { mini: 1, love: 2, forever: 3 }

export const projectInclude = {
  template: true,
  assets: { orderBy: { sortOrder: 'asc' as const } },
  publishedPage: true,
} satisfies Prisma.SurpriseProjectInclude

export type ProjectWithRelations = SurpriseProject & {
  template: Template
  assets: ProjectAsset[]
  publishedPage: PublishedPage | null
}

export type ProjectDTO = {
  id: string
  title: string
  occasion: string
  recipientName: string
  creatorName: string
  nickname: string
  occasionDate: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  template: {
    id: string
    slug: string
    name: string
    componentKey: string
    requiredPlan: string
    supportedFields: string[]
  }
  design: DesignConfig
  content: SurpriseContent
  assets: RenderAsset[]
  published: {
    publicId: string
    url: string
    status: 'ACTIVE' | 'EXPIRED' | 'UNPUBLISHED'
    publishedAt: string
    expiresAt: string | null
    revision: number
  } | null
  entitlement: {
    planSlug: string
    planName: string
    expiresAt: string | null
    maxPhotos: number
    music: boolean
    canPublish: boolean
  } | null
  createdAt: string
  updatedAt: string
}

function publicUrlFor(publicId: string): string {
  return `/s/${publicId}`
}

export function toRenderAsset(asset: ProjectAsset): RenderAsset {
  const type: RenderAsset['type'] =
    asset.assetType === 'AUDIO' ? 'AUDIO' : asset.assetType === 'COVER' ? 'COVER' : 'PHOTO'
  return { id: asset.id, type, url: asset.url, caption: asset.caption, sortOrder: asset.sortOrder }
}

export async function getActiveEntitlement(projectId: string) {
  const order = await prisma.order.findFirst({
    where: { projectId, status: 'PAID' },
    orderBy: { paidAt: 'desc' },
  })
  if (!order || !order.paidAt) return null
  const snapshot = order.planSnapshot as unknown as PlanSnapshot
  const expiresAt = new Date(order.paidAt.getTime() + snapshot.entitlement.hostingDays * 86_400_000)
  return { order, snapshot, expiresAt }
}

export function buildRenderPayload(project: ProjectWithRelations): RenderPayload {
  return {
    templateKey: project.template.componentKey,
    templateSlug: project.template.slug,
    content: project.contentJson as unknown as SurpriseContent,
    design: { ...defaultDesign(), ...(project.designConfigJson as unknown as DesignConfig) },
    assets: project.assets.map(toRenderAsset),
    meta: {
      title: project.projectTitle,
      recipientName: project.recipientName,
      creatorName: project.creatorName,
      nickname: project.nickname,
      occasion: project.occasion,
      occasionDate: project.occasionDate ? project.occasionDate.toISOString() : null,
    },
  }
}

export async function toProjectDTO(project: ProjectWithRelations): Promise<ProjectDTO> {
  const entitlement = await getActiveEntitlement(project.id)
  const page = project.publishedPage
  const design = { ...defaultDesign(), ...(project.designConfigJson as unknown as DesignConfig) }
  return {
    id: project.id,
    title: project.projectTitle,
    occasion: project.occasion,
    recipientName: project.recipientName,
    creatorName: project.creatorName,
    nickname: project.nickname,
    occasionDate: project.occasionDate ? project.occasionDate.toISOString() : null,
    status: project.status,
    template: {
      id: project.template.id,
      slug: project.template.slug,
      name: project.template.name,
      componentKey: project.template.componentKey,
      requiredPlan: project.template.requiredPlan,
      supportedFields: (project.template.supportedFields as string[]) ?? [],
    },
    design,
    content: project.contentJson as unknown as SurpriseContent,
    assets: project.assets.map(toRenderAsset),
    published: page
      ? {
          publicId: page.publicId,
          url: publicUrlFor(page.publicId),
          status: page.status,
          publishedAt: page.publishedAt.toISOString(),
          expiresAt: page.expiresAt ? page.expiresAt.toISOString() : null,
          revision: page.publishedRevision,
        }
      : null,
    entitlement: entitlement
      ? {
          planSlug: entitlement.snapshot.planSlug,
          planName: entitlement.snapshot.name,
          expiresAt: entitlement.expiresAt.toISOString(),
          maxPhotos: entitlement.snapshot.entitlement.maxPhotos,
          music: entitlement.snapshot.entitlement.music,
          canPublish: true,
        }
      : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }
}

/* -------------------------------------------------------------------------- */
/*  Ownership-safe loaders                                                     */
/* -------------------------------------------------------------------------- */

export async function getOwnedProject(ownerId: string, projectId: string): Promise<ProjectWithRelations> {
  const project = await prisma.surpriseProject.findFirst({
    where: { id: projectId, ownerId, deletedAt: null },
    include: projectInclude,
  })
  if (!project) throw notFound('Project not found')
  return project
}

export async function listProjects(
  ownerId: string,
  filters: { status?: string } = {},
): Promise<ProjectDTO[]> {
  const where: Prisma.SurpriseProjectWhereInput = { ownerId, deletedAt: null }
  if (filters.status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(filters.status)) {
    where.status = filters.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  }
  const projects = await prisma.surpriseProject.findMany({
    where,
    include: projectInclude,
    orderBy: { updatedAt: 'desc' },
  })
  return Promise.all(projects.map(toProjectDTO))
}

/* -------------------------------------------------------------------------- */
/*  Mutations                                                                  */
/* -------------------------------------------------------------------------- */

export async function createProject(
  ownerId: string,
  input: { templateId: string; occasion: string; projectTitle: string },
): Promise<ProjectWithRelations> {
  const template = await prisma.template.findUnique({ where: { id: input.templateId } })
  if (!template || !template.isPublished) throw badRequest('Choose an available template')

  const project = await prisma.surpriseProject.create({
    data: {
      ownerId,
      templateId: template.id,
      projectTitle: input.projectTitle,
      occasion: input.occasion as Prisma.SurpriseProjectCreateInput['occasion'],
      contentJson: {} as Prisma.InputJsonValue,
      designConfigJson: { ...defaultDesign(), palette: template.defaultConfiguration ? ((template.defaultConfiguration as Record<string, unknown>).palette as string) ?? 'midnight' : 'midnight' } as Prisma.InputJsonValue,
    },
    include: projectInclude,
  })
  return project
}

export async function updateProject(
  ownerId: string,
  projectId: string,
  input: {
    projectTitle?: string
    occasion?: string
    recipientName?: string
    creatorName?: string
    nickname?: string
    occasionDate?: string | null
    templateId?: string
    content?: Partial<SurpriseContent>
    design?: Partial<DesignConfig>
  },
): Promise<ProjectWithRelations> {
  const project = await getOwnedProject(ownerId, projectId)

  const data: Prisma.SurpriseProjectUpdateInput = {}
  if (input.projectTitle !== undefined) data.projectTitle = input.projectTitle
  if (input.occasion !== undefined) data.occasion = input.occasion as Prisma.SurpriseProjectUpdateInput['occasion']
  if (input.recipientName !== undefined) data.recipientName = input.recipientName
  if (input.creatorName !== undefined) data.creatorName = input.creatorName
  if (input.nickname !== undefined) data.nickname = input.nickname
  if (input.occasionDate !== undefined) {
    data.occasionDate = input.occasionDate ? new Date(input.occasionDate) : null
  }

  if (input.templateId !== undefined && input.templateId !== project.templateId) {
    const template = await prisma.template.findUnique({ where: { id: input.templateId } })
    if (!template || !template.isPublished) throw badRequest('Choose an available template')
    data.template = { connect: { id: template.id } }
  }

  if (input.content !== undefined) {
    const merged = { ...(project.contentJson as Record<string, unknown>), ...input.content }
    data.contentJson = surpriseContentSchema.parse(merged) as unknown as Prisma.InputJsonValue
  }
  if (input.design !== undefined) {
    const merged = { ...(project.designConfigJson as Record<string, unknown>), ...input.design }
    data.designConfigJson = designConfigSchema.parse(merged) as unknown as Prisma.InputJsonValue
  }

  return prisma.surpriseProject.update({ where: { id: project.id }, data, include: projectInclude })
}

export async function duplicateProject(ownerId: string, projectId: string): Promise<ProjectWithRelations> {
  const project = await getOwnedProject(ownerId, projectId)
  const copy = await prisma.surpriseProject.create({
    data: {
      ownerId,
      templateId: project.templateId,
      projectTitle: `${project.projectTitle} (copy)`,
      occasion: project.occasion,
      recipientName: project.recipientName,
      creatorName: project.creatorName,
      nickname: project.nickname,
      occasionDate: project.occasionDate,
      contentJson: project.contentJson as Prisma.InputJsonValue,
      designConfigJson: project.designConfigJson as Prisma.InputJsonValue,
      assets: {
        create: project.assets.map((a) => ({
          assetType: a.assetType,
          storageKey: a.storageKey,
          url: a.url,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          width: a.width,
          height: a.height,
          caption: a.caption,
          sortOrder: a.sortOrder,
        })),
      },
    },
    include: projectInclude,
  })
  return copy
}

export async function deleteProject(ownerId: string, projectId: string): Promise<void> {
  const project = await getOwnedProject(ownerId, projectId)
  await prisma.$transaction([
    prisma.publishedPage.updateMany({
      where: { projectId: project.id },
      data: { status: 'UNPUBLISHED', unpublishedAt: new Date() },
    }),
    prisma.surpriseProject.update({
      where: { id: project.id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    }),
  ])
  // Best-effort storage cleanup.
  await Promise.all(project.assets.map((a) => storage().delete(a.storageKey)))
}

/* -------------------------------------------------------------------------- */
/*  Entitlement checks                                                         */
/* -------------------------------------------------------------------------- */

function assertTemplateAllowed(snapshot: PlanSnapshot, template: Template): void {
  const purchasedRank = PLAN_RANK[snapshot.planSlug] ?? 0
  const requiredRank = PLAN_RANK[template.requiredPlan] ?? 1
  if (purchasedRank < requiredRank) {
    throw paymentRequired(
      `The "${template.name}" template needs the ${template.requiredPlan === 'forever' ? 'Forever Memories' : 'Love Edition'} plan or higher`,
    )
  }
}

export function checkPublishReadiness(project: ProjectWithRelations, snapshot: PlanSnapshot | null) {
  const problems: string[] = []
  if (!snapshot) {
    problems.push('A paid plan is required before publishing')
    return problems
  }
  if (!project.template.isPublished) problems.push('This template is no longer available')
  const purchasedRank = PLAN_RANK[snapshot.planSlug] ?? 0
  const requiredRank = PLAN_RANK[project.template.requiredPlan] ?? 1
  if (purchasedRank < requiredRank) problems.push('Your plan does not include this template')

  const photos = project.assets.filter((a) => a.assetType !== 'AUDIO')
  if (photos.length > snapshot.entitlement.maxPhotos) {
    problems.push(`Your plan allows up to ${snapshot.entitlement.maxPhotos} photos`)
  }
  const hasAudio = project.assets.some((a) => a.assetType === 'AUDIO')
  if (hasAudio && !snapshot.entitlement.music) problems.push('Background music requires the Love Edition plan or higher')

  const content = project.contentJson as unknown as SurpriseContent
  const hasName = project.recipientName || project.nickname || content.title
  if (!hasName) problems.push('Add your partner’s name or a title before publishing')
  return problems
}

/* -------------------------------------------------------------------------- */
/*  Publish / unpublish                                                        */
/* -------------------------------------------------------------------------- */

export async function publishProject(
  ownerId: string,
  projectId: string,
): Promise<{ publicId: string; url: string; expiresAt: string | null; projectTitle: string }> {
  const project = await getOwnedProject(ownerId, projectId)
  const entitlement = await getActiveEntitlement(project.id)
  if (!entitlement) throw paymentRequired('Purchase a plan before publishing your surprise')

  assertTemplateAllowed(entitlement.snapshot, project.template)
  const problems = checkPublishReadiness(project, entitlement.snapshot)
  if (problems.length) throw badRequest(problems[0]!)

  const payload = buildRenderPayload(project)
  const snapshotJson = payload as unknown as Prisma.InputJsonValue

  const existing = project.publishedPage
  const expiresAt = entitlement.expiresAt

  if (existing) {
    const updated = await prisma.publishedPage.update({
      where: { id: existing.id },
      data: {
        snapshotJson,
        status: 'ACTIVE',
        expiresAt,
        unpublishedAt: null,
        publishedRevision: existing.publishedRevision + 1,
      },
    })
    return { publicId: updated.publicId, url: publicUrlFor(updated.publicId), expiresAt: expiresAt.toISOString(), projectTitle: project.projectTitle }
  }

  // Generate a unique, non-sequential public id.
  let publicId = newPublicId()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clash = await prisma.publishedPage.findUnique({ where: { publicId } })
    if (!clash) break
    publicId = newPublicId()
  }

  const page = await prisma.$transaction(async (tx) => {
    const created = await tx.publishedPage.create({
      data: {
        projectId: project.id,
        publicId,
        snapshotJson,
        status: 'ACTIVE',
        expiresAt,
        publishedRevision: 1,
      },
    })
    await tx.surpriseProject.update({ where: { id: project.id }, data: { status: 'PUBLISHED' } })
    return created
  })

  return { publicId: page.publicId, url: publicUrlFor(page.publicId), expiresAt: expiresAt.toISOString(), projectTitle: project.projectTitle }
}

export async function unpublishProject(ownerId: string, projectId: string): Promise<void> {
  const project = await getOwnedProject(ownerId, projectId)
  await prisma.$transaction([
    prisma.publishedPage.updateMany({
      where: { projectId: project.id },
      data: { status: 'UNPUBLISHED', unpublishedAt: new Date() },
    }),
    prisma.surpriseProject.update({ where: { id: project.id }, data: { status: 'DRAFT' } }),
  ])
}

export { PLAN_RANK, PLAN_SLUGS }
