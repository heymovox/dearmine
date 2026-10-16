import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { formatDate } from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { useAdminProjects } from '../../api/hooks'
import {
  Badge,
  Button,
  Input,
  PageHeader,
  Pagination,
  Spinner,
  StatusMessage,
  useDocumentTitle,
  useToast,
} from '../ui'
import { statusTone, TableWrap, Td, Th, Tr } from './table'

export default function AdminProjectsPage() {
  useDocumentTitle('Admin · Projects')
  const queryClient = useQueryClient()
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const projects = useAdminProjects(page, query)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })

  const unpublish = async (id: string) => {
    if (!window.confirm('Take this surprise offline?')) return
    setBusyId(id)
    setError(null)
    try {
      await api.post(`/admin/projects/${id}/unpublish`)
      await refresh()
      toast.push('Surprise taken offline', 'success')
    } catch (err) {
      setError(errorMessage(err, 'Could not unpublish'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Projects"
        description="Every surprise built on the platform."
        actions={
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or recipient…"
              aria-label="Search projects"
            />
          </div>
        }
      />

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {projects.isLoading && <Spinner label="Loading projects…" />}
      {projects.isError && <StatusMessage tone="error">We could not load projects.</StatusMessage>}

      {projects.data && (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Project</Th>
                <Th>Owner</Th>
                <Th>Template</Th>
                <Th>Status</Th>
                <Th>Live link</Th>
                <Th>Updated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {projects.data.items.length === 0 && (
                <Tr>
                  <Td className="py-8 text-center text-ink/50">No projects match this search.</Td>
                </Tr>
              )}
              {projects.data.items.map((project) => (
                <Tr key={project.id}>
                  <Td>
                    <span className="block font-medium">{project.title}</span>
                    <span className="text-xs text-ink/50">{project.occasion}</span>
                  </Td>
                  <Td>
                    <span className="block">{project.owner}</span>
                    <span className="text-xs text-ink/50">{project.email}</span>
                  </Td>
                  <Td>{project.template}</Td>
                  <Td>
                    <Badge tone={statusTone(project.status)}>{project.status}</Badge>
                  </Td>
                  <Td>
                    {project.published && project.published.status === 'ACTIVE' ? (
                      <a
                        href={`/s/${project.published.publicId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-romantic hover:underline"
                      >
                        /s/{project.published.publicId.slice(0, 8)}… <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </Td>
                  <Td>{formatDate(project.updatedAt)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      {project.published && project.published.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === project.id}
                          onClick={() => void unpublish(project.id)}
                        >
                          Unpublish
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination
            page={projects.data.page}
            total={projects.data.total}
            limit={projects.data.limit}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
