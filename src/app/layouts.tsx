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

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img src="/brand/dearmine-logo.png" alt={BRAND.name} className="h-12 w-auto sm:h-14" />
    </Link>
  )
}

export function PublicLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/templates', label: 'Templates', end: false },
    { to: '/how-it-works', label: 'How It Works', end: false },
    { to: '/pricing', label: 'Pricing', end: false },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      {/* Announcement topbar */}
      <div className="hidden bg-burgundy-deep text-cream/80 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-rose-gold" aria-hidden />
            <span>
              New here? Use code <span className="font-semibold text-cream">WELCOME10</span> for 10% off
              your first plan.
            </span>
          </p>
          <p className="flex items-center gap-5">
            <Link to="/how-it-works" className="transition-colors hover:text-cream">
              How it works
            </Link>
            <a href={`mailto:${BRAND.supportEmail}`} className="transition-colors hover:text-cream">
              {BRAND.supportEmail}
            </a>
          </p>
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-burgundy/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <BrandMark />
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? 'text-cream' : 'text-cream/75 hover:text-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <LinkButton to="/dashboard" variant="primary" size="sm">
                Create Surprise
              </LinkButton>
            ) : (
              <>
                <LinkButton to="/login" variant="onDark" size="sm">
                  Log In
                </LinkButton>
                <LinkButton to="/register" variant="primary" size="sm">
                  Create Surprise
                </LinkButton>
              </>
            )}
          </div>
          <button
            type="button"
            className="text-cream md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </Container>
        {open && (
          <div className="border-t border-white/10 bg-burgundy md:hidden">
            <Container className="flex flex-col gap-1 py-3">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/support" className="rounded-xl px-3 py-2 text-sm text-cream/90 hover:bg-white/10">
                Support
              </Link>
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                {user ? (
                  <LinkButton to="/dashboard" variant="primary" size="sm" className="justify-center">
                    Create Surprise
                  </LinkButton>
                ) : (
                  <>
                    <LinkButton to="/login" variant="onDark" size="sm" className="justify-center">
                      Log In
                    </LinkButton>
                    <LinkButton to="/register" variant="primary" size="sm" className="justify-center">
                      Create Surprise
                    </LinkButton>
                  </>
                )}
              </div>
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
                <Link to="/how-it-works" className="hover:text-cream">
                  How it works
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
