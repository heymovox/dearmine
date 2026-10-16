import { Router } from 'express'
import { asyncHandler, sendOk } from '../../lib/http'
import { gone, notFound } from '../../lib/errors'
import { prisma } from '../../db'
import { publicIdSchema } from '../../shared'
import type { RenderPayload } from '../../shared'

export const publicRouter = Router()

publicRouter.get(
  '/:publicId',
  asyncHandler(async (req, res) => {
    const parsed = publicIdSchema.safeParse(req.params.publicId)
    if (!parsed.success) throw notFound('This surprise could not be found')

    const page = await prisma.publishedPage.findUnique({
      where: { publicId: parsed.data },
      include: { project: { select: { templateId: true, deletedAt: true } } },
    })
    if (!page || page.project.deletedAt) throw notFound('This surprise could not be found')

    if (page.status === 'UNPUBLISHED') throw gone('This surprise is no longer available')

    const expired = page.status === 'EXPIRED' || (page.expiresAt != null && page.expiresAt.getTime() < Date.now())
    if (expired) {
      if (page.status !== 'EXPIRED') {
        await prisma.publishedPage.update({ where: { id: page.id }, data: { status: 'EXPIRED' } })
      }
      throw gone('This surprise has expired. Ask the sender to renew it to keep it online.')
    }

    const payload = page.snapshotJson as unknown as RenderPayload
    sendOk(res, {
      payload,
      publicId: page.publicId,
      publishedAt: page.publishedAt.toISOString(),
      expiresAt: page.expiresAt ? page.expiresAt.toISOString() : null,
      revision: page.publishedRevision,
    })
  }),
)
