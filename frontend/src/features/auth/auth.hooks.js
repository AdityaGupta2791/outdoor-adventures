import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  refreshRequest,
  fetchProviders,
} from './auth.api'

export function useAuth() {
  const { user, status } = useAuthStore()
  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  }
}

// Restores the session on app load using the httpOnly refresh cookie.
export function useSessionRestore() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    let cancelled = false
    refreshRequest()
      .then((data) => {
        if (!cancelled) setAuth(data.user, data.accessToken)
      })
      .catch(() => {
        if (!cancelled) clearAuth()
      })
    return () => {
      cancelled = true
    }
  }, [setAuth, clearAuth])
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const qc = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  async function login(credentials) {
    setIsPending(true)
    setError(null)
    try {
      const data = await loginRequest(credentials)
      setAuth(data.user, data.accessToken)
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      return data.user
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Could not sign in. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  return { login, isPending, error, clearError: () => setError(null) }
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const qc = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  async function register(payload) {
    setIsPending(true)
    setError(null)
    try {
      const data = await registerRequest(payload)
      setAuth(data.user, data.accessToken)
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      return data.user
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message || 'Could not create your account. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  return { register, isPending, error, clearError: () => setError(null) }
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const qc = useQueryClient()
  return async function logout() {
    try {
      await logoutRequest()
    } finally {
      clearAuth()
      qc.removeQueries({ queryKey: ['my-bookings'] })
    }
  }
}

export function useProviders() {
  const [providers, setProviders] = useState({ google: false })
  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(() => setProviders({ google: false }))
  }, [])
  return providers
}
