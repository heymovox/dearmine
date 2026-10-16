import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  BarChart3,
  CreditCard,
  FolderHeart,
  LayoutTemplate,
  LifeBuoy,
  Receipt,
  ScrollText,
  Ticket,
  Users,
} from 'lucide-react'
import { useAuth } from '../../api/AuthContext'
import { useDocumentTitle } from '../ui'

const NAV = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/projects', label: 'Projects', icon: FolderHeart, end: false },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplate, end: false },
  { to: '/admin/plans', label: 'Plans', icon: CreditCard, end: false },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket, end: false },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy, end: false },
  { to: '/admin/audit', label: 'Audit log', icon: ScrollText, end: false },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  useDocumentTitle('Admin')

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/brand/dearmine-logo.png" alt="" aria-hidden className="h-9 w-auto" />
              <span className="font-display text-xl tracking-wide text-cream">Dearmine</span>
            </Link>
            <span className="rounded-full bg-romantic/25 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-rose-gold">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-cream/80">
            <span className="hidden sm:inline">{user?.email}</span>
            <Link to="/dashboard" className="hover:text-cream">
              Dashboard
            </Link>
            <button type="button" className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1500px] flex-1 gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-burgundy/10 bg-white/80 p-2 lg:flex-col lg:overflow-visible">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-burgundy text-cream' : 'text-ink/80 hover:bg-blush/50'
                  }`
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
