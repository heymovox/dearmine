import { useState } from 'react'
import { formatDate } from '../../shared'
import { useAdminAudit } from '../../api/hooks'
import { PageHeader, Pagination, Spinner, StatusMessage, useDocumentTitle } from '../ui'
import { TableWrap, Td, Th, Tr } from './table'

export default function AdminAuditPage() {
  useDocumentTitle('Admin · Audit log')
  const [page, setPage] = useState(1)
  const audit = useAdminAudit(page)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Audit log" description="Who did what, and when." />

      {audit.isLoading && <Spinner label="Loading audit log…" />}
      {audit.isError && <StatusMessage tone="error">We could not load the audit log.</StatusMessage>}

      {audit.data && (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Action</Th>
                <Th>Actor</Th>
                <Th>Entity</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {audit.data.items.length === 0 && (
                <Tr>
                  <Td className="py-8 text-center text-ink/50">No activity recorded yet.</Td>
                </Tr>
              )}
              {audit.data.items.map((log) => (
                <Tr key={log.id}>
                  <Td className="whitespace-nowrap text-xs text-ink/60">{formatDate(log.createdAt)}</Td>
                  <Td>
                    <span className="font-mono text-xs font-medium text-romantic">{log.action}</span>
                  </Td>
                  <Td className="text-xs">
                    {log.actor ? (
                      <>
                        <span className="block">{log.actor.name}</span>
                        <span className="text-ink/50">{log.actor.email}</span>
                      </>
                    ) : (
                      <span className="text-ink/40">System</span>
                    )}
                  </Td>
                  <Td className="text-xs text-ink/70">
                    {log.entityType}
                    {log.entityId && <span className="block font-mono text-[11px] text-ink/40">{log.entityId}</span>}
                  </Td>
                  <Td className="max-w-xs truncate text-xs text-ink/60">
                    {log.metadata && Object.keys(log.metadata as Record<string, unknown>).length > 0
                      ? JSON.stringify(log.metadata)
                      : '—'}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination page={audit.data.page} total={audit.data.total} limit={audit.data.limit} onChange={setPage} />
        </>
      )}
    </div>
  )
}
