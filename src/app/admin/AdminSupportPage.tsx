import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { useAdminSupport } from '../../api/hooks'
import {
  Badge,
  Card,
  PageHeader,
  Select,
  Spinner,
  StatusMessage,
  useDocumentTitle,
  useToast,
} from '../ui'
import { statusTone } from './table'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

export default function AdminSupportPage() {
  useDocumentTitle('Admin · Support')
  const queryClient = useQueryClient()
  const toast = useToast()
  const support = useAdminSupport()
  const [filter, setFilter] = useState<string>('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rows = support.data ? (filter ? support.data.filter((r) => r.status === filter) : support.data) : []

  const setStatus = async (id: string, status: string) => {
    setBusyId(id)
    setError(null)
    try {
      await api.patch(`/admin/support/${id}`, { status })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'support'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.push(`Marked as ${status.replace('_', ' ').toLowerCase()}`, 'success')
    } catch (err) {
      setError(errorMessage(err, 'Could not update the request'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Support"
        description="Messages from the support form, newest first."
        actions={
          <div className="w-52">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {support.isLoading && <Spinner label="Loading requests…" />}
      {support.isError && <StatusMessage tone="error">We could not load support requests.</StatusMessage>}

      {!support.isLoading && rows.length === 0 && (
        <p className="rounded-3xl border border-dashed border-burgundy/20 px-6 py-12 text-center text-sm text-ink/60">
          Nothing here yet.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((request) => (
          <Card key={request.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg text-ink">{request.subject}</h2>
                <p className="text-xs text-ink/50">
                  {request.name || request.user?.name || 'Anonymous'} · {request.email} ·{' '}
                  {new Date(request.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <Badge tone={statusTone(request.status)}>{request.status.replace('_', ' ')}</Badge>
            </div>

            <p className="whitespace-pre-wrap rounded-2xl bg-blush/30 px-4 py-3 text-sm text-ink/80">
              {request.message}
            </p>

            <div className="flex items-center justify-end gap-2">
              <span className="mr-auto text-xs text-ink/50">Change status</span>
              <div className="w-44">
                <Select
                  value={request.status}
                  disabled={busyId === request.id}
                  onChange={(e) => void setStatus(request.id, e.target.value)}
                  aria-label={`Status for ${request.subject}`}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
