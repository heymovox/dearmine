/** Client-side mirrors of the API's serialized DTOs. */
import type { DesignConfig, RenderAsset, RenderPayload, SurpriseContent } from '../shared'

export type PublicUser = {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  emailVerified: boolean
  createdAt: string
}

export type CategoryDTO = {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  templateCount: number
}

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

export type PlanEntitlement = {
  maxPhotos: number
  premiumTemplates: boolean
  music: boolean
  advancedAnimations: boolean
  hostingDays: number
  revisions: number
}

/** Public plan shape returned by GET /plans. */
export type PublicPlanDTO = {
  id: string
  slug: string
  name: string
  description: string
  pricePaise: number
  currency: string
  features: string[]
  entitlement: PlanEntitlement
  hostingDurationDays: number
  isFeatured: boolean
}

/** Raw plan row returned by GET /admin/plans. */
export type PlanRow = {
  id: string
  slug: string
  name: string
  description: string
  pricePaise: number
  currency: string
  featuresJson: string[]
  entitlementJson: PlanEntitlement
  hostingDurationDays: number
  isFeatured: boolean
  sortOrder: number
  isActive: boolean
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

export type OrderDTO = {
  id: string
  projectId: string
  plan: { slug: string; name: string }
  provider: string
  status: string
  subtotalPaise: number
  discountAmountPaise: number
  amountPaise: number
  currency: string
  couponCode: string | null
  createdAt: string
  paidAt: string | null
}

export type CheckoutInfo = {
  provider: string
  providerOrderId: string
  amountPaise: number
  currency: string
  publicKey: string | null
  isMock: boolean
}

export type CreateOrderResult = { order: OrderDTO; checkout: CheckoutInfo }

export type PublicPageResponse = {
  payload: RenderPayload
  publicId: string
  publishedAt: string
  expiresAt: string | null
  revision: number
}

export type UploadTicket = {
  storageKey: string
  publicUrl: string
  uploadUrl: string
  method: 'PUT'
  headers: Record<string, string>
  provider: 'local' | 'r2'
}

/** What the API returns after confirming an upload (same shape as a RenderAsset). */
export type UploadedAsset = RenderAsset

export type SupportRequestDTO = {
  id: string
  subject: string
  message: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
}

export type SupportSubmitResult = {
  id: string
  status: string
  supportEmail: string
}

export type AdminStats = {
  users: number
  projects: number
  activePublicPages: number
  orders: { total: number; paid: number }
  revenuePaise: number
  openSupport: number
  recentOrders: Array<{
    id: string
    plan: string
    amountPaise: number
    status: string
    customer: string
    email: string
    createdAt: string
  }>
  recentSupport: Array<{
    id: string
    subject: string
    email: string
    status: string
    createdAt: string
  }>
}

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  emailVerifiedAt: string | null
  createdAt: string
  deletedAt: string | null
  _count: { projects: number; orders: number }
}

export type AdminOrderRow = {
  id: string
  status: string
  provider: string
  amountPaise: number
  discountAmountPaise: number
  plan: string
  planSlug: string
  customer: string
  email: string
  projectTitle: string
  providerPaymentId: string | null
  createdAt: string
  paidAt: string | null
}

export type AdminTemplateRow = {
  id: string
  slug: string
  name: string
  categoryId: string
  description: string
  tagline: string | null
  previewImage: string | null
  componentKey: string
  supportedFields: string[]
  defaultConfiguration: unknown
  requiredPlan: string
  occasions: string[]
  isPublished: boolean
  isFeatured: boolean
  sortOrder: number
  category: CategoryDTO
}

export type AdminProjectRow = {
  id: string
  title: string
  occasion: string
  status: string
  owner: string
  email: string
  template: string
  published: { publicId: string; status: string; expiresAt: string | null } | null
  updatedAt: string
}

export type AdminSupportRow = {
  id: string
  userId: string | null
  name: string
  email: string
  subject: string
  message: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  user: { name: string; email: string } | null
}

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number }

export type AuditLogRow = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  actorId: string | null
  metadata: unknown
  createdAt: string
  actor: { name: string; email: string } | null
}

export type CouponRow = {
  id: string
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  startsAt: string | null
  expiresAt: string | null
  usageLimit: number | null
  perUserLimit: number
  usedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
