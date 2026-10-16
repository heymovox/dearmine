import { Link } from 'react-router-dom'
import { FolderHeart, LifeBuoy, Receipt, Users } from 'lucide-react'
import { formatINR, formatDate } from '../../shared'
import { useAdminStats } from '../../api/hooks'
import { Badge, Card, PageHeader, Spinner, StatusMessage, useDocumentTitle } from '../ui'
import { statusTone, TableWrap, Td, Th, Tr } from './table'

export default function AdminOverviewPage() {
  useDocumentTitle('Admin · Overview')
  const stats = useAdminStats()

  if (stats.isLoading) return <Spinner label="Loading platform stats…" />
  if (stats.isError || !stats.data) {
    return <StatusMessage tone="error">We could not load the admin overview.</StatusMessage>
  }

  const s = stats.data
  const cards = [
    { label: 'Users', value: String(s.users), icon: Users, to: '/admin/users' },
    { label: 'Projects', value: String(s.projects), icon: FolderHeart, to: '/admin/projects' },
    { label: 'Live pages', value: String(s.activePublicPages), icon: FolderHeart, to: '/admin/projects' },
    { label: 'Paid orders', value: `${s.orders.paid} / ${s.orders.total}`, icon: Receipt, to: '/admin/orders' },
    { label: 'Revenue', value: formatINR(s.revenuePaise), icon: Receipt, to: '/admin/orders' },
    { label: 'Open support', value: String(s.openSupport), icon: LifeBuoy, to: '/admin/support' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Overview" description="Everything happening on Dearmine right now." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-ink/50">{card.label}</span>
                <card.icon className="h-4 w-4 text-romantic" aria-hidden />
              </div>
              <p className="mt-2 font-display text-3xl text-ink">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Recent orders</h2>
        <TableWrap>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Plan</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {s.recentOrders.length === 0 && (
              <Tr>
                <Td className="py-8 text-center text-ink/50" >No orders yet.</Td>
              </Tr>
            )}
            {s.recentOrders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <span className="block font-medium">{order.customer}</span>
                  <span className="text-xs text-ink/50">{order.email}</span>
                </Td>
                <Td>{order.plan}</Td>
                <Td>{formatINR(order.amountPaise)}</Td>
                <Td>
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </Td>
                <Td>{formatDate(order.createdAt)}</Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Recent support requests</h2>
        <TableWrap>
          <thead>
            <tr>
              <Th>Subject</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {s.recentSupport.length === 0 && (
              <Tr>
                <Td className="py-8 text-center text-ink/50">Inbox is empty.</Td>
              </Tr>
            )}
            {s.recentSupport.map((request) => (
              <Tr key={request.id}>
                <Td>
                  <Link to="/admin/support" className="font-medium text-romantic hover:underline">
                    {request.subject}
                  </Link>
                </Td>
                <Td>{request.email}</Td>
                <Td>
                  <Badge tone={statusTone(request.status)}>{request.status}</Badge>
                </Td>
                <Td>{formatDate(request.createdAt)}</Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </section>
    </div>
  )
}
