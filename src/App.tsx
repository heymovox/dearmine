import { Route, Routes } from 'react-router-dom'
import ExperienceDemo from './app/ExperienceDemo'
import { DashboardLayout, PublicLayout } from './app/layouts'
import { RedirectIfAuthed, RequireAdmin, RequireAuth } from './app/guards'
import { AdminLayout } from './app/admin/AdminLayout'
import AdminAuditPage from './app/admin/AdminAuditPage'
import AdminCouponsPage from './app/admin/AdminCouponsPage'
import AdminOrdersPage from './app/admin/AdminOrdersPage'
import AdminOverviewPage from './app/admin/AdminOverviewPage'
import AdminPlansPage from './app/admin/AdminPlansPage'
import AdminProjectsPage from './app/admin/AdminProjectsPage'
import AdminSupportPage from './app/admin/AdminSupportPage'
import AdminTemplatesPage from './app/admin/AdminTemplatesPage'
import AdminUsersPage from './app/admin/AdminUsersPage'
import AccountPage from './app/pages/AccountPage'
import CheckoutPage from './app/pages/CheckoutPage'
import DashboardOverviewPage from './app/pages/DashboardOverviewPage'
import ForgotPasswordPage from './app/pages/ForgotPasswordPage'
import LandingPage from './app/pages/LandingPage'
import LoginPage from './app/pages/LoginPage'
import NotFoundPage from './app/pages/NotFoundPage'
import OrdersPage from './app/pages/OrdersPage'
import PricingPage from './app/pages/PricingPage'
import ProjectEditorPage from './app/pages/ProjectEditorPage'
import ProjectsPage from './app/pages/ProjectsPage'
import PublicSurprisePage from './app/pages/PublicSurprisePage'
import RegisterPage from './app/pages/RegisterPage'
import ResetPasswordPage from './app/pages/ResetPasswordPage'
import SupportPage from './app/pages/SupportPage'
import TemplateDetailPage from './app/pages/TemplateDetailPage'
import TemplatesPage from './app/pages/TemplatesPage'
import VerifyEmailPage from './app/pages/VerifyEmailPage'

export default function App() {
  return (
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
  )
}
