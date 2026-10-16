import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Lock } from 'lucide-react'
import { formatINR } from '../../shared'
import { api } from '../../api/client'
import type { CheckoutInfo, OrderDTO } from '../../api/types'
import { Button, Card, Container, LinkButton, Spinner, StatusMessage, useDocumentTitle, useToast } from '../ui'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const queryClient = useQueryClient()
  const toast = useToast()

  const checkoutInfo = (location.state as { checkout?: CheckoutInfo } | null)?.checkout
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  const orderQuery = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => api.get<OrderDTO>(`/orders/${orderId}`),
    enabled: Boolean(orderId),
  })

  const order = orderQuery.data

  useEffect(() => {
    if (order?.status === 'PAID') setPaid(true)
  }, [order?.status])

  const finish = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
    ])
    setPaid(true)
    toast.push('Payment successful — you can publish now', 'success')
  }

  const payMock = async () => {
    if (!orderId) return
    setPaying(true)
    setError(null)
    try {
      await api.post(`/orders/${orderId}/mock-complete`)
      await finish()
    } catch {
      setError('We could not complete the test payment. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  const payRazorpay = async () => {
    if (!orderId || !order) return
    if (!checkoutInfo?.publicKey || !checkoutInfo.providerOrderId) {
      setError('Checkout session expired. Please start the payment again from the pricing page.')
      return
    }
    setPaying(true)
    setError(null)
    const ready = await loadRazorpay()
    if (!ready || !window.Razorpay) {
      setError('We could not load the payment window. Check your connection and try again.')
      setPaying(false)
      return
    }

    const rzp = new window.Razorpay({
      key: checkoutInfo.publicKey,
      amount: checkoutInfo.amountPaise,
      currency: checkoutInfo.currency,
      order_id: checkoutInfo.providerOrderId,
      name: 'Dearmine',
      description: `${order.plan.name} plan`,
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        try {
          await api.post(`/orders/${orderId}/verify`, {
            orderId,
            providerOrderId: response.razorpay_order_id,
            providerPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
          await finish()
        } catch {
          setError('We could not verify that payment. If money was deducted it will be refunded.')
        } finally {
          setPaying(false)
        }
      },
      modal: { ondismiss: () => setPaying(false) },
    })
    rzp.open()
  }

  if (orderQuery.isLoading) {
    return (
      <Container className="py-20">
        <Spinner label="Loading your order…" />
      </Container>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Order not found</h1>
        <div className="mt-6">
          <LinkButton to="/pricing" variant="secondary">
            Back to plans
          </LinkButton>
        </div>
      </Container>
    )
  }

  const isMock = checkoutInfo?.isMock ?? order.provider === 'mock'

  return (
    <Container className="flex justify-center py-14">
      <Card className="w-full max-w-lg">
        {paid ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <BadgeCheck className="h-14 w-14 text-emerald-500" aria-hidden />
            <h1 className="font-display text-3xl text-ink">Payment complete</h1>
            <p className="text-sm text-ink/70">
              Your {order.plan.name} plan is active. Head back to your surprise to publish it.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <LinkButton to="/dashboard/projects">Go to my surprises</LinkButton>
              <LinkButton to="/dashboard" variant="outline">
                Dashboard
              </LinkButton>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl text-ink">Complete your purchase</h1>
            <p className="mt-1 text-sm text-ink/60">
              One-time payment for the {order.plan.name} plan.
            </p>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Plan</dt>
                <dd className="text-ink">{order.plan.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd className="text-ink">{formatINR(order.subtotalPaise)}</dd>
              </div>
              {order.discountAmountPaise > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                  <dd>− {formatINR(order.discountAmountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-burgundy/10 pt-2 text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd>{formatINR(order.amountPaise)}</dd>
              </div>
            </dl>

            {error && (
              <div className="mt-4">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            )}

            {isMock && (
              <div className="mt-4">
                <StatusMessage tone="info">
                  Test mode: payments are simulated. Use the button below to complete this order without a real
                  gateway.
                </StatusMessage>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => void (isMock ? payMock() : payRazorpay())}
                loading={paying}
                className="w-full"
              >
                <Lock className="h-4 w-4" aria-hidden />
                {isMock ? 'Complete test payment' : `Pay ${formatINR(order.amountPaise)}`}
              </Button>
              <Link
                to="/pricing"
                className="text-center text-sm text-ink/60 hover:text-romantic"
                onClick={() => {
                  void api.post(`/orders/${order.id}/cancel`).catch(() => undefined)
                }}
              >
                Cancel and go back
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-ink/50">
              Your payment details are handled securely. We never store your card information.
            </p>
          </>
        )}
      </Card>
    </Container>
  )
}
