import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { DashboardLayout, PublicLayout } from './app/layouts'
import { RedirectIfAuthed, RequireAdmin, RequireAuth } from './app/guards'
import { AdminLayout } from './app/admin/AdminLayout'
import { Spinner } from './app/ui'
import LandingPage from './app/pages/LandingPage'

/* Route-level code splitting keeps the initial bundle small; the heavier
 * pieces (template engine, editor, admin) load on demand. */
const ExperienceDemo = lazy(() => import('./app/ExperienceDemo'))
const ProjectEditorPage = lazy(() => import('./app/pages/ProjectEditorPage'))
const CheckoutPage = lazy(() => import('./app/pages/CheckoutPage'))
const PublicSurprisePage = lazy(() => import('./app/pages/PublicSurprisePage'))
const TemplatesPage = lazy(() => import('./app/pages/TemplatesPage'))
const TemplateDetailPage = lazy(() => import('./app/pages/TemplateDetailPage'))
const PricingPage = lazy(() => import('./app/pages/PricingPage'))
const HowItWorksPage = lazy(() => import('./app/pages/HowItWorksPage'))
const SupportPage = lazy(() => import('./app/pages/SupportPage'))
const LoginPage = lazy(() => import('./app/pages/LoginPage'))
const RegisterPage = lazy(() => import('./app/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./app/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./app/pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./app/pages/VerifyEmailPage'))
const NotFoundPage = lazy(() => import('./app/pages/NotFoundPage'))
const DashboardOverviewPage = lazy(() => import('./app/pages/DashboardOverviewPage'))
const ProjectsPage = lazy(() => import('./app/pages/ProjectsPage'))
const OrdersPage = lazy(() => import('./app/pages/OrdersPage'))
const AccountPage = lazy(() => import('./app/pages/AccountPage'))
const AdminOverviewPage = lazy(() => import('./app/admin/AdminOverviewPage'))
const AdminUsersPage = lazy(() => import('./app/admin/AdminUsersPage'))
const AdminProjectsPage = lazy(() => import('./app/admin/AdminProjectsPage'))
const AdminOrdersPage = lazy(() => import('./app/admin/AdminOrdersPage'))
const AdminTemplatesPage = lazy(() => import('./app/admin/AdminTemplatesPage'))
const AdminPlansPage = lazy(() => import('./app/admin/AdminPlansPage'))
const AdminCouponsPage = lazy(() => import('./app/admin/AdminCouponsPage'))
const AdminSupportPage = lazy(() => import('./app/admin/AdminSupportPage'))
const AdminAuditPage = lazy(() => import('./app/admin/AdminAuditPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label="Loading…" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Standalone, full-bleed pages */}
        <Route path="/s/:publicId" element={<PublicSurprisePage />} />
        <Route path="/demo" element={<ExperienceDemo />} />
        <Route
          path="/editor/:projectId"
          element={
            <RequireAuth>
              <ProjectEditorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/:orderId"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />

        {/* Public marketing + auth */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/:slug" element={<TemplateDetailPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route
            path="login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="register"
            element={
              <RedirectIfAuthed>
                <RegisterPage />
              </RedirectIfAuthed>
            }
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Authenticated dashboard */}
        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardOverviewPage />} />
          <Route path="/dashboard/projects" element={<ProjectsPage />} />
          <Route path="/dashboard/orders" element={<OrdersPage />} />
          <Route path="/dashboard/account" element={<AccountPage />} />
        </Route>

        {/* Admin */}
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/templates" element={<AdminTemplatesPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
