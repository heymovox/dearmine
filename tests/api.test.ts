import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createHmac } from 'node:crypto'
import type { Express } from 'express'
import { createApp } from '../server/app'
import { env } from '../server/env'

/**
 * These tests exercise the HTTP surface without touching the database:
 * health, auth guards, request validation and the error envelope. Endpoints
 * that require persistence are covered by the integration suite on a real
 * database.
 */
let app: Express

beforeAll(() => {
  app = createApp()
})

afterAll(() => {
  // Nothing to tear down — no server socket is opened by supertest.
})

describe('GET /api/health', () => {
  it('reports service health with the configured providers', async () => {
    const res = await request(app).get('/api/health').expect(200)
    expect(res.body.data.ok).toBe(true)
    expect(res.body.data.service).toBe('lovesurprise-api')
    expect(res.body.data.provider).toMatchObject({ storage: expect.any(String), payments: expect.any(String) })
  })
})

describe('auth guards', () => {
  it('rejects anonymous access to protected resources with an error envelope', async () => {
    const res = await request(app).get('/api/v1/projects').expect(401)
    expect(res.body.error).toBeTruthy()
    expect(typeof res.body.error.code).toBe('string')
    expect(typeof res.body.error.message).toBe('string')
  })

  it('rejects anonymous access to the admin API', async () => {
    const res = await request(app).get('/api/v1/admin/stats').expect(401)
    expect(res.body.error.code).toBeTruthy()
  })
})

describe('request validation', () => {
  it('returns field-level details for an invalid login payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '' })
      .expect(422)
    expect(res.body.error).toBeTruthy()
    expect(Array.isArray(res.body.error.details)).toBe(true)
    const paths = (res.body.error.details as Array<{ path: string }>).map((d) => d.path)
    expect(paths).toContain('email')
    expect(paths).toContain('password')
  })

  it('validates support requests before persisting', async () => {
    const res = await request(app).post('/api/v1/support').send({ email: 'bad' }).expect(422)
    const paths = (res.body.error.details as Array<{ path: string }>).map((d) => d.path)
    expect(paths).toContain('email')
    expect(paths).toContain('subject')
    expect(paths).toContain('message')
  })
})

describe('error envelope', () => {
  it('returns a structured 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/v1/definitely-not-a-route').expect(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('does not crash on a foreign Origin (browser blocks, CSRF guards writes)', async () => {
    // CORS must reject with a missing header, never a 500. In test mode the
    // CSRF origin check is bypassed, so validation runs instead.
    const res = await request(app)
      .post('/api/v1/support')
      .set('Origin', 'https://evil.example')
      .send({})
    expect(res.status).toBeLessThan(500)
    expect(res.body.error.code).toBeTruthy()
  })
})

describe('webhook endpoint', () => {
  it('rejects an unsigned webhook without a generic 500', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('content-type', 'application/json')
      .send('{"event":"payment.captured"}')
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(500)
    expect(res.body.error.code).toBeTruthy()
  })

  it('accepts a correctly signed mock webhook', async () => {
    const raw = '{"event":"payment.captured","payload":{"payment":{"entity":{}}}}'
    const signature = createHmac('sha256', env.SESSION_SECRET).update(raw).digest('hex')
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('content-type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(raw)
    if (env.PAYMENT_PROVIDER === 'mock') {
      expect(res.status).toBe(200)
      expect(res.body.data.ok).toBe(true)
    } else {
      expect(res.status).toBeLessThan(500)
    }
  })
})
