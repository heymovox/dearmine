import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Pencil } from 'lucide-react'
import { formatINR } from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { useAdminPlans } from '../../api/hooks'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Spinner,
  StatusMessage,
  Textarea,
  useDocumentTitle,
  useToast,
} from '../ui'
import { TableWrap, Td, Th, Tr } from './table'

type Editable = {
  name: string
  description: string
  priceRupees: number
  hostingDurationDays: number
  isActive: boolean
  isFeatured: boolean
  features: string
}

export default function AdminPlansPage() {
  useDocumentTitle('Admin · Plans')
  const queryClient = useQueryClient()
  const toast = useToast()
  const plans = useAdminPlans()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Editable | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!plans.data || !editingId) return
    const row = plans.data.find((p) => p.id === editingId)
    if (!row) return
    setForm({
      name: row.name,
      description: row.description,
      priceRupees: Math.round(row.pricePaise / 100),
      hostingDurationDays: row.hostingDurationDays,
      isActive: row.isActive,
      isFeatured: row.isFeatured,
      features: row.featuresJson.join('\n'),
    })
  }, [plans.data, editingId])

  const save = async () => {
    if (!editingId || !form) return
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/admin/plans/${editingId}`, {
        name: form.name,
        description: form.description,
        pricePaise: Math.max(0, Math.round(form.priceRupees * 100)),
        hostingDurationDays: form.hostingDurationDays,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        features: form.features.split('\n').map((line) => line.trim()).filter(Boolean),
      })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      await queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.push('Plan updated', 'success')
      setEditingId(null)
    } catch (err) {
      setError(errorMessage(err, 'Could not save the plan'))
    } finally {
      setSaving(false)
    }
  }

  if (plans.isLoading) return <Spinner label="Loading plans…" />
  if (plans.isError || !plans.data) {
    return <StatusMessage tone="error">We could not load plans.</StatusMessage>
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl text-ink">Plans</h1>
        <p className="mt-1 text-sm text-ink/70">Pricing, hosting duration and availability for each plan.</p>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}

      {editingId && form && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Edit plan</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Price (₹)">
              <Input
                type="number"
                min={0}
                value={form.priceRupees}
                onChange={(e) => setForm({ ...form, priceRupees: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Hosting duration (days)">
              <Input
                type="number"
                min={1}
                value={form.hostingDurationDays}
                onChange={(e) => setForm({ ...form, hostingDurationDays: Number(e.target.value) || 1 })}
              />
            </Field>
            <Field label="Description">
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Features (one per line)">
                <Textarea
                  rows={6}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex items-end gap-4 pb-1 text-sm text-ink">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Available for purchase
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Highlighted on pricing page
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Button loading={saving} onClick={() => void save()}>
              <Check className="h-4 w-4" aria-hidden /> Save changes
            </Button>
          </div>
        </Card>
      )}

      <TableWrap>
        <thead>
          <tr>
            <Th>Plan</Th>
            <Th>Price</Th>
            <Th>Hosting</Th>
            <Th>Status</Th>
            <Th>Sort</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {plans.data.map((plan) => (
            <Tr key={plan.id}>
              <Td>
                <span className="block font-medium">{plan.name}</span>
                <span className="text-xs text-ink/50">{plan.description}</span>
              </Td>
              <Td>{formatINR(plan.pricePaise)}</Td>
              <Td>{plan.hostingDurationDays} days</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={plan.isActive ? 'success' : 'neutral'}>{plan.isActive ? 'Active' : 'Hidden'}</Badge>
                  {plan.isFeatured && <Badge tone="accent">Featured</Badge>}
                </div>
              </Td>
              <Td>{plan.sortOrder}</Td>
              <Td>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(plan.id)}>
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
