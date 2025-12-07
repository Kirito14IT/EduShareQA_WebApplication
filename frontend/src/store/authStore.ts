import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens, UserProfile } from '../types/api'

interface AuthState {
  user: UserProfile | null
  tokens: AuthTokens | null
  setAuth: (payload: { user: UserProfile; tokens: AuthTokens }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: ({ user, tokens }) => set({ user, tokens }),
      logout: () => set({ user: null, tokens: null }),
    }),
    {
      name: 'edushareqa-auth',
    },
  ),
)

