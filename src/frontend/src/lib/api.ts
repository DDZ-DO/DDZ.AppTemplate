import type { LoginCredentials, LoginResponse } from '@ddz/shared-react'

const API_BASE = '/api'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('ddz_token')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(path: string) => fetchApi<T>(path),
  post: <T>(path: string, body: unknown) =>
    fetchApi<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    fetchApi<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => fetchApi<void>(path, { method: 'DELETE' }),
}

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const text = await response.text()
    let message = 'Anmeldung fehlgeschlagen'
    try {
      const json = JSON.parse(text)
      message = json.error || json.message || message
    } catch {
      if (text) message = text
    }
    throw new Error(message)
  }

  return response.json()
}
