import type { Prisma, Template } from '@prisma/client'
import { prisma } from '../../db'
import { notFound } from '../../lib/errors'

export type TemplateDTO = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string
  componentKey: string
  category: { id: string; name: string; slug: string }
  requiredPlan: string
  occasions: string[]
  supportedFields: string[]
  previewImage: string | null
  isFeatured: boolean
}

type TemplateWithCategory = Template & {
  category: { id: string; name: string; slug: string }
}

export function toTemplateDTO(template: TemplateWithCategory): TemplateDTO {
  return {
    id: template.id,
    slug: template.slug,
    name: template.name,
    tagline: template.tagline,
    description: template.description,
    componentKey: template.componentKey,
    category: {
      id: template.category.id,
      name: template.category.name,
      slug: template.category.slug,
    },
    requiredPlan: template.requiredPlan,
    occasions: (template.occasions as string[]) ?? [],
    supportedFields: (template.supportedFields as string[]) ?? [],
    previewImage: template.previewImage,
    isFeatured: template.isFeatured,
  }
}

export async function listTemplates(filters: {
  category?: string
  occasion?: string
  search?: string
  featured?: boolean
  includeUnpublished?: boolean
}): Promise<TemplateDTO[]> {
  const where: Prisma.TemplateWhereInput = {}
  if (!filters.includeUnpublished) where.isPublished = true
  if (filters.featured) where.isFeatured = true
  if (filters.category) where.category = { slug: filters.category }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tagline: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  if (filters.occasion) {
    where.AND = [{ occasions: { array_contains: [filters.occasion] } }]
  }

  const templates = await prisma.template.findMany({
    where,
    include: { category: true },
    orderBy: { sortOrder: 'asc' },
  })
  return templates.map(toTemplateDTO)
}

export async function getTemplateBySlug(slug: string): Promise<TemplateWithCategory> {
  const template = await prisma.template.findUnique({ where: { slug }, include: { category: true } })
  if (!template) throw notFound('Template not found')
  return template
}

export async function listCategories() {
  const categories = await prisma.templateCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { templates: { where: { isPublished: true } } } } },
  })
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    templateCount: c._count.templates,
  }))
}
