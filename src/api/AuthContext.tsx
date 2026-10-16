import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'
import type { PublicUser } from './types'

type AuthResponse = { user: PublicUser; devVerifyToken?: string }

type AuthContextValue = {
  user: PublicUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<PublicUser>
  register: (name: string, email: string, password: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ user: PublicUser | null }>('/auth/me'),
    staleTime: 60_000,
    retry: false,
  })

  const user = meQuery.data?.user ?? null

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/login', { email, password })
      await queryClient.invalidateQueries({ queryKey: ['auth'] })
      return res.user
    },
    [queryClient],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/register', { name, email, password })
      await queryClient.invalidateQueries({ queryKey: ['auth'] })
      return res
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    await api.post('/auth/logout')
    queryClient.setQueryData(['auth', 'me'], { user: null })
    queryClient.clear()
  }, [queryClient])

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth'] })
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading: meQuery.isLoading, login, register, logout, refresh }),
    [user, meQuery.isLoading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Convenience for rendering API errors inline. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
