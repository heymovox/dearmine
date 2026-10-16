/**
 * Seeds the database with:
 *  - 4 template categories + 40 templates (from the isomorphic catalog)
 *  - 3 pricing plans (from the shared plan table)
 *  - a WELCOME10 coupon
 *  - an admin account when ADMIN_EMAIL is set
 *
 * Idempotent: every record is upserted by its stable slug.
 * Run with: npm run db:seed
 */
import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PLANS, TEMPLATE_CATEGORIES, TEMPLATE_CATALOG } from '../src/shared'

const prisma = new PrismaClient()

async function seedCategories() {
  const bySlug = new Map<string, string>()
  for (const category of TEMPLATE_CATEGORIES) {
    const row = await prisma.templateCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder: category.sortOrder },
      create: { name: category.name, slug: category.slug, description: category.description, sortOrder: category.sortOrder },
    })
    bySlug.set(category.slug, row.id)
  }
  return bySlug
}

async function seedTemplates(categoryIds: Map<string, string>) {
  let created = 0
  for (const template of TEMPLATE_CATALOG) {
    const categoryId = categoryIds.get(template.category)
    if (!categoryId) throw new Error(`Missing category ${template.category} for template ${template.slug}`)
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        description: template.description,
        tagline: template.tagline,
        componentKey: template.componentKey,
        supportedFields: template.supportedFields,
        defaultConfiguration: {
          palette: template.palette,
          animation: template.animation,
          sections: template.sections,
        },
        requiredPlan: template.requiredPlan,
        occasions: template.occasions,
        isFeatured: template.isFeatured,
        isPublished: true,
        sortOrder: template.sortOrder,
        categoryId,
      },
      create: {
        slug: template.slug,
        name: template.name,
        description: template.description,
        tagline: template.tagline,
        componentKey: template.componentKey,
        supportedFields: template.supportedFields,
        defaultConfiguration: {
          palette: template.palette,
          animation: template.animation,
          sections: template.sections,
        },
        requiredPlan: template.requiredPlan,
        occasions: template.occasions,
        isFeatured: template.isFeatured,
        isPublished: true,
        sortOrder: template.sortOrder,
        categoryId,
      },
    })
    created += 1
  }
  return created
}

async function seedPlans() {
  for (const plan of PLANS) {
    await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        pricePaise: plan.pricePaise,
        featuresJson: plan.features,
        entitlementJson: plan.entitlement,
        hostingDurationDays: plan.hostingDurationDays,
        isFeatured: plan.isFeatured,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        pricePaise: plan.pricePaise,
        currency: 'INR',
        featuresJson: plan.features,
        entitlementJson: plan.entitlement,
        hostingDurationDays: plan.hostingDurationDays,
        isFeatured: plan.isFeatured,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
    })
  }
}

async function seedCoupon() {
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: { discountType: 'PERCENT', discountValue: 10, isActive: true },
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENT',
      discountValue: 10,
      perUserLimit: 1,
      isActive: true,
    },
  })
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!email) {
    console.log('[seed] ADMIN_EMAIL not set — skipping admin account')
    return null
  }
  const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', deletedAt: null },
    create: {
      email,
      name: process.env.ADMIN_NAME ?? 'Dearmine Admin',
      passwordHash,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  })
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`\n[seed] Generated admin password for ${email} (set ADMIN_PASSWORD to pin it):`)
    console.log(`       ${password}\n`)
  }
  return user
}

async function main() {
  console.log('[seed] starting…')
  const categoryIds = await seedCategories()
  const templates = await seedTemplates(categoryIds)
  await seedPlans()
  await seedCoupon()
  await seedAdmin()
  console.log(`[seed] categories=${categoryIds.size} templates=${templates} plans=${PLANS.length} coupons=1`)
}

main()
  .catch((error) => {
    console.error('[seed] failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
