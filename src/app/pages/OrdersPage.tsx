import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { formatDate, formatINR } from '../../shared'
import { useOrders, useProjects } from '../../api/hooks'
import { Badge, Card, EmptyState, LinkButton, PageHeader, Spinner, useDocumentTitle } from '../ui'

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  PAID: 'success',
  PENDING: 'warning',
  CREATED: 'warning',
  FAILED: 'danger',
  CANCELLED: 'neutral',
}

export default function OrdersPage() {
  useDocumentTitle('Orders')
  const orders = useOrders()
  const projects = useProjects()

  const projectTitle = (id: string) => projects.data?.find((p) => p.id === id)?.title ?? 'Surprise'
  const list = orders.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Your payments and the plans they unlocked." />

      {orders.isLoading ? (
        <Spinner label="Loading your orders…" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" aria-hidden />}
          title="No orders yet"
          description="When you publish a surprise, your purchase will show up here."
          action={
            <LinkButton to="/pricing" className="mt-2">
              See plans
            </LinkButton>
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-burgundy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.id} className="border-b border-burgundy/5 last:border-0">
                  <td className="px-5 py-4 text-ink">{projectTitle(order.projectId)}</td>
                  <td className="px-5 py-4 text-ink/80">{order.plan.name}</td>
                  <td className="px-5 py-4 text-ink/80">
                    {formatINR(order.amountPaise)}
                    {order.discountAmountPaise > 0 && (
                      <span className="ml-1 text-xs text-emerald-600">
                        (saved {formatINR(order.discountAmountPaise)})
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>{order.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-ink/70">{formatDate(order.paidAt ?? order.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    {(order.status === 'PENDING' || order.status === 'CREATED') && (
                      <Link
                        to={`/checkout/${order.id}`}
                        className="text-sm font-medium text-romantic hover:underline"
                      >
                        Complete payment
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
