import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { formatDate, timeAgo } from '../../shared'
import { useProjects } from '../../api/hooks'
import { api } from '../../api/client'
import { useToast, Badge, Button, Card, EmptyState, LinkButton, PageHeader, Spinner, useDocumentTitle } from '../ui'

export default function ProjectsPage() {
  useDocumentTitle('My surprises')
  const projects = useProjects()
  const toast = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = () => void projects.refetch()

  const duplicate = async (id: string) => {
    try {
      await api.post(`/projects/${id}/duplicate`)
      toast.push('Copied your surprise', 'success')
      refresh()
    } catch {
      toast.push('We could not duplicate that surprise', 'error')
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this surprise? Its published link will stop working.')) return
    setDeletingId(id)
    try {
      await api.del(`/projects/${id}`)
      toast.push('Surprise deleted', 'success')
      refresh()
    } catch {
      toast.push('We could not delete that surprise', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const list = projects.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My surprises"
        description="Edit a draft, share a live link, or start something new."
        actions={
          <LinkButton to="/templates">
            <Plus className="h-4 w-4" aria-hidden /> New surprise
          </LinkButton>
        }
      />

      {projects.isLoading ? (
        <Spinner label="Loading your surprises…" />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Create your first surprise and it will appear here."
          action={
            <LinkButton to="/templates" className="mt-2">
              Browse templates
            </LinkButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((project) => (
            <Card key={project.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-ink">{project.title}</h3>
                  <Badge
                    tone={
                      project.published?.status === 'ACTIVE'
                        ? 'success'
                        : project.published?.status === 'EXPIRED'
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {project.published?.status === 'ACTIVE'
                      ? 'Live'
                      : project.published?.status === 'EXPIRED'
                        ? 'Expired'
                        : 'Draft'}
                  </Badge>
                  {project.entitlement ? (
                    <Badge tone="accent">{project.entitlement.planName}</Badge>
                  ) : (
                    <Badge tone="warning">Not paid yet</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink/60">
                  {project.template.name} · {project.occasion.toLowerCase().replace('_', ' ')} · updated{' '}
                  {timeAgo(project.updatedAt)}
                </p>
                {project.published?.expiresAt && (
                  <p className="text-xs text-ink/50">Live until {formatDate(project.published.expiresAt)}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <LinkButton to={`/editor/${project.id}`} size="sm" variant="secondary">
                  <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                </LinkButton>
                {project.published?.status === 'ACTIVE' && (
                  <>
                    <a
                      href={project.published.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-romantic hover:bg-blush/50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}${project.published!.url}`
                        void navigator.clipboard.writeText(url)
                        toast.push('Link copied', 'success')
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-blush/50"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden /> Copy link
                    </button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void duplicate(project.id)}
                  aria-label={`Duplicate ${project.title}`}
                >
                  Duplicate
                </Button>
                {!project.published && (
                  <Link to={`/editor/${project.id}`} className="text-sm text-romantic hover:underline">
                    Publish
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deletingId === project.id}
                  onClick={() => void remove(project.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
