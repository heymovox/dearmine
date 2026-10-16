/** Small, dependency-free UI kit for the Dearmine web app. */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

/* ------------------------------------------------------------------ layout */

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

/* ------------------------------------------------------------------ button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-romantic text-cream hover:bg-romantic-soft shadow-[0_10px_30px_-12px_rgba(181,40,77,0.8)]',
  secondary: 'bg-burgundy text-cream hover:bg-burgundy-deep',
  ghost: 'bg-transparent text-ink hover:bg-blush/60',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  outline: 'border border-romantic/40 bg-white/70 text-romantic hover:bg-blush/50',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {children}
    </Link>
  )
}

/* ------------------------------------------------------------------- forms */

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-romantic"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-ink/60">{hint}</span>}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

const CONTROL_CLASS =
  'w-full rounded-2xl border border-burgundy/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 transition-colors focus:border-romantic focus:outline-none focus:ring-2 focus:ring-romantic/20'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${CONTROL_CLASS} ${className}`} />
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${CONTROL_CLASS} min-h-28 resize-y ${className}`} />
}

export function Select({ className = '', children, ...rest }: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...rest} className={`${CONTROL_CLASS} ${className}`}>
      {children}
    </select>
  )
}

/* ------------------------------------------------------------------- cards */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-burgundy/10 bg-white/90 p-6 shadow-[0_10px_40px_-24px_rgba(74,16,37,0.5)] ${className}`}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ states */

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/70">
      <Loader2 className="h-6 w-6 animate-spin text-romantic" aria-hidden />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-burgundy/20 bg-white/60 px-6 py-14 text-center">
      {icon && <div className="text-romantic">{icon}</div>}
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink/70">{description}</p>}
      {action}
    </div>
  )
}

export function StatusMessage({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning'
  children: ReactNode
}) {
  const tones = {
    info: 'border-burgundy/15 bg-blush/40 text-ink',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    error: 'border-red-300 bg-red-50 text-red-700',
    warning: 'border-amber-300 bg-amber-50 text-amber-800',
  }
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent'
}) {
  const tones = {
    neutral: 'bg-burgundy/10 text-burgundy',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    accent: 'bg-romantic/15 text-romantic',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- toasts */

type Toast = { id: number; tone: 'info' | 'success' | 'error'; message: string }
type ToastContextValue = { push: (message: string, tone?: Toast['tone']) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, tone, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3 text-sm shadow-lg ${
              toast.tone === 'success'
                ? 'bg-emerald-600 text-white'
                : toast.tone === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-burgundy text-cream'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/* --------------------------------------------------------------- utilities */

export function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-ink/70">
        Page {page} of {pages}
      </span>
      <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  )
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const suffix = 'Dearmine'
    document.title = title ? `${title} | ${suffix}` : suffix
    return () => {
      document.title = suffix
    }
  }, [title])
}
