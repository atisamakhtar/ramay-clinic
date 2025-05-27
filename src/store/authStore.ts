import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { AuthChangeEvent } from '@supabase/supabase-js';
import type { User } from '../types'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initializeAuth: () => Promise<void>

  setUserSession: (user: User, session: Session) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Sign in via Supabase, map session.user to our User type
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      set({ error: error.message, isLoading: false })
      return
    }

    if (data.session && data.user) {
      // Map SupabaseUser to our User type
      const supaUser: SupabaseUser = data.user
      const mappedUser: User = {
        id: supaUser.id,
        name: (supaUser.user_metadata as any)?.name || '',
        email: supaUser.email || '',
        role: (supaUser.user_metadata as any)?.role || 'authenticated',
        createdAt: supaUser.created_at || new Date().toISOString(),
      }

      set({
        user: mappedUser,
        session: data.session,
        isAuthenticated: true,
        isLoading: false
      })
    }
  },

  // Sign out and clear store
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, isAuthenticated: false })
  },

  // On app load, read existing session & subscribe to changes
  initializeAuth: async () => {
    set({ isLoading: true })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session && session.user) {
      const supaUser = session.user
      const mappedUser: User = {
        id: supaUser.id,
        name: (supaUser.user_metadata as any)?.name || '',
        email: supaUser.email || '',
        role: (supaUser.user_metadata as any)?.role || 'authenticated',
        createdAt: supaUser.created_at || new Date().toISOString(),
      }

      set({
        user: mappedUser,
        session,
        isAuthenticated: true
      })
    }

    // Subscribe to auth changes
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      if (newSession && newSession.user) {
        const supaUser = newSession.user
        const mappedUser: User = {
          id: supaUser.id,
          name: (supaUser.user_metadata as any)?.name || '',
          email: supaUser.email || '',
          role: (supaUser.user_metadata as any)?.role || 'authenticated',
          createdAt: supaUser.created_at || new Date().toISOString(),
        }
        set({ user: mappedUser, session: newSession, isAuthenticated: true })
      } else {
        set({ user: null, session: null, isAuthenticated: false })
      }
    })

    set({ isLoading: false })
  },

  setUserSession: (user, session) =>
    set({ user, session, isAuthenticated: true }),
}))