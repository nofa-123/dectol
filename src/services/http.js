const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '/backend-api').replace(/\/$/, '')
const TOKEN_KEY = 'doctol_access_token'

export class HttpError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
    this.errors = data?.errors ?? {}
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export async function request(path, options = {}) {
  const token = tokenStorage.get()
  const hasBody = options.body !== undefined && options.body !== null
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'ar',
      ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    if (response.status === 401) tokenStorage.clear()
    throw new HttpError(data?.message || `فشل الاتصال بالسيرفر (${response.status})`, {
      status: response.status,
      data,
    })
  }

  return data
}

export const get = (path, options = {}) => request(path, options)

export const post = (path, body, options = {}) =>
  request(path, {
    ...options,
    method: 'POST',
    body: typeof FormData !== 'undefined' && body instanceof FormData ? body : JSON.stringify(body),
  })

export const put = (path, body, options = {}) =>
  request(path, { ...options, method: 'PUT', body: JSON.stringify(body) })

export const destroy = (path, options = {}) => request(path, { ...options, method: 'DELETE' })
