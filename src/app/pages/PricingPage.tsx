import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Heart } from 'lucide-react'
import { BRAND, formatINR } from '../../shared'
import { usePlans, useProjects } from '../../api/hooks'
import { useAuth } from '../../api/AuthContext'
import { api } from '../../api/client'
import type { CreateOrderResult, ProjectDTO } from '../../api/types'
import { Button, Card, Container, EmptyState, Spinner, StatusMessage, useDocumentTitle } from '../ui'

export default function PricingPage() {
  useDocumentTitle('Pricing')
  const plans = usePlans()
  const { user } = useAuth()
  const projects = useProjects()
  const navigate = useNavigate()
  const [busyPlan, setBusyPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const choosePlan = async (planSlug: string) => {
    setError(null)
    if (!user) {
      navigate('/register', { state: { from: '/pricing' } })
      return
    }
    const target = projects.data?.[0]
    if (!target) {
      setError('Create a surprise first — then come back and choose a plan for it.')
      return
    }
    setBusyPlan(planSlug)
    try {
      const res = await api.post<CreateOrderResult>('/orders', { projectId: target.id, planSlug })
      navigate(`/checkout/${res.order.id}`, { state: { checkout: res.checkout } })
    } catch {
      setError('We could not start checkout. Please try again in a moment.')
      setBusyPlan(null)
    }
  }

  const unlocked: Pick<ProjectDTO, 'id'>[] = projects.data ?? []

  return (
    <Container className="py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl text-ink">Pay once, keep the memories</h1>
        <p className="mt-3 text-sm text-ink/70">
          You can build and preview everything for free. Choose a plan only when you are ready to publish.
        </p>
      </div>

      {error && (
        <div className="mx-auto mt-6 max-w-2xl">
          <StatusMessage tone="warning">{error}</StatusMessage>
          {unlocked.length === 0 && (
            <div className="mt-3 text-center">
              <Link to="/templates" className="text-sm font-medium text-romantic hover:underline">
                Browse templates to create your surprise →
              </Link>
            </div>
          )}
        </div>
      )}

      {plans.isLoading ? (
        <Spinner label="Loading plans…" />
      ) : plans.isError ? (
        <EmptyState title="Plans are unavailable right now" description="Please refresh the page." />
      ) : (
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {(plans.data ?? []).map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${plan.isFeatured ? 'border-romantic/50 ring-2 ring-romantic/25' : ''}`}
            >
              {plan.isFeatured && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-romantic/15 px-3 py-1 text-xs font-medium text-romantic">
                  <Heart className="h-3 w-3" aria-hidden /> Most popular
                </span>
              )}
              <h2 className="font-display text-2xl text-ink">{plan.name}</h2>
              <p className="mt-2 text-4xl font-semibold text-romantic">{formatINR(plan.pricePaise)}</p>
              <p className="mt-1 text-xs text-ink/60">One-time · {plan.hostingDurationDays} days hosting</p>
              <p className="mt-3 text-sm text-ink/70">{plan.description}</p>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ink/80">
                {plan.featuresJson.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-romantic" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button
                  className="w-full"
                  variant={plan.isFeatured ? 'primary' : 'secondary'}
                  loading={busyPlan === plan.slug}
                  onClick={() => void choosePlan(plan.slug)}
                >
                  Choose {plan.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mx-auto mt-12 max-w-2xl text-center text-sm text-ink/60">
        <p>
          Every plan includes a private link, unlimited previews while editing, and hosting for the period shown.
          Questions? Write to{' '}
          <a href={`mailto:${BRAND.supportEmail}`} className="font-medium text-romantic hover:underline">
            {BRAND.supportEmail}
          </a>
          .
        </p>
      </div>
    </Container>
  )
}
