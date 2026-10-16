import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { formatDate } from '../../shared'
import { api } from '../../api/client'
import { errorMessage } from '../../api/AuthContext'
import { useAdminCoupons } from '../../api/hooks'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatusMessage,
  useDocumentTitle,
  useToast,
} from '../ui'
import { TableWrap, Td, Th, Tr } from './table'

type Draft = {
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: string
  perUserLimit: string
  usageLimit: string
}

const emptyDraft: Draft = {
  code: '',
  discountType: 'PERCENT',
  discountValue: '',
  perUserLimit: '1',
  usageLimit: '',
}

export default function AdminCouponsPage() {
  useDocumentTitle('Admin · Coupons')
  const queryClient = useQueryClient()
  const toast = useToast()
  const coupons = useAdminCoupons()

  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })

  const create = async () => {
    if (!draft.code.trim() || !draft.discountValue) {
      setError('Enter a code and a discount value.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.post('/admin/coupons', {
        code: draft.code.trim().toUpperCase(),
        discountType: draft.discountType,
        discountValue: Number(draft.discountValue),
        perUserLimit: Number(draft.perUserLimit) || 1,
        usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
        isActive: true,
      })
      await refresh()
      setDraft(emptyDraft)
      toast.push('Coupon created', 'success')
    } catch (err) {
      setError(errorMessage(err, 'Could not create the coupon'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/coupons/${id}`, { isActive: !isActive })
      await refresh()
      toast.push(isActive ? 'Coupon deactivated' : 'Coupon activated', 'success')
    } catch (err) {
      setError(errorMessage(err, 'Could not update the coupon'))
    }
  }

  const remove = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon ${code}? Used coupons are deactivated instead.`)) return
    try {
      await api.del(`/admin/coupons/${id}`)
      await refresh()
      toast.push('Coupon removed', 'success')
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the coupon'))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Coupons" description="Discount codes customers can apply at checkout." />

      {error && <StatusMessage tone="error">{error}</StatusMessage>}

      <Card>
        <h2 className="font-display text-xl text-ink">Create a coupon</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Code">
            <Input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="LOVE20"
            />
          </Field>
          <Field label="Type">
            <Select
              value={draft.discountType}
              onChange={(e) => setDraft({ ...draft, discountType: e.target.value as Draft['discountType'] })}
            >
              <option value="PERCENT">Percentage (%)</option>
              <option value="FIXED">Fixed (₹)</option>
            </Select>
          </Field>
          <Field label={draft.discountType === 'PERCENT' ? 'Percent off' : 'Rupees off'}>
            <Input
              type="number"
              min={1}
              value={draft.discountValue}
              onChange={(e) => setDraft({ ...draft, discountValue: e.target.value })}
              placeholder={draft.discountType === 'PERCENT' ? '10' : '50'}
            />
          </Field>
          <Field label="Per-customer limit">
            <Input
              type="number"
              min={1}
              value={draft.perUserLimit}
              onChange={(e) => setDraft({ ...draft, perUserLimit: e.target.value })}
            />
          </Field>
          <Field label="Total uses (optional)">
            <Input
              type="number"
              min={1}
              value={draft.usageLimit}
              onChange={(e) => setDraft({ ...draft, usageLimit: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Button loading={saving} onClick={() => void create()}>
            Create coupon
          </Button>
        </div>
      </Card>

      {coupons.isLoading && <Spinner label="Loading coupons…" />}
      {coupons.isError && <StatusMessage tone="error">We could not load coupons.</StatusMessage>}

      {coupons.data && (
        <TableWrap>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Discount</Th>
              <Th>Usage</Th>
              <Th>Window</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {coupons.data.length === 0 && (
              <Tr>
                <Td className="py-8 text-center text-ink/50">No coupons yet.</Td>
              </Tr>
            )}
            {coupons.data.map((coupon) => (
              <Tr key={coupon.id}>
                <Td className="font-mono font-medium">{coupon.code}</Td>
                <Td>
                  {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                </Td>
                <Td>
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''} used
                  <span className="block text-xs text-ink/50">{coupon.perUserLimit} per customer</span>
                </Td>
                <Td className="text-xs text-ink/60">
                  {coupon.startsAt ? formatDate(coupon.startsAt) : 'Any time'} →{' '}
                  {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                </Td>
                <Td>
                  <Badge tone={coupon.isActive ? 'success' : 'neutral'}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void toggleActive(coupon.id, coupon.isActive)}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => void remove(coupon.id, coupon.code)}
                      aria-label={`Delete ${coupon.code}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}
