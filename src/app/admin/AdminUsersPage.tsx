import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { formatDate } from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { useAdminUsers } from '../../api/hooks'
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
import { TableWrap, Td, Th, Tr } from './table'

export default function AdminUsersPage() {
  useDocumentTitle('Admin · Users')
  const queryClient = useQueryClient()
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const users = useAdminUsers(page, query)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })

  const patchUser = async (id: string, body: Record<string, unknown>, label: string) => {
    setBusyId(id)
    setError(null)
    try {
      await api.patch(`/admin/users/${id}`, body)
      await refresh()
      toast.push(label, 'success')
    } catch (err) {
      setError(errorMessage(err, 'Update failed'))
    } finally {
      setBusyId(null)
    }
  }

  const removeUser = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? Their published surprises will be taken offline.`)) return
    setBusyId(id)
    try {
      await api.del(`/admin/users/${id}`)
      await refresh()
      toast.push('User deleted', 'success')
    } catch (err) {
      setError(errorMessage(err, 'Delete failed'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Users"
        description="Search accounts, change roles and manage verification."
        actions={
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search users"
            />
          </div>
        }
      />

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {users.isLoading && <Spinner label="Loading users…" />}
      {users.isError && <StatusMessage tone="error">We could not load users.</StatusMessage>}

      {users.data && (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Verified</Th>
                <Th>Projects / Orders</Th>
                <Th>Joined</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.data.items.length === 0 && (
                <Tr>
                  <Td className="py-8 text-center text-ink/50">No users match this search.</Td>
                </Tr>
              )}
              {users.data.items.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <span className="block font-medium">{user.name}</span>
                    <span className="text-xs text-ink/50">{user.email}</span>
                  </Td>
                  <Td>
                    <Badge tone={user.role === 'ADMIN' ? 'accent' : 'neutral'}>{user.role}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={user.emailVerifiedAt ? 'success' : 'warning'}>
                      {user.emailVerifiedAt ? 'Verified' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td>
                    {user._count.projects} / {user._count.orders}
                  </Td>
                  <Td>{formatDate(user.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === user.id}
                        onClick={() =>
                          void patchUser(
                            user.id,
                            { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' },
                            user.role === 'ADMIN' ? 'Role changed to user' : 'Role changed to admin',
                          )
                        }
                      >
                        {user.role === 'ADMIN' ? 'Make user' : 'Make admin'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === user.id}
                        onClick={() =>
                          void patchUser(
                            user.id,
                            { emailVerified: !user.emailVerifiedAt },
                            user.emailVerifiedAt ? 'Verification removed' : 'User marked verified',
                          )
                        }
                      >
                        {user.emailVerifiedAt ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        disabled={busyId === user.id}
                        onClick={() => void removeUser(user.id, user.name)}
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination
            page={users.data.page}
            total={users.data.total}
            limit={users.data.limit}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
