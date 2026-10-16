/** Thin typed fetch wrapper for the LoveSurprise API (session-cookie based). */

export type ApiErrorBody = {
  code: string
  message: string
  fields?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string>

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || 'Something went wrong')
    this.name = 'ApiError'
    this.status = status
    this.code = body.code || 'UNKNOWN'
    this.fields = body.fields
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** Raw body (e.g. FormData) — sent as-is without JSON encoding. */
  raw?: BodyInit
}

const BASE = '/api/v1'

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, raw } = options

  const headers: Record<string, string> = {}
  let payload: BodyInit | undefined
  if (raw !== undefined) {
    payload = raw
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: payload,
      credentials: 'include',
      signal,
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    throw new ApiError(0, { code: 'NETWORK', message: 'Cannot reach the server. Check your connection.' })
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = null
    }
  }

  if (!res.ok) {
    const err = (parsed as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error ?? {}

    // Server-side zod failures arrive as `details: [{ path, message }]`.
    const fields: Record<string, string> = {}
    if (Array.isArray(err.details)) {
      for (const d of err.details) {
        if (d && typeof d === 'object' && 'path' in d && 'message' in d) {
          fields[String(d.path)] = String(d.message)
        }
      }
    }

    throw new ApiError(res.status, {
      code: err.code ?? `HTTP_${res.status}`,
      message: err.message ?? `Request failed (${res.status})`,
      fields: Object.keys(fields).length ? fields : undefined,
    })
  }

  const envelope = parsed as { data?: T } | null
  return (envelope && 'data' in envelope ? envelope.data : parsed) as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'PATCH', body, signal }),
  del: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'DELETE', body, signal }),
}
