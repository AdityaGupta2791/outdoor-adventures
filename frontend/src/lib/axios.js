import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
})

// Attach the access token from the auth store to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const NO_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register']
let refreshPromise = null

// On 401, try a single refresh, then replay the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const url = original?.url ?? ''
    const isAuthFlow = NO_REFRESH.some((p) => url.includes(p))

    if (error.response?.status === 401 && original && !original._retry && !isAuthFlow) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null
            })
        }
        const { data } = await refreshPromise
        useAuthStore.getState().setAuth(data.user, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().clearAuth()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)
