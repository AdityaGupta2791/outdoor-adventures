import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  status: 'loading', // 'loading' | 'authenticated' | 'unauthenticated'

  setAuth: (user, accessToken) =>
    set({ user, accessToken, status: 'authenticated' }),

  setUser: (user) => set({ user }),

  clearAuth: () =>
    set({ user: null, accessToken: null, status: 'unauthenticated' }),
}))
