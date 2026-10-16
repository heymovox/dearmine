/** React Query hooks for every read the web app performs. */
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { api } from './client'
import type {
  AdminOrderRow,
  AdminProjectRow,
  AdminStats,
  AdminSupportRow,
  AdminTemplateRow,
  AdminUserRow,
  AuditLogRow,
  CategoryDTO,
  CouponRow,
  OrderDTO,
  Paginated,
  PlanRow,
  ProjectDTO,
  PublicPageResponse,
  SupportRequestDTO,
  TemplateDTO,
} from './types'

export function useCategories(): UseQueryResult<CategoryDTO[]> {
  return useQuery({
    queryKey: ['templates', 'categories'],
    queryFn: () => api.get<CategoryDTO[]>('/templates/categories'),
    staleTime: 5 * 60_000,
  })
}

export function useTemplates(filters: {
  category?: string
  occasion?: string
  search?: string
  featured?: boolean
} = {}): UseQueryResult<TemplateDTO[]> {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.occasion) params.set('occasion', filters.occasion)
  if (filters.search) params.set('search', filters.search)
  if (filters.featured) params.set('featured', 'true')
  const qs = params.toString()
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => api.get<TemplateDTO[]>(`/templates${qs ? `?${qs}` : ''}`),
    staleTime: 60_000,
  })
}

export function useTemplate(slug: string | undefined): UseQueryResult<TemplateDTO> {
  return useQuery({
    queryKey: ['templates', 'detail', slug],
    queryFn: () => api.get<TemplateDTO>(`/templates/${slug}`),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  })
}

export function usePlans(): UseQueryResult<PlanRow[]> {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get<PlanRow[]>('/plans'),
    staleTime: 5 * 60_000,
  })
}

export function useProjects(): UseQueryResult<ProjectDTO[]> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<ProjectDTO[]>('/projects'),
  })
}

export function useProject(id: string | undefined): UseQueryResult<ProjectDTO> {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get<ProjectDTO>(`/projects/${id}`),
    enabled: Boolean(id),
  })
}

export function useOrders(): UseQueryResult<OrderDTO[]> {
  return useQuery({ queryKey: ['orders'], queryFn: () => api.get<OrderDTO[]>('/orders') })
}

export function usePublicPage(
  publicId: string | undefined,
): UseQueryResult<PublicPageResponse, Error> {
  return useQuery({
    queryKey: ['public', publicId],
    queryFn: () => api.get<PublicPageResponse>(`/public/${publicId}`),
    enabled: Boolean(publicId),
    retry: false,
    staleTime: 30_000,
  })
}

export function useSupportRequests(): UseQueryResult<SupportRequestDTO[]> {
  return useQuery({ queryKey: ['support'], queryFn: () => api.get<SupportRequestDTO[]>('/support') })
}

/* --------------------------------- admin --------------------------------- */

export function useAdminStats(): UseQueryResult<AdminStats> {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api.get<AdminStats>('/admin/stats') })
}

export function useAdminUsers(page = 1, search = ''): UseQueryResult<Paginated<AdminUserRow>> {
  const qs = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) qs.set('search', search)
  return useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => api.get<Paginated<AdminUserRow>>(`/admin/users?${qs}`),
  })
}

export function useAdminOrders(page = 1): UseQueryResult<Paginated<AdminOrderRow>> {
  return useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => api.get<Paginated<AdminOrderRow>>(`/admin/orders?page=${page}&limit=20`),
  })
}

export function useAdminTemplates(): UseQueryResult<AdminTemplateRow[]> {
  return useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: () => api.get<AdminTemplateRow[]>('/admin/templates'),
  })
}

export function useAdminPlans(): UseQueryResult<PlanRow[]> {
  return useQuery({ queryKey: ['admin', 'plans'], queryFn: () => api.get<PlanRow[]>('/admin/plans') })
}

export function useAdminCoupons(): UseQueryResult<CouponRow[]> {
  return useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => api.get<CouponRow[]>('/admin/coupons') })
}

export function useAdminProjects(page = 1, search = ''): UseQueryResult<Paginated<AdminProjectRow>> {
  const qs = new URLSearchParams({ page: String(page), limit: '20' })
  if (search) qs.set('search', search)
  return useQuery({
    queryKey: ['admin', 'projects', page, search],
    queryFn: () => api.get<Paginated<AdminProjectRow>>(`/admin/projects?${qs}`),
  })
}

export function useAdminSupport(): UseQueryResult<AdminSupportRow[]> {
  return useQuery({ queryKey: ['admin', 'support'], queryFn: () => api.get<AdminSupportRow[]>('/admin/support') })
}

export function useAdminAudit(page = 1): UseQueryResult<Paginated<AuditLogRow>> {
  return useQuery({
    queryKey: ['admin', 'audit', page],
    queryFn: () => api.get<Paginated<AuditLogRow>>(`/admin/audit?page=${page}&limit=30`),
  })
}
