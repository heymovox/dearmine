import { useState } from 'react'
import { formatINR, formatDate } from '../../shared'
import { useAdminOrders } from '../../api/hooks'
import { Badge, PageHeader, Pagination, Select, Spinner, StatusMessage, useDocumentTitle } from '../ui'
import { statusTone, TableWrap, Td, Th, Tr } from './table'

const STATUSES = ['', 'PAID', 'PENDING', 'CREATED', 'FAILED', 'CANCELLED', 'REFUNDED']

export default function AdminOrdersPage() {
  useDocumentTitle('Admin · Orders')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const orders = useAdminOrders(page)

  const rows = orders.data
    ? {
        ...orders.data,
        items: status ? orders.data.items.filter((o) => o.status === status) : orders.data.items,
      }
    : null

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        description="Payments across all plans, including mock/test payments."
        actions={
          <div className="w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              aria-label="Filter by status"
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value || 'All statuses'}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {orders.isLoading && <Spinner label="Loading orders…" />}
      {orders.isError && <StatusMessage tone="error">We could not load orders.</StatusMessage>}

      {rows && (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Plan</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Provider</Th>
                <Th>Created</Th>
                <Th>Paid</Th>
              </tr>
            </thead>
            <tbody>
              {rows.items.length === 0 && (
                <Tr>
                  <Td className="py-8 text-center text-ink/50">No orders found.</Td>
                </Tr>
              )}
              {rows.items.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <span className="block font-mono text-xs text-ink/60">{order.id.slice(0, 12)}…</span>
                    <span className="text-xs text-ink/50">{order.projectTitle}</span>
                  </Td>
                  <Td>
                    <span className="block">{order.customer}</span>
                    <span className="text-xs text-ink/50">{order.email}</span>
                  </Td>
                  <Td>{order.plan}</Td>
                  <Td>
                    {formatINR(order.amountPaise)}
                    {order.discountAmountPaise > 0 && (
                      <span className="block text-xs text-emerald-700">
                        − {formatINR(order.discountAmountPaise)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                  </Td>
                  <Td className="text-xs text-ink/60">
                    {order.provider}
                    {order.providerPaymentId && (
                      <span className="block font-mono text-[11px] text-ink/40">
                        {order.providerPaymentId.slice(0, 14)}…
                      </span>
                    )}
                  </Td>
                  <Td>{formatDate(order.createdAt)}</Td>
                  <Td>{order.paidAt ? formatDate(order.paidAt) : '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination page={rows.page} total={rows.total} limit={rows.limit} onChange={setPage} />
        </>
      )}
    </div>
  )
}
