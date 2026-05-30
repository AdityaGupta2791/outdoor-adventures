import { api } from '../../lib/axios'

export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data // { user, accessToken }
}

export async function loginRequest(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data // { user, accessToken }
}

export async function refreshRequest() {
  const { data } = await api.post('/auth/refresh')
  return data // { user, accessToken }
}

export async function logoutRequest() {
  await api.post('/auth/logout')
}

export async function fetchProviders() {
  const { data } = await api.get('/auth/providers')
  return data // { google: boolean }
}
