import { Link } from 'react-router-dom'
import { FolderHeart, Globe, Plus, Receipt, Sparkles } from 'lucide-react'
import { formatDate, timeAgo } from '../../shared'
import { useAuth } from '../../api/AuthContext'
import { useOrders, useProjects } from '../../api/hooks'
import { Badge, Card, EmptyState, LinkButton, PageHeader, Spinner, useDocumentTitle } from '../ui'

export default function DashboardOverviewPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const projects = useProjects()
  const orders = useOrders()

  const list = projects.data ?? []
  const published = list.filter((p) => p.published && p.published.status === 'ACTIVE')
  const paidOrders = (orders.data ?? []).filter((o) => o.status === 'PAID')

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'friend'}`}
        description="Everything you have created and shared, in one place."
        actions={
          <LinkButton to="/templates">
            <Plus className="h-4 w-4" aria-hidden /> New surprise
          </LinkButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-romantic/12 text-romantic">
            <FolderHeart className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink">{list.length}</p>
            <p className="text-xs text-ink/60">Surprises created</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Globe className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink">{published.length}</p>
            <p className="text-xs text-ink/60">Live right now</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-burgundy/10 text-burgundy">
            <Receipt className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink">{paidOrders.length}</p>
            <p className="text-xs text-ink/60">Paid plans</p>
          </div>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Recent surprises</h2>
          {list.length > 0 && (
            <Link to="/dashboard/projects" className="text-sm font-medium text-romantic hover:underline">
              View all
            </Link>
          )}
        </div>

        {projects.isLoading ? (
          <Spinner label="Loading your surprises…" />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-6 w-6" aria-hidden />}
            title="You have not created a surprise yet"
            description="Pick a template and make something they will never forget."
            action={
              <LinkButton to="/templates" className="mt-2">
                Browse templates
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.slice(0, 4).map((project) => (
              <Card key={project.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-ink">{project.title}</h3>
                    <p className="text-xs text-ink/60">
                      {project.template.name} · updated {timeAgo(project.updatedAt)}
                    </p>
                  </div>
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
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <LinkButton to={`/editor/${project.id}`} size="sm">
                    Continue editing
                  </LinkButton>
                  {project.published?.status === 'ACTIVE' && (
                    <a
                      href={project.published.url}
                      className="text-sm text-romantic hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View live
                    </a>
                  )}
                </div>
                {project.entitlement && (
                  <p className="text-xs text-ink/50">
                    {project.entitlement.planName} · active until {formatDate(project.entitlement.expiresAt)}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
