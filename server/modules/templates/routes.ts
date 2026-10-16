import { Router } from 'express'
import { asyncHandler, sendOk } from '../../lib/http'
import { getTemplateBySlug, listCategories, listTemplates, toTemplateDTO } from './service'

export const templatesRouter = Router()

templatesRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    sendOk(res, await listCategories())
  }),
)

templatesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const templates = await listTemplates({
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      occasion: typeof req.query.occasion === 'string' ? req.query.occasion : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      featured: req.query.featured === 'true',
    })
    sendOk(res, templates)
  }),
)

templatesRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const template = await getTemplateBySlug(req.params.slug)
    sendOk(res, toTemplateDTO(template))
  }),
)
