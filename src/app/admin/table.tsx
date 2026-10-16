import type { ReactNode } from 'react'

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-burgundy/10 bg-white/90 shadow-[0_10px_40px_-24px_rgba(74,16,37,0.5)]">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`border-b border-burgundy/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink/50 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`border-b border-burgundy/5 px-4 py-3 align-middle text-ink ${className}`}>{children}</td>
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-blush/30">{children}</tr>
}

export const statusTone = (status: string): 'success' | 'warning' | 'danger' | 'neutral' | 'accent' => {
  switch (status) {
    case 'PAID':
    case 'ACTIVE':
    case 'RESOLVED':
    case 'PUBLISHED':
      return 'success'
    case 'PENDING':
    case 'CREATED':
    case 'OPEN':
    case 'IN_PROGRESS':
    case 'EXPIRED':
      return 'warning'
    case 'FAILED':
    case 'CANCELLED':
    case 'CLOSED':
    case 'UNPUBLISHED':
      return 'danger'
    default:
      return 'neutral'
  }
}
