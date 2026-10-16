import { z } from 'zod'
import { CONTENT_FIELDS, FONT_OPTIONS, OCCASION_KEYS, PALETTES, PLAN_SLUGS } from './constants'

/* -------------------------------------------------------------------------- */
/*  Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
})

export const forgotPasswordSchema = z.object({ email: emailSchema })

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Enter your password to confirm'),
})

/* -------------------------------------------------------------------------- */
/*  Personalization content                                                    */
/* -------------------------------------------------------------------------- */

const shortText = z.string().trim().max(220)
const longText = z.string().trim().max(6000)

export const timelineItemSchema = z.object({
  date: z.string().trim().max(60).default(''),
  title: z.string().trim().max(120).default(''),
  description: z.string().trim().max(500).default(''),
})

export const promiseSchema = z.object({
  title: z.string().trim().max(120).default(''),
  body: z.string().trim().max(400).default(''),
})

export const quizItemSchema = z.object({
  question: z.string().trim().max(240).default(''),
  options: z.array(z.string().trim().max(120)).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3).default(0),
})

export const couponSchema = z.object({
  title: z.string().trim().max(120).default(''),
  description: z.string().trim().max(240).default(''),
})

export const storyPanelSchema = z.object({
  caption: z.string().trim().max(300).default(''),
})

export const choiceSchema = z.object({
  label: z.string().trim().max(80).default(''),
  message: z.string().trim().max(600).default(''),
})

export const surpriseContentSchema = z.object({
  title: shortText.default(''),
  openingMessage: shortText.default(''),
  mainMessage: longText.default(''),
  letter: longText.default(''),
  finalMessage: longText.default(''),
  signature: shortText.default(''),
  secretMessage: shortText.default(''),
  timeline: z.array(timelineItemSchema).max(12).default([]),
  promises: z.array(promiseSchema).max(12).default([]),
  quiz: z.array(quizItemSchema).max(10).default([]),
  coupons: z.array(couponSchema).max(12).default([]),
  storyPanels: z.array(storyPanelSchema).max(12).default([]),
  choices: z.array(choiceSchema).max(4).default([]),
})

export type SurpriseContent = z.infer<typeof surpriseContentSchema>

export const designConfigSchema = z.object({
  palette: z.enum(PALETTES.map((p) => p.id) as [string, ...string[]]).default('midnight'),
  font: z.enum(FONT_OPTIONS.map((f) => f.id) as [string, ...string[]]).default('cormorant'),
  animation: z.enum(['subtle', 'balanced', 'cinematic']).default('balanced'),
  coverPhotoId: z.string().max(60).nullable().default(null),
  sections: z.record(z.enum(CONTENT_FIELDS as unknown as [string, ...string[]]), z.boolean()).default({}),
})

export type DesignConfig = z.infer<typeof designConfigSchema>

/* -------------------------------------------------------------------------- */
/*  Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const occasionEnum = z.enum(OCCASION_KEYS as [string, ...string[]])

export const createProjectSchema = z.object({
  templateId: z.string().min(1),
  occasion: occasionEnum.default('BIRTHDAY'),
  projectTitle: z.string().trim().max(120).default('My surprise'),
})

export const updateProjectSchema = z.object({
  projectTitle: z.string().trim().max(120).optional(),
  occasion: occasionEnum.optional(),
  recipientName: z.string().trim().max(80).optional(),
  creatorName: z.string().trim().max(80).optional(),
  nickname: z.string().trim().max(80).optional(),
  occasionDate: z.string().datetime().nullable().optional(),
  templateId: z.string().min(1).optional(),
  content: surpriseContentSchema.partial().optional(),
  design: designConfigSchema.partial().optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

/* -------------------------------------------------------------------------- */
/*  Assets                                                                     */
/* -------------------------------------------------------------------------- */

export const assetTypeEnum = z.enum(['PHOTO', 'AUDIO', 'COVER'])

export const requestUploadSchema = z.object({
  assetType: assetTypeEnum,
  filename: z.string().trim().min(1).max(200),
  mimeType: z.string().trim().min(3).max(100),
  sizeBytes: z.number().int().positive(),
})

export const updateAssetSchema = z.object({
  caption: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

export const reorderAssetsSchema = z.object({
  order: z.array(z.string().min(1)).max(200),
})

/* -------------------------------------------------------------------------- */
/*  Orders & payments                                                          */
/* -------------------------------------------------------------------------- */

export const createOrderSchema = z.object({
  projectId: z.string().min(1),
  planSlug: z.enum(PLAN_SLUGS as unknown as [string, ...string[]]),
  couponCode: z.string().trim().max(40).optional(),
})

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  providerOrderId: z.string().min(1),
  providerPaymentId: z.string().min(1),
  signature: z.string().min(1),
})

export const mockPaySchema = z.object({
  orderId: z.string().min(1),
})

/* -------------------------------------------------------------------------- */
/*  Public pages                                                               */
/* -------------------------------------------------------------------------- */

export const publicIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10,64}$/, 'Invalid link')

/* -------------------------------------------------------------------------- */
/*  Support                                                                    */
/* -------------------------------------------------------------------------- */

export const supportRequestSchema = z.object({
  name: z.string().trim().max(80).default(''),
  email: emailSchema,
  subject: z.string().trim().min(3).max(140),
  message: z.string().trim().min(10).max(4000),
})

/* -------------------------------------------------------------------------- */
/*  Admin                                                                      */
/* -------------------------------------------------------------------------- */

export const adminTemplateUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(600).optional(),
  tagline: z.string().trim().max(200).optional(),
  previewImage: z.string().trim().max(500).nullable().optional(),
  requiredPlan: z.string().trim().min(1).max(40).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  categoryId: z.string().min(1).optional(),
})

export const adminPlanUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(400).optional(),
  pricePaise: z.number().int().min(0).max(100_000_000).optional(),
  hostingDurationDays: z.number().int().min(1).max(3650).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  features: z.array(z.string().trim().max(160)).max(20).optional(),
})

export const couponInputSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(40),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().int().min(1).max(100_000_00),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  usageLimit: z.number().int().min(1).max(1_000_000).nullable().optional(),
  perUserLimit: z.number().int().min(1).max(1000).default(1),
  isActive: z.boolean().default(true),
})

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  planSlug: z.enum(PLAN_SLUGS as unknown as [string, ...string[]]),
})
