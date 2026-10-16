import { createHmac } from 'node:crypto'
import Razorpay from 'razorpay'
import { env } from '../env'
import { paymentFailed } from '../lib/errors'
import { safeCompare } from '../lib/ids'

export type ProviderOrder = {
  provider: string
  providerOrderId: string
  amountPaise: number
  currency: string
  /** Public key the browser checkout needs (Razorpay key id). */
  publicKey?: string
}

export type ParsedWebhook = {
  event: string
  providerOrderId?: string
  providerPaymentId?: string
  amountPaise?: number
  currency?: string
  status?: string
}

export interface PaymentProvider {
  readonly name: 'mock' | 'razorpay'
  createOrder(input: {
    amountPaise: number
    currency: string
    receipt: string
    notes?: Record<string, string>
  }): Promise<ProviderOrder>
  /** Verify the checkout handshake signature for a payment. */
  verifyPaymentSignature(input: {
    providerOrderId: string
    providerPaymentId: string
    signature: string
  }): boolean
  /** Verify a webhook signature against the raw request body. */
  verifyWebhook(rawBody: Buffer, signature: string): boolean
  parseWebhook(rawBody: Buffer): ParsedWebhook
}

/* -------------------------------------------------------------------------- */
/*  Mock provider — local development and automated tests only                 */
/* -------------------------------------------------------------------------- */

function mockSignature(providerOrderId: string, providerPaymentId: string): string {
  return createHmac('sha256', env.SESSION_SECRET)
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest('hex')
}

class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock' as const

  async createOrder(input: {
    amountPaise: number
    currency: string
  }): Promise<ProviderOrder> {
    return {
      provider: 'mock',
      providerOrderId: `mock_order_${Math.random().toString(36).slice(2, 14)}`,
      amountPaise: input.amountPaise,
      currency: input.currency,
    }
  }

  verifyPaymentSignature(input: {
    providerOrderId: string
    providerPaymentId: string
    signature: string
  }): boolean {
    const expected = mockSignature(input.providerOrderId, input.providerPaymentId)
    return safeCompare(expected, input.signature)
  }

  verifyWebhook(_rawBody: Buffer, signature: string): boolean {
    // Mock webhooks are signed with the session secret as well.
    const expected = createHmac('sha256', env.SESSION_SECRET).update(_rawBody).digest('hex')
    return safeCompare(expected, signature)
  }

  parseWebhook(rawBody: Buffer): ParsedWebhook {
    const body = JSON.parse(rawBody.toString('utf8')) as {
      event?: string
      payload?: { payment?: { entity?: { order_id?: string; id?: string; amount?: number; currency?: string; status?: string } } }
    }
    const entity = body.payload?.payment?.entity
    return {
      event: body.event ?? 'unknown',
      providerOrderId: entity?.order_id,
      providerPaymentId: entity?.id,
      amountPaise: entity?.amount,
      currency: entity?.currency,
      status: entity?.status,
    }
  }

  /** Helper used by the dev "simulate checkout" endpoint. */
  simulateSignature(providerOrderId: string, providerPaymentId: string): string {
    return mockSignature(providerOrderId, providerPaymentId)
  }
}

/* -------------------------------------------------------------------------- */
/*  Razorpay provider                                                          */
/* -------------------------------------------------------------------------- */

class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay' as const
  private client: Razorpay

  constructor() {
    this.client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }

  async createOrder(input: {
    amountPaise: number
    currency: string
    receipt: string
    notes?: Record<string, string>
  }): Promise<ProviderOrder> {
    const order = await this.client.orders.create({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    })
    return {
      provider: 'razorpay',
      providerOrderId: order.id,
      amountPaise: Number(order.amount),
      currency: order.currency,
      publicKey: env.RAZORPAY_KEY_ID,
    }
  }

  verifyPaymentSignature(input: {
    providerOrderId: string
    providerPaymentId: string
    signature: string
  }): boolean {
    const expected = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest('hex')
    return safeCompare(expected, input.signature)
  }

  verifyWebhook(rawBody: Buffer, signature: string): boolean {
    if (!env.RAZORPAY_WEBHOOK_SECRET) throw paymentFailed('Webhook secret is not configured')
    const expected = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')
    return safeCompare(expected, signature)
  }

  parseWebhook(rawBody: Buffer): ParsedWebhook {
    const body = JSON.parse(rawBody.toString('utf8')) as {
      event?: string
      payload?: { payment?: { entity?: { order_id?: string; id?: string; amount?: number; currency?: string; status?: string } } }
    }
    const entity = body.payload?.payment?.entity
    return {
      event: body.event ?? 'unknown',
      providerOrderId: entity?.order_id,
      providerPaymentId: entity?.id,
      amountPaise: entity?.amount,
      currency: entity?.currency,
      status: entity?.status,
    }
  }
}

/* -------------------------------------------------------------------------- */

let instance: PaymentProvider | null = null

export function payments(): PaymentProvider {
  if (!instance) {
    instance = env.PAYMENT_PROVIDER === 'razorpay' ? new RazorpayProvider() : new MockPaymentProvider()
  }
  return instance
}

export function isMockProvider(): boolean {
  return env.PAYMENT_PROVIDER === 'mock'
}

export function simulateMockPayment(providerOrderId: string, providerPaymentId: string): string {
  const provider = payments()
  if (!(provider instanceof MockPaymentProvider)) {
    throw paymentFailed('Mock payments are only available with PAYMENT_PROVIDER=mock')
  }
  return provider.simulateSignature(providerOrderId, providerPaymentId)
}
