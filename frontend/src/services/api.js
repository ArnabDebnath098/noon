/**
 * Tiny fetch wrapper for talking to the backend API.
 * In dev, "/api" is proxied to the backend (see vite.config.js).
 * In prod, set VITE_API_BASE_URL to the deployed backend origin.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
}

// Example domain service — products live behind the backend.
export const productService = {
  list: () => api.get('/api/products'),
}
