const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getTrips: () => request('/trips'),
  createTrip: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  getTrip: (id) => request(`/trips/${id}`),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  generatePlan: (id) => request(`/trips/${id}/plan`, { method: 'POST' }),
}