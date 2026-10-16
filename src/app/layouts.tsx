import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  FolderHeart,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { BRAND } from '../shared'
import { useAuth } from '../api/AuthContext'
import { Container, LinkButton, Button } from './ui'

/* ------------------------------------------------------------------ header */

function BrandMark({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <Sparkles className={tone === 'light' ? 'h-5 w-5 text-rose-gold' : 'h-5 w-5 text-romantic'} aria-hidden />
      <span className={`font-display text-xl tracking-wide ${tone === 'light' ? 'text-cream' : 'text-ink'}`}>
        {BRAND.name}
      </span>
    </Link>
  )
}

export function PublicLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-burgundy/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <BrandMark />
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/templates" className="text-sm text-cream/80 transition-colors hover:text-cream">
              Templates
            </NavLink>
            <NavLink to="/pricing" className="text-sm text-cream/80 transition-colors hover:text-cream">
              Pricing
            </NavLink>
            <NavLink to="/support" className="text-sm text-cream/80 transition-colors hover:text-cream">
              Support
            </NavLink>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <LinkButton to="/dashboard" variant="primary" size="sm">
                My surprises
              </LinkButton>
            ) : (
              <>
                <Link to="/login" className="text-sm text-cream/80 transition-colors hover:text-cream">
                  Log in
                </Link>
                <LinkButton to="/register" variant="primary" size="sm">
                  Start free
                </LinkButton>
              </>
            )}
          </div>
          <button
            type="button"
            className="text-cream md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </Container>
        {open && (
          <div className="border-t border-white/10 bg-burgundy md:hidden">
            <Container className="flex flex-col gap-1 py-3">
              <Link to="/templates" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                Templates
              </Link>
              <Link to="/pricing" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                Pricing
              </Link>
              <Link to="/support" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                Support
              </Link>
              {user ? (
                <Link to="/dashboard" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                  My surprises
                </Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                    Log in
                  </Link>
                  <Link to="/register" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                    Start free
                  </Link>
                </>
              )}
            </Container>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-white/10 bg-burgundy text-cream/80">
        <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandMark />
            <p className="mt-3 max-w-xs text-sm">{BRAND.tagline}</p>
          </div>
          <div className="text-sm">
            <h3 className="mb-3 font-medium text-cream">Create</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/templates" className="hover:text-cream">
                  Browse templates
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-cream">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-cream">
                  Start free
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h3 className="mb-3 font-medium text-cream">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="hover:text-cream">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cream">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-cream">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h3 className="mb-3 font-medium text-cream">Contact</h3>
            <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-cream">
              {BRAND.supportEmail}
            </a>
          </div>
        </Container>
        <div className="border-t border-white/10 py-4 text-center text-xs text-cream/60">
          © {new Date().getFullYear()} {BRAND.name}. Made with love.
        </div>
      </footer>
    </div>
  )
}

/* --------------------------------------------------------------- dashboard */

const DASH_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/projects', label: 'My surprises', icon: FolderHeart, end: false },
  { to: '/dashboard/orders', label: 'Orders', icon: Receipt, end: false },
  { to: '/dashboard/account', label: 'Account', icon: Settings, end: false },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-burgundy/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-3">
            {user?.role === 'ADMIN' && (
              <LinkButton to="/admin" variant="outline" size="sm" className="hidden sm:inline-flex">
                Admin
              </LinkButton>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-cream hover:bg-white/10"
              onClick={() => void logout()}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </Container>
      </header>

      <Container className="flex flex-1 flex-col gap-6 py-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-burgundy/10 bg-white/80 p-2 lg:flex-col lg:overflow-visible">
            {DASH_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-romantic text-cream' : 'text-ink/80 hover:bg-blush/50'
                  }`
                }
              >
                <link.icon className="h-4 w-4" aria-hidden />
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-romantic text-cream' : 'text-ink/80 hover:bg-blush/50'
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Admin
              </NavLink>
            )}
            <NavLink
              to="/support"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-blush/50"
            >
              <LifeBuoy className="h-4 w-4" aria-hidden />
              Help
            </NavLink>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </Container>
    </div>
  )
}
