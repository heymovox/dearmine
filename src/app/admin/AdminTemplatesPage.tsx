import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { useAdminTemplates, useCategories } from '../../api/hooks'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Spinner,
  StatusMessage,
  useDocumentTitle,
  useToast,
} from '../ui'
import { TableWrap, Td, Th, Tr } from './table'

type Editable = {
  name: string
  tagline: string
  requiredPlan: string
  categoryId: string
  sortOrder: number
  isPublished: boolean
  isFeatured: boolean
}

export default function AdminTemplatesPage() {
  useDocumentTitle('Admin · Templates')
  const queryClient = useQueryClient()
  const toast = useToast()
  const templates = useAdminTemplates()
  const categories = useCategories()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Editable | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!templates.data || !editingId) return
    const row = templates.data.find((t) => t.id === editingId)
    if (!row) return
    setForm({
      name: row.name,
      tagline: row.tagline ?? '',
      requiredPlan: row.requiredPlan,
      categoryId: row.categoryId,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      isFeatured: row.isFeatured,
    })
  }, [templates.data, editingId])

  const startEdit = (id: string) => {
    setError(null)
    setEditingId(id)
  }

  const save = async () => {
    if (!editingId || !form) return
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/admin/templates/${editingId}`, {
        name: form.name,
        tagline: form.tagline,
        requiredPlan: form.requiredPlan,
        categoryId: form.categoryId,
        sortOrder: form.sortOrder,
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
      })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] })
      await queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.push('Template updated', 'success')
      setEditingId(null)
    } catch (err) {
      setError(errorMessage(err, 'Could not save the template'))
    } finally {
      setSaving(false)
    }
  }

  if (templates.isLoading) return <Spinner label="Loading templates…" />
  if (templates.isError || !templates.data) {
    return <StatusMessage tone="error">We could not load templates.</StatusMessage>
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl text-ink">Templates</h1>
        <p className="mt-1 text-sm text-ink/70">
          {templates.data.length} templates. Publishing a template here makes it visible in the public gallery.
        </p>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}

      {editingId && form && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Edit template</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </Field>
            <Field label="Required plan">
              <Select
                value={form.requiredPlan}
                onChange={(e) => setForm({ ...form, requiredPlan: e.target.value })}
              >
                <option value="mini">Mini Surprise</option>
                <option value="love">Love Edition</option>
                <option value="forever">Forever Memories</option>
              </Select>
            </Field>
            <Field label="Category">
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
              />
            </Field>
            <div className="flex items-end gap-4 pb-1 text-sm text-ink">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Visible publicly
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Button loading={saving} onClick={() => void save()}>
              Save changes
            </Button>
          </div>
        </Card>
      )}

      <TableWrap>
        <thead>
          <tr>
            <Th>Template</Th>
            <Th>Category</Th>
            <Th>Plan</Th>
            <Th>Status</Th>
            <Th>Sort</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {templates.data.map((template) => (
            <Tr key={template.id}>
              <Td>
                <span className="block font-medium">{template.name}</span>
                <span className="font-mono text-xs text-ink/50">{template.slug}</span>
              </Td>
              <Td>{template.category.name}</Td>
              <Td className="capitalize">{template.requiredPlan}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={template.isPublished ? 'success' : 'neutral'}>
                    {template.isPublished ? 'Live' : 'Hidden'}
                  </Badge>
                  {template.isFeatured && <Badge tone="accent">Featured</Badge>}
                </div>
              </Td>
              <Td>{template.sortOrder}</Td>
              <Td>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => startEdit(template.id)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  )
}
